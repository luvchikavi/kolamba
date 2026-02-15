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
from app.models.conversation import Conversation, Message
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
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Seed the database with sample artists, communities, bookings, and conversations. Requires superuser + development env."""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Superuser access required")
    if settings.env != "development":
        raise HTTPException(status_code=403, detail="Seed endpoints are only available in development environment")

    # Check if data already exists
    result = await db.execute(select(Artist).limit(1))
    if result.scalar_one_or_none():
        return {"message": "Data already exists. Skipping seed.", "seeded": False}

    # Get categories
    categories_result = await db.execute(select(Category))
    all_categories = {cat.slug: cat for cat in categories_result.scalars().all()}

    # ── 8 Artists (matching frontend/public/artists/ images) ──

    artists_data = [
        {
            "email": "tuna@kolamba.com",
            "password": "tuna123",
            "name_he": "טונה (איתי זבולון)",
            "name_en": "Tuna (Itay Zvulun)",
            "bio_he": "איתי זבולון, הידוע בשם הבמה טונה, הוא ראפר, זמר ויוצר ישראלי. מוכר בזכות הסגנון הייחודי שלו המשלב היפ-הופ, פופ ומוזיקה מזרחית, ובזכות טקסטים אישיים ועמוקים",
            "bio_en": "Itay Zvulun, known by his stage name Tuna, is an Israeli rapper, singer and songwriter. Known for his unique style blending hip-hop, pop and Middle Eastern music with deeply personal lyrics.",
            "price_single": 2500,
            "price_tour": 8000,
            "languages": ["Hebrew", "English"],
            "city": "Tel Aviv",
            "categories": ["music"],
            "is_featured": True,
            "profile_image": "/artists/tuna.jpg",
            "subcategories": ["Hip-Hop", "Pop", "Mizrahi"],
            "performance_types": ["Concert", "Festival", "Private Event"],
            "instagram": "https://instagram.com/tuna_music",
            "youtube": "https://youtube.com/@tunamusic",
            "video_urls": ["https://youtube.com/watch?v=example1"],
        },
        {
            "email": "noga@kolamba.com",
            "password": "noga123",
            "name_he": "נגה ארז",
            "name_en": "Noga Erez",
            "bio_he": "נגה ארז היא מוזיקאית ומפיקה ישראלית בעלת כישרון מולד לשילוב ז'אנרים ודחיפת גבולות יצירתיים. מוכרת בינלאומית בזכות הסאונד החדשני שלה",
            "bio_en": "Noga Erez is a visionary Israeli musician and producer with an innate talent for blending genres and pushing creative boundaries. Internationally recognized for her innovative sound.",
            "price_single": 3000,
            "price_tour": 10000,
            "languages": ["Hebrew", "English"],
            "city": "Tel Aviv",
            "categories": ["music"],
            "is_featured": True,
            "profile_image": "/artists/noga-erez.jpg",
            "subcategories": ["Electronic", "Pop", "Alternative"],
            "performance_types": ["Concert", "Festival", "DJ Set"],
            "instagram": "https://instagram.com/nogaerez",
            "youtube": "https://youtube.com/@nogaerez",
            "video_urls": ["https://youtube.com/watch?v=example2"],
        },
        {
            "email": "jasmin@kolamba.com",
            "password": "jasmin123",
            "name_he": "יסמין מועלם",
            "name_en": "Jasmin Moallem",
            "bio_he": "יסמין מועלם היא זמרת ויוצרת ישראלית מחיפה, המשלבת מוזיקה ים-תיכונית עם פופ מודרני. קולה הייחודי והנוכחות הבימתית שלה כובשים קהלים",
            "bio_en": "Jasmin Moallem is an Israeli singer-songwriter from Haifa blending Mediterranean sounds with modern pop. Her unique voice and stage presence captivate audiences worldwide.",
            "price_single": 1800,
            "price_tour": 6000,
            "languages": ["Hebrew", "English", "Arabic"],
            "city": "Haifa",
            "categories": ["music"],
            "is_featured": True,
            "profile_image": "/artists/jasmin-moallem.jpg",
            "subcategories": ["Mediterranean", "Pop", "World Music"],
            "performance_types": ["Concert", "Acoustic Set", "Workshop"],
            "instagram": "https://instagram.com/jasminmoallem",
            "youtube": "https://youtube.com/@jasminmoallem",
            "video_urls": ["https://youtube.com/watch?v=example3"],
        },
        {
            "email": "eden@kolamba.com",
            "password": "eden123",
            "name_he": "עדן בן זקן",
            "name_en": "Eden Ben Zaken",
            "bio_he": "עדן בן זקן היא אחת מכוכבות הפופ האהובות בישראל, עם שירי להיט רבים והופעות מלאות בכל רחבי העולם. סגנונה משלב מזרחי עם פופ מודרני",
            "bio_en": "One of Israel's most beloved pop stars with numerous hit songs and sold-out performances worldwide. Her style blends Mizrahi music with modern pop sensibilities.",
            "price_single": 4000,
            "price_tour": 15000,
            "languages": ["Hebrew", "English"],
            "city": "Ramat Gan",
            "categories": ["music"],
            "is_featured": True,
            "profile_image": "/artists/eden-ben-zaken.jpg",
            "subcategories": ["Pop", "Mizrahi", "Dance"],
            "performance_types": ["Concert", "Festival", "Gala"],
            "instagram": "https://instagram.com/edenbenzaken",
            "youtube": "https://youtube.com/@edenbenzaken",
            "video_urls": ["https://youtube.com/watch?v=example4"],
        },
        {
            "email": "etgar@kolamba.com",
            "password": "etgar123",
            "name_he": "אתגר קרת",
            "name_en": "Etgar Keret",
            "bio_he": "אתגר קרת הוא סופר, תסריטאי ובמאי ישראלי, מהסופרים הנקראים ביותר בישראל. סיפוריו הקצרים תורגמו ליותר מ-40 שפות",
            "bio_en": "Etgar Keret is an Israeli writer, screenwriter and director — one of Israel's most-read authors. His short stories have been translated into over 40 languages.",
            "price_single": 2000,
            "price_tour": 7000,
            "languages": ["Hebrew", "English"],
            "city": "Tel Aviv",
            "categories": ["literature"],
            "is_featured": True,
            "profile_image": "/artists/etgar-keret.jpg",
            "subcategories": ["Short Stories", "Screenwriting", "Public Speaking"],
            "performance_types": ["Lecture", "Reading", "Panel Discussion", "Workshop"],
            "instagram": "https://instagram.com/etgarkeret",
            "youtube": "https://youtube.com/@etgarkeret",
            "video_urls": ["https://youtube.com/watch?v=example5"],
        },
        {
            "email": "udi@kolamba.com",
            "password": "udi123",
            "name_he": "אודי קגן",
            "name_en": "Udi Kagan",
            "bio_he": "אודי קגן הוא קומיקאי סטנדאפ ישראלי מוביל, ידוע בזכות הומור חד, אקטואלי ובלתי מתפשר. מופיע בפני קהלים בישראל ובתפוצות",
            "bio_en": "Udi Kagan is a leading Israeli stand-up comedian known for sharp, topical and uncompromising humor. Performs for audiences in Israel and across the diaspora.",
            "price_single": 1500,
            "price_tour": 5000,
            "languages": ["Hebrew", "English"],
            "city": "Tel Aviv",
            "categories": ["comedy"],
            "is_featured": True,
            "profile_image": "/artists/udi-kagan.jpg",
            "subcategories": ["Stand-Up", "Satire", "Improv"],
            "performance_types": ["Stand-Up Show", "Comedy Night", "Corporate Event"],
            "instagram": "https://instagram.com/udikagan",
            "youtube": "https://youtube.com/@udikagan",
            "video_urls": ["https://youtube.com/watch?v=example6"],
        },
        {
            "email": "yonit@kolamba.com",
            "password": "yonit123",
            "name_he": "יונית לוי",
            "name_en": "Yonit Levi",
            "bio_he": "יונית לוי היא מגישת חדשות ועיתונאית ישראלית בכירה. שימשה כמגישת מהדורת החדשות המרכזית של ערוץ 2/12 במשך שנים רבות",
            "bio_en": "Yonit Levi is a senior Israeli news anchor and journalist. She served as the main news anchor on Channel 2/12 for many years and is a respected media figure.",
            "price_single": 2500,
            "price_tour": 8000,
            "languages": ["Hebrew", "English", "French"],
            "city": "Tel Aviv",
            "categories": ["journalism"],
            "is_featured": False,
            "profile_image": "/artists/yonit-levi.jpg",
            "subcategories": ["News", "Moderation", "Interviewing"],
            "performance_types": ["Keynote", "Panel Moderation", "Interview", "Lecture"],
            "instagram": "https://instagram.com/yonitlevi",
            "youtube": "",
            "video_urls": [],
        },
        {
            "email": "emily@kolamba.com",
            "password": "emily123",
            "name_he": "אמילי דמארי",
            "name_en": "Emily Damari",
            "bio_he": "אמילי דמארי היא דמות השראה ישראלית, שסיפורה האישי של עוצמה וחוסן מעורר השראה בקהילות ברחבי העולם",
            "bio_en": "Emily Damari is an Israeli inspirational figure whose personal story of strength and resilience inspires communities worldwide.",
            "price_single": 1200,
            "price_tour": 4000,
            "languages": ["Hebrew", "English"],
            "city": "Kiryat Gat",
            "categories": ["inspiration"],
            "is_featured": False,
            "profile_image": "/artists/emily-damari.jpg",
            "subcategories": ["Motivational Speaking", "Personal Story", "Resilience"],
            "performance_types": ["Keynote", "Lecture", "Panel Discussion"],
            "instagram": "https://instagram.com/emilydamari",
            "youtube": "",
            "video_urls": [],
        },
    ]

    created_artists = []
    artist_users = {}  # artist_idx -> user object

    for idx, data in enumerate(artists_data):
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
        artist_users[idx] = user

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
            profile_image=data["profile_image"],
            subcategories=data.get("subcategories", []),
            performance_types=data.get("performance_types", []),
            instagram=data.get("instagram", ""),
            youtube=data.get("youtube", ""),
            video_urls=data.get("video_urls", []),
        )

        # Add categories
        for cat_slug in data["categories"]:
            if cat_slug in all_categories:
                artist.categories.append(all_categories[cat_slug])

        db.add(artist)
        await db.flush()
        created_artists.append({"id": artist.id, "name": data["name_en"], "email": data["email"]})

    # ── 10 Communities ──

    communities_data = [
        {
            "email": "info@manhattanjcc.org",
            "name": "Manhattan JCC",
            "location": "New York, NY, United States",
            "lat": 40.7831, "lon": -73.9712,
            "community_type": "JCC",
            "event_types": ["Concerts", "Lectures", "Workshops", "Holiday Events"],
            "contact_role": "Program Director",
            "phone": "+1-212-555-0101",
            "member_min": 2000, "member_max": 5000,
        },
        {
            "email": "info@templeemanuel.org",
            "name": "Temple Emanuel",
            "location": "Boston, MA, United States",
            "lat": 42.3467, "lon": -71.0972,
            "community_type": "Temple",
            "event_types": ["Concerts", "Shabbat Programs", "Holiday Events", "Educational Programs"],
            "contact_role": "Rabbi",
            "phone": "+1-617-555-0102",
            "member_min": 800, "member_max": 1500,
        },
        {
            "email": "info@bethisraella.org",
            "name": "Beth Israel Congregation",
            "location": "Los Angeles, CA, United States",
            "lat": 34.0689, "lon": -118.3527,
            "community_type": "Synagogue",
            "event_types": ["Concerts", "Lectures", "Family Events", "Holiday Events"],
            "contact_role": "Executive Director",
            "phone": "+1-310-555-0103",
            "member_min": 1000, "member_max": 3000,
        },
        {
            "email": "info@chicagojcc.org",
            "name": "Chicago Jewish Center",
            "location": "Chicago, IL, United States",
            "lat": 41.8998, "lon": -87.6237,
            "community_type": "JCC",
            "event_types": ["Concerts", "Workshops", "Children Shows", "Cultural Festivals"],
            "contact_role": "Events Coordinator",
            "phone": "+1-312-555-0104",
            "member_min": 1500, "member_max": 4000,
        },
        {
            "email": "info@bethshalom-miami.org",
            "name": "Congregation Beth Shalom",
            "location": "Miami, FL, United States",
            "lat": 25.8326, "lon": -80.2342,
            "community_type": "Synagogue",
            "event_types": ["Concerts", "Shabbat Programs", "Holiday Events", "Youth Programs"],
            "contact_role": "Cantor",
            "phone": "+1-305-555-0105",
            "member_min": 600, "member_max": 1200,
        },
        {
            "email": "info@torontojewish.org",
            "name": "Toronto Jewish Federation",
            "location": "Toronto, ON, Canada",
            "lat": 43.7184, "lon": -79.3781,
            "community_type": "Federation",
            "event_types": ["Concerts", "Lectures", "Cultural Festivals", "Educational Programs"],
            "contact_role": "Program Director",
            "phone": "+1-416-555-0106",
            "member_min": 3000, "member_max": 8000,
        },
        {
            "email": "info@hillel-columbia.org",
            "name": "Hillel at Columbia",
            "location": "New York, NY, United States",
            "lat": 40.8075, "lon": -73.9626,
            "community_type": "Campus Organization",
            "event_types": ["Concerts", "Lectures", "Shabbat Programs", "Youth Programs"],
            "contact_role": "Executive Director",
            "phone": "+1-212-555-0107",
            "member_min": 500, "member_max": 1000,
        },
        {
            "email": "info@thecjm.org",
            "name": "Contemporary Jewish Museum",
            "location": "San Francisco, CA, United States",
            "lat": 37.7857, "lon": -122.4011,
            "community_type": "Museum",
            "event_types": ["Lectures", "Workshops", "Cultural Festivals", "Educational Programs"],
            "contact_role": "Events Coordinator",
            "phone": "+1-415-555-0108",
            "member_min": 200, "member_max": 500,
        },
        {
            "email": "info@campramah.org",
            "name": "Camp Ramah Berkshires",
            "location": "Wingdale, NY, United States",
            "lat": 41.6376, "lon": -73.5660,
            "community_type": "Summer Camp",
            "event_types": ["Concerts", "Workshops", "Children Shows", "Family Events"],
            "contact_role": "Program Director",
            "phone": "+1-845-555-0109",
            "member_min": 300, "member_max": 600,
        },
        {
            "email": "info@ljcc.org.uk",
            "name": "London Jewish Cultural Centre",
            "location": "London, United Kingdom",
            "lat": 51.5762, "lon": -0.1448,
            "community_type": "Cultural Center",
            "event_types": ["Concerts", "Lectures", "Workshops", "Cultural Festivals"],
            "contact_role": "Program Director",
            "phone": "+44-20-7555-0110",
            "member_min": 1000, "member_max": 2500,
        },
    ]

    created_communities = []
    community_users = {}  # community_idx -> user object

    for idx, data in enumerate(communities_data):
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
        community_users[idx] = user

        community = Community(
            user_id=user.id,
            name=data["name"],
            location=data["location"],
            latitude=data["lat"],
            longitude=data["lon"],
            community_type=data["community_type"],
            event_types=data["event_types"],
            contact_role=data["contact_role"],
            phone=data["phone"],
            member_count_min=data["member_min"],
            member_count_max=data["member_max"],
            language="English",
            status="active",
        )
        db.add(community)
        await db.flush()
        created_communities.append({"id": community.id, "name": data["name"]})

    # ── 10 Tour Dates (next 2-3 months) ──

    tour_dates_data = [
        {"artist_idx": 0, "location": "New York, NY", "days_offset": 21, "description": "Tuna Live in NYC - East Coast Tour", "lat": 40.7128, "lon": -74.0060},
        {"artist_idx": 0, "location": "Boston, MA", "days_offset": 24, "description": "Tuna Live - East Coast Tour", "lat": 42.3601, "lon": -71.0589},
        {"artist_idx": 1, "location": "Los Angeles, CA", "days_offset": 30, "description": "Noga Erez - West Coast Shows", "lat": 34.0522, "lon": -118.2437},
        {"artist_idx": 1, "location": "San Francisco, CA", "days_offset": 33, "description": "Noga Erez - West Coast Shows", "lat": 37.7749, "lon": -122.4194},
        {"artist_idx": 3, "location": "New York, NY", "days_offset": 40, "description": "Eden Ben Zaken - American Tour", "lat": 40.7128, "lon": -74.0060},
        {"artist_idx": 3, "location": "Miami, FL", "days_offset": 44, "description": "Eden Ben Zaken - American Tour", "lat": 25.7617, "lon": -80.1918},
        {"artist_idx": 4, "location": "Chicago, IL", "days_offset": 35, "description": "Etgar Keret - Literary Evenings", "lat": 41.8781, "lon": -87.6298},
        {"artist_idx": 4, "location": "Toronto, ON", "days_offset": 38, "description": "Etgar Keret - Literary Evenings", "lat": 43.6532, "lon": -79.3832},
        {"artist_idx": 5, "location": "New York, NY", "days_offset": 28, "description": "Udi Kagan - Comedy Tour", "lat": 40.7128, "lon": -74.0060},
        {"artist_idx": 5, "location": "Los Angeles, CA", "days_offset": 50, "description": "Udi Kagan - Comedy Night LA", "lat": 34.0522, "lon": -118.2437},
    ]

    for td in tour_dates_data:
        tour_date = ArtistTourDate(
            artist_id=created_artists[td["artist_idx"]]["id"],
            location=td["location"],
            start_date=(datetime.now() + timedelta(days=td["days_offset"])).date(),
            end_date=(datetime.now() + timedelta(days=td["days_offset"] + 2)).date(),
            description=td["description"],
            latitude=td["lat"],
            longitude=td["lon"],
        )
        db.add(tour_date)

    # ── 8 Bookings (3 approved, 3 pending, 2 completed) ──

    base_date = datetime.now()
    bookings_info = [
        # 3 approved (Events page)
        {"artist_idx": 0, "comm_idx": 0, "days": 25, "budget": 2800, "status": "approved", "loc": "New York, NY", "notes": "We're thrilled to host Tuna at our annual gala!"},
        {"artist_idx": 1, "comm_idx": 2, "days": 32, "budget": 3500, "status": "approved", "loc": "Los Angeles, CA", "notes": "Noga Erez concert for our community celebration."},
        {"artist_idx": 3, "comm_idx": 3, "days": 42, "budget": 4500, "status": "approved", "loc": "Chicago, IL", "notes": "Eden Ben Zaken for our annual fundraiser gala."},
        # 3 pending (Quotes page)
        {"artist_idx": 4, "comm_idx": 5, "days": 38, "budget": 2200, "status": "pending", "loc": "Toronto, ON", "notes": "We'd love Etgar Keret for a literary evening at our federation."},
        {"artist_idx": 5, "comm_idx": 6, "days": 30, "budget": 1800, "status": "pending", "loc": "New York, NY", "notes": "Comedy night with Udi Kagan for our Hillel students!"},
        {"artist_idx": 2, "comm_idx": 1, "days": 45, "budget": 2000, "status": "pending", "loc": "Boston, MA", "notes": "Jasmin Moallem concert for Shabbat celebration."},
        # 2 completed
        {"artist_idx": 0, "comm_idx": 4, "days": -30, "budget": 2600, "status": "completed", "loc": "Miami, FL", "notes": "Amazing Tuna performance at our community event!"},
        {"artist_idx": 5, "comm_idx": 7, "days": -15, "budget": 1600, "status": "completed", "loc": "San Francisco, CA", "notes": "Udi Kagan brought the house down at CJM!"},
    ]

    created_bookings = []
    for bd in bookings_info:
        booking = Booking(
            artist_id=created_artists[bd["artist_idx"]]["id"],
            community_id=created_communities[bd["comm_idx"]]["id"],
            requested_date=(base_date + timedelta(days=bd["days"])).date(),
            location=bd["loc"],
            budget=bd["budget"],
            status=bd["status"],
            notes=bd["notes"],
        )
        db.add(booking)
        await db.flush()
        created_bookings.append({
            "id": booking.id,
            "artist_idx": bd["artist_idx"],
            "comm_idx": bd["comm_idx"],
            "status": bd["status"],
        })

    # ── Conversations + Messages for each booking ──

    conversation_messages = [
        [
            ("community", "Hi! We'd love to have Tuna perform at our annual gala. Is the date available?"),
            ("artist", "Thanks for reaching out! The date works great. Looking forward to it."),
            ("community", "Wonderful! We'll send over the venue details shortly."),
        ],
        [
            ("community", "Hello! We're interested in booking Noga Erez for a community celebration."),
            ("artist", "Hi! I'd be happy to discuss. What kind of event are you planning?"),
            ("community", "A community-wide celebration for about 500 people. We have a great outdoor venue."),
        ],
        [
            ("community", "We would be honored to host Eden Ben Zaken at our annual fundraiser."),
            ("artist", "Thank you for the invitation! I've heard great things about your community."),
        ],
        [
            ("community", "We're a federation in Toronto and would love to host a literary evening with Etgar Keret."),
            ("artist", "Sounds wonderful. I enjoy connecting with diaspora communities. Let's discuss details."),
        ],
        [
            ("community", "Hi! Our Hillel students would love a comedy night with Udi Kagan."),
            ("artist", "I love performing for college crowds! What's the venue like?"),
            ("community", "We have a great auditorium that seats about 400. Very lively atmosphere!"),
        ],
        [
            ("community", "We'd love Jasmin Moallem for a special Shabbat celebration concert."),
            ("artist", "That sounds beautiful! I'd be honored to be part of your Shabbat celebration."),
        ],
        [
            ("community", "Thank you for the incredible performance! Our community loved it."),
            ("artist", "Thank you for having me! The audience was amazing. Hope to come back soon."),
        ],
        [
            ("community", "Udi, your show was absolutely hilarious! Everyone is still talking about it."),
            ("artist", "Haha, that's the best compliment! Your crowd was fantastic. Let's do it again!"),
        ],
    ]

    for i, bk in enumerate(created_bookings):
        conversation = Conversation(booking_id=bk["id"])
        db.add(conversation)
        await db.flush()

        messages = conversation_messages[i]
        for j, (sender_type, content) in enumerate(messages):
            if sender_type == "community":
                sender_id = community_users[bk["comm_idx"]].id
            else:
                sender_id = artist_users[bk["artist_idx"]].id

            msg = Message(
                conversation_id=conversation.id,
                sender_id=sender_id,
                content=content,
            )
            db.add(msg)

    await db.commit()

    return {
        "message": "Database seeded successfully!",
        "seeded": True,
        "artists": created_artists,
        "communities": created_communities,
        "bookings": len(created_bookings),
        "conversations": len(created_bookings),
        "tour_dates": len(tour_dates_data),
    }


@router.post("/seed-tour-dates")
async def seed_tour_dates(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Seed tour dates for existing artists. Requires superuser + development env."""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Superuser access required")
    if settings.env != "development":
        raise HTTPException(status_code=403, detail="Seed endpoints are only available in development environment")

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
