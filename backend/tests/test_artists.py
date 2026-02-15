"""Tests for artist endpoints."""

import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.artist import Artist
from app.models.category import Category


@pytest.fixture
async def sample_category(db_session: AsyncSession) -> Category:
    """Create a test category."""
    suffix = uuid.uuid4().hex[:6]
    cat = Category(name_en=f"Music-{suffix}", name_he="מוזיקה", slug=f"music-{suffix}")
    db_session.add(cat)
    await db_session.commit()
    await db_session.refresh(cat)
    return cat


@pytest.fixture
async def sample_artist(db_session: AsyncSession, test_artist_user, sample_category) -> Artist:
    """Create a test artist with a category."""
    artist = Artist(
        user_id=test_artist_user["user"].id,
        name_en="Test Artist",
        name_he="אמן מבחן",
        bio_en="A test artist bio",
        city="Tel Aviv",
        country="Israel",
        status="active",
        is_featured=False,
        languages=["English", "Hebrew"],
        performance_types=["Concert"],
    )
    artist.categories.append(sample_category)
    db_session.add(artist)
    await db_session.commit()
    await db_session.refresh(artist)
    return artist


class TestListArtists:
    """Tests for GET /api/artists."""

    async def test_list_artists_public(self, client: AsyncClient, sample_artist):
        response = await client.get("/api/artists")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        # Verify our test artist is in the list (DB may have seed data too)
        names = [a["name_en"] for a in data]
        assert "Test Artist" in names

    async def test_list_artists_with_limit(self, client: AsyncClient, sample_artist):
        response = await client.get("/api/artists?limit=1")
        assert response.status_code == 200
        assert len(response.json()) <= 1

    async def test_list_artists_filter_by_category(self, client: AsyncClient, sample_artist, sample_category):
        response = await client.get(f"/api/artists?category={sample_category.slug}")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1


class TestGetArtist:
    """Tests for GET /api/artists/{artist_id}."""

    async def test_get_artist_by_id(self, client: AsyncClient, sample_artist):
        response = await client.get(f"/api/artists/{sample_artist.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["name_en"] == "Test Artist"
        assert data["city"] == "Tel Aviv"

    async def test_get_artist_not_found(self, client: AsyncClient):
        response = await client.get("/api/artists/99999")
        assert response.status_code == 404


class TestFeaturedArtists:
    """Tests for GET /api/artists/featured."""

    async def test_featured_empty(self, client: AsyncClient, sample_artist):
        response = await client.get("/api/artists/featured")
        assert response.status_code == 200
        # sample_artist is not featured
        data = response.json()
        assert isinstance(data, list)


class TestMyArtistProfile:
    """Tests for GET /api/artists/me."""

    async def test_get_my_profile_as_artist(self, client: AsyncClient, test_artist_user, sample_artist):
        response = await client.get("/api/artists/me", headers={
            "Authorization": f"Bearer {test_artist_user['token']}",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["name_en"] == "Test Artist"

    async def test_get_my_profile_unauthenticated(self, client: AsyncClient):
        response = await client.get("/api/artists/me")
        assert response.status_code == 401
