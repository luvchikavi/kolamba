"""Artist model for performer profiles."""

from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from sqlalchemy import String, Integer, Boolean, DateTime, Text, ForeignKey, ARRAY
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.category import Category
    from app.models.booking import Booking
    from app.models.tour import Tour
    from app.models.artist_tour_date import ArtistTourDate


class Artist(Base):
    """Artist model - performer profiles with bio, pricing, availability."""

    __tablename__ = "artists"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    # Agent who submitted this artist (if any)
    agent_user_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Profile info
    name_he: Mapped[str] = mapped_column(String(255), nullable=False)
    name_en: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    bio_he: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    bio_en: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    profile_image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Pricing (in USD)
    price_single: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    price_tour: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Languages (array of language codes)
    languages: Mapped[list[str]] = mapped_column(ARRAY(String(50)), default=list)

    # Availability (JSONB for flexible date/time storage)
    availability: Mapped[dict] = mapped_column(JSONB, default=dict)

    # Location
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    country: Mapped[str] = mapped_column(String(100), default="Israel")

    # Contact and social media
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    website: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    instagram: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    youtube: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    facebook: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    twitter: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    linkedin: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Media - uploaded files and external links
    video_urls: Mapped[list[str]] = mapped_column(ARRAY(String(500)), default=list)  # Video clip URLs
    portfolio_images: Mapped[list[str]] = mapped_column(ARRAY(String(500)), default=list)  # Gallery images
    spotify_links: Mapped[list[str]] = mapped_column(ARRAY(String(500)), default=list)  # Spotify track/album links
    media_links: Mapped[list[str]] = mapped_column(ARRAY(String(500)), default=list)  # Press/media article links

    # Performance types (array of strings)
    performance_types: Mapped[list[str]] = mapped_column(ARRAY(String(100)), default=list)

    # Subcategories within primary category
    subcategories: Mapped[list[str]] = mapped_column(ARRAY(String(100)), default=list)

    # Status and visibility
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, active, inactive, rejected
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    rejection_reason: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="artist", foreign_keys=[user_id])
    agent: Mapped[Optional["User"]] = relationship("User", foreign_keys=[agent_user_id], lazy="select")
    categories: Mapped[list["Category"]] = relationship(
        "Category",
        secondary="artist_categories",
        back_populates="artists",
    )
    bookings: Mapped[list["Booking"]] = relationship("Booking", back_populates="artist")
    tours: Mapped[list["Tour"]] = relationship("Tour", back_populates="artist")
    tour_dates: Mapped[list["ArtistTourDate"]] = relationship("ArtistTourDate", back_populates="artist")
