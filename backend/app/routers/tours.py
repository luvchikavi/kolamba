"""Tours router - tour management and suggestions."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.tour import Tour
from app.models.booking import Booking
from app.models.artist import Artist
from app.schemas.tour import (
    TourCreate,
    TourUpdate,
    TourResponse,
    TourSuggestion,
)
from app.services.tour_grouping import suggest_tours

router = APIRouter()


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
        raise HTTPException(status_code=404, detail="Artist not found")

    suggestions = await suggest_tours(
        db=db,
        artist_id=artist_id,
        max_distance_km=max_distance_km,
        min_bookings=min_bookings,
    )

    return suggestions


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
        raise HTTPException(status_code=404, detail="Artist not found")

    # Create the tour
    tour = Tour(
        artist_id=tour_data.artist_id,
        name=tour_data.name,
        region=tour_data.region,
        start_date=tour_data.start_date,
        end_date=tour_data.end_date,
        total_budget=tour_data.total_budget,
        description=tour_data.description,
        status="draft",
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

        for booking in bookings:
            booking.tour_id = tour.id

    await db.commit()
    await db.refresh(tour)

    # Load relationships for response
    result = await db.execute(
        select(Tour)
        .options(selectinload(Tour.bookings))
        .where(Tour.id == tour.id)
    )
    tour = result.scalar_one()

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
    query = select(Tour).options(selectinload(Tour.bookings))

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
    """Get tour details with all bookings."""
    result = await db.execute(
        select(Tour)
        .options(selectinload(Tour.bookings))
        .where(Tour.id == tour_id)
    )
    tour = result.scalar_one_or_none()

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
    await db.refresh(tour)

    # Load relationships for response
    result = await db.execute(
        select(Tour)
        .options(selectinload(Tour.bookings))
        .where(Tour.id == tour.id)
    )
    tour = result.scalar_one()

    return tour


@router.post("/{tour_id}/bookings/{booking_id}")
async def add_booking_to_tour(
    tour_id: int,
    booking_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Add a booking to an existing tour."""
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
            detail="Booking does not belong to the tour's artist"
        )

    # Add booking to tour
    booking.tour_id = tour_id
    await db.commit()

    return {"message": "Booking added to tour successfully"}


@router.delete("/{tour_id}/bookings/{booking_id}")
async def remove_booking_from_tour(
    tour_id: int,
    booking_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Remove a booking from a tour."""
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

    # Delete the tour
    await db.delete(tour)
    await db.commit()

    return {"message": "Tour deleted successfully"}
