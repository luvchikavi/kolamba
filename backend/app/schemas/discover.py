"""Discover schemas - artist discovery response types for community dashboard."""

from datetime import date
from typing import Optional
from pydantic import BaseModel, computed_field

from app.schemas.category import CategoryResponse
from app.schemas.artist import calculate_price_tier


class NearbyTourDateInfo(BaseModel):
    """Info about an artist's nearest upcoming tour date."""
    location: str
    start_date: date
    distance_km: float


class DiscoverArtistItem(BaseModel):
    """A single artist in the discover results."""
    # Core fields (same as ArtistListResponse)
    id: int
    name_he: str
    name_en: Optional[str] = None
    bio_en: Optional[str] = None
    profile_image: Optional[str] = None
    price_single: Optional[int] = None
    city: Optional[str] = None
    country: str = "Israel"
    is_featured: bool = False
    categories: list[CategoryResponse] = []
    subcategories: list[str] = []

    @computed_field
    @property
    def price_tier(self) -> Optional[str]:
        return calculate_price_tier(self.price_single)

    # Discovery context
    interest_score: float = 0.0
    matched_event_types: list[str] = []
    nearest_tour_date: Optional[NearbyTourDateInfo] = None

    class Config:
        from_attributes = True


class DiscoverResponse(BaseModel):
    """Paginated discover response with metadata."""
    artists: list[DiscoverArtistItem]
    total: int
    matched_categories: list[str] = []
    community_event_types: list[str] = []
