"""Search router - artist search with filters."""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.artist import Artist
from app.models.category import Category
from app.schemas.artist import ArtistListResponse

router = APIRouter()


@router.get("/artists", response_model=list[ArtistListResponse])
async def search_artists(
    q: Optional[str] = Query(None, description="Search query (name, bio)"),
    category: Optional[str] = Query(None, description="Filter by category slug"),
    min_price: Optional[int] = Query(None, description="Minimum price (USD)"),
    max_price: Optional[int] = Query(None, description="Maximum price (USD)"),
    language: Optional[str] = Query(None, description="Filter by language"),
    city: Optional[str] = Query(None, description="Filter by city"),
    is_featured: Optional[bool] = Query(None, description="Only featured artists"),
    sort_by: str = Query("name", description="Sort by: name, price, created_at"),
    sort_order: str = Query("asc", description="Sort order: asc, desc"),
    limit: int = Query(20, le=100),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db),
):
    """
    Search artists with advanced filters.

    - **q**: Free text search in name and bio
    - **category**: Filter by category slug (e.g., 'singing', 'lecture')
    - **min_price/max_price**: Price range filter
    - **language**: Filter by language (e.g., 'Hebrew', 'English')
    - **city**: Filter by city
    - **is_featured**: Only show featured artists
    - **sort_by**: Sort field (name, price, created_at)
    - **sort_order**: asc or desc
    """
    query = select(Artist).options(selectinload(Artist.categories)).where(
        Artist.status == "active"
    )

    # Text search
    if q:
        search_term = f"%{q}%"
        query = query.where(
            or_(
                Artist.name_he.ilike(search_term),
                Artist.name_en.ilike(search_term),
                Artist.bio_he.ilike(search_term),
                Artist.bio_en.ilike(search_term),
            )
        )

    # Category filter
    if category:
        query = query.join(Artist.categories).where(Category.slug == category)

    # Price filters
    if min_price is not None:
        query = query.where(Artist.price_single >= min_price)

    if max_price is not None:
        query = query.where(Artist.price_single <= max_price)

    # Language filter
    if language:
        query = query.where(Artist.languages.contains([language]))

    # City filter
    if city:
        query = query.where(Artist.city.ilike(f"%{city}%"))

    # Featured filter
    if is_featured is not None:
        query = query.where(Artist.is_featured == is_featured)

    # Sorting
    sort_column = {
        "name": Artist.name_he,
        "price": Artist.price_single,
        "created_at": Artist.created_at,
    }.get(sort_by, Artist.name_he)

    if sort_order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    # Pagination
    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    artists = result.scalars().unique().all()

    return artists
