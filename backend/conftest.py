"""Shared test fixtures for Kolamba backend tests."""

import uuid
from typing import AsyncGenerator

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

from app.database import Base, get_db
from app.main import app
from app.config import get_settings
from app.utils.security import get_password_hash, create_access_token

settings = get_settings()
TEST_DATABASE_URL = settings.database_url


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provide a transactional session that rolls back after each test.

    Creates its own engine per test to ensure correct event loop binding
    with pytest-asyncio's runner system (v1.x uses per-test Runners).
    """
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)

    # Ensure tables exist (idempotent — no-op if already created)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with engine.connect() as connection:
        async with connection.begin() as transaction:
            session = AsyncSession(
                bind=connection,
                expire_on_commit=False,
                join_transaction_mode="create_savepoint",
            )
            yield session
            await session.close()
            await transaction.rollback()

    await engine.dispose()


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Provide an async HTTP test client with overridden DB dependency."""

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


def _unique_email(prefix: str) -> str:
    """Generate a unique email for test isolation."""
    return f"{prefix}_{uuid.uuid4().hex[:8]}@test.com"


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession) -> dict:
    """Create a test community user and return user data + token."""
    from app.models.user import User

    email = _unique_email("community")
    user = User(
        email=email,
        password_hash=get_password_hash("TestPass123"),
        name="Test User",
        role="community",
        status="active",
        is_active=True,
    )
    db_session.add(user)
    await db_session.flush()
    await db_session.refresh(user)

    token = create_access_token(data={"sub": user.id, "email": user.email, "role": user.role})
    return {"user": user, "token": token, "password": "TestPass123"}


@pytest_asyncio.fixture
async def test_admin(db_session: AsyncSession) -> dict:
    """Create a test admin/superuser and return user data + token."""
    from app.models.user import User

    email = _unique_email("admin")
    user = User(
        email=email,
        password_hash=get_password_hash("AdminPass123"),
        name="Admin User",
        role="admin",
        status="active",
        is_active=True,
        is_superuser=True,
    )
    db_session.add(user)
    await db_session.flush()
    await db_session.refresh(user)

    token = create_access_token(data={"sub": user.id, "email": user.email, "role": user.role})
    return {"user": user, "token": token}


@pytest_asyncio.fixture
async def test_artist_user(db_session: AsyncSession) -> dict:
    """Create a test artist user and return user data + token."""
    from app.models.user import User

    email = _unique_email("artist")
    user = User(
        email=email,
        password_hash=get_password_hash("ArtistPass123"),
        name="Test Artist",
        role="artist",
        status="active",
        is_active=True,
    )
    db_session.add(user)
    await db_session.flush()
    await db_session.refresh(user)

    token = create_access_token(data={"sub": user.id, "email": user.email, "role": user.role})
    return {"user": user, "token": token}
