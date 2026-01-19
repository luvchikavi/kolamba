"""Booking schemas for API validation."""

from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, Field


class BookingBase(BaseModel):
    """Base booking schema with common fields."""
    artist_id: int
    requested_date: Optional[date] = None
    location: Optional[str] = Field(None, max_length=255)
    budget: Optional[int] = Field(None, ge=0)
    notes: Optional[str] = None


class BookingCreate(BookingBase):
    """Schema for creating a booking request."""
    pass


class BookingUpdate(BaseModel):
    """Schema for updating a booking."""
    requested_date: Optional[date] = None
    location: Optional[str] = Field(None, max_length=255)
    budget: Optional[int] = Field(None, ge=0)
    notes: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(pending|approved|rejected|completed|cancelled)$")


class BookingResponse(BookingBase):
    """Schema for booking response."""
    id: int
    community_id: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
