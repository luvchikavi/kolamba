"""Kolamba Backend - FastAPI Application Entry Point."""

import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import get_settings
from app.routers import auth, artists, communities, categories, bookings, search, tours, admin, artist_tour_dates, agents, uploads, conversations

settings = get_settings()

from app.rate_limit import limiter

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s %(levelname)-8s [%(name)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("kolamba")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager."""
    logger.info("Starting Kolamba API (env=%s, debug=%s)", settings.env, settings.debug)
    if not settings.cloudinary_cloud_name:
        logger.warning("Cloudinary not configured — file uploads will be unavailable")
    if not settings.resend_api_key:
        logger.warning("Resend API key not set — emails will be unavailable")
    if not settings.google_client_id:
        logger.warning("Google OAuth not configured — Google sign-in will be unavailable")
    yield
    logger.info("Shutting down Kolamba API...")


app = FastAPI(
    title="Kolamba API",
    description="Marketplace platform connecting Israeli/Jewish artists with Jewish communities worldwide",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware - allow Vercel preview URLs via regex
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"https://kolamba(-[a-z0-9]+)?(-[a-z0-9-]+)?\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    logger.info(
        "%s %s %d %.0fms",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response


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



class ContactRequest(BaseModel):
    full_name: str
    email: EmailStr
    message: str


@app.post("/api/contact", tags=["Contact"])
@limiter.limit("3/minute")
async def contact_form(request: Request, body: ContactRequest):
    """Submit a contact form message."""
    from app.services.email import _send, is_configured

    logger.info("Contact form from %s <%s>", body.full_name, body.email)

    if is_configured():
        _send(
            "avi@kolamba.org",
            f"Kolamba Contact: {body.full_name}",
            f"<p><strong>From:</strong> {body.full_name} ({body.email})</p>"
            f"<p><strong>Message:</strong></p><p>{body.message}</p>",
        )

    return {"message": "Thank you! We'll get back to you soon."}


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Kolamba API",
        "version": "1.0.0",
        "docs": "/api/docs",
    }
