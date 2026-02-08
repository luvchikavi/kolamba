"""Artist schemas for API validation."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, computed_field

from app.schemas.category import CategoryResponse


def calculate_price_tier(price: Optional[int]) -> Optional[str]:
    """Calculate price tier from price_single.

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


class ArtistBase(BaseModel):
    """Base artist schema with common fields."""
    name_he: str = Field(..., min_length=2, max_length=255)
    name_en: Optional[str] = Field(None, max_length=255)
    bio_he: Optional[str] = None
    bio_en: Optional[str] = None
    profile_image: Optional[str] = None
    price_single: Optional[int] = Field(None, ge=0)
    price_tour: Optional[int] = Field(None, ge=0)
    languages: list[str] = []
    city: Optional[str] = None
    country: str = "Israel"
    phone: Optional[str] = None
    website: Optional[str] = None
    instagram: Optional[str] = None
    youtube: Optional[str] = None
    performance_types: list[str] = []
    spotify_links: list[str] = []


class ArtistCreate(ArtistBase):
    """Schema for creating an artist profile."""
    category_ids: list[int] = []
    availability: dict = {}


class ArtistUpdate(BaseModel):
    """Schema for updating an artist profile."""
    name_he: Optional[str] = Field(None, min_length=2, max_length=255)
    name_en: Optional[str] = Field(None, max_length=255)
    bio_he: Optional[str] = None
    bio_en: Optional[str] = None
    profile_image: Optional[str] = None
    price_single: Optional[int] = Field(None, ge=0)
    price_tour: Optional[int] = Field(None, ge=0)
    languages: Optional[list[str]] = None
    city: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    instagram: Optional[str] = None
    youtube: Optional[str] = None
    performance_types: Optional[list[str]] = None
    category_ids: Optional[list[int]] = None
    availability: Optional[dict] = None


class ArtistResponse(ArtistBase):
    """Schema for artist response."""
    id: int
    user_id: int
    status: str
    is_featured: bool
    availability: dict
    categories: list[CategoryResponse] = []
    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def price_tier(self) -> Optional[str]:
        """Price tier based on price_single: $ (<=2k), $$ (2k-10k), $$$ (>10k)."""
        return calculate_price_tier(self.price_single)

    class Config:
        from_attributes = True


class ArtistListResponse(BaseModel):
    """Schema for artist listing response."""
    id: int
    name_he: str
    name_en: Optional[str]
    profile_image: Optional[str]
    price_single: Optional[int]
    city: Optional[str]
    country: str
    is_featured: bool
    categories: list[CategoryResponse] = []

    @computed_field
    @property
    def price_tier(self) -> Optional[str]:
        """Price tier based on price_single: $ (<=2k), $$ (2k-10k), $$$ (>10k)."""
        return calculate_price_tier(self.price_single)

    class Config:
        from_attributes = True
