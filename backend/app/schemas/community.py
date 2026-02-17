"""Community schemas for API validation."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator


class CommunityBase(BaseModel):
    """Base community schema with common fields."""
    name: str = Field(..., min_length=2, max_length=255)
    community_type: Optional[str] = Field(None, max_length=100)
    location: str = Field(..., min_length=2, max_length=255)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)

    # Member count range (e.g., 120-150 members)
    member_count_min: Optional[int] = Field(None, ge=0, le=100000)
    member_count_max: Optional[int] = Field(None, ge=0, le=100000)

    # Event types this community hosts
    event_types: Optional[List[str]] = Field(default=None)

    # Contact information
    contact_role: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=50)

    # Legacy field for backward compatibility
    audience_size: Optional[str] = None
    language: str = "English"
    receive_artist_offers: bool = False

    @field_validator('member_count_max')
    @classmethod
    def validate_member_count_range(cls, v, info):
        """Ensure max is greater than or equal to min."""
        if v is not None and info.data.get('member_count_min') is not None:
            if v < info.data['member_count_min']:
                raise ValueError('member_count_max must be >= member_count_min')
        return v


class CommunityCreate(CommunityBase):
    """Schema for creating a community profile."""
    pass


class CommunityUpdate(BaseModel):
    """Schema for updating a community profile."""
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    community_type: Optional[str] = Field(None, max_length=100)
    location: Optional[str] = Field(None, min_length=2, max_length=255)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    member_count_min: Optional[int] = Field(None, ge=0, le=100000)
    member_count_max: Optional[int] = Field(None, ge=0, le=100000)
    event_types: Optional[List[str]] = None
    contact_role: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=50)
    audience_size: Optional[str] = None
    language: Optional[str] = None
    receive_artist_offers: Optional[bool] = None


class CommunityResponse(CommunityBase):
    """Schema for community response."""
    id: int
    user_id: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CommunityListResponse(BaseModel):
    """Schema for paginated community list."""
    communities: List[CommunityResponse]
    total: int
    limit: int
    offset: int
