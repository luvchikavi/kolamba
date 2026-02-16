"""Admin router - endpoints for super user administration."""

import logging
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
from app.models.booking import Booking
from app.models.artist_tour_date import ArtistTourDate
from app.routers.auth import get_current_active_user
from app.utils.security import get_password_hash
from app.config import get_settings
from app.services.email import send_artist_status_change

settings = get_settings()

router = APIRouter()
logger = logging.getLogger("kolamba.admin")


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
    total_bookings: int
    pending_bookings: int
    total_tour_dates: int
    upcoming_tour_dates: int


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

    # Total bookings
    total_bookings_result = await db.execute(select(func.count(Booking.id)))
    total_bookings = total_bookings_result.scalar()

    # Pending bookings
    pending_bookings_result = await db.execute(
        select(func.count(Booking.id)).where(Booking.status == "pending")
    )
    pending_bookings = pending_bookings_result.scalar()

    # Total tour dates
    total_tour_dates_result = await db.execute(select(func.count(ArtistTourDate.id)))
    total_tour_dates = total_tour_dates_result.scalar()

    # Upcoming tour dates
    from datetime import date
    upcoming_tour_dates_result = await db.execute(
        select(func.count(ArtistTourDate.id)).where(ArtistTourDate.start_date >= date.today())
    )
    upcoming_tour_dates = upcoming_tour_dates_result.scalar()

    return StatsResponse(
        total_users=total_users or 0,
        total_artists=total_artists or 0,
        total_communities=total_communities or 0,
        pending_artists=pending_artists or 0,
        active_artists=active_artists or 0,
        active_communities=active_communities or 0,
        total_bookings=total_bookings or 0,
        pending_bookings=pending_bookings or 0,
        total_tour_dates=total_tour_dates or 0,
        upcoming_tour_dates=upcoming_tour_dates or 0,
    )


class AnalyticsPoint(BaseModel):
    """Single data point for time-series charts."""
    month: str
    users: int = 0
    artists: int = 0
    communities: int = 0
    bookings: int = 0


class CategoryBreakdown(BaseModel):
    """Category distribution data."""
    name: str
    count: int


class AnalyticsResponse(BaseModel):
    """Analytics data for dashboard charts."""
    monthly_growth: list[AnalyticsPoint]
    category_breakdown: list[CategoryBreakdown]
    booking_status: list[CategoryBreakdown]


@router.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics(
    superuser: User = Depends(get_superuser),
    db: AsyncSession = Depends(get_db),
):
    """Get analytics data for admin dashboard charts."""
    from datetime import date, timedelta
    from app.models.category import Category as CategoryModel

    # Monthly growth over last 6 months
    monthly_growth = []
    today = date.today()
    for i in range(5, -1, -1):
        # Start of month, i months ago
        month_start = today.replace(day=1) - timedelta(days=i * 30)
        month_start = month_start.replace(day=1)
        if month_start.month == 12:
            month_end = month_start.replace(year=month_start.year + 1, month=1, day=1)
        else:
            month_end = month_start.replace(month=month_start.month + 1, day=1)

        label = month_start.strftime("%b %Y")

        users_count = (await db.execute(
            select(func.count(User.id)).where(User.created_at < month_end)
        )).scalar() or 0

        artists_count = (await db.execute(
            select(func.count(Artist.id)).where(Artist.created_at < month_end)
        )).scalar() or 0

        communities_count = (await db.execute(
            select(func.count(Community.id)).where(Community.created_at < month_end)
        )).scalar() or 0

        bookings_count = (await db.execute(
            select(func.count(Booking.id)).where(Booking.created_at < month_end)
        )).scalar() or 0

        monthly_growth.append(AnalyticsPoint(
            month=label,
            users=users_count,
            artists=artists_count,
            communities=communities_count,
            bookings=bookings_count,
        ))

    # Category breakdown (artists per category)
    from app.models.category import ArtistCategory
    cat_result = await db.execute(
        select(CategoryModel.name_en, func.count(ArtistCategory.artist_id))
        .join(ArtistCategory, CategoryModel.id == ArtistCategory.category_id)
        .group_by(CategoryModel.name_en)
        .order_by(func.count(ArtistCategory.artist_id).desc())
        .limit(10)
    )
    category_breakdown = [
        CategoryBreakdown(name=name or "Unknown", count=count)
        for name, count in cat_result.all()
    ]

    # Booking status breakdown
    status_result = await db.execute(
        select(Booking.status, func.count(Booking.id))
        .group_by(Booking.status)
    )
    booking_status = [
        CategoryBreakdown(name=status, count=count)
        for status, count in status_result.all()
    ]

    return AnalyticsResponse(
        monthly_growth=monthly_growth,
        category_breakdown=category_breakdown,
        booking_status=booking_status,
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

    # Get artist IDs for users with role "artist"
    artist_user_ids = [u.id for u in users if u.role == "artist"]
    artist_map = {}
    if artist_user_ids:
        artist_result = await db.execute(
            select(Artist.user_id, Artist.id).where(Artist.user_id.in_(artist_user_ids))
        )
        artist_map = {row[0]: row[1] for row in artist_result.all()}

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
            "artist_id": artist_map.get(u.id) if u.role == "artist" else None,
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

    logger.info("Admin %s updated user id=%d fields=%s", superuser.email, user_id, list(update_dict.keys()))
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
    logger.info("Admin %s deactivated user id=%d email=%s", superuser.email, user.id, user.email)
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
    status: str = Query(..., description="New status: active, pending, inactive, rejected"),
    rejection_reason: Optional[str] = Query(None, description="Reason for rejection"),
    superuser: User = Depends(get_superuser),
    db: AsyncSession = Depends(get_db),
):
    """Update artist status (approve/reject)."""
    if status not in ["active", "pending", "inactive", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    result = await db.execute(
        select(Artist).options(selectinload(Artist.user)).where(Artist.id == artist_id)
    )
    artist = result.scalar_one_or_none()

    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")

    old_status = artist.status
    artist.status = status

    # Store or clear rejection reason
    if status == "rejected":
        artist.rejection_reason = rejection_reason
    else:
        artist.rejection_reason = None

    # Also update user status if approving
    if status == "active" and artist.user:
        artist.user.status = "active"
    elif status == "inactive" and artist.user:
        artist.user.status = "inactive"

    logger.info(
        "Admin %s changed artist id=%d status: %s -> %s",
        superuser.email, artist_id, old_status, status,
    )
    await db.commit()

    # Send email notification to artist
    if artist.user and status in ("active", "rejected"):
        send_artist_status_change(
            artist.user.email,
            artist.name_en or artist.name_he or "Artist",
            status,
            reason=rejection_reason,
        )

    return {
        "id": artist.id,
        "name_en": artist.name_en,
        "status": artist.status,
        "rejection_reason": artist.rejection_reason,
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
    superuser: User = Depends(get_superuser),
    db: AsyncSession = Depends(get_db),
):
    """Create superuser accounts. Requires superuser + development env."""
    if settings.env != "development":
        raise HTTPException(status_code=403, detail="Seed endpoints are only available in development environment")

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


@router.get("/bookings")
async def list_bookings_admin(
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
    superuser: User = Depends(get_superuser),
    db: AsyncSession = Depends(get_db),
):
    """List all bookings for admin management with artist and community names."""
    query = (
        select(Booking, Artist, Community)
        .join(Artist, Booking.artist_id == Artist.id)
        .join(Community, Booking.community_id == Community.id)
        .order_by(Booking.created_at.desc())
    )

    if status:
        query = query.where(Booking.status == status)

    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    rows = result.all()

    return [
        {
            "id": booking.id,
            "artist_id": booking.artist_id,
            "artist_name": artist.name_en or artist.name_he or "Unknown",
            "community_id": booking.community_id,
            "community_name": community.name or "Unknown",
            "requested_date": booking.requested_date.isoformat() if booking.requested_date else None,
            "location": booking.location,
            "budget": booking.budget,
            "status": booking.status,
            "created_at": booking.created_at.isoformat(),
        }
        for booking, artist, community in rows
    ]


@router.put("/bookings/{booking_id}/status")
async def update_booking_status(
    booking_id: int,
    status: str = Query(..., description="New status: pending, confirmed, rejected, cancelled"),
    superuser: User = Depends(get_superuser),
    db: AsyncSession = Depends(get_db),
):
    """Update booking status."""
    valid_statuses = ["pending", "confirmed", "rejected", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    old_status = booking.status
    booking.status = status
    logger.info("Admin %s changed booking id=%d status: %s -> %s", superuser.email, booking_id, old_status, status)
    await db.commit()

    return {
        "id": booking.id,
        "status": booking.status,
        "message": f"Booking status updated to {status}",
    }


@router.get("/tour-dates")
async def list_tour_dates_admin(
    upcoming_only: bool = Query(True, description="Only show upcoming tour dates"),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
    superuser: User = Depends(get_superuser),
    db: AsyncSession = Depends(get_db),
):
    """List all tour dates for admin management with artist names."""
    from datetime import date as date_type
    from sqlalchemy.orm import selectinload

    query = (
        select(ArtistTourDate)
        .options(selectinload(ArtistTourDate.artist))
        .order_by(ArtistTourDate.start_date)
    )

    if upcoming_only:
        query = query.where(ArtistTourDate.start_date >= date_type.today())

    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    tour_dates = result.scalars().all()

    return [
        {
            "id": td.id,
            "artist_id": td.artist_id,
            "artist_name": td.artist.name_en or td.artist.name_he or "Unknown",
            "location": td.location,
            "start_date": td.start_date.isoformat(),
            "end_date": td.end_date.isoformat() if td.end_date else None,
            "description": td.description,
            "is_booked": td.is_booked,
            "created_at": td.created_at.isoformat(),
        }
        for td in tour_dates
    ]
