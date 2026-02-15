"""ArtistTourDate schemas for API validation."""

from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, Field, model_validator


class ArtistTourDateBase(BaseModel):
    """Base artist tour date schema with common fields."""

    location: str = Field(..., min_length=2, max_length=255)
    start_date: date
    end_date: Optional[date] = None
    description: Optional[str] = Field(None, max_length=1000)

    @model_validator(mode="after")
    def validate_dates(self):
        if self.end_date and self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        return self


class ArtistTourDateCreate(ArtistTourDateBase):
    """Schema for creating an artist tour date."""

    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)


class ArtistTourDateUpdate(BaseModel):
    """Schema for updating an artist tour date."""

    location: Optional[str] = Field(None, min_length=2, max_length=255)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None
    is_booked: Optional[bool] = None


class ArtistTourDateResponse(ArtistTourDateBase):
    """Schema for artist tour date response."""

    id: int
    artist_id: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_booked: bool
    created_at: datetime

    class Config:
        from_attributes = True


class NearbyTouringArtist(BaseModel):
    """Response for nearby touring artist."""

    artist_id: int
    artist_name: str
    profile_image: Optional[str] = None
    tour_date: ArtistTourDateResponse
    distance_km: float

    class Config:
        from_attributes = True
