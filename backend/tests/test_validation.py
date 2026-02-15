"""Tests for input validation."""

import pytest
from httpx import AsyncClient


class TestBookingValidation:
    """Test booking input validation."""

    async def test_booking_missing_artist_id(self, client: AsyncClient, test_user):
        response = await client.post("/api/bookings", json={
            "location": "Test",
        }, headers={"Authorization": f"Bearer {test_user['token']}"})
        assert response.status_code == 422

    async def test_register_missing_fields(self, client: AsyncClient):
        response = await client.post("/api/auth/register", json={
            "email": "test@test.com",
        })
        assert response.status_code == 422


class TestContactFormValidation:
    """Test contact form input validation."""

    async def test_contact_valid(self, client: AsyncClient):
        response = await client.post("/api/contact", json={
            "full_name": "Test User",
            "email": "test@example.com",
            "message": "Hello from test",
        })
        assert response.status_code == 200

    async def test_contact_invalid_email(self, client: AsyncClient):
        response = await client.post("/api/contact", json={
            "full_name": "Test",
            "email": "not-an-email",
            "message": "Hello",
        })
        assert response.status_code == 422

    async def test_contact_missing_fields(self, client: AsyncClient):
        response = await client.post("/api/contact", json={
            "email": "test@example.com",
        })
        assert response.status_code == 422


class TestHealthEndpoint:
    """Test health check endpoint."""

    async def test_health(self, client: AsyncClient):
        response = await client.get("/api/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
