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
from app.models.artist_tour_date import ArtistTourDate
from app.schemas.artist import ArtistResponse, ArtistListResponse, ArtistUpdate
from app.utils.security import get_password_hash
from app.routers.auth import get_current_active_user
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


@router.get("/me", response_model=ArtistResponse)
async def get_my_artist_profile(
    current_user: User = Depends(get_current_active_user),
    artist_id: Optional[int] = Query(None, description="Artist ID for admin impersonation"),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's artist profile. Admins can specify artist_id to impersonate."""
    # Allow superusers to impersonate any artist for testing
    if current_user.is_superuser and artist_id:
        result = await db.execute(
            select(Artist)
            .options(selectinload(Artist.categories))
            .where(Artist.id == artist_id)
        )
        artist = result.scalar_one_or_none()
        if not artist:
            raise HTTPException(status_code=404, detail="Artist not found")
        return artist

    # For superusers without artist_id, return first active artist for testing
    if current_user.is_superuser:
        result = await db.execute(
            select(Artist)
            .options(selectinload(Artist.categories))
            .where(Artist.status == "active")
            .limit(1)
        )
        artist = result.scalar_one_or_none()
        if artist:
            return artist

    if current_user.role not in ("artist", "agent"):
        raise HTTPException(status_code=403, detail="Not an artist account")

    # Look up by user_id (artist role) or agent_user_id (agent role)
    if current_user.role == "agent":
        result = await db.execute(
            select(Artist)
            .options(selectinload(Artist.categories))
            .where(Artist.agent_user_id == current_user.id)
        )
    else:
        result = await db.execute(
            select(Artist)
            .options(selectinload(Artist.categories))
            .where(Artist.user_id == current_user.id)
        )
    artist = result.scalar_one_or_none()

    if not artist:
        raise HTTPException(status_code=404, detail="Artist profile not found")

    return artist


@router.put("/me", response_model=ArtistResponse)
async def update_my_artist_profile(
    update_data: ArtistUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current user's artist profile."""
    if current_user.role not in ("artist", "agent"):
        raise HTTPException(status_code=403, detail="Not an artist account")

    # Look up by user_id (artist role) or agent_user_id (agent role)
    if current_user.role == "agent":
        result = await db.execute(
            select(Artist)
            .options(selectinload(Artist.categories))
            .where(Artist.agent_user_id == current_user.id)
        )
    else:
        result = await db.execute(
            select(Artist)
            .options(selectinload(Artist.categories))
            .where(Artist.user_id == current_user.id)
        )
    artist = result.scalar_one_or_none()

    if not artist:
        raise HTTPException(status_code=404, detail="Artist profile not found")

    # Update fields
    update_dict = update_data.model_dump(exclude_unset=True)

    # Handle category updates separately
    if "category_ids" in update_dict:
        category_ids = update_dict.pop("category_ids")
        if category_ids is not None:
            categories_result = await db.execute(
                select(Category).where(Category.id.in_(category_ids))
            )
            artist.categories = list(categories_result.scalars().all())

    # Update other fields
    for field, value in update_dict.items():
        if hasattr(artist, field):
            setattr(artist, field, value)

    await db.commit()
    await db.refresh(artist)

    return artist


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
            "categories": ["music-instrumental", "workshop"],
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
            notes="We'd love to have you perform at our community!",
        )
        db.add(booking)

    # Create sample tour dates for featured artists
    tour_dates_data = [
        {
            "artist_idx": 0,  # Avi Luvchik
            "location": "New York, NY",
            "days_offset": 30,
            "description": "East Coast Concert Tour",
            "latitude": 40.7128,
            "longitude": -74.0060,
        },
        {
            "artist_idx": 0,  # Avi Luvchik
            "location": "Boston, MA",
            "days_offset": 33,
            "description": "East Coast Concert Tour",
            "latitude": 42.3601,
            "longitude": -71.0589,
        },
        {
            "artist_idx": 1,  # David Cohen
            "location": "Los Angeles, CA",
            "days_offset": 45,
            "description": "West Coast High Holiday Tour",
            "latitude": 34.0522,
            "longitude": -118.2437,
        },
        {
            "artist_idx": 2,  # Sarah Levy
            "location": "Chicago, IL",
            "days_offset": 60,
            "description": "Jewish History Lecture Series",
            "latitude": 41.8781,
            "longitude": -87.6298,
        },
        {
            "artist_idx": 3,  # Yossi Mizrachi
            "location": "Miami, FL",
            "days_offset": 50,
            "description": "Comedy Night Tour",
            "latitude": 25.7617,
            "longitude": -80.1918,
        },
    ]

    for td in tour_dates_data:
        tour_date = ArtistTourDate(
            artist_id=created_artists[td["artist_idx"]]["id"],
            location=td["location"],
            start_date=(datetime.now() + timedelta(days=td["days_offset"])).date(),
            end_date=(datetime.now() + timedelta(days=td["days_offset"] + 2)).date(),
            description=td["description"],
            latitude=td["latitude"],
            longitude=td["longitude"],
        )
        db.add(tour_date)

    await db.commit()

    return {
        "message": "Database seeded successfully!",
        "seeded": True,
        "artists": created_artists,
        "communities": created_communities,
        "note": "Avi can login with: avi@kolamba.com / avi123",
    }


@router.post("/seed-tour-dates")
async def seed_tour_dates(
    admin_secret: str = Query(..., description="Admin secret for authorization"),
    db: AsyncSession = Depends(get_db),
):
    """Seed tour dates for existing artists. Requires admin secret."""
    # Verify admin secret
    if admin_secret != settings.secret_key:
        raise HTTPException(status_code=403, detail="Invalid admin secret")

    # Check if tour dates already exist
    result = await db.execute(select(ArtistTourDate).limit(1))
    if result.scalar_one_or_none():
        return {"message": "Tour dates already exist. Skipping seed.", "seeded": False}

    # Get existing artists
    artists_result = await db.execute(
        select(Artist).where(Artist.is_featured == True).order_by(Artist.id)
    )
    artists = artists_result.scalars().all()

    if not artists:
        return {"message": "No featured artists found. Run /seed first.", "seeded": False}

    # Create tour dates
    tour_dates_data = [
        {
            "artist_idx": 0,
            "location": "New York, NY",
            "days_offset": 14,
            "description": "East Coast Concert Tour - Performing live in NYC!",
        },
        {
            "artist_idx": 0,
            "location": "Boston, MA",
            "days_offset": 17,
            "description": "East Coast Concert Tour - Boston stop",
        },
        {
            "artist_idx": 1 if len(artists) > 1 else 0,
            "location": "Los Angeles, CA",
            "days_offset": 21,
            "description": "West Coast High Holiday Tour",
        },
        {
            "artist_idx": 2 if len(artists) > 2 else 0,
            "location": "Chicago, IL",
            "days_offset": 28,
            "description": "Jewish History Lecture Series",
        },
        {
            "artist_idx": 3 if len(artists) > 3 else 0,
            "location": "Miami, FL",
            "days_offset": 35,
            "description": "Comedy Night Tour - Bringing laughs to Florida!",
        },
        {
            "artist_idx": 0,
            "location": "Washington, DC",
            "days_offset": 42,
            "description": "Capital City Performance",
        },
    ]

    created_tour_dates = []
    for td in tour_dates_data:
        artist = artists[td["artist_idx"]] if td["artist_idx"] < len(artists) else artists[0]
        tour_date = ArtistTourDate(
            artist_id=artist.id,
            location=td["location"],
            start_date=(datetime.now() + timedelta(days=td["days_offset"])).date(),
            end_date=(datetime.now() + timedelta(days=td["days_offset"] + 2)).date(),
            description=td["description"],
        )
        db.add(tour_date)
        await db.flush()
        created_tour_dates.append({
            "id": tour_date.id,
            "location": tour_date.location,
            "artist": artist.name_en,
            "start_date": str(tour_date.start_date),
        })

    await db.commit()

    return {
        "message": "Tour dates seeded successfully!",
        "seeded": True,
        "tour_dates": created_tour_dates,
    }
