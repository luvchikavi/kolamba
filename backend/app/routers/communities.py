"""Communities router - CRUD operations for community profiles."""

from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def list_communities():
    """List all communities."""
    return {"message": "List communities endpoint - to be implemented"}


@router.get("/{community_id}")
async def get_community(community_id: int):
    """Get community profile by ID."""
    return {"message": f"Get community {community_id} - to be implemented"}


@router.post("")
async def create_community():
    """Register new community (authenticated)."""
    return {"message": "Create community endpoint - to be implemented"}


@router.put("/{community_id}")
async def update_community(community_id: int):
    """Update community profile (authenticated, owner only)."""
    return {"message": f"Update community {community_id} - to be implemented"}
