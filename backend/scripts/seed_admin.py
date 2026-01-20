"""Seed script to create admin user and sample data."""

import asyncio
import sys
sys.path.insert(0, "/Users/aviluvchik/app/Kolamba/backend")

from sqlalchemy import select
from passlib.context import CryptContext

from app.database import AsyncSessionLocal, engine
from app.models.user import User
from app.models.category import Category

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def seed_admin_user():
    """Create admin user if not exists."""
    async with AsyncSessionLocal() as db:
        # Check if user exists
        result = await db.execute(
            select(User).where(User.email == "avi@drishti.com")
        )
        existing_user = result.scalar_one_or_none()

        if existing_user:
            print(f"User avi@drishti.com already exists (id: {existing_user.id})")
            return existing_user

        # Create new user
        hashed_password = pwd_context.hash("Luvchik!2030")
        user = User(
            email="avi@drishti.com",
            hashed_password=hashed_password,
            full_name="Avi Luvchik",
            role="admin",
            is_active=True,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        print(f"Created admin user: avi@drishti.com (id: {user.id})")
        return user


async def seed_categories():
    """Create categories if not exist."""
    categories_data = [
        {"name_he": "מוזיקה", "name_en": "Music", "slug": "music", "icon": "music"},
        {"name_he": "ריקוד", "name_en": "Dance", "slug": "dance", "icon": "dance"},
        {"name_he": "תיאטרון", "name_en": "Theater", "slug": "theater", "icon": "theater"},
        {"name_he": "אמנות חזותית", "name_en": "Visual Arts", "slug": "visual-arts", "icon": "art"},
        {"name_he": "סדנאות", "name_en": "Workshops", "slug": "workshops", "icon": "workshop"},
        {"name_he": "הרצאות", "name_en": "Lectures", "slug": "lectures", "icon": "lecture"},
        {"name_he": "קולנוע", "name_en": "Film", "slug": "film", "icon": "film"},
        {"name_he": "עיתונות", "name_en": "Journalism", "slug": "journalism", "icon": "journalism"},
    ]

    async with AsyncSessionLocal() as db:
        for cat_data in categories_data:
            result = await db.execute(
                select(Category).where(Category.slug == cat_data["slug"])
            )
            existing = result.scalar_one_or_none()

            if existing:
                print(f"Category {cat_data['slug']} already exists")
                continue

            category = Category(
                name_he=cat_data["name_he"],
                name_en=cat_data["name_en"],
                slug=cat_data["slug"],
                icon=cat_data["icon"],
            )
            db.add(category)
            print(f"Created category: {cat_data['name_en']}")

        await db.commit()


async def main():
    print("Seeding database...")
    await seed_admin_user()
    await seed_categories()
    print("Done!")


if __name__ == "__main__":
    asyncio.run(main())
