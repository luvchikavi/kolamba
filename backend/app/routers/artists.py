"""Artists router - CRUD operations for artist profiles."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.artist import Artist
from app.models.category import Category
from app.schemas.artist import ArtistResponse, ArtistListResponse

router = APIRouter()


@router.get("", response_model=list[ArtistListResponse])
async def list_artists(
    category: Optional[str] = Query(None, description="Filter by category slug"),
    min_price: Optional[int] = Query(None, description="Minimum price"),
    max_price: Optional[int] = Query(None, description="Maximum price"),
    language: Optional[str] = Query(None, description="Filter by language"),
    limit: int = Query(20, le=100),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db),
):
    """List all artists with optional filters."""
    query = select(Artist).options(selectinload(Artist.categories)).where(
        Artist.status == "active"
    )

    # Apply filters
    if category:
        query = query.join(Artist.categories).where(Category.slug == category)

    if min_price is not None:
        query = query.where(Artist.price_single >= min_price)

    if max_price is not None:
        query = query.where(Artist.price_single <= max_price)

    if language:
        query = query.where(Artist.languages.contains([language]))

    # Pagination
    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    artists = result.scalars().unique().all()
    return artists


@router.get("/featured", response_model=list[ArtistListResponse])
async def get_featured_artists(
    limit: int = Query(4, le=10),
    db: AsyncSession = Depends(get_db),
):
    """Get featured artists for homepage."""
    result = await db.execute(
        select(Artist)
        .options(selectinload(Artist.categories))
        .where(Artist.status == "active", Artist.is_featured == True)
        .limit(limit)
    )
    artists = result.scalars().unique().all()
    return artists


@router.get("/{artist_id}", response_model=ArtistResponse)
async def get_artist(artist_id: int, db: AsyncSession = Depends(get_db)):
    """Get artist profile by ID."""
    result = await db.execute(
        select(Artist)
        .options(selectinload(Artist.categories))
        .where(Artist.id == artist_id)
    )
    artist = result.scalar_one_or_none()

    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")

    return artist


@router.post("")
async def create_artist():
    """Create new artist profile (authenticated)."""
    return {"message": "Create artist endpoint - to be implemented with auth"}


@router.put("/{artist_id}")
async def update_artist(artist_id: int):
    """Update artist profile (authenticated, owner only)."""
    return {"message": f"Update artist {artist_id} - to be implemented with auth"}
