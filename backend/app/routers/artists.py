"""Artists router - CRUD operations for artist profiles."""

from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def list_artists():
    """List all artists with optional filters."""
    return {"message": "List artists endpoint - to be implemented"}


@router.get("/featured")
async def get_featured_artists():
    """Get featured artists for homepage."""
    return {"message": "Featured artists endpoint - to be implemented"}


@router.get("/{artist_id}")
async def get_artist(artist_id: int):
    """Get artist profile by ID."""
    return {"message": f"Get artist {artist_id} - to be implemented"}


@router.post("")
async def create_artist():
    """Create new artist profile (authenticated)."""
    return {"message": "Create artist endpoint - to be implemented"}


@router.put("/{artist_id}")
async def update_artist(artist_id: int):
    """Update artist profile (authenticated, owner only)."""
    return {"message": f"Update artist {artist_id} - to be implemented"}
