"""Search router - artist search with full-text search and filters."""

from typing import Optional
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy import select, or_, func, text, case, literal_column
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.artist import Artist
from app.models.category import Category
from app.schemas.artist import ArtistListResponse

from app.rate_limit import limiter

router = APIRouter()


def _build_tsquery(q: str) -> str:
    """Build a tsquery string from user input.

    Splits on whitespace and joins with '|' (OR) for flexible matching.
    Each term gets prefix matching (:*) so partial words work.
    """
    terms = q.strip().split()
    if not terms:
        return ""
    return " | ".join(f"{t}:*" for t in terms)


@router.get("/artists", response_model=list[ArtistListResponse])
@limiter.limit("30/minute")
async def search_artists(
    request: Request,
    q: Optional[str] = Query(None, description="Search query (name, bio)"),
    category: Optional[str] = Query(None, description="Filter by category slug"),
    min_price: Optional[int] = Query(None, description="Minimum price (USD)"),
    max_price: Optional[int] = Query(None, description="Maximum price (USD)"),
    language: Optional[str] = Query(None, description="Filter by language"),
    city: Optional[str] = Query(None, description="Filter by city"),
    is_featured: Optional[bool] = Query(None, description="Only featured artists"),
    sort_by: str = Query("relevance", description="Sort by: relevance, name, price, created_at"),
    sort_order: str = Query("desc", description="Sort order: asc, desc"),
    limit: int = Query(20, le=100),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db),
):
    """
    Search artists with full-text search and advanced filters.

    - **q**: Free text search using PostgreSQL full-text search (supports Hebrew + English)
    - **category**: Filter by category slug (e.g., 'singing', 'lecture')
    - **min_price/max_price**: Price range filter
    - **language**: Filter by language (e.g., 'Hebrew', 'English')
    - **city**: Filter by city
    - **is_featured**: Only show featured artists
    - **sort_by**: Sort field (relevance, name, price, created_at)
    - **sort_order**: asc or desc
    """
    query = select(Artist).options(selectinload(Artist.categories)).where(
        Artist.status == "active"
    )

    # Full-text search with relevance ranking
    rank_column = None
    if q:
        tsquery_str = _build_tsquery(q)
        if tsquery_str:
            # Build tsvector from name and bio fields (coalesce NULLs)
            tsvector = func.to_tsvector(
                "simple",
                func.coalesce(Artist.name_he, "")
                + " "
                + func.coalesce(Artist.name_en, "")
                + " "
                + func.coalesce(Artist.bio_he, "")
                + " "
                + func.coalesce(Artist.bio_en, "")
                + " "
                + func.coalesce(Artist.city, ""),
            )
            tsquery = func.to_tsquery("simple", tsquery_str)

            # Filter: must match full-text search OR fall back to ILIKE for partial matches
            ilike_term = f"%{q}%"
            query = query.where(
                or_(
                    tsvector.op("@@")(tsquery),
                    Artist.name_he.ilike(ilike_term),
                    Artist.name_en.ilike(ilike_term),
                )
            )

            # Compute relevance rank for sorting
            rank_column = func.ts_rank(tsvector, tsquery)

    # Category filter
    if category:
        query = query.join(Artist.categories).where(Category.slug == category)

    # Price filters (include artists without pricing)
    if min_price is not None:
        query = query.where(or_(Artist.price_single >= min_price, Artist.price_single.is_(None)))

    if max_price is not None:
        query = query.where(or_(Artist.price_single <= max_price, Artist.price_single.is_(None)))

    # Language filter
    if language:
        query = query.where(
            Artist.languages.isnot(None),
            Artist.languages.contains([language]),
        )

    # City filter
    if city:
        query = query.where(Artist.city.ilike(f"%{city}%"))

    # Featured filter
    if is_featured is not None:
        query = query.where(Artist.is_featured == is_featured)

    # Sorting
    if sort_by == "relevance" and rank_column is not None:
        # Sort by full-text relevance score
        if sort_order == "asc":
            query = query.order_by(rank_column.asc())
        else:
            query = query.order_by(rank_column.desc())
    else:
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
