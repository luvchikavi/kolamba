"""Community model for Jewish communities profiles."""

from datetime import datetime
from typing import TYPE_CHECKING, Optional, List
from sqlalchemy import String, Numeric, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.booking import Booking


# Community type options
COMMUNITY_TYPES = [
    "JCC",
    "Synagogue",
    "Temple",
    "Jewish School",
    "Summer Camp",
    "Campus Organization",
    "Federation",
    "Cultural Center",
    "Museum",
    "Independent Community",
]

# Event type options
EVENT_TYPES = [
    "Concerts",
    "Lectures",
    "Workshops",
    "Children Shows",
    "Holiday Events",
    "Shabbat Programs",
    "Educational Programs",
    "Cultural Festivals",
    "Family Events",
    "Youth Programs",
]

# Contact role options
CONTACT_ROLES = [
    "Executive Director",
    "Program Director",
    "Rabbi",
    "Cantor",
    "Education Director",
    "Events Coordinator",
    "Administrator",
    "Board Member",
    "Other",
]


class Community(Base):
    """Community model - synagogues, JCCs, educational institutions."""

    __tablename__ = "communities"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    # Profile info
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    community_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    location: Mapped[str] = mapped_column(String(255), nullable=False)

    # Geographic coordinates for tour algorithm
    latitude: Mapped[Optional[float]] = mapped_column(Numeric(10, 8), nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Numeric(11, 8), nullable=True)

    # Member count (numeric range instead of categorical)
    member_count_min: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    member_count_max: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Event types this community hosts (multi-select)
    event_types: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String(100)), nullable=True)

    # Contact information
    contact_role: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Community details (keeping audience_size for backward compatibility)
    audience_size: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # deprecated
    language: Mapped[str] = mapped_column(String(50), default="English")
    status: Mapped[str] = mapped_column(String(20), default="active")

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="community")
    bookings: Mapped[list["Booking"]] = relationship("Booking", back_populates="community")
