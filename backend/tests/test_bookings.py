"""Tests for booking endpoints."""

import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.artist import Artist
from app.models.community import Community
from app.models.category import Category


@pytest.fixture
async def booking_fixtures(db_session: AsyncSession, test_user, test_artist_user):
    """Create artist + community for booking tests."""
    suffix = uuid.uuid4().hex[:6]
    cat = Category(name_en=f"Music-{suffix}", name_he="מוזיקה", slug=f"music-book-{suffix}")
    db_session.add(cat)
    await db_session.flush()

    artist = Artist(
        user_id=test_artist_user["user"].id,
        name_en="Booking Artist",
        name_he="אמן הזמנה",
        city="Jerusalem",
        country="Israel",
        status="active",
    )
    artist.categories.append(cat)
    db_session.add(artist)

    community = Community(
        user_id=test_user["user"].id,
        name="Test Community",
        location="New York, USA",
        status="active",
    )
    db_session.add(community)
    await db_session.commit()
    await db_session.refresh(artist)
    await db_session.refresh(community)
    return {"artist": artist, "community": community}


class TestCreateBooking:
    """Tests for POST /api/bookings."""

    async def test_create_booking(self, client: AsyncClient, test_user, booking_fixtures):
        response = await client.post("/api/bookings", json={
            "artist_id": booking_fixtures["artist"].id,
            "location": "New York",
            "budget": 5000,
            "notes": "Looking for a performer",
        }, headers={"Authorization": f"Bearer {test_user['token']}"})
        assert response.status_code == 200
        data = response.json()
        assert data["artist_id"] == booking_fixtures["artist"].id
        assert data["status"] == "pending"

    async def test_create_booking_unauthenticated(self, client: AsyncClient, booking_fixtures):
        response = await client.post("/api/bookings", json={
            "artist_id": booking_fixtures["artist"].id,
        })
        assert response.status_code == 401

    async def test_create_booking_nonexistent_artist(self, client: AsyncClient, test_user):
        response = await client.post("/api/bookings", json={
            "artist_id": 99999,
        }, headers={"Authorization": f"Bearer {test_user['token']}"})
        assert response.status_code == 404


class TestListBookings:
    """Tests for GET /api/bookings."""

    async def test_list_bookings_authenticated(self, client: AsyncClient, test_user):
        response = await client.get("/api/bookings", headers={
            "Authorization": f"Bearer {test_user['token']}",
        })
        assert response.status_code == 200
        assert isinstance(response.json(), list)
