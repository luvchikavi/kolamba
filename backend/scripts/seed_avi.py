"""Create Avi Luvchik artist account with sample bookings for tour algorithm demo.

Run with: cd backend && python -m scripts.seed_avi
"""

import asyncio
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import AsyncSessionLocal
from app.models import User, Artist, Community, Booking
from app.utils.security import get_password_hash


async def seed_avi():
    """Create Avi Luvchik artist with sample bookings."""
    async with AsyncSessionLocal() as session:
        # Check if Avi already exists
        result = await session.execute(
            select(User).where(User.email == "avi@kolamba.com")
        )
        existing = result.scalar_one_or_none()

        if existing:
            print("Avi Luvchik already exists!")
            print(f"Email: avi@kolamba.com")
            print(f"Password: avi123")
            return

        print("Creating Avi Luvchik artist account...")

        # Create user
        user = User(
            email="avi@kolamba.com",
            password_hash=get_password_hash("avi123"),
            name="Avi Luvchik",
            role="artist",
            is_active=True,
        )
        session.add(user)
        await session.flush()

        # Create artist profile
        artist = Artist(
            user_id=user.id,
            name_he="אבי לבצ'יק",
            name_en="Avi Luvchik",
            bio_he="מוזיקאי ויוצר מוכשר עם ניסיון רב בהופעות בקהילות יהודיות ברחבי העולם",
            bio_en="Talented musician and creator with extensive experience performing at Jewish communities worldwide",
            price_single=800,
            price_tour=3000,
            languages=["Hebrew", "English"],
            city="Tel Aviv",
            country="Israel",
            status="active",
            is_featured=True,
            available_for_tour=True,
        )
        session.add(artist)
        await session.flush()

        # Add categories (music and workshops)
        categories_result = await session.execute("SELECT id, slug FROM categories")
        categories_map = {row.slug: row.id for row in categories_result}

        for cat_slug in ["music", "workshops"]:
            if cat_slug in categories_map:
                await session.execute(
                    f"INSERT INTO artist_categories (artist_id, category_id) VALUES ({artist.id}, {categories_map[cat_slug]})"
                )

        # Get or create communities for bookings
        communities_data = [
            {
                "email": "nyc@community.org",
                "name": "NYC Jewish Center",
                "location": "New York, NY",
                "latitude": 40.7128,
                "longitude": -74.0060,
            },
            {
                "email": "boston@community.org",
                "name": "Boston Kehila",
                "location": "Boston, MA",
                "latitude": 42.3601,
                "longitude": -71.0589,
            },
            {
                "email": "philly@community.org",
                "name": "Philadelphia Synagogue",
                "location": "Philadelphia, PA",
                "latitude": 39.9526,
                "longitude": -75.1652,
            },
            {
                "email": "la@community.org",
                "name": "LA Jewish Federation",
                "location": "Los Angeles, CA",
                "latitude": 34.0522,
                "longitude": -118.2437,
            },
            {
                "email": "sf@community.org",
                "name": "San Francisco JCC",
                "location": "San Francisco, CA",
                "latitude": 37.7749,
                "longitude": -122.4194,
            },
            {
                "email": "chicago@community.org",
                "name": "Chicago Beth Israel",
                "location": "Chicago, IL",
                "latitude": 41.8781,
                "longitude": -87.6298,
            },
        ]

        community_ids = []
        for data in communities_data:
            # Check if community exists
            result = await session.execute(
                select(User).where(User.email == data["email"])
            )
            existing_user = result.scalar_one_or_none()

            if existing_user:
                result = await session.execute(
                    select(Community).where(Community.user_id == existing_user.id)
                )
                community = result.scalar_one_or_none()
                if community:
                    community_ids.append(community.id)
                    continue

            # Create community user
            comm_user = User(
                email=data["email"],
                password_hash=get_password_hash("community123"),
                role="community",
                is_active=True,
            )
            session.add(comm_user)
            await session.flush()

            # Create community profile
            community = Community(
                user_id=comm_user.id,
                name=data["name"],
                location=data["location"],
                latitude=data["latitude"],
                longitude=data["longitude"],
                audience_size="medium",
                language="English",
                status="active",
            )
            session.add(community)
            await session.flush()
            community_ids.append(community.id)

        # Create sample bookings (pending status for tour algorithm)
        base_date = datetime.now() + timedelta(days=60)  # Starting ~2 months from now

        bookings_data = [
            # Northeast cluster (NYC, Boston, Philly)
            {"community_idx": 0, "days_offset": 0, "budget": 900, "location": "New York, NY"},
            {"community_idx": 1, "days_offset": 2, "budget": 850, "location": "Boston, MA"},
            {"community_idx": 2, "days_offset": 4, "budget": 800, "location": "Philadelphia, PA"},
            # West Coast cluster (LA, SF)
            {"community_idx": 3, "days_offset": 14, "budget": 1000, "location": "Los Angeles, CA"},
            {"community_idx": 4, "days_offset": 16, "budget": 950, "location": "San Francisco, CA"},
            # Midwest
            {"community_idx": 5, "days_offset": 30, "budget": 850, "location": "Chicago, IL"},
        ]

        for booking_data in bookings_data:
            booking = Booking(
                artist_id=artist.id,
                community_id=community_ids[booking_data["community_idx"]],
                requested_date=(base_date + timedelta(days=booking_data["days_offset"])).date(),
                location=booking_data["location"],
                budget=booking_data["budget"],
                status="pending",
                message="We'd love to have you perform at our community!",
            )
            session.add(booking)

        await session.commit()

        print("\n" + "="*50)
        print("✅ Avi Luvchik artist account created!")
        print("="*50)
        print(f"\n📧 Email: avi@kolamba.com")
        print(f"🔑 Password: avi123")
        print(f"\n📊 Created {len(bookings_data)} pending bookings:")
        print("   - Northeast tour: NYC → Boston → Philadelphia")
        print("   - West Coast tour: LA → San Francisco")
        print("   - Midwest: Chicago")
        print("\n🚀 Login and go to /dashboard/artist to see Tour Suggestions!")
        print("="*50)


if __name__ == "__main__":
    asyncio.run(seed_avi())
