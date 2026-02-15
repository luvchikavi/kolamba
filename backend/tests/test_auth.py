"""Tests for authentication endpoints."""

import pytest
from httpx import AsyncClient


class TestRegister:
    """Tests for POST /api/auth/register."""

    async def test_register_community_user(self, client: AsyncClient):
        response = await client.post("/api/auth/register", json={
            "email": "new_community@test.com",
            "password": "SecurePass123",
            "name": "New Community",
            "role": "community",
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    async def test_register_duplicate_email(self, client: AsyncClient, test_user):
        response = await client.post("/api/auth/register", json={
            "email": test_user["user"].email,
            "password": "SecurePass123",
            "name": "Duplicate",
            "role": "community",
        })
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]

    async def test_register_invalid_role(self, client: AsyncClient):
        response = await client.post("/api/auth/register", json={
            "email": "invalid_role@test.com",
            "password": "SecurePass123",
            "name": "Bad Role",
            "role": "hacker",
        })
        assert response.status_code == 400


class TestLogin:
    """Tests for POST /api/auth/login."""

    async def test_login_success(self, client: AsyncClient, test_user):
        response = await client.post("/api/auth/login", data={
            "username": test_user["user"].email,
            "password": test_user["password"],
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data

    async def test_login_wrong_password(self, client: AsyncClient, test_user):
        response = await client.post("/api/auth/login", data={
            "username": test_user["user"].email,
            "password": "WrongPassword",
        })
        assert response.status_code == 401

    async def test_login_nonexistent_user(self, client: AsyncClient):
        response = await client.post("/api/auth/login", data={
            "username": "nobody@test.com",
            "password": "whatever",
        })
        assert response.status_code == 401


class TestMe:
    """Tests for GET /api/auth/me."""

    async def test_get_me_authenticated(self, client: AsyncClient, test_user):
        response = await client.get("/api/auth/me", headers={
            "Authorization": f"Bearer {test_user['token']}",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user["user"].email
        assert data["role"] == "community"
        assert data["is_active"] is True

    async def test_get_me_unauthenticated(self, client: AsyncClient):
        response = await client.get("/api/auth/me")
        assert response.status_code == 401

    async def test_get_me_invalid_token(self, client: AsyncClient):
        response = await client.get("/api/auth/me", headers={
            "Authorization": "Bearer invalid-token-here",
        })
        assert response.status_code == 401


class TestRefreshToken:
    """Tests for POST /api/auth/refresh."""

    async def test_refresh_token(self, client: AsyncClient, test_user):
        # First login to get a refresh token
        login_resp = await client.post("/api/auth/login", data={
            "username": test_user["user"].email,
            "password": test_user["password"],
        })
        refresh_token = login_resp.json()["refresh_token"]

        # Use refresh token
        response = await client.post("/api/auth/refresh", json={
            "refresh_token": refresh_token,
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data

    async def test_refresh_invalid_token(self, client: AsyncClient):
        response = await client.post("/api/auth/refresh", json={
            "refresh_token": "invalid-refresh-token",
        })
        assert response.status_code == 401
