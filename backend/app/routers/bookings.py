"""Bookings router - booking request management."""

from fastapi import APIRouter

router = APIRouter()


@router.post("")
async def create_booking():
    """Create new booking request."""
    return {"message": "Create booking endpoint - to be implemented"}


@router.get("")
async def list_bookings():
    """List my bookings (authenticated)."""
    return {"message": "List bookings endpoint - to be implemented"}


@router.get("/{booking_id}")
async def get_booking(booking_id: int):
    """Get booking details."""
    return {"message": f"Get booking {booking_id} - to be implemented"}


@router.put("/{booking_id}")
async def update_booking(booking_id: int):
    """Update booking status (approve/reject)."""
    return {"message": f"Update booking {booking_id} - to be implemented"}
