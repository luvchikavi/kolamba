"""Tour model for grouping bookings into tours."""

from datetime import datetime, date, timezone
from decimal import Decimal
from typing import TYPE_CHECKING, Optional
from sqlalchemy import String, Integer, Float, Date, DateTime, Text, Numeric, ForeignKey
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
    price_per_show: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # Artist's price per show on this tour
    min_tour_budget: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # Minimum total revenue to confirm the tour

    # Notes and description
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Status: pending (announced), approved (has confirmed bookings), completed, cancelled
    status: Mapped[str] = mapped_column(String(20), default="pending")

    # Tour constraint fields
    max_travel_hours: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    min_shows_per_week: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    max_shows_per_week: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    rest_day_rule: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    min_net_profit: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    efficiency_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    visa_status: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    artist: Mapped["Artist"] = relationship("Artist", back_populates="tours")
    bookings: Mapped[list["Booking"]] = relationship("Booking", back_populates="tour")
    stops: Mapped[list["TourStop"]] = relationship("TourStop", back_populates="tour", cascade="all, delete-orphan", order_by="TourStop.sequence_order")


class TourStop(Base):
    """Tour stop - individual stop on a tour with logistics and financial details."""

    __tablename__ = "tour_stops"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    tour_id: Mapped[int] = mapped_column(
        ForeignKey("tours.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    booking_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("bookings.id", ondelete="SET NULL"),
        nullable=True,
        unique=True,
    )

    # Location and scheduling
    date: Mapped[date] = mapped_column(Date, nullable=False)
    city: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    venue_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    latitude: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 8), nullable=True)
    longitude: Mapped[Optional[Decimal]] = mapped_column(Numeric(11, 8), nullable=True)
    sequence_order: Mapped[int] = mapped_column(Integer, default=0)

    # Travel logistics
    travel_from_prev: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    travel_cost: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    accommodation_cost: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Financials
    performance_fee: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    shared_logistics: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    net_revenue: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    route_discount: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Status: confirmed, inquiry, recommended, open, rest_day
    status: Mapped[str] = mapped_column(String(30), default="open")

    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    tour: Mapped["Tour"] = relationship("Tour", back_populates="stops")
    booking: Mapped[Optional["Booking"]] = relationship("Booking", foreign_keys=[booking_id])


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
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )
