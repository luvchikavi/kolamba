"""Tours router - tour suggestion algorithm."""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class TourSuggestRequest(BaseModel):
    """Request body for tour suggestions."""
    artist_id: int
    start_date: str
    end_date: str
    start_location: str
    max_communities: Optional[int] = 5


@router.post("/suggest")
async def suggest_tour(request: TourSuggestRequest):
    """Get tour suggestions based on location, availability, and community size."""
    return {
        "message": "Tour suggestion endpoint - to be implemented",
        "request": request.model_dump()
    }
