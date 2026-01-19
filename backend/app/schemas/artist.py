"""Artist schemas for API validation."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from app.schemas.category import CategoryResponse


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

    class Config:
        from_attributes = True
