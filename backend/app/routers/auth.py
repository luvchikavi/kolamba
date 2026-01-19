"""Authentication router - login, register, tokens."""

from fastapi import APIRouter

router = APIRouter()


@router.post("/register")
async def register():
    """Register new user (artist or community)."""
    return {"message": "Register endpoint - to be implemented"}


@router.post("/login")
async def login():
    """Login and get JWT tokens."""
    return {"message": "Login endpoint - to be implemented"}


@router.post("/refresh")
async def refresh_token():
    """Refresh access token."""
    return {"message": "Refresh endpoint - to be implemented"}


@router.get("/me")
async def get_current_user():
    """Get current authenticated user."""
    return {"message": "Me endpoint - to be implemented"}
