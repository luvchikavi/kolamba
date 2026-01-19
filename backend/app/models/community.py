"""Community model for Jewish communities profiles."""

from datetime import datetime
from typing import TYPE_CHECKING, Optional
from sqlalchemy import String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.booking import Booking


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
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)

    # Geographic coordinates for tour algorithm
    latitude: Mapped[Optional[float]] = mapped_column(Numeric(10, 8), nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Numeric(11, 8), nullable=True)

    # Community details
    audience_size: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # small, medium, large
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
