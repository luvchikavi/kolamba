"""Bookings router - booking request management."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
from datetime import date

from app.database import get_db
from app.models.booking import Booking
from app.models.artist import Artist
from app.models.community import Community
from app.schemas.booking import BookingCreate, BookingUpdate, BookingResponse

router = APIRouter()


class BookingCreateRequest(BaseModel):
    """Request body for creating a booking."""
    artist_id: int
    requested_date: Optional[date] = None
    location: Optional[str] = None
    budget: Optional[int] = None
    notes: Optional[str] = None


@router.post("", response_model=BookingResponse)
async def create_booking(
    request: BookingCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create new booking request."""
    # Verify artist exists
    artist_result = await db.execute(
        select(Artist).where(Artist.id == request.artist_id)
    )
    artist = artist_result.scalar_one_or_none()
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")

    # For MVP, we'll use a placeholder community_id (1)
    # In production, this would come from the authenticated user
    community_id = 1

    booking = Booking(
        artist_id=request.artist_id,
        community_id=community_id,
        requested_date=request.requested_date,
        location=request.location,
        budget=request.budget,
        notes=request.notes,
        status="pending",
    )
    db.add(booking)
    await db.commit()
    await db.refresh(booking)

    return booking


@router.get("", response_model=list[BookingResponse])
async def list_bookings(
    status: Optional[str] = Query(None, description="Filter by status"),
    artist_id: Optional[int] = Query(None, description="Filter by artist"),
    community_id: Optional[int] = Query(None, description="Filter by community"),
    limit: int = Query(20, le=100),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db),
):
    """List bookings with optional filters."""
    query = select(Booking)

    if status:
        query = query.where(Booking.status == status)
    if artist_id:
        query = query.where(Booking.artist_id == artist_id)
    if community_id:
        query = query.where(Booking.community_id == community_id)

    query = query.order_by(Booking.created_at.desc()).offset(offset).limit(limit)

    result = await db.execute(query)
    bookings = result.scalars().all()
    return bookings


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(booking_id: int, db: AsyncSession = Depends(get_db)):
    """Get booking details."""
    result = await db.execute(
        select(Booking).where(Booking.id == booking_id)
    )
    booking = result.scalar_one_or_none()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    return booking


@router.put("/{booking_id}", response_model=BookingResponse)
async def update_booking(
    booking_id: int,
    update_data: BookingUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update booking status (approve/reject)."""
    result = await db.execute(
        select(Booking).where(Booking.id == booking_id)
    )
    booking = result.scalar_one_or_none()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Update fields
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(booking, field, value)

    await db.commit()
    await db.refresh(booking)

    return booking


@router.delete("/{booking_id}")
async def cancel_booking(booking_id: int, db: AsyncSession = Depends(get_db)):
    """Cancel a booking."""
    result = await db.execute(
        select(Booking).where(Booking.id == booking_id)
    )
    booking = result.scalar_one_or_none()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.status = "cancelled"
    await db.commit()

    return {"message": "Booking cancelled successfully"}
