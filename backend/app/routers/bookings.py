"""Bookings router - booking request management."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
from datetime import date

from app.database import get_db
from app.models.booking import Booking
from app.models.artist import Artist
from app.models.community import Community
from app.models.user import User
from app.models.conversation import Conversation
from app.schemas.booking import BookingCreate, BookingUpdate, BookingResponse
from app.routers.auth import get_current_user

from app.rate_limit import limiter
from app.routers.notifications import create_notification

router = APIRouter()


class BookingCreateRequest(BaseModel):
    """Request body for creating a booking."""
    artist_id: int
    requested_date: Optional[date] = None
    location: Optional[str] = None
    budget: Optional[int] = None
    notes: Optional[str] = None


@router.post("", response_model=BookingResponse)
@limiter.limit("10/minute")
async def create_booking(
    request: Request,
    body: BookingCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create new booking request. Requires authenticated community user."""
    # Verify artist exists
    artist_result = await db.execute(
        select(Artist).where(Artist.id == body.artist_id)
    )
    artist = artist_result.scalar_one_or_none()
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")

    # Require community role (or superuser for testing)
    if current_user.role != "community" and not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="Only community accounts can create bookings. Please register as a community first.",
        )

    # Get community_id from authenticated user
    community_result = await db.execute(
        select(Community).where(Community.user_id == current_user.id)
    )
    community = community_result.scalar_one_or_none()

    if not community and not current_user.is_superuser:
        raise HTTPException(
            status_code=404,
            detail="Community profile not found. Please complete your community registration.",
        )

    community_id = community.id if community else None

    # Superuser fallback: use first community for testing
    if community_id is None and current_user.is_superuser:
        first_community = await db.execute(select(Community).limit(1))
        fc = first_community.scalar_one_or_none()
        if not fc:
            raise HTTPException(status_code=400, detail="No communities exist in the database")
        community_id = fc.id

    booking = Booking(
        artist_id=body.artist_id,
        community_id=community_id,
        requested_date=body.requested_date,
        location=body.location,
        budget=body.budget,
        notes=body.notes,
        status="pending",
    )
    db.add(booking)
    await db.flush()

    # Auto-create a conversation for this booking
    conversation = Conversation(booking_id=booking.id)
    db.add(conversation)

    # Notify the artist about the new booking
    community_name = community.name if community else "A community"
    await create_notification(
        db=db,
        user_id=artist.user_id,
        type="booking_new",
        title="New Booking Request",
        message=f"{community_name} has sent you a booking request for {body.location or 'an event'}.",
        link=f"/dashboard/artist?tab=bookings",
    )

    await db.commit()
    await db.refresh(booking)

    return booking


class BookingWithArtistResponse(BaseModel):
    """Booking response with artist name."""
    id: int
    artist_id: int
    artist_name: str
    community_id: int
    requested_date: Optional[date] = None
    location: Optional[str] = None
    budget: Optional[int] = None
    notes: Optional[str] = None
    status: str
    created_at: str

    class Config:
        from_attributes = True


@router.get("/my-bookings", response_model=list[BookingWithArtistResponse])
async def get_my_bookings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get bookings for the authenticated community with artist names."""
    if current_user.role != "community":
        raise HTTPException(status_code=403, detail="Only communities can access this endpoint")

    # Get the community for this user
    community_result = await db.execute(
        select(Community).where(Community.user_id == current_user.id)
    )
    community = community_result.scalar_one_or_none()

    if not community:
        raise HTTPException(status_code=404, detail="Community not found")

    # Get bookings with artist info
    result = await db.execute(
        select(Booking, Artist)
        .join(Artist, Booking.artist_id == Artist.id)
        .where(Booking.community_id == community.id)
        .order_by(Booking.created_at.desc())
    )
    rows = result.all()

    bookings = []
    for booking, artist in rows:
        bookings.append(BookingWithArtistResponse(
            id=booking.id,
            artist_id=booking.artist_id,
            artist_name=artist.name_en or artist.name_he,
            community_id=booking.community_id,
            requested_date=booking.requested_date,
            location=booking.location,
            budget=booking.budget,
            notes=booking.notes,
            status=booking.status,
            created_at=booking.created_at.isoformat(),
        ))

    return bookings


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
