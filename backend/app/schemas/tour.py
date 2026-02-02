"""Tour schemas for API validation."""

from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, Field, computed_field

from app.schemas.booking import BookingResponse


def calculate_price_tier(price: Optional[int]) -> Optional[str]:
    """Calculate price tier from price.

    $ = up to $2,000
    $$ = $2,000 - $10,000
    $$$ = above $10,000
    """
    if price is None:
        return None
    if price <= 2000:
        return "$"
    elif price <= 10000:
        return "$$"
    else:
        return "$$$"


class TourBase(BaseModel):
    """Base tour schema with common fields."""

    name: str = Field(..., min_length=2, max_length=255)
    region: Optional[str] = Field(None, max_length=255)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    total_budget: Optional[int] = Field(None, ge=0)
    price_per_show: Optional[int] = Field(None, ge=0, description="Artist's price per show on this tour")
    description: Optional[str] = None


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
    description: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(pending|approved|completed|cancelled)$")


class TourResponse(TourBase):
    """Schema for tour response."""

    id: int
    artist_id: int
    status: str
    created_at: datetime
    updated_at: datetime
    bookings: list[BookingResponse] = []

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
