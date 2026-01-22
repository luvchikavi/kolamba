"""Seed script to create super users for admin dashboard."""

import asyncio
import sys
sys.path.insert(0, "/Users/aviluvchik/app/Kolamba/backend")

from sqlalchemy import select
from passlib.context import CryptContext

from app.database import AsyncSessionLocal
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


SUPERUSERS = [
    {
        "email": "avi@kolamba.org",
        "name": "Avi Luvchik",
        "password": "Kolamba!26",
    },
    {
        "email": "avital@kolamba.org",
        "name": "Avital",
        "password": "Kolamba!26",
    },
]


async def create_superusers():
    """Create super users if they don't exist."""
    async with AsyncSessionLocal() as db:
        for user_data in SUPERUSERS:
            # Check if user exists
            result = await db.execute(
                select(User).where(User.email == user_data["email"])
            )
            existing_user = result.scalar_one_or_none()

            if existing_user:
                # Update existing user to be superuser
                existing_user.is_superuser = True
                existing_user.role = "admin"
                existing_user.status = "active"
                existing_user.is_active = True
                print(f"Updated {user_data['email']} to superuser (id: {existing_user.id})")
            else:
                # Create new superuser
                hashed_password = pwd_context.hash(user_data["password"])
                user = User(
                    email=user_data["email"],
                    password_hash=hashed_password,
                    name=user_data["name"],
                    role="admin",
                    status="active",
                    is_active=True,
                    is_superuser=True,
                )
                db.add(user)
                print(f"Created superuser: {user_data['email']}")

        await db.commit()


async def main():
    print("Creating superusers...")
    await create_superusers()
    print("Done!")


if __name__ == "__main__":
    asyncio.run(main())
