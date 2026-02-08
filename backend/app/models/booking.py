"""Booking model for artist booking requests."""

from datetime import datetime, date
from typing import TYPE_CHECKING, Optional
from sqlalchemy import String, Integer, Date, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.artist import Artist
    from app.models.community import Community
    from app.models.tour import Tour
    from app.models.conversation import Conversation


class Booking(Base):
    """Booking model - booking requests from communities to artists."""

    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    artist_id: Mapped[int] = mapped_column(
        ForeignKey("artists.id", ondelete="CASCADE"),
        nullable=False,
    )
    community_id: Mapped[int] = mapped_column(
        ForeignKey("communities.id", ondelete="CASCADE"),
        nullable=False,
    )
    tour_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("tours.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Booking details
    requested_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    budget: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Status: pending, approved, rejected, completed, cancelled
    status: Mapped[str] = mapped_column(String(20), default="pending")

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    artist: Mapped["Artist"] = relationship("Artist", back_populates="bookings")
    community: Mapped["Community"] = relationship("Community", back_populates="bookings")
    tour: Mapped[Optional["Tour"]] = relationship("Tour", back_populates="bookings")
    conversation: Mapped[Optional["Conversation"]] = relationship("Conversation", back_populates="booking", uselist=False)
