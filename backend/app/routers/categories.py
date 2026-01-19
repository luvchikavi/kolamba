"""Categories router - list art categories."""

from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def list_categories():
    """List all performance categories."""
    return {"message": "List categories endpoint - to be implemented"}
