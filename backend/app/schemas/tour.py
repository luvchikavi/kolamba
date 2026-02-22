"""Tour schemas for API validation."""

from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, Field, computed_field, model_validator

from app.schemas.booking import BookingResponse
from app.schemas.artist import calculate_price_tier


class TourBase(BaseModel):
    """Base tour schema with common fields."""

    name: str = Field(..., min_length=2, max_length=255)
    region: Optional[str] = Field(None, max_length=255)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    total_budget: Optional[int] = Field(None, ge=0)
    price_per_show: Optional[int] = Field(None, ge=0, description="Artist's price per show on this tour")
    min_tour_budget: Optional[int] = Field(None, ge=0, description="Minimum total revenue to confirm the tour")
    description: Optional[str] = Field(None, max_length=5000)

    # Tour constraint fields
    max_travel_hours: Optional[float] = Field(None, ge=0, description="Max driving hours between consecutive shows")
    min_shows_per_week: Optional[int] = Field(None, ge=0)
    max_shows_per_week: Optional[int] = Field(None, ge=0)
    rest_day_rule: Optional[str] = Field(None, max_length=100, description="e.g., every_wednesday, after_3_consecutive")
    min_net_profit: Optional[float] = Field(None, ge=0, description="Target take-home after fees & logistics")
    efficiency_score: Optional[int] = Field(None, ge=1, le=100, description="Recalculated on changes (1-100)")
    visa_status: Optional[str] = Field(None, max_length=30, description="approved, in_process, not_required")

    @model_validator(mode="after")
    def validate_dates(self):
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        return self


class TourCreate(TourBase):
    """Schema for creating a tour."""

    artist_id: int
    booking_ids: list[int] = Field(default_factory=list)


class TourUpdate(BaseModel):
    """Schema for updating a tour."""

    name: Optional[str] = Field(None, min_length=2, max_length=255)
    region: Optional[str] = Field(None, max_length=255)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    total_budget: Optional[int] = Field(None, ge=0)
    price_per_show: Optional[int] = Field(None, ge=0)
    min_tour_budget: Optional[int] = Field(None, ge=0)
    description: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(pending|approved|completed|cancelled)$")

    # Tour constraint fields
    max_travel_hours: Optional[float] = Field(None, ge=0)
    min_shows_per_week: Optional[int] = Field(None, ge=0)
    max_shows_per_week: Optional[int] = Field(None, ge=0)
    rest_day_rule: Optional[str] = Field(None, max_length=100)
    min_net_profit: Optional[float] = Field(None, ge=0)
    efficiency_score: Optional[int] = Field(None, ge=1, le=100)
    visa_status: Optional[str] = Field(None, max_length=30)


# --- TourStop schemas ---

class TourStopCreate(BaseModel):
    """Schema for creating a tour stop."""

    date: date
    city: Optional[str] = Field(None, max_length=255)
    venue_name: Optional[str] = Field(None, max_length=255)
    booking_id: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    sequence_order: int = 0
    travel_from_prev: Optional[str] = Field(None, max_length=255)
    travel_cost: Optional[float] = Field(None, ge=0)
    accommodation_cost: Optional[float] = Field(None, ge=0)
    performance_fee: Optional[float] = Field(None, ge=0)
    shared_logistics: Optional[float] = Field(None, ge=0)
    net_revenue: Optional[float] = None
    route_discount: Optional[float] = Field(None, ge=0, le=100)
    status: str = Field("open", pattern="^(confirmed|inquiry|recommended|open|rest_day)$")
    notes: Optional[str] = None


class TourStopUpdate(BaseModel):
    """Schema for updating a tour stop."""

    date: Optional[date] = None
    city: Optional[str] = Field(None, max_length=255)
    venue_name: Optional[str] = Field(None, max_length=255)
    booking_id: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    sequence_order: Optional[int] = None
    travel_from_prev: Optional[str] = Field(None, max_length=255)
    travel_cost: Optional[float] = Field(None, ge=0)
    accommodation_cost: Optional[float] = Field(None, ge=0)
    performance_fee: Optional[float] = Field(None, ge=0)
    shared_logistics: Optional[float] = Field(None, ge=0)
    net_revenue: Optional[float] = None
    route_discount: Optional[float] = Field(None, ge=0, le=100)
    status: Optional[str] = Field(None, pattern="^(confirmed|inquiry|recommended|open|rest_day)$")
    notes: Optional[str] = None


class TourStopResponse(BaseModel):
    """Schema for tour stop response."""

    id: int
    tour_id: int
    booking_id: Optional[int] = None
    date: date
    city: Optional[str] = None
    venue_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    sequence_order: int = 0
    travel_from_prev: Optional[str] = None
    travel_cost: Optional[float] = None
    accommodation_cost: Optional[float] = None
    performance_fee: Optional[float] = None
    shared_logistics: Optional[float] = None
    net_revenue: Optional[float] = None
    route_discount: Optional[float] = None
    status: str = "open"
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Tour response ---

class TourResponse(TourBase):
    """Schema for tour response."""

    id: int
    artist_id: int
    status: str
    created_at: datetime
    updated_at: datetime
    bookings: list[BookingResponse] = []
    stops: list[TourStopResponse] = []

    @computed_field
    @property
    def price_tier(self) -> Optional[str]:
        """Price tier based on price_per_show: $ (<=2k), $$ (2k-10k), $$$ (>10k)."""
        return calculate_price_tier(self.price_per_show)

    @computed_field
    @property
    def confirmed_shows(self) -> int:
        """Number of confirmed/approved bookings."""
        return len([b for b in self.bookings if b.status in ("approved", "confirmed")])

    @computed_field
    @property
    def confirmed_revenue(self) -> int:
        """Total revenue from confirmed/approved bookings."""
        return sum(b.budget or 0 for b in self.bookings if b.status in ("approved", "confirmed"))

    class Config:
        from_attributes = True


class TourSuggestion(BaseModel):
    """Schema for tour suggestion from grouping algorithm."""

    region: str
    booking_ids: list[int]
    communities: list[dict]  # List of community info with lat/lng
    suggested_start: Optional[date] = None
    suggested_end: Optional[date] = None
    total_distance_km: Optional[float] = None
    estimated_budget: Optional[int] = None
    total_audience: Optional[int] = None  # Combined audience size
    score: Optional[float] = None  # Quality score (higher = better opportunity)


class TourGroupingRequest(BaseModel):
    """Request for tour grouping algorithm."""

    artist_id: int
    max_distance_km: float = Field(default=500, description="Maximum distance between communities in km")
    min_bookings: int = Field(default=2, description="Minimum bookings to form a tour")
    date_range_days: int = Field(default=30, description="Date range to consider for grouping")


class NearbyTourArtist(BaseModel):
    """Artist info for nearby tour response."""
    id: int
    name_en: Optional[str] = None
    name_he: Optional[str] = None
    profile_image: Optional[str] = None
    category: Optional[str] = None


class NearbyTourBooking(BaseModel):
    """Booking info for nearby tour."""
    id: int
    location: str
    requested_date: Optional[date] = None
    distance_km: Optional[float] = None


class NearbyTourResponse(BaseModel):
    """Response for nearby tour opportunity."""
    tour_id: int
    tour_name: str
    artist: NearbyTourArtist
    region: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    nearest_booking: Optional[NearbyTourBooking] = None
    distance_to_nearest_km: Optional[float] = None
    total_stops: int
    status: str
    estimated_savings: Optional[int] = None  # Cost savings from joining the tour

    class Config:
        from_attributes = True


class JoinTourRequest(BaseModel):
    """Request to join an existing tour."""
    community_id: int
    preferred_date: Optional[date] = None
    budget: Optional[int] = Field(None, ge=0)
    notes: Optional[str] = None


class TourJoinRequestResponse(BaseModel):
    """Response for tour join request."""
    id: int
    tour_id: int
    community_id: int
    status: str  # pending, approved, rejected
    preferred_date: Optional[date] = None
    budget: Optional[int] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TourOpportunityArtist(BaseModel):
    """Artist info for tour opportunity."""
    id: int
    name_en: Optional[str] = None
    name_he: Optional[str] = None
    profile_image: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None


class TourOpportunityResponse(BaseModel):
    """Public tour opportunity for communities to browse."""
    id: int
    name: str
    region: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None
    price_tier: Optional[str] = None  # $, $$, or $$$
    status: str  # pending or approved
    confirmed_shows: int = 0  # Number of confirmed bookings
    artist: TourOpportunityArtist
    created_at: datetime

    class Config:
        from_attributes = True
