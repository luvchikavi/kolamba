"""Communities router - CRUD operations for community profiles."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field

from app.database import get_db
from app.models.community import Community
from app.models.user import User
from app.schemas.community import CommunityCreate, CommunityUpdate, CommunityResponse

router = APIRouter()


class CommunityRegisterRequest(BaseModel):
    """Request body for community registration (MVP - includes user info)."""
    # User info
    email: str = Field(..., min_length=5, max_length=255)
    name: str = Field(..., min_length=2, max_length=255, description="Contact name")

    # Community info
    community_name: str = Field(..., min_length=2, max_length=255)
    location: str = Field(..., min_length=2, max_length=255)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    audience_size: Optional[str] = Field(None, description="small, medium, or large")
    language: str = Field(default="English")


@router.get("", response_model=list[CommunityResponse])
async def list_communities(
    language: Optional[str] = Query(None, description="Filter by language"),
    audience_size: Optional[str] = Query(None, description="Filter by audience size"),
    limit: int = Query(20, le=100),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db),
):
    """List all communities with optional filters."""
    query = select(Community).where(Community.status == "active")

    if language:
        query = query.where(Community.language == language)

    if audience_size:
        query = query.where(Community.audience_size == audience_size)

    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    communities = result.scalars().all()
    return communities


@router.get("/{community_id}", response_model=CommunityResponse)
async def get_community(community_id: int, db: AsyncSession = Depends(get_db)):
    """Get community profile by ID."""
    result = await db.execute(
        select(Community).where(Community.id == community_id)
    )
    community = result.scalar_one_or_none()

    if not community:
        raise HTTPException(status_code=404, detail="Community not found")

    return community


@router.post("", response_model=CommunityResponse)
async def create_community(
    request: CommunityRegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """Register new community with user account (MVP version)."""
    # Check if email already exists
    existing_user = await db.execute(
        select(User).where(User.email == request.email)
    )
    if existing_user.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user account
    user = User(
        email=request.email,
        name=request.name,
        role="community",
        status="active",
    )
    db.add(user)
    await db.flush()  # Get user ID

    # Create community profile
    community = Community(
        user_id=user.id,
        name=request.community_name,
        location=request.location,
        latitude=request.latitude,
        longitude=request.longitude,
        audience_size=request.audience_size,
        language=request.language,
        status="active",
    )
    db.add(community)
    await db.commit()
    await db.refresh(community)

    return community


@router.put("/{community_id}", response_model=CommunityResponse)
async def update_community(
    community_id: int,
    update_data: CommunityUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update community profile."""
    result = await db.execute(
        select(Community).where(Community.id == community_id)
    )
    community = result.scalar_one_or_none()

    if not community:
        raise HTTPException(status_code=404, detail="Community not found")

    # Update fields
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(community, field, value)

    await db.commit()
    await db.refresh(community)

    return community


@router.delete("/{community_id}")
async def delete_community(community_id: int, db: AsyncSession = Depends(get_db)):
    """Deactivate a community (soft delete)."""
    result = await db.execute(
        select(Community).where(Community.id == community_id)
    )
    community = result.scalar_one_or_none()

    if not community:
        raise HTTPException(status_code=404, detail="Community not found")

    community.status = "inactive"
    await db.commit()

    return {"message": "Community deactivated successfully"}
