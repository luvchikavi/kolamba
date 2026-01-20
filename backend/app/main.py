"""Kolamba Backend - FastAPI Application Entry Point."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import auth, artists, communities, categories, bookings, search, tours

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
app.include_router(communities.router, prefix="/api/communities", tags=["Communities"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(search.router, prefix="/api/search", tags=["Search"])
app.include_router(tours.router, prefix="/api/tours", tags=["Tours"])


@app.get("/api/health", tags=["Health"])
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy", "service": "kolamba-api"}


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Kolamba API",
        "version": "1.0.0",
        "docs": "/api/docs",
    }
