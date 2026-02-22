"""Bookings router - booking request management."""

from typing import Optional
from datetime import date, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from pydantic import BaseModel

from app.database import get_db
from app.models.booking import Booking
from app.models.artist import Artist
from app.models.community import Community
from app.models.user import User
from app.models.conversation import Conversation, Message
from app.schemas.booking import BookingCreate, BookingUpdate, BookingResponse, QuoteSubmit, QuoteResponse
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
    event_type: Optional[str] = None
    audience_size: Optional[int] = None
    audience_description: Optional[str] = None
    is_online: Optional[bool] = False


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
        raise HTTPException(status_code=404, detail="Talent not found")

    # Require community role (or superuser for testing)
    if current_user.role != "community" and not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="Only host accounts can create bookings. Please register as a host first.",
        )

    # Get community_id from authenticated user
    community_result = await db.execute(
        select(Community).where(Community.user_id == current_user.id)
    )
    community = community_result.scalar_one_or_none()

    if not community and not current_user.is_superuser:
        raise HTTPException(
            status_code=404,
            detail="Host profile not found. Please complete your host registration.",
        )

    community_id = community.id if community else None

    # Superuser fallback: use first community for testing
    if community_id is None and current_user.is_superuser:
        first_community = await db.execute(select(Community).limit(1))
        fc = first_community.scalar_one_or_none()
        if not fc:
            raise HTTPException(status_code=400, detail="No hosts exist in the database")
        community_id = fc.id

    booking = Booking(
        artist_id=body.artist_id,
        community_id=community_id,
        requested_date=body.requested_date,
        location=body.location,
        budget=body.budget,
        notes=body.notes,
        event_type=body.event_type,
        audience_size=body.audience_size,
        audience_description=body.audience_description,
        is_online=body.is_online or False,
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
        link=f"/dashboard/talent?tab=bookings",
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
    # Quote flow fields
    event_type: Optional[str] = None
    audience_size: Optional[int] = None
    audience_description: Optional[str] = None
    is_online: Optional[bool] = None
    quote_amount: Optional[float] = None
    quote_notes: Optional[str] = None
    quoted_at: Optional[str] = None
    decline_reason: Optional[str] = None

    class Config:
        from_attributes = True


@router.get("/my-bookings", response_model=list[BookingWithArtistResponse])
async def get_my_bookings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get bookings for the authenticated community with artist names."""
    if current_user.role != "community":
        raise HTTPException(status_code=403, detail="Only hosts can access this endpoint")

    # Get the community for this user
    community_result = await db.execute(
        select(Community).where(Community.user_id == current_user.id)
    )
    community = community_result.scalar_one_or_none()

    if not community:
        raise HTTPException(status_code=404, detail="Host not found")

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
            event_type=booking.event_type,
            audience_size=booking.audience_size,
            audience_description=booking.audience_description,
            is_online=booking.is_online,
            quote_amount=booking.quote_amount,
            quote_notes=booking.quote_notes,
            quoted_at=booking.quoted_at.isoformat() if booking.quoted_at else None,
            decline_reason=booking.decline_reason,
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


# --- Quote Flow Endpoints ---


@router.post("/{booking_id}/quote", response_model=BookingResponse)
async def submit_quote(
    booking_id: int,
    body: QuoteSubmit,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit a price quote for a booking. Talent (artist) only."""
    # Load booking with conversation
    result = await db.execute(
        select(Booking)
        .options(selectinload(Booking.conversation))
        .where(Booking.id == booking_id)
    )
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Verify current user is the talent on this booking
    artist_result = await db.execute(
        select(Artist).where(Artist.id == booking.artist_id)
    )
    artist = artist_result.scalar_one_or_none()
    if not artist or artist.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the talent on this booking can submit a quote")

    # Validate status
    if booking.status != "pending":
        raise HTTPException(status_code=400, detail=f"Cannot submit quote: booking status is '{booking.status}', expected 'pending'")

    # Set quote fields
    booking.quote_amount = body.quote_amount
    booking.quote_notes = body.quote_notes
    booking.quoted_at = datetime.now(timezone.utc)
    booking.status = "quote_sent"

    # Auto-create message in conversation
    if booking.conversation:
        quote_msg = f"Quote submitted: ${body.quote_amount:,.2f}"
        if body.quote_notes:
            quote_msg += f"\n\nWhat's included:\n{body.quote_notes}"
        message = Message(
            conversation_id=booking.conversation.id,
            sender_id=current_user.id,
            content=quote_msg,
        )
        db.add(message)

    # Notify the host
    community_result = await db.execute(
        select(Community).where(Community.id == booking.community_id)
    )
    community = community_result.scalar_one_or_none()
    if community:
        artist_name = artist.name_en or artist.name_he or "A talent"
        await create_notification(
            db=db,
            user_id=community.user_id,
            type="quote_received",
            title="Quote Received",
            message=f"{artist_name} has submitted a quote of ${body.quote_amount:,.2f} for your booking.",
            link="/dashboard/host/messages",
        )

    await db.commit()
    await db.refresh(booking)
    return booking


@router.post("/{booking_id}/respond", response_model=BookingResponse)
async def respond_to_quote(
    booking_id: int,
    body: QuoteResponse,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Respond to a quote (approve/decline/request_changes). Host (community) only."""
    # Load booking with conversation
    result = await db.execute(
        select(Booking)
        .options(selectinload(Booking.conversation))
        .where(Booking.id == booking_id)
    )
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Verify current user is the host on this booking
    community_result = await db.execute(
        select(Community).where(Community.id == booking.community_id)
    )
    community = community_result.scalar_one_or_none()
    if not community or community.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the host on this booking can respond to the quote")

    # Validate status
    if booking.status != "quote_sent":
        raise HTTPException(status_code=400, detail=f"Cannot respond to quote: booking status is '{booking.status}', expected 'quote_sent'")

    # Get artist for notifications
    artist_result = await db.execute(
        select(Artist).where(Artist.id == booking.artist_id)
    )
    artist = artist_result.scalar_one_or_none()

    community_name = community.name or "Host"

    if body.action == "approve":
        booking.status = "approved"
        auto_msg = "Booking approved!"

        if artist:
            await create_notification(
                db=db,
                user_id=artist.user_id,
                type="quote_approved",
                title="Quote Approved",
                message=f"{community_name} has approved your quote of ${booking.quote_amount:,.2f}!",
                link="/dashboard/talent/messages",
            )

    elif body.action == "decline":
        booking.status = "declined"
        booking.decline_reason = body.decline_reason
        reason_text = body.decline_reason or "No reason provided"
        auto_msg = f"Quote declined: {reason_text}"

        if artist:
            await create_notification(
                db=db,
                user_id=artist.user_id,
                type="quote_declined",
                title="Quote Declined",
                message=f"{community_name} has declined your quote. Reason: {reason_text}",
                link="/dashboard/talent/messages",
            )

    elif body.action == "request_changes":
        booking.status = "pending"
        # Clear previous quote so talent can submit a new one
        booking.quote_amount = None
        booking.quote_notes = None
        booking.quoted_at = None
        reason_text = body.decline_reason or "Please revise your quote"
        auto_msg = f"Changes requested: {reason_text}"

        if artist:
            await create_notification(
                db=db,
                user_id=artist.user_id,
                type="quote_changes_requested",
                title="Changes Requested",
                message=f"{community_name} has requested changes to your quote: {reason_text}",
                link="/dashboard/talent/messages",
            )

    # Auto-create message in conversation
    if booking.conversation:
        message = Message(
            conversation_id=booking.conversation.id,
            sender_id=current_user.id,
            content=auto_msg,
        )
        db.add(message)

    await db.commit()
    await db.refresh(booking)
    return booking
