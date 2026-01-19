"""Seed data script for development.

Run with: python -m scripts.seed_data
"""

import asyncio
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.database import AsyncSessionLocal
from app.models import User, Artist, Community, Category
from app.utils.security import get_password_hash


async def seed_data():
    """Seed initial data for development."""
    async with AsyncSessionLocal() as session:
        # Check if data already exists
        result = await session.execute("SELECT COUNT(*) FROM users")
        count = result.scalar()
        if count > 0:
            print("Data already exists, skipping seed.")
            return

        print("Seeding data...")

        # Create admin user
        admin = User(
            email="admin@kolamba.com",
            password_hash=get_password_hash("admin123"),
            role="admin",
            is_active=True,
        )
        session.add(admin)

        # Create sample artist users and profiles
        artist_data = [
            {
                "email": "david@example.com",
                "name_he": "דוד כהן",
                "name_en": "David Cohen",
                "bio_he": "זמר וחזן עם 20 שנות ניסיון בהופעות בקהילות יהודיות",
                "bio_en": "Singer and cantor with 20 years of experience performing at Jewish communities",
                "price_single": 500,
                "price_tour": 2000,
                "languages": ["Hebrew", "English", "Yiddish"],
                "city": "Tel Aviv",
                "categories": ["singing", "cantorial"],
                "is_featured": True,
            },
            {
                "email": "sarah@example.com",
                "name_he": "שרה לוי",
                "name_en": "Sarah Levy",
                "bio_he": "מרצה וסופרת בתחום ההיסטוריה היהודית",
                "bio_en": "Lecturer and author specializing in Jewish history",
                "price_single": 400,
                "price_tour": 1500,
                "languages": ["Hebrew", "English"],
                "city": "Jerusalem",
                "categories": ["lecture"],
                "is_featured": True,
            },
            {
                "email": "yossi@example.com",
                "name_he": "יוסי מזרחי",
                "name_en": "Yossi Mizrachi",
                "bio_he": "קומיקאי סטנדאפ ושחקן",
                "bio_en": "Stand-up comedian and actor",
                "price_single": 600,
                "price_tour": 2500,
                "languages": ["Hebrew", "English"],
                "city": "Haifa",
                "categories": ["comedy", "theater"],
                "is_featured": False,
            },
        ]

        # Get categories
        categories_result = await session.execute("SELECT id, slug FROM categories")
        categories_map = {row.slug: row.id for row in categories_result}

        for data in artist_data:
            # Create user
            user = User(
                email=data["email"],
                password_hash=get_password_hash("password123"),
                role="artist",
                is_active=True,
            )
            session.add(user)
            await session.flush()

            # Create artist profile
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
            session.add(artist)
            await session.flush()

            # Add categories
            for cat_slug in data["categories"]:
                if cat_slug in categories_map:
                    await session.execute(
                        f"INSERT INTO artist_categories (artist_id, category_id) VALUES ({artist.id}, {categories_map[cat_slug]})"
                    )

        # Create sample community users
        community_data = [
            {
                "email": "beth@synagogue.org",
                "name": "Beth Israel Synagogue",
                "location": "New York, NY",
                "latitude": 40.7128,
                "longitude": -74.0060,
                "audience_size": "large",
                "language": "English",
            },
            {
                "email": "jcc@boston.org",
                "name": "Boston JCC",
                "location": "Boston, MA",
                "latitude": 42.3601,
                "longitude": -71.0589,
                "audience_size": "large",
                "language": "English",
            },
            {
                "email": "temple@miami.org",
                "name": "Temple Beth Am",
                "location": "Miami, FL",
                "latitude": 25.7617,
                "longitude": -80.1918,
                "audience_size": "medium",
                "language": "English",
            },
        ]

        for data in community_data:
            # Create user
            user = User(
                email=data["email"],
                password_hash=get_password_hash("password123"),
                role="community",
                is_active=True,
            )
            session.add(user)
            await session.flush()

            # Create community profile
            community = Community(
                user_id=user.id,
                name=data["name"],
                location=data["location"],
                latitude=data["latitude"],
                longitude=data["longitude"],
                audience_size=data["audience_size"],
                language=data["language"],
                status="active",
            )
            session.add(community)

        await session.commit()
        print("Seed data created successfully!")


if __name__ == "__main__":
    asyncio.run(seed_data())
