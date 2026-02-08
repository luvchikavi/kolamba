"""Kolamba Backend - FastAPI Application Entry Point."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import auth, artists, communities, categories, bookings, search, tours, admin, artist_tour_dates, agents, uploads, conversations

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager."""
    # Startup
    print("Starting Kolamba API...")
    yield
    # Shutdown
    print("Shutting down Kolamba API...")


app = FastAPI(
    title="Kolamba API",
    description="Marketplace platform connecting Israeli/Jewish artists with Jewish communities worldwide",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# CORS middleware - allow Vercel preview URLs via regex
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"https://kolamba(-[a-z0-9]+)?(-[a-z0-9-]+)?\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(artists.router, prefix="/api/artists", tags=["Artists"])
app.include_router(artist_tour_dates.router, prefix="/api/artists", tags=["Artist Tour Dates"])
app.include_router(communities.router, prefix="/api/communities", tags=["Communities"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(search.router, prefix="/api/search", tags=["Search"])
app.include_router(tours.router, prefix="/api/tours", tags=["Tours"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(agents.router, prefix="/api/agents", tags=["Agents"])
app.include_router(uploads.router, prefix="/api/uploads", tags=["Uploads"])
app.include_router(conversations.router, prefix="/api/conversations", tags=["Conversations"])


@app.get("/api/health", tags=["Health"])
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy", "service": "kolamba-api"}


@app.get("/api/debug/db", tags=["Debug"])
async def debug_db():
    """Temporary debug endpoint to test database connectivity."""
    import socket
    import asyncpg
    results = {}

    # Check resolved DATABASE_URL
    results["database_url"] = settings.database_url[:60] + "..."

    # DNS test
    try:
        ip = socket.gethostbyname("postgres.railway.internal")
        results["dns"] = f"OK -> {ip}"
    except Exception as e:
        results["dns"] = f"FAIL: {e}"

    # TCP test
    try:
        s = socket.socket()
        s.settimeout(5)
        s.connect(("postgres.railway.internal", 5432))
        results["tcp"] = "OK"
        s.close()
    except Exception as e:
        results["tcp"] = f"FAIL: {e}"

    # asyncpg direct test with ssl=False
    try:
        conn = await asyncpg.connect(
            host="postgres.railway.internal",
            port=5432,
            user="postgres",
            password="fhIYmeKyBXKiBfujwcgswCsPEepnGGwl",
            database="railway",
            ssl=False,
            timeout=10
        )
        val = await conn.fetchval("SELECT 1")
        results["asyncpg_no_ssl"] = f"OK (result={val})"
        await conn.close()
    except Exception as e:
        results["asyncpg_no_ssl"] = f"FAIL: {type(e).__name__}: {e}"

    # asyncpg with ssl='prefer'
    try:
        conn = await asyncpg.connect(
            host="postgres.railway.internal",
            port=5432,
            user="postgres",
            password="fhIYmeKyBXKiBfujwcgswCsPEepnGGwl",
            database="railway",
            ssl="prefer",
            timeout=10
        )
        val = await conn.fetchval("SELECT 1")
        results["asyncpg_ssl_prefer"] = f"OK (result={val})"
        await conn.close()
    except Exception as e:
        results["asyncpg_ssl_prefer"] = f"FAIL: {type(e).__name__}: {e}"

    # asyncpg via TCP proxy (external)
    try:
        conn = await asyncpg.connect(
            host="switchback.proxy.rlwy.net",
            port=29317,
            user="postgres",
            password="fhIYmeKyBXKiBfujwcgswCsPEepnGGwl",
            database="railway",
            ssl="prefer",
            timeout=10
        )
        val = await conn.fetchval("SELECT 1")
        results["asyncpg_tcp_proxy"] = f"OK (result={val})"
        await conn.close()
    except Exception as e:
        results["asyncpg_tcp_proxy"] = f"FAIL: {type(e).__name__}: {e}"

    # Check what postgres.railway.internal:5432 actually responds with
    try:
        s = socket.socket()
        s.settimeout(5)
        s.connect(("postgres.railway.internal", 5432))
        # Send a minimal Postgres startup packet
        import struct
        # Just read what the server sends first (if anything)
        s.settimeout(2)
        try:
            data = s.recv(100)
            results["raw_response"] = data.hex() + " = " + repr(data[:20])
        except socket.timeout:
            results["raw_response"] = "No data received (timeout)"
        s.close()
    except Exception as e:
        results["raw_response"] = f"FAIL: {e}"

    # SQLAlchemy engine test
    try:
        from app.database import engine
        from sqlalchemy import text
        async with engine.connect() as conn:
            val = await conn.execute(text("SELECT 1"))
            results["sqlalchemy"] = f"OK (result={val.scalar()})"
    except Exception as e:
        results["sqlalchemy"] = f"FAIL: {type(e).__name__}: {e}"

    return results


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Kolamba API",
        "version": "1.0.0",
        "docs": "/api/docs",
    }
