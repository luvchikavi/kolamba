"""Artist model for performer profiles."""

from datetime import datetime
from typing import TYPE_CHECKING, Optional
from sqlalchemy import String, Integer, Boolean, DateTime, Text, ForeignKey, ARRAY
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.category import Category
    from app.models.booking import Booking


class Artist(Base):
    """Artist model - performer profiles with bio, pricing, availability."""

    __tablename__ = "artists"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
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

    # Status and visibility
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, active, inactive
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="artist")
    categories: Mapped[list["Category"]] = relationship(
        "Category",
        secondary="artist_categories",
        back_populates="artists",
    )
    bookings: Mapped[list["Booking"]] = relationship("Booking", back_populates="artist")
