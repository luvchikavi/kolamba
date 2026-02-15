"""User model for authentication."""

from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from sqlalchemy import String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.artist import Artist
    from app.models.community import Community


class User(Base):
    """User model - authentication and role management."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)  # Optional for MVP
    name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # artist, community, admin
    status: Mapped[str] = mapped_column(String(20), default="active")  # active, inactive, pending
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    artist: Mapped[Optional["Artist"]] = relationship(
        "Artist", back_populates="user", uselist=False,
        foreign_keys="[Artist.user_id]"
    )
    community: Mapped[Optional["Community"]] = relationship(
        "Community", back_populates="user", uselist=False
    )
