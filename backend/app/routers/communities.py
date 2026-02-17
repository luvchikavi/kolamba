"""Communities router - CRUD operations for community profiles."""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field

from datetime import date

from app.database import get_db
from app.models.community import Community, COMMUNITY_TYPES, EVENT_TYPES, CONTACT_ROLES
from app.models.user import User
from app.models.artist_tour_date import ArtistTourDate
from app.models.artist import Artist
from app.models.category import Category, ArtistCategory
from app.schemas.community import CommunityCreate, CommunityUpdate, CommunityResponse
from app.schemas.tour import NearbyTourResponse
from app.schemas.artist_tour_date import NearbyTouringArtist, ArtistTourDateResponse
from app.schemas.discover import DiscoverArtistItem, DiscoverResponse, NearbyTourDateInfo
from app.services.tour_grouping import find_nearby_tours, haversine_distance
from app.services.interest_matching import get_matched_categories, calculate_interest_score, EVENT_TYPE_TO_CATEGORIES
from app.services.geocoding import geocode_location
from app.routers.auth import get_current_active_user

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
    receive_artist_offers: bool = Field(default=False)


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


@router.get("/me", response_model=CommunityResponse)
async def get_my_community_profile(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's community profile."""
    if current_user.role != "community":
        raise HTTPException(status_code=403, detail="Not a host account")

    result = await db.execute(
        select(Community).where(Community.user_id == current_user.id)
    )
    community = result.scalar_one_or_none()

    if not community:
        raise HTTPException(status_code=404, detail="Host profile not found")

    return community


@router.put("/me", response_model=CommunityResponse)
async def update_my_community_profile(
    update_data: CommunityUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current user's community profile."""
    if current_user.role != "community":
        raise HTTPException(status_code=403, detail="Not a host account")

    result = await db.execute(
        select(Community).where(Community.user_id == current_user.id)
    )
    community = result.scalar_one_or_none()

    if not community:
        raise HTTPException(status_code=404, detail="Host profile not found")

    # If name is being updated, check for duplicates
    if update_data.name and update_data.name.lower() != community.name.lower():
        existing = await db.execute(
            select(Community).where(
                func.lower(Community.name) == update_data.name.lower(),
                Community.id != community.id
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=400,
                detail="A host with this name already exists."
            )

    # Update fields
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        if hasattr(community, field):
            setattr(community, field, value)

    await db.commit()
    await db.refresh(community)

    return community


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


class MapLocation(BaseModel):
    """Location data for map visualization."""
    id: int
    name: str
    latitude: float
    longitude: float
    type: str  # "community" or "tour_date"
    details: Optional[str] = None


@router.get("/locations", response_model=list[MapLocation])
async def get_map_locations(
    db: AsyncSession = Depends(get_db),
):
    """Get all communities and upcoming tour dates with coordinates for map display."""
    locations: list[MapLocation] = []

    # Communities with coordinates
    result = await db.execute(
        select(Community).where(
            Community.status == "active",
            Community.latitude.isnot(None),
            Community.longitude.isnot(None),
        )
    )
    for community in result.scalars().all():
        locations.append(MapLocation(
            id=community.id,
            name=community.name,
            latitude=float(community.latitude),
            longitude=float(community.longitude),
            type="community",
            details=community.location,
        ))

    # Upcoming tour dates with coordinates
    tour_result = await db.execute(
        select(ArtistTourDate, Artist.name_en).join(
            Artist, ArtistTourDate.artist_id == Artist.id
        ).where(
            ArtistTourDate.start_date >= date.today(),
            ArtistTourDate.latitude.isnot(None),
            ArtistTourDate.longitude.isnot(None),
        )
    )
    for tour_date, artist_name in tour_result.all():
        locations.append(MapLocation(
            id=tour_date.id,
            name=f"{artist_name or 'Artist'} Tour",
            latitude=float(tour_date.latitude),
            longitude=float(tour_date.longitude),
            type="tour_date",
            details=f"{tour_date.location} - {tour_date.start_date}",
        ))

    return locations


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
        raise HTTPException(status_code=404, detail="Host not found")

    if community.latitude is None or community.longitude is None:
        # Return empty list if location not set (instead of error)
        return []

    opportunities = await find_nearby_tours(
        db=db,
        community_id=community_id,
        radius_km=radius_km,
    )

    return opportunities


@router.get("/{community_id}/nearby-touring-artists", response_model=list[NearbyTouringArtist])
async def get_nearby_touring_artists(
    community_id: int,
    radius_km: float = Query(200, description="Search radius in kilometers"),
    db: AsyncSession = Depends(get_db),
):
    """
    Get artists who are touring within the specified radius of the community.

    Returns artists with announced tour dates near the community's location.
    Default radius is 200km.
    """
    # Get the community
    result = await db.execute(
        select(Community).where(Community.id == community_id)
    )
    community = result.scalar_one_or_none()

    if not community:
        raise HTTPException(status_code=404, detail="Host not found")

    if community.latitude is None or community.longitude is None:
        return []

    community_lat = float(community.latitude)
    community_lng = float(community.longitude)

    # Get all upcoming tour dates with artist info
    tour_dates_result = await db.execute(
        select(ArtistTourDate, Artist)
        .join(Artist, ArtistTourDate.artist_id == Artist.id)
        .where(
            ArtistTourDate.start_date >= date.today(),
            ArtistTourDate.latitude.isnot(None),
            ArtistTourDate.longitude.isnot(None),
            Artist.status == "active",
        )
        .order_by(ArtistTourDate.start_date)
    )
    tour_dates_with_artists = tour_dates_result.all()

    nearby_artists = []

    for tour_date, artist in tour_dates_with_artists:
        # Calculate distance
        distance = haversine_distance(
            community_lat, community_lng,
            float(tour_date.latitude), float(tour_date.longitude)
        )

        if distance <= radius_km:
            nearby_artists.append(NearbyTouringArtist(
                artist_id=artist.id,
                artist_name=artist.name_en or artist.name_he,
                profile_image=artist.profile_image,
                tour_date=ArtistTourDateResponse(
                    id=tour_date.id,
                    artist_id=tour_date.artist_id,
                    location=tour_date.location,
                    latitude=float(tour_date.latitude) if tour_date.latitude else None,
                    longitude=float(tour_date.longitude) if tour_date.longitude else None,
                    start_date=tour_date.start_date,
                    end_date=tour_date.end_date,
                    description=tour_date.description,
                    is_booked=tour_date.is_booked,
                    created_at=tour_date.created_at,
                ),
                distance_km=round(distance, 1),
            ))

    # Sort by distance
    nearby_artists.sort(key=lambda x: x.distance_km)

    return nearby_artists


@router.get("/{community_id}/discover-artists", response_model=DiscoverResponse)
async def discover_artists(
    community_id: int,
    min_price: Optional[int] = Query(None, ge=0, description="Minimum price filter"),
    max_price: Optional[int] = Query(None, ge=0, description="Maximum price filter"),
    category: Optional[str] = Query(None, description="Explicit category slug override"),
    match_interests: bool = Query(True, description="Auto-filter by community event_types"),
    touring_only: bool = Query(False, description="Only artists with tour dates within radius"),
    radius_km: float = Query(500, description="Radius for touring_only filter"),
    sort_by: str = Query("relevance", description="Sort: relevance|price_asc|price_desc|distance|name"),
    limit: int = Query(12, le=50),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """
    Discover artists matched to a community's interests.

    Returns artists scored by interest overlap, with optional
    price, category, and touring-nearby filters.
    """
    # 1. Fetch community
    result = await db.execute(
        select(Community).where(Community.id == community_id)
    )
    community = result.scalar_one_or_none()
    if not community:
        raise HTTPException(status_code=404, detail="Host not found")

    community_event_types: list[str] = community.event_types or []
    community_lat = float(community.latitude) if community.latitude is not None else None
    community_lng = float(community.longitude) if community.longitude is not None else None

    # 2. Determine category filter
    matched_categories: list[str] = []
    if category:
        matched_categories = [category]
    elif match_interests and community_event_types:
        matched_categories = get_matched_categories(community_event_types)

    # 3. Query active artists with categories eagerly loaded
    from sqlalchemy.orm import selectinload
    artist_query = (
        select(Artist)
        .options(selectinload(Artist.categories))
        .where(Artist.status == "active")
    )

    # Price filters
    if min_price is not None:
        artist_query = artist_query.where(Artist.price_single >= min_price)
    if max_price is not None:
        artist_query = artist_query.where(Artist.price_single <= max_price)

    # Category filter via join
    if matched_categories:
        artist_query = (
            artist_query
            .join(ArtistCategory, Artist.id == ArtistCategory.artist_id)
            .join(Category, ArtistCategory.category_id == Category.id)
            .where(Category.slug.in_(matched_categories))
            .distinct()
        )

    artists_result = await db.execute(artist_query)
    artists = artists_result.scalars().unique().all()

    # 4. Fetch upcoming tour dates for distance calc
    tour_dates_by_artist: dict[int, list] = {}
    if community_lat is not None and community_lng is not None:
        td_result = await db.execute(
            select(ArtistTourDate).where(
                ArtistTourDate.start_date >= date.today(),
                ArtistTourDate.latitude.isnot(None),
                ArtistTourDate.longitude.isnot(None),
            )
        )
        for td in td_result.scalars().all():
            tour_dates_by_artist.setdefault(td.artist_id, []).append(td)

    # 5. Build discover items
    items: list[DiscoverArtistItem] = []
    for artist in artists:
        artist_cat_slugs = [c.slug for c in artist.categories]

        # Interest score
        interest_score = calculate_interest_score(community_event_types, artist_cat_slugs)

        # Matched event types for this artist
        artist_matched_events: list[str] = []
        for et in community_event_types:
            et_cats = EVENT_TYPE_TO_CATEGORIES.get(et, [])
            if any(s in artist_cat_slugs for s in et_cats):
                artist_matched_events.append(et)

        # Nearest tour date within radius
        nearest_tour: NearbyTourDateInfo | None = None
        if community_lat is not None and community_lng is not None:
            artist_tour_dates = tour_dates_by_artist.get(artist.id, [])
            best_dist = float("inf")
            for td in artist_tour_dates:
                dist = haversine_distance(
                    community_lat, community_lng,
                    float(td.latitude), float(td.longitude),
                )
                if dist < best_dist:
                    best_dist = dist
                    nearest_tour = NearbyTourDateInfo(
                        location=td.location,
                        start_date=td.start_date,
                        distance_km=round(dist, 1),
                    )

        # touring_only filter
        if touring_only:
            if nearest_tour is None or nearest_tour.distance_km > radius_km:
                continue

        items.append(DiscoverArtistItem(
            id=artist.id,
            name_he=artist.name_he,
            name_en=artist.name_en,
            bio_en=artist.bio_en,
            profile_image=artist.profile_image,
            price_single=artist.price_single,
            city=artist.city,
            country=artist.country,
            is_featured=artist.is_featured,
            categories=[
                {"id": c.id, "name_he": c.name_he, "name_en": c.name_en, "slug": c.slug, "icon": c.icon, "sort_order": c.sort_order}
                for c in artist.categories
            ],
            subcategories=artist.subcategories or [],
            interest_score=interest_score,
            matched_event_types=artist_matched_events,
            nearest_tour_date=nearest_tour,
        ))

    # 6. Sort
    if sort_by == "price_asc":
        items.sort(key=lambda x: (x.price_single or 0,))
    elif sort_by == "price_desc":
        items.sort(key=lambda x: (x.price_single or 0,), reverse=True)
    elif sort_by == "distance":
        items.sort(key=lambda x: (x.nearest_tour_date.distance_km if x.nearest_tour_date else float("inf"),))
    elif sort_by == "name":
        items.sort(key=lambda x: (x.name_en or x.name_he).lower())
    else:
        # relevance: featured first, then touring-nearby, then interest_score desc
        items.sort(
            key=lambda x: (
                not x.is_featured,
                x.nearest_tour_date is None,
                -x.interest_score,
                (x.name_en or x.name_he).lower(),
            )
        )

    total = len(items)
    paged = items[offset : offset + limit]

    return DiscoverResponse(
        artists=paged,
        total=total,
        matched_categories=matched_categories,
        community_event_types=community_event_types,
    )


@router.get("/{community_id}", response_model=CommunityResponse)
async def get_community(community_id: int, db: AsyncSession = Depends(get_db)):
    """Get community profile by ID."""
    result = await db.execute(
        select(Community).where(Community.id == community_id)
    )
    community = result.scalar_one_or_none()

    if not community:
        raise HTTPException(status_code=404, detail="Host not found")

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
            detail="A host with this name already exists. Please use a different name or contact support."
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

    # Geocode location if lat/long not provided
    latitude = request.latitude
    longitude = request.longitude
    if latitude is None or longitude is None:
        coords = await geocode_location(request.location)
        if coords:
            latitude, longitude = coords

    # Create community profile
    community = Community(
        user_id=user.id,
        name=request.community_name,
        community_type=request.community_type,
        location=request.location,
        latitude=latitude,
        longitude=longitude,
        member_count_min=request.member_count_min,
        member_count_max=request.member_count_max,
        event_types=request.event_types,
        contact_role=request.contact_role,
        phone=request.phone,
        audience_size=request.audience_size,
        language=request.language,
        receive_artist_offers=request.receive_artist_offers,
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
        raise HTTPException(status_code=404, detail="Host not found")

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
                detail="A host with this name already exists."
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
        raise HTTPException(status_code=404, detail="Host not found")

    community.status = "inactive"
    await db.commit()

    return {"message": "Community deactivated successfully"}
