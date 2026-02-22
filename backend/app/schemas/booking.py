"""Booking schemas for API validation."""

from datetime import datetime, date
from typing import Optional, Literal
from pydantic import BaseModel, Field, model_validator


class BookingBase(BaseModel):
    """Base booking schema with common fields."""
    artist_id: int
    requested_date: Optional[date] = None
    location: Optional[str] = Field(None, max_length=255)
    budget: Optional[int] = Field(None, ge=0)
    notes: Optional[str] = Field(None, max_length=2000)


class BookingCreate(BookingBase):
    """Schema for creating a booking request."""
    event_type: Optional[str] = Field(None, max_length=30)
    audience_size: Optional[int] = Field(None, ge=0)
    audience_description: Optional[str] = None
    is_online: Optional[bool] = False

    @model_validator(mode="after")
    def validate_future_date(self):
        if self.requested_date and self.requested_date < date.today():
            raise ValueError("Requested date must be in the future")
        return self


class BookingUpdate(BaseModel):
    """Schema for updating a booking."""
    requested_date: Optional[date] = None
    location: Optional[str] = Field(None, max_length=255)
    budget: Optional[int] = Field(None, ge=0)
    notes: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(pending|quote_sent|approved|declined|rejected|completed|cancelled)$")


class BookingResponse(BookingBase):
    """Schema for booking response."""
    id: int
    community_id: int
    tour_id: Optional[int] = None
    status: str
    # Event details
    event_type: Optional[str] = None
    audience_size: Optional[int] = None
    audience_description: Optional[str] = None
    is_online: Optional[bool] = None
    # Quote flow
    quote_amount: Optional[float] = None
    quote_notes: Optional[str] = None
    quoted_at: Optional[datetime] = None
    decline_reason: Optional[str] = None
    # POST-MVP placeholders
    deposit_amount: Optional[float] = None
    deposit_paid_at: Optional[datetime] = None
    visa_required: Optional[bool] = None
    visa_status: Optional[str] = None
    review_host_rating: Optional[int] = None
    review_host_text: Optional[str] = None
    review_talent_rating: Optional[int] = None
    review_talent_text: Optional[str] = None
    # Timestamps
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class QuoteSubmit(BaseModel):
    """Schema for talent submitting a quote."""
    quote_amount: float = Field(..., gt=0, description="Quoted price in USD")
    quote_notes: Optional[str] = Field(None, max_length=2000, description="What's included, duration, etc.")


class QuoteResponse(BaseModel):
    """Schema for host responding to a quote."""
    action: Literal["approve", "decline", "request_changes"]
    decline_reason: Optional[str] = Field(None, max_length=2000)
