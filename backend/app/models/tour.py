"""Tour model for grouping bookings into tours."""

from datetime import datetime, date
from typing import TYPE_CHECKING, Optional
from sqlalchemy import String, Integer, Date, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.artist import Artist
    from app.models.booking import Booking


class Tour(Base):
    """Tour model - groups multiple bookings for efficient touring."""

    __tablename__ = "tours"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    artist_id: Mapped[int] = mapped_column(
        ForeignKey("artists.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Tour details
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    region: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)  # e.g., "Northeast USA"

    # Date range
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    # Pricing
    total_budget: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Notes and description
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Status: draft, proposed, confirmed, in_progress, completed, cancelled
    status: Mapped[str] = mapped_column(String(20), default="draft")

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    artist: Mapped["Artist"] = relationship("Artist", back_populates="tours")
    bookings: Mapped[list["Booking"]] = relationship("Booking", back_populates="tour")


class TourBooking(Base):
    """Association table for tours and bookings with additional metadata."""

    __tablename__ = "tour_bookings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    tour_id: Mapped[int] = mapped_column(
        ForeignKey("tours.id", ondelete="CASCADE"),
        nullable=False,
    )
    booking_id: Mapped[int] = mapped_column(
        ForeignKey("bookings.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Suggested order in the tour
    sequence_order: Mapped[int] = mapped_column(Integer, default=0)

    # Suggested date for this specific booking within the tour
    suggested_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    # Notes specific to this stop
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class TourJoinRequest(Base):
    """Request from a community to join an existing tour."""

    __tablename__ = "tour_join_requests"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    tour_id: Mapped[int] = mapped_column(
        ForeignKey("tours.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    community_id: Mapped[int] = mapped_column(
        ForeignKey("communities.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Request details
    preferred_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    budget: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Status: pending, approved, rejected
    status: Mapped[str] = mapped_column(String(20), default="pending")

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
