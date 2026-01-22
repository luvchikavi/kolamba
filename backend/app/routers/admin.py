"""Admin router - endpoints for super user administration."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.models.artist import Artist
from app.models.community import Community
from app.routers.auth import get_current_active_user
from app.utils.security import get_password_hash
from app.config import get_settings

settings = get_settings()

router = APIRouter()


async def get_superuser(
    user: User = Depends(get_current_active_user),
) -> User:
    """Dependency to check if user is a superuser."""
    if not user.is_superuser:
        raise HTTPException(status_code=403, detail="Superuser access required")
    return user


class UserResponse(BaseModel):
    """User response schema."""
    id: int
    email: str
    name: Optional[str]
    role: str
    status: str
    is_active: bool
    is_superuser: bool
    created_at: str

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """Schema for updating a user."""
    name: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None


class ArtistAdminResponse(BaseModel):
    """Artist response schema for admin."""
    id: int
    user_id: int
    name_en: Optional[str]
    name_he: Optional[str]
    email: str
    status: str
    city: Optional[str]
    is_featured: bool
    created_at: str

    class Config:
        from_attributes = True


class StatsResponse(BaseModel):
    """Dashboard statistics response."""
    total_users: int
    total_artists: int
    total_communities: int
    pending_artists: int
    active_artists: int
    active_communities: int


@router.get("/stats", response_model=StatsResponse)
async def get_admin_stats(
    superuser: User = Depends(get_superuser),
    db: AsyncSession = Depends(get_db),
):
    """Get dashboard statistics."""
    # Total users
    total_users_result = await db.execute(select(func.count(User.id)))
    total_users = total_users_result.scalar()

    # Total artists
    total_artists_result = await db.execute(select(func.count(Artist.id)))
    total_artists = total_artists_result.scalar()

    # Total communities
    total_communities_result = await db.execute(select(func.count(Community.id)))
    total_communities = total_communities_result.scalar()

    # Pending artists
    pending_artists_result = await db.execute(
        select(func.count(Artist.id)).where(Artist.status == "pending")
    )
    pending_artists = pending_artists_result.scalar()

    # Active artists
    active_artists_result = await db.execute(
        select(func.count(Artist.id)).where(Artist.status == "active")
    )
    active_artists = active_artists_result.scalar()

    # Active communities
    active_communities_result = await db.execute(
        select(func.count(Community.id)).where(Community.status == "active")
    )
    active_communities = active_communities_result.scalar()

    return StatsResponse(
        total_users=total_users or 0,
        total_artists=total_artists or 0,
        total_communities=total_communities or 0,
        pending_artists=pending_artists or 0,
        active_artists=active_artists or 0,
        active_communities=active_communities or 0,
    )


@router.get("/users")
async def list_users(
    search: Optional[str] = Query(None, description="Search by email or name"),
    role: Optional[str] = Query(None, description="Filter by role"),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
    superuser: User = Depends(get_superuser),
    db: AsyncSession = Depends(get_db),
):
    """List all users with optional filters."""
    query = select(User).order_by(User.created_at.desc())

    if search:
        query = query.where(
            (User.email.ilike(f"%{search}%")) | (User.name.ilike(f"%{search}%"))
        )

    if role:
        query = query.where(User.role == role)

    if status:
        query = query.where(User.status == status)

    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    users = result.scalars().all()

    return [
        {
            "id": u.id,
            "email": u.email,
            "name": u.name,
            "role": u.role,
            "status": u.status,
            "is_active": u.is_active,
            "is_superuser": u.is_superuser,
            "created_at": u.created_at.isoformat(),
        }
        for u in users
    ]


@router.get("/users/{user_id}")
async def get_user(
    user_id: int,
    superuser: User = Depends(get_superuser),
    db: AsyncSession = Depends(get_db),
):
    """Get user details by ID."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "status": user.status,
        "is_active": user.is_active,
        "is_superuser": user.is_superuser,
        "created_at": user.created_at.isoformat(),
        "updated_at": user.updated_at.isoformat(),
    }


@router.put("/users/{user_id}")
async def update_user(
    user_id: int,
    update_data: UserUpdate,
    superuser: User = Depends(get_superuser),
    db: AsyncSession = Depends(get_db),
):
    """Update a user."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update fields
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        if hasattr(user, field):
            setattr(user, field, value)

    await db.commit()
    await db.refresh(user)

    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "status": user.status,
        "is_active": user.is_active,
        "is_superuser": user.is_superuser,
    }


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    superuser: User = Depends(get_superuser),
    db: AsyncSession = Depends(get_db),
):
    """Soft delete a user (set is_active=False and status=inactive)."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == superuser.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    # Soft delete
    user.is_active = False
    user.status = "inactive"
    await db.commit()

    return {"message": f"User {user.email} has been deactivated"}


@router.get("/artists")
async def list_artists_admin(
    status: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search by name"),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
    superuser: User = Depends(get_superuser),
    db: AsyncSession = Depends(get_db),
):
    """List all artists for admin management."""
    query = (
        select(Artist)
        .options(selectinload(Artist.user))
        .order_by(Artist.created_at.desc())
    )

    if status:
        query = query.where(Artist.status == status)

    if search:
        query = query.where(
            (Artist.name_en.ilike(f"%{search}%")) | (Artist.name_he.ilike(f"%{search}%"))
        )

    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    artists = result.scalars().unique().all()

    return [
        {
            "id": a.id,
            "user_id": a.user_id,
            "name_en": a.name_en,
            "name_he": a.name_he,
            "email": a.user.email if a.user else None,
            "status": a.status,
            "city": a.city,
            "is_featured": a.is_featured,
            "created_at": a.created_at.isoformat(),
        }
        for a in artists
    ]


@router.put("/artists/{artist_id}/status")
async def update_artist_status(
    artist_id: int,
    status: str = Query(..., description="New status: active, pending, inactive"),
    superuser: User = Depends(get_superuser),
    db: AsyncSession = Depends(get_db),
):
    """Update artist status (approve/reject)."""
    if status not in ["active", "pending", "inactive"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    result = await db.execute(
        select(Artist).options(selectinload(Artist.user)).where(Artist.id == artist_id)
    )
    artist = result.scalar_one_or_none()

    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")

    artist.status = status

    # Also update user status if approving
    if status == "active" and artist.user:
        artist.user.status = "active"
    elif status == "inactive" and artist.user:
        artist.user.status = "inactive"

    await db.commit()

    return {
        "id": artist.id,
        "name_en": artist.name_en,
        "status": artist.status,
        "message": f"Artist status updated to {status}",
    }


@router.put("/artists/{artist_id}/featured")
async def toggle_artist_featured(
    artist_id: int,
    is_featured: bool = Query(..., description="Featured status"),
    superuser: User = Depends(get_superuser),
    db: AsyncSession = Depends(get_db),
):
    """Toggle artist featured status."""
    result = await db.execute(select(Artist).where(Artist.id == artist_id))
    artist = result.scalar_one_or_none()

    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")

    artist.is_featured = is_featured
    await db.commit()

    return {
        "id": artist.id,
        "name_en": artist.name_en,
        "is_featured": artist.is_featured,
    }


@router.post("/seed-superusers")
async def seed_superusers(
    admin_secret: str = Query(..., description="Admin secret for authorization"),
    db: AsyncSession = Depends(get_db),
):
    """Create superuser accounts. Requires admin secret."""
    if admin_secret != settings.secret_key:
        raise HTTPException(status_code=403, detail="Invalid admin secret")

    superusers_data = [
        {"email": "avi@kolamba.org", "name": "Avi Luvchik", "password": "Kolamba!26"},
        {"email": "avital@kolamba.org", "name": "Avital", "password": "Kolamba!26"},
    ]

    created = []
    updated = []

    for user_data in superusers_data:
        result = await db.execute(
            select(User).where(User.email == user_data["email"])
        )
        existing_user = result.scalar_one_or_none()

        if existing_user:
            existing_user.is_superuser = True
            existing_user.role = "admin"
            existing_user.status = "active"
            existing_user.is_active = True
            updated.append(user_data["email"])
        else:
            user = User(
                email=user_data["email"],
                password_hash=get_password_hash(user_data["password"]),
                name=user_data["name"],
                role="admin",
                status="active",
                is_active=True,
                is_superuser=True,
            )
            db.add(user)
            created.append(user_data["email"])

    await db.commit()

    return {
        "message": "Superusers seeded successfully",
        "created": created,
        "updated": updated,
    }
