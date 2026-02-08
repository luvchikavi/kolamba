"""Conversation and Message schemas for API validation."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class VenueInfoSchema(BaseModel):
    """Structured venue information filled by community manager."""
    facility_size: Optional[str] = None
    venue_type: Optional[str] = None
    stage_dimensions: Optional[str] = None
    expected_attendance: Optional[int] = None
    audience_type: Optional[str] = None
    sound_system: Optional[bool] = None
    speaker_system: Optional[str] = None
    lighting: Optional[bool] = None
    camera_available: Optional[bool] = None
    green_room: Optional[bool] = None
    catering: Optional[bool] = None
    wifi: Optional[bool] = None
    parking: Optional[str] = None
    accessibility: Optional[str] = None
    load_in_access: Optional[str] = None
    additional_notes: Optional[str] = None


class MessageCreate(BaseModel):
    """Schema for creating a message."""
    content: str = Field(..., min_length=1, max_length=5000)


class MessageResponse(BaseModel):
    """Schema for message response."""
    id: int
    sender_id: int
    sender_name: Optional[str] = None
    sender_role: Optional[str] = None
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    """Schema for full conversation response with messages."""
    id: int
    booking_id: int
    venue_info: Optional[dict] = None
    messages: list[MessageResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConversationListItem(BaseModel):
    """Schema for conversation list (inbox view)."""
    id: int
    booking_id: int
    artist_name: Optional[str] = None
    community_name: Optional[str] = None
    last_message: Optional[str] = None
    message_count: int = 0
    booking_status: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True
