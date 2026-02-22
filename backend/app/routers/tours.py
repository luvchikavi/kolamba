"""Tours router - tour management and suggestions."""

from datetime import date as date_type
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func as sa_func
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.tour import Tour, TourStop, TourJoinRequest
from app.models.booking import Booking
from app.models.artist import Artist
from app.models.community import Community
from app.models.user import User
from app.routers.auth import get_current_active_user
from app.schemas.tour import (
    TourCreate,
    TourUpdate,
    TourResponse,
    TourSuggestion,
    TourStopCreate,
    TourStopUpdate,
    TourStopResponse,
    NearbyTourResponse,
    JoinTourRequest,
    TourJoinRequestResponse,
    TourOpportunityResponse,
    TourOpportunityArtist,
)
from app.schemas.artist import calculate_price_tier
from app.services.tour_grouping import suggest_tours, find_nearby_tours
from app.config import get_settings

router = APIRouter()
settings = get_settings()


async def _load_tour_with_relations(db: AsyncSession, tour_id: int) -> Tour | None:
    """Load a tour with bookings and stops eagerly loaded."""
    result = await db.execute(
        select(Tour)
        .options(selectinload(Tour.bookings), selectinload(Tour.stops))
        .where(Tour.id == tour_id)
    )
    return result.scalar_one_or_none()


@router.post("/admin/create-test-tour")
async def create_test_tour(
    artist_id: int = Query(None, description="Artist ID (optional, uses first active artist if not provided)"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a test tour for admin testing. Requires superuser + development env."""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Superuser access required")
    if settings.env != "development":
        raise HTTPException(status_code=403, detail="Test endpoints are only available in development environment")

    # Get artist
    if artist_id:
        artist_result = await db.execute(
            select(Artist).where(Artist.id == artist_id, Artist.status == "active")
        )
    else:
        # Get first active artist
        artist_result = await db.execute(
            select(Artist).where(Artist.status == "active").limit(1)
        )

    artist = artist_result.scalar_one_or_none()
    if not artist:
        raise HTTPException(status_code=404, detail="No active talent found")

    from datetime import date, timedelta

    # Create test tour
    tour = Tour(
        artist_id=artist.id,
        name=f"Test Tour - {artist.name_en or artist.name_he}",
        region="Northeast USA",
        start_date=date.today() + timedelta(days=14),
        end_date=date.today() + timedelta(days=30),
        price_per_show=5000,
        description="This is a test tour to verify the tour feature is working correctly.",
        status="pending",
    )
    db.add(tour)
    await db.commit()
    await db.refresh(tour)

    return {
        "message": "Test tour created successfully!",
        "tour": {
            "id": tour.id,
            "name": tour.name,
            "artist_id": tour.artist_id,
            "artist_name": artist.name_en or artist.name_he,
            "region": tour.region,
            "start_date": tour.start_date.isoformat(),
            "end_date": tour.end_date.isoformat(),
            "price_per_show": tour.price_per_show,
            "status": tour.status,
        }
    }


@router.get("/opportunities", response_model=list[TourOpportunityResponse])
async def get_tour_opportunities(
    region: Optional[str] = Query(None, description="Filter by region"),
    status: Optional[str] = Query(None, pattern="^(pending|approved)$", description="Filter by status"),
    limit: int = Query(20, le=100),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db),
):
    """
    Get public tour opportunities for communities to browse.

    Returns tours that are either:
    - pending: Artist has announced availability, waiting for bookings
    - approved: Has confirmed bookings, open for more communities to join

    Communities can use this to find artists touring in their region.
    """
    from datetime import date

    # Build query for tours with artist info
    query = (
        select(Tour, Artist)
        .join(Artist, Tour.artist_id == Artist.id)
        .where(Tour.status.in_(["pending", "approved"]))
        .where(Artist.status == "active")
    )

    # Only show tours with future dates
    query = query.where(
        (Tour.start_date >= date.today()) | (Tour.start_date.is_(None))
    )

    if region:
        query = query.where(Tour.region.ilike(f"%{region}%"))

    if status:
        query = query.where(Tour.status == status)

    query = query.order_by(Tour.start_date.asc().nulls_last(), Tour.created_at.desc())
    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    rows = result.all()

    # Get booking counts for each tour
    tour_ids = [tour.id for tour, artist in rows]
    booking_counts = {}
    if tour_ids:
        booking_result = await db.execute(
            select(Booking.tour_id, sa.func.count(Booking.id))
            .where(Booking.tour_id.in_(tour_ids))
            .where(Booking.status.in_(["approved", "confirmed"]))
            .group_by(Booking.tour_id)
        )
        booking_counts = dict(booking_result.all())

    opportunities = []
    for tour, artist in rows:
        opportunities.append(
            TourOpportunityResponse(
                id=tour.id,
                name=tour.name,
                region=tour.region,
                start_date=tour.start_date,
                end_date=tour.end_date,
                description=tour.description,
                price_tier=calculate_price_tier(tour.price_per_show),
                status=tour.status,
                confirmed_shows=booking_counts.get(tour.id, 0),
                artist=TourOpportunityArtist(
                    id=artist.id,
                    name_en=artist.name_en,
                    name_he=artist.name_he,
                    profile_image=artist.profile_image,
                    city=artist.city,
                    country=artist.country,
                ),
                created_at=tour.created_at,
            )
        )

    return opportunities


@router.get("/suggestions", response_model=list[TourSuggestion])
async def get_tour_suggestions(
    artist_id: int = Query(..., description="Artist ID to get suggestions for"),
    max_distance_km: float = Query(500, description="Maximum distance between communities"),
    min_bookings: int = Query(2, description="Minimum bookings to form a tour"),
    db: AsyncSession = Depends(get_db),
):
    """
    Get tour suggestions based on pending bookings.

    Analyzes pending bookings for an artist and suggests optimal tour groupings
    based on geographic proximity of communities.
    """
    # Verify artist exists
    artist_result = await db.execute(
        select(Artist).where(Artist.id == artist_id)
    )
    artist = artist_result.scalar_one_or_none()
    if not artist:
        raise HTTPException(status_code=404, detail="Talent not found")

    suggestions = await suggest_tours(
        db=db,
        artist_id=artist_id,
        max_distance_km=max_distance_km,
        min_bookings=min_bookings,
    )

    return suggestions


@router.get("/nearby", response_model=list[NearbyTourResponse])
async def get_nearby_tours(
    community_id: int = Query(..., description="Community ID to find nearby tours for"),
    radius_km: float = Query(500, description="Search radius in kilometers"),
    db: AsyncSession = Depends(get_db),
):
    """
    Find tours with confirmed bookings near a community.

    This is the core feature for tour discovery - allows communities to see
    which artists are coming to their area and potentially join their tours.
    """
    # Verify community exists
    community_result = await db.execute(
        select(Community).where(Community.id == community_id)
    )
    community = community_result.scalar_one_or_none()
    if not community:
        raise HTTPException(status_code=404, detail="Host not found")

    if community.latitude is None or community.longitude is None:
        raise HTTPException(
            status_code=400,
            detail="Host location not set. Please update your profile with your address."
        )

    nearby = await find_nearby_tours(
        db=db,
        community_id=community_id,
        radius_km=radius_km,
    )

    return nearby


@router.post("/{tour_id}/join-request", response_model=TourJoinRequestResponse)
async def request_to_join_tour(
    tour_id: int,
    request: JoinTourRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Submit a request to join an existing tour.

    Communities can request to be added to an artist's tour. The artist/admin
    will review and approve/reject the request.
    """
    # Verify tour exists and is open for joining
    tour_result = await db.execute(
        select(Tour).where(Tour.id == tour_id)
    )
    tour = tour_result.scalar_one_or_none()
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")

    if tour.status not in ["pending", "approved"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot join tour with status '{tour.status}'. Tour must be 'pending' or 'approved'."
        )

    # Verify community exists
    community_result = await db.execute(
        select(Community).where(Community.id == request.community_id)
    )
    community = community_result.scalar_one_or_none()
    if not community:
        raise HTTPException(status_code=404, detail="Host not found")

    # Check if there's already a pending request
    existing_request = await db.execute(
        select(TourJoinRequest).where(
            TourJoinRequest.tour_id == tour_id,
            TourJoinRequest.community_id == request.community_id,
            TourJoinRequest.status == "pending",
        )
    )
    if existing_request.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="You already have a pending request to join this tour."
        )

    # Create the join request
    join_request = TourJoinRequest(
        tour_id=tour_id,
        community_id=request.community_id,
        preferred_date=request.preferred_date,
        budget=request.budget,
        notes=request.notes,
        status="pending",
    )
    db.add(join_request)
    await db.commit()
    await db.refresh(join_request)

    return TourJoinRequestResponse(
        id=join_request.id,
        tour_id=join_request.tour_id,
        community_id=join_request.community_id,
        status=join_request.status,
        preferred_date=join_request.preferred_date,
        budget=join_request.budget,
        notes=join_request.notes,
        created_at=join_request.created_at,
    )


@router.get("/{tour_id}/join-requests", response_model=list[TourJoinRequestResponse])
async def get_tour_join_requests(
    tour_id: int,
    status: Optional[str] = Query(None, description="Filter by status"),
    db: AsyncSession = Depends(get_db),
):
    """Get all join requests for a tour (for artists/admins)."""
    # Verify tour exists
    tour_result = await db.execute(
        select(Tour).where(Tour.id == tour_id)
    )
    tour = tour_result.scalar_one_or_none()
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")

    query = select(TourJoinRequest).where(TourJoinRequest.tour_id == tour_id)
    if status:
        query = query.where(TourJoinRequest.status == status)

    result = await db.execute(query.order_by(TourJoinRequest.created_at.desc()))
    requests = result.scalars().all()

    return [
        TourJoinRequestResponse(
            id=r.id,
            tour_id=r.tour_id,
            community_id=r.community_id,
            status=r.status,
            preferred_date=r.preferred_date,
            budget=r.budget,
            notes=r.notes,
            created_at=r.created_at,
        )
        for r in requests
    ]


@router.put("/{tour_id}/join-requests/{request_id}")
async def update_join_request_status(
    tour_id: int,
    request_id: int,
    new_status: str = Query(..., pattern="^(approved|rejected)$"),
    db: AsyncSession = Depends(get_db),
):
    """Approve or reject a tour join request."""
    # Get the request
    request_result = await db.execute(
        select(TourJoinRequest).where(
            TourJoinRequest.id == request_id,
            TourJoinRequest.tour_id == tour_id,
        )
    )
    join_request = request_result.scalar_one_or_none()
    if not join_request:
        raise HTTPException(status_code=404, detail="Join request not found")

    if join_request.status != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"Request already {join_request.status}"
        )

    join_request.status = new_status
    await db.commit()

    # If approved, create a booking for this community
    if new_status == "approved":
        tour_result = await db.execute(
            select(Tour).where(Tour.id == tour_id)
        )
        tour = tour_result.scalar_one()

        booking = Booking(
            artist_id=tour.artist_id,
            community_id=join_request.community_id,
            tour_id=tour_id,
            requested_date=join_request.preferred_date,
            budget=join_request.budget,
            notes=f"Joined tour via request. {join_request.notes or ''}".strip(),
            status="approved",
        )
        db.add(booking)
        await db.flush()

        # Auto-create a TourStop for the new booking
        stop = TourStop(
            tour_id=tour_id,
            booking_id=booking.id,
            date=join_request.preferred_date or date_type.today(),
            city=None,
            status="confirmed",
        )
        db.add(stop)
        await db.commit()

        return {
            "message": "Join request approved. A booking has been created.",
            "booking_id": booking.id,
        }

    return {"message": f"Join request {new_status}"}


@router.post("", response_model=TourResponse)
async def create_tour(
    tour_data: TourCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new tour and optionally add bookings to it."""
    # Verify artist exists
    artist_result = await db.execute(
        select(Artist).where(Artist.id == tour_data.artist_id)
    )
    artist = artist_result.scalar_one_or_none()
    if not artist:
        raise HTTPException(status_code=404, detail="Talent not found")

    # Create the tour
    tour = Tour(
        artist_id=tour_data.artist_id,
        name=tour_data.name,
        region=tour_data.region,
        start_date=tour_data.start_date,
        end_date=tour_data.end_date,
        total_budget=tour_data.total_budget,
        price_per_show=tour_data.price_per_show,
        min_tour_budget=tour_data.min_tour_budget,
        description=tour_data.description,
        max_travel_hours=tour_data.max_travel_hours,
        min_shows_per_week=tour_data.min_shows_per_week,
        max_shows_per_week=tour_data.max_shows_per_week,
        rest_day_rule=tour_data.rest_day_rule,
        min_net_profit=tour_data.min_net_profit,
        efficiency_score=tour_data.efficiency_score,
        visa_status=tour_data.visa_status,
        status="pending",  # Artist announces availability, waiting for bookings
    )
    db.add(tour)
    await db.flush()

    # Add bookings to the tour if provided
    if tour_data.booking_ids:
        booking_result = await db.execute(
            select(Booking).where(
                Booking.id.in_(tour_data.booking_ids),
                Booking.artist_id == tour_data.artist_id,
            )
        )
        bookings = booking_result.scalars().all()

        for idx, booking in enumerate(bookings):
            booking.tour_id = tour.id
            # Auto-create a TourStop for each booking
            stop = TourStop(
                tour_id=tour.id,
                booking_id=booking.id,
                date=booking.requested_date or date_type.today(),
                city=booking.location,
                sequence_order=idx,
                status="confirmed" if booking.status in ("approved", "confirmed") else "inquiry",
            )
            db.add(stop)

    await db.commit()

    tour = await _load_tour_with_relations(db, tour.id)
    return tour


@router.get("", response_model=list[TourResponse])
async def list_tours(
    artist_id: Optional[int] = Query(None, description="Filter by artist"),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(20, le=100),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db),
):
    """List tours with optional filters."""
    query = select(Tour).options(selectinload(Tour.bookings), selectinload(Tour.stops))

    if artist_id:
        query = query.where(Tour.artist_id == artist_id)
    if status:
        query = query.where(Tour.status == status)

    query = query.order_by(Tour.created_at.desc()).offset(offset).limit(limit)

    result = await db.execute(query)
    tours = result.scalars().all()

    return tours


@router.get("/{tour_id}", response_model=TourResponse)
async def get_tour(tour_id: int, db: AsyncSession = Depends(get_db)):
    """Get tour details with all bookings and stops."""
    tour = await _load_tour_with_relations(db, tour_id)

    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")

    return tour


@router.put("/{tour_id}", response_model=TourResponse)
async def update_tour(
    tour_id: int,
    update_data: TourUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update tour details or status."""
    result = await db.execute(
        select(Tour).where(Tour.id == tour_id)
    )
    tour = result.scalar_one_or_none()

    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")

    # Update fields
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(tour, field, value)

    await db.commit()

    tour = await _load_tour_with_relations(db, tour.id)
    return tour


# --- Tour Stop endpoints ---

@router.post("/{tour_id}/stops", response_model=TourStopResponse)
async def create_tour_stop(
    tour_id: int,
    stop_data: TourStopCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new stop on a tour (anchor show, open slot, or rest day)."""
    # Verify tour exists
    tour_result = await db.execute(select(Tour).where(Tour.id == tour_id))
    tour = tour_result.scalar_one_or_none()
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")

    # If booking_id provided, verify it exists and belongs to same artist
    if stop_data.booking_id:
        booking_result = await db.execute(
            select(Booking).where(Booking.id == stop_data.booking_id)
        )
        booking = booking_result.scalar_one_or_none()
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        if booking.artist_id != tour.artist_id:
            raise HTTPException(status_code=400, detail="Booking does not belong to the tour's talent")

        # Check booking isn't already linked to another stop
        existing_stop = await db.execute(
            select(TourStop).where(TourStop.booking_id == stop_data.booking_id)
        )
        if existing_stop.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Booking is already linked to a tour stop")

    stop = TourStop(
        tour_id=tour_id,
        booking_id=stop_data.booking_id,
        date=stop_data.date,
        city=stop_data.city,
        venue_name=stop_data.venue_name,
        latitude=stop_data.latitude,
        longitude=stop_data.longitude,
        sequence_order=stop_data.sequence_order,
        travel_from_prev=stop_data.travel_from_prev,
        travel_cost=stop_data.travel_cost,
        accommodation_cost=stop_data.accommodation_cost,
        performance_fee=stop_data.performance_fee,
        shared_logistics=stop_data.shared_logistics,
        net_revenue=stop_data.net_revenue,
        route_discount=stop_data.route_discount,
        status=stop_data.status,
        notes=stop_data.notes,
    )
    db.add(stop)
    await db.commit()
    await db.refresh(stop)

    return stop


@router.put("/{tour_id}/stops/{stop_id}", response_model=TourStopResponse)
async def update_tour_stop(
    tour_id: int,
    stop_id: int,
    update_data: TourStopUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a tour stop's details (logistics, financials, status)."""
    result = await db.execute(
        select(TourStop).where(TourStop.id == stop_id, TourStop.tour_id == tour_id)
    )
    stop = result.scalar_one_or_none()
    if not stop:
        raise HTTPException(status_code=404, detail="Tour stop not found")

    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(stop, field, value)

    await db.commit()
    await db.refresh(stop)

    return stop


@router.delete("/{tour_id}/stops/{stop_id}")
async def delete_tour_stop(
    tour_id: int,
    stop_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Remove a stop from a tour."""
    result = await db.execute(
        select(TourStop).where(TourStop.id == stop_id, TourStop.tour_id == tour_id)
    )
    stop = result.scalar_one_or_none()
    if not stop:
        raise HTTPException(status_code=404, detail="Tour stop not found")

    await db.delete(stop)
    await db.commit()

    return {"message": "Tour stop deleted successfully"}


# --- Booking-to-Tour endpoints (kept for backwards compatibility) ---

@router.post("/{tour_id}/bookings/{booking_id}")
async def add_booking_to_tour(
    tour_id: int,
    booking_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Add a booking to an existing tour. Auto-creates a TourStop."""
    # Get the tour
    tour_result = await db.execute(
        select(Tour).where(Tour.id == tour_id)
    )
    tour = tour_result.scalar_one_or_none()
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")

    # Get the booking
    booking_result = await db.execute(
        select(Booking).where(Booking.id == booking_id)
    )
    booking = booking_result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Verify booking belongs to the same artist
    if booking.artist_id != tour.artist_id:
        raise HTTPException(
            status_code=400,
            detail="Booking does not belong to the tour's talent"
        )

    # Add booking to tour
    booking.tour_id = tour_id

    # Auto-create a TourStop for this booking
    # Get next sequence order
    max_seq_result = await db.execute(
        select(sa.func.max(TourStop.sequence_order)).where(TourStop.tour_id == tour_id)
    )
    max_seq = max_seq_result.scalar() or 0

    stop = TourStop(
        tour_id=tour_id,
        booking_id=booking.id,
        date=booking.requested_date or date_type.today(),
        city=booking.location,
        sequence_order=max_seq + 1,
        status="confirmed" if booking.status in ("approved", "confirmed") else "inquiry",
    )
    db.add(stop)
    await db.commit()

    return {"message": "Booking added to tour successfully", "stop_id": stop.id}


@router.delete("/{tour_id}/bookings/{booking_id}")
async def remove_booking_from_tour(
    tour_id: int,
    booking_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Remove a booking from a tour. Also removes the associated TourStop."""
    # Get the booking
    booking_result = await db.execute(
        select(Booking).where(
            Booking.id == booking_id,
            Booking.tour_id == tour_id,
        )
    )
    booking = booking_result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found in tour")

    booking.tour_id = None

    # Remove the associated TourStop
    stop_result = await db.execute(
        select(TourStop).where(
            TourStop.tour_id == tour_id,
            TourStop.booking_id == booking_id,
        )
    )
    stop = stop_result.scalar_one_or_none()
    if stop:
        await db.delete(stop)

    await db.commit()

    return {"message": "Booking removed from tour successfully"}


@router.delete("/{tour_id}")
async def delete_tour(tour_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a tour (removes tour but keeps bookings)."""
    result = await db.execute(
        select(Tour).where(Tour.id == tour_id)
    )
    tour = result.scalar_one_or_none()

    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")

    # Remove tour_id from all bookings
    booking_result = await db.execute(
        select(Booking).where(Booking.tour_id == tour_id)
    )
    bookings = booking_result.scalars().all()
    for booking in bookings:
        booking.tour_id = None

    # Delete the tour (cascade will delete stops)
    await db.delete(tour)
    await db.commit()

    return {"message": "Tour deleted successfully"}
