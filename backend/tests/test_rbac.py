"""Tests for role-based access control."""

import pytest
from httpx import AsyncClient


class TestAdminEndpoints:
    """Test that admin endpoints require superuser."""

    async def test_admin_stats_requires_auth(self, client: AsyncClient):
        response = await client.get("/api/admin/stats")
        assert response.status_code == 401

    async def test_admin_stats_requires_superuser(self, client: AsyncClient, test_user):
        response = await client.get("/api/admin/stats", headers={
            "Authorization": f"Bearer {test_user['token']}",
        })
        assert response.status_code == 403

    async def test_admin_stats_with_superuser(self, client: AsyncClient, test_admin):
        response = await client.get("/api/admin/stats", headers={
            "Authorization": f"Bearer {test_admin['token']}",
        })
        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data
        assert "total_artists" in data

    async def test_admin_users_requires_superuser(self, client: AsyncClient, test_user):
        response = await client.get("/api/admin/users", headers={
            "Authorization": f"Bearer {test_user['token']}",
        })
        assert response.status_code == 403

    async def test_admin_users_with_superuser(self, client: AsyncClient, test_admin):
        response = await client.get("/api/admin/users", headers={
            "Authorization": f"Bearer {test_admin['token']}",
        })
        assert response.status_code == 200


class TestAgentEndpoints:
    """Test that agent endpoints require agent role."""

    async def test_agent_artists_requires_agent(self, client: AsyncClient, test_user):
        response = await client.get("/api/agents/me/artists", headers={
            "Authorization": f"Bearer {test_user['token']}",
        })
        assert response.status_code == 403

    async def test_agent_stats_requires_agent(self, client: AsyncClient, test_artist_user):
        response = await client.get("/api/agents/me/stats", headers={
            "Authorization": f"Bearer {test_artist_user['token']}",
        })
        assert response.status_code == 403


class TestSeedEndpointsProtection:
    """Test that seed endpoints are gated behind dev + superuser."""

    async def test_seed_superusers_requires_auth(self, client: AsyncClient):
        response = await client.post("/api/admin/seed-superusers")
        assert response.status_code == 401

    async def test_seed_superusers_requires_superuser(self, client: AsyncClient, test_user):
        response = await client.post("/api/admin/seed-superusers", headers={
            "Authorization": f"Bearer {test_user['token']}",
        })
        assert response.status_code == 403
