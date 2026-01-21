"""Communities router - CRUD operations for community profiles."""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field

from app.database import get_db
from app.models.community import Community, COMMUNITY_TYPES, EVENT_TYPES, CONTACT_ROLES
from app.models.user import User
from app.schemas.community import CommunityCreate, CommunityUpdate, CommunityResponse
from app.schemas.tour import NearbyTourResponse
from app.services.tour_grouping import find_nearby_tours

router = APIRouter()


class CommunityRegisterRequest(BaseModel):
    """Request body for community registration (MVP - includes user info)."""
    # User info
    email: str = Field(..., min_length=5, max_length=255)
    name: str = Field(..., min_length=2, max_length=255, description="Contact name")

    # Community info
    community_name: str = Field(..., min_length=2, max_length=255)
    community_type: Optional[str] = Field(None, max_length=100)
    location: str = Field(..., min_length=2, max_length=255)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)

    # Member count (numeric range)
    member_count_min: Optional[int] = Field(None, ge=0, le=100000)
    member_count_max: Optional[int] = Field(None, ge=0, le=100000)

    # Event types
    event_types: Optional[List[str]] = Field(default=None)

    # Contact info
    contact_role: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=50)

    # Legacy field
    audience_size: Optional[str] = Field(None, description="small, medium, or large (deprecated)")
    language: str = Field(default="English")


class CommunityOptionsResponse(BaseModel):
    """Response with available options for community registration."""
    community_types: List[str]
    event_types: List[str]
    contact_roles: List[str]
    languages: List[str]


class DuplicateCheckResponse(BaseModel):
    """Response for duplicate name check."""
    exists: bool
    similar_names: List[str] = []


@router.get("/options", response_model=CommunityOptionsResponse)
async def get_community_options():
    """Get available options for community registration dropdowns."""
    return CommunityOptionsResponse(
        community_types=COMMUNITY_TYPES,
        event_types=EVENT_TYPES,
        contact_roles=CONTACT_ROLES,
        languages=["English", "Hebrew", "French", "Spanish", "Russian", "German", "Portuguese"],
    )


@router.get("/check-name", response_model=DuplicateCheckResponse)
async def check_community_name(
    name: str = Query(..., min_length=2, description="Community name to check"),
    db: AsyncSession = Depends(get_db),
):
    """Check if a community name already exists and find similar names."""
    # Exact match check (case-insensitive)
    exact_match = await db.execute(
        select(Community).where(func.lower(Community.name) == name.lower())
    )
    exists = exact_match.scalar_one_or_none() is not None

    # Find similar names (for suggestions)
    similar_query = await db.execute(
        select(Community.name)
        .where(Community.status == "active")
        .where(func.lower(Community.name).contains(name.lower()[:3]))
        .limit(5)
    )
    similar_names = [row[0] for row in similar_query.fetchall() if row[0].lower() != name.lower()]

    return DuplicateCheckResponse(exists=exists, similar_names=similar_names)


@router.get("", response_model=list[CommunityResponse])
async def list_communities(
    language: Optional[str] = Query(None, description="Filter by language"),
    audience_size: Optional[str] = Query(None, description="Filter by audience size (deprecated)"),
    community_type: Optional[str] = Query(None, description="Filter by community type"),
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    min_members: Optional[int] = Query(None, ge=0, description="Minimum member count"),
    max_members: Optional[int] = Query(None, ge=0, description="Maximum member count"),
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

    if community_type:
        query = query.where(Community.community_type == community_type)

    if event_type:
        query = query.where(Community.event_types.contains([event_type]))

    if min_members is not None:
        query = query.where(Community.member_count_min >= min_members)

    if max_members is not None:
        query = query.where(Community.member_count_max <= max_members)

    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    communities = result.scalars().all()
    return communities


@router.get("/{community_id}/tour-opportunities", response_model=list[NearbyTourResponse])
async def get_community_tour_opportunities(
    community_id: int,
    radius_km: float = Query(500, description="Search radius in kilometers"),
    db: AsyncSession = Depends(get_db),
):
    """
    Get tour opportunities for a community.

    Returns tours with confirmed bookings near the community's location
    that the community could potentially join.
    """
    # Verify community exists
    result = await db.execute(
        select(Community).where(Community.id == community_id)
    )
    community = result.scalar_one_or_none()

    if not community:
        raise HTTPException(status_code=404, detail="Community not found")

    if community.latitude is None or community.longitude is None:
        # Return empty list if location not set (instead of error)
        return []

    opportunities = await find_nearby_tours(
        db=db,
        community_id=community_id,
        radius_km=radius_km,
    )

    return opportunities


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

    # Check for duplicate community name (case-insensitive)
    existing_community = await db.execute(
        select(Community).where(func.lower(Community.name) == request.community_name.lower())
    )
    if existing_community.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="A community with this name already exists. Please use a different name or contact support."
        )

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
        community_type=request.community_type,
        location=request.location,
        latitude=request.latitude,
        longitude=request.longitude,
        member_count_min=request.member_count_min,
        member_count_max=request.member_count_max,
        event_types=request.event_types,
        contact_role=request.contact_role,
        phone=request.phone,
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

    # If name is being updated, check for duplicates
    if update_data.name and update_data.name.lower() != community.name.lower():
        existing = await db.execute(
            select(Community).where(
                func.lower(Community.name) == update_data.name.lower(),
                Community.id != community_id
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=400,
                detail="A community with this name already exists."
            )

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
