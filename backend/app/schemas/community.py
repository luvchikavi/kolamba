"""Community schemas for API validation."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class CommunityBase(BaseModel):
    """Base community schema with common fields."""
    name: str = Field(..., min_length=2, max_length=255)
    location: str = Field(..., min_length=2, max_length=255)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    audience_size: Optional[str] = None  # small, medium, large
    language: str = "English"


class CommunityCreate(CommunityBase):
    """Schema for creating a community profile."""
    pass


class CommunityUpdate(BaseModel):
    """Schema for updating a community profile."""
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    location: Optional[str] = Field(None, min_length=2, max_length=255)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    audience_size: Optional[str] = None
    language: Optional[str] = None


class CommunityResponse(CommunityBase):
    """Schema for community response."""
    id: int
    user_id: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
