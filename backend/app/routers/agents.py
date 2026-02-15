"""Agents router - endpoints for talent agents to manage their artists."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone

from app.database import get_db
from app.models.user import User
from app.models.artist import Artist
from app.models.booking import Booking
from app.models.artist_tour_date import ArtistTourDate
from app.routers.auth import get_current_active_user

router = APIRouter()


class AgentArtistResponse(BaseModel):
    """Response for an artist managed by an agent."""
    id: int
    name_en: str
    name_he: str
    profile_image: Optional[str]
    city: Optional[str]
    country: str
    status: str
    created_at: datetime
    pending_bookings: int = 0
    tour_dates_count: int = 0

    class Config:
        from_attributes = True


class AgentDashboardStats(BaseModel):
    """Stats for agent dashboard."""
    total_artists: int
    active_artists: int
    pending_bookings: int
    upcoming_tour_dates: int


@router.get("/me/artists", response_model=list[AgentArtistResponse])
async def get_my_artists(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all artists managed by the current agent."""
    if current_user.role != "agent":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only agents can access this endpoint",
        )

    # Get all artists where agent_user_id matches current user
    result = await db.execute(
        select(Artist)
        .where(Artist.agent_user_id == current_user.id)
        .order_by(Artist.created_at.desc())
    )
    artists = result.scalars().all()
    artist_ids = [a.id for a in artists]

    # Batch query: count pending bookings per artist
    booking_counts: dict[int, int] = {}
    if artist_ids:
        bookings_result = await db.execute(
            select(Booking.artist_id, func.count(Booking.id))
            .where(Booking.artist_id.in_(artist_ids), Booking.status == "pending")
            .group_by(Booking.artist_id)
        )
        booking_counts = dict(bookings_result.all())

    # Batch query: count upcoming tour dates per artist
    tour_date_counts: dict[int, int] = {}
    if artist_ids:
        tour_dates_result = await db.execute(
            select(ArtistTourDate.artist_id, func.count(ArtistTourDate.id))
            .where(
                ArtistTourDate.artist_id.in_(artist_ids),
                ArtistTourDate.start_date >= datetime.now(timezone.utc),
            )
            .group_by(ArtistTourDate.artist_id)
        )
        tour_date_counts = dict(tour_dates_result.all())

    return [
        AgentArtistResponse(
            id=artist.id,
            name_en=artist.name_en or artist.name_he,
            name_he=artist.name_he,
            profile_image=artist.profile_image,
            city=artist.city,
            country=artist.country,
            status=artist.status,
            created_at=artist.created_at,
            pending_bookings=booking_counts.get(artist.id, 0),
            tour_dates_count=tour_date_counts.get(artist.id, 0),
        )
        for artist in artists
    ]


@router.get("/me/stats", response_model=AgentDashboardStats)
async def get_my_stats(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get dashboard stats for the current agent."""
    if current_user.role != "agent":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only agents can access this endpoint",
        )

    # Get all artists managed by this agent
    artists_result = await db.execute(
        select(Artist).where(Artist.agent_user_id == current_user.id)
    )
    artists = artists_result.scalars().all()
    artist_ids = [a.id for a in artists]

    total_artists = len(artists)
    active_artists = len([a for a in artists if a.status == "active"])

    # Count pending bookings across all artists
    if artist_ids:
        bookings_result = await db.execute(
            select(Booking).where(
                Booking.artist_id.in_(artist_ids),
                Booking.status == "pending"
            )
        )
        pending_bookings = len(bookings_result.scalars().all())

        # Count upcoming tour dates
        tour_dates_result = await db.execute(
            select(ArtistTourDate).where(
                ArtistTourDate.artist_id.in_(artist_ids),
                ArtistTourDate.start_date >= datetime.now(timezone.utc)
            )
        )
        upcoming_tour_dates = len(tour_dates_result.scalars().all())
    else:
        pending_bookings = 0
        upcoming_tour_dates = 0

    return AgentDashboardStats(
        total_artists=total_artists,
        active_artists=active_artists,
        pending_bookings=pending_bookings,
        upcoming_tour_dates=upcoming_tour_dates,
    )


@router.get("/me/bookings")
async def get_my_artists_bookings(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all bookings for artists managed by the current agent."""
    if current_user.role != "agent":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only agents can access this endpoint",
        )

    # Get artist IDs managed by this agent
    artists_result = await db.execute(
        select(Artist.id, Artist.name_en).where(Artist.agent_user_id == current_user.id)
    )
    artists_data = artists_result.all()
    artist_ids = [a[0] for a in artists_data]
    artist_names = {a[0]: a[1] for a in artists_data}

    if not artist_ids:
        return []

    # Get all bookings for these artists
    bookings_result = await db.execute(
        select(Booking)
        .where(Booking.artist_id.in_(artist_ids))
        .order_by(Booking.created_at.desc())
    )
    bookings = bookings_result.scalars().all()

    return [
        {
            "id": b.id,
            "artist_id": b.artist_id,
            "artist_name": artist_names.get(b.artist_id, "Unknown"),
            "location": b.location,
            "requested_date": b.requested_date,
            "budget": b.budget,
            "status": b.status,
            "created_at": b.created_at,
        }
        for b in bookings
    ]
