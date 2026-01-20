"""Artists router - CRUD operations for artist profiles."""

from typing import Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.artist import Artist
from app.models.category import Category
from app.models.user import User
from app.models.community import Community
from app.models.booking import Booking
from app.schemas.artist import ArtistResponse, ArtistListResponse
from app.utils.security import get_password_hash
from app.config import get_settings

settings = get_settings()
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


@router.post("/seed")
async def seed_artists(
    admin_secret: str = Query(..., description="Admin secret for authorization"),
    db: AsyncSession = Depends(get_db),
):
    """Seed the database with sample artists and bookings. Requires admin secret."""
    # Verify admin secret
    if admin_secret != settings.secret_key:
        raise HTTPException(status_code=403, detail="Invalid admin secret")

    # Check if data already exists
    result = await db.execute(select(Artist).limit(1))
    if result.scalar_one_or_none():
        return {"message": "Data already exists. Skipping seed.", "seeded": False}

    # Get categories
    categories_result = await db.execute(select(Category))
    all_categories = {cat.slug: cat for cat in categories_result.scalars().all()}

    artists_data = [
        {
            "email": "avi@kolamba.com",
            "password": "avi123",
            "name_he": "אבי לבצ'יק",
            "name_en": "Avi Luvchik",
            "bio_he": "מוזיקאי ויוצר מוכשר עם ניסיון רב בהופעות בקהילות יהודיות ברחבי העולם",
            "bio_en": "Talented musician and creator with extensive experience performing at Jewish communities worldwide",
            "price_single": 800,
            "price_tour": 3000,
            "languages": ["Hebrew", "English"],
            "city": "Tel Aviv",
            "categories": ["music", "workshop"],
            "is_featured": True,
        },
        {
            "email": "david@kolamba.com",
            "password": "david123",
            "name_he": "דוד כהן",
            "name_en": "David Cohen",
            "bio_he": "זמר וחזן עם 20 שנות ניסיון בהופעות בקהילות יהודיות",
            "bio_en": "Singer and cantor with 20 years of experience performing at Jewish communities",
            "price_single": 500,
            "price_tour": 2000,
            "languages": ["Hebrew", "English", "Yiddish"],
            "city": "Jerusalem",
            "categories": ["singing", "cantorial"],
            "is_featured": True,
        },
        {
            "email": "sarah@kolamba.com",
            "password": "sarah123",
            "name_he": "שרה לוי",
            "name_en": "Sarah Levy",
            "bio_he": "מרצה וסופרת בתחום ההיסטוריה היהודית",
            "bio_en": "Lecturer and author specializing in Jewish history",
            "price_single": 400,
            "price_tour": 1500,
            "languages": ["Hebrew", "English"],
            "city": "Haifa",
            "categories": ["lecture"],
            "is_featured": True,
        },
        {
            "email": "yossi@kolamba.com",
            "password": "yossi123",
            "name_he": "יוסי מזרחי",
            "name_en": "Yossi Mizrachi",
            "bio_he": "קומיקאי סטנדאפ ושחקן תיאטרון",
            "bio_en": "Stand-up comedian and theater actor",
            "price_single": 600,
            "price_tour": 2500,
            "languages": ["Hebrew", "English"],
            "city": "Tel Aviv",
            "categories": ["comedy", "theater"],
            "is_featured": True,
        },
        {
            "email": "miri@kolamba.com",
            "password": "miri123",
            "name_he": "מירי גולן",
            "name_en": "Miri Golan",
            "bio_he": "רקדנית ומעצבת תנועה עם התמחות במחול ישראלי",
            "bio_en": "Dancer and movement designer specializing in Israeli dance",
            "price_single": 450,
            "price_tour": 1800,
            "languages": ["Hebrew", "English"],
            "city": "Tel Aviv",
            "categories": ["dance"],
            "is_featured": False,
        },
    ]

    created_artists = []

    for data in artists_data:
        # Create user
        user = User(
            email=data["email"],
            password_hash=get_password_hash(data["password"]),
            name=data["name_en"],
            role="artist",
            status="active",
            is_active=True,
        )
        db.add(user)
        await db.flush()

        # Create artist
        artist = Artist(
            user_id=user.id,
            name_he=data["name_he"],
            name_en=data["name_en"],
            bio_he=data["bio_he"],
            bio_en=data["bio_en"],
            price_single=data["price_single"],
            price_tour=data["price_tour"],
            languages=data["languages"],
            city=data["city"],
            country="Israel",
            status="active",
            is_featured=data["is_featured"],
            available_for_tour=True,
        )

        # Add categories
        for cat_slug in data["categories"]:
            if cat_slug in all_categories:
                artist.categories.append(all_categories[cat_slug])

        db.add(artist)
        await db.flush()
        created_artists.append({"id": artist.id, "name": data["name_en"], "email": data["email"]})

    # Create sample communities
    communities_data = [
        {"email": "nyc@community.org", "name": "NYC Jewish Center", "location": "New York, NY", "lat": 40.7128, "lon": -74.0060},
        {"email": "boston@community.org", "name": "Boston Kehila", "location": "Boston, MA", "lat": 42.3601, "lon": -71.0589},
        {"email": "la@community.org", "name": "LA Jewish Federation", "location": "Los Angeles, CA", "lat": 34.0522, "lon": -118.2437},
    ]

    created_communities = []
    for data in communities_data:
        user = User(
            email=data["email"],
            password_hash=get_password_hash("community123"),
            name=data["name"],
            role="community",
            status="active",
            is_active=True,
        )
        db.add(user)
        await db.flush()

        community = Community(
            user_id=user.id,
            name=data["name"],
            location=data["location"],
            latitude=data["lat"],
            longitude=data["lon"],
            audience_size="medium",
            language="English",
            status="active",
        )
        db.add(community)
        await db.flush()
        created_communities.append({"id": community.id, "name": data["name"]})

    # Create bookings for Avi Luvchik (artist_id=1)
    base_date = datetime.now() + timedelta(days=60)
    avi_artist_id = created_artists[0]["id"]

    bookings_data = [
        {"community_idx": 0, "days_offset": 0, "budget": 900, "location": "New York, NY"},
        {"community_idx": 1, "days_offset": 3, "budget": 850, "location": "Boston, MA"},
        {"community_idx": 2, "days_offset": 10, "budget": 1000, "location": "Los Angeles, CA"},
    ]

    for bd in bookings_data:
        booking = Booking(
            artist_id=avi_artist_id,
            community_id=created_communities[bd["community_idx"]]["id"],
            requested_date=(base_date + timedelta(days=bd["days_offset"])).date(),
            location=bd["location"],
            budget=bd["budget"],
            status="pending",
            message="We'd love to have you perform at our community!",
        )
        db.add(booking)

    await db.commit()

    return {
        "message": "Database seeded successfully!",
        "seeded": True,
        "artists": created_artists,
        "communities": created_communities,
        "note": "Avi can login with: avi@kolamba.com / avi123",
    }
