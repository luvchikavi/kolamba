#!/usr/bin/env python3
"""
Seed script to add the 50 largest Jewish communities in the US and Canada.
Based on publicly available population data from Jewish federations and census data.

Run with: python -m scripts.seed_communities
"""

import asyncio
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.models.user import User
from app.models.community import Community
from app.database import Base

# 50 Largest Jewish Communities in US and Canada
# Data based on Jewish Virtual Library, Jewish Federations, and census data
COMMUNITIES = [
    # United States - Top 40
    {"name": "Jewish Federation of Greater New York", "location": "New York, NY", "lat": 40.7128, "lng": -74.0060, "size": "large", "pop": 1900000},
    {"name": "Jewish Federation of Greater Los Angeles", "location": "Los Angeles, CA", "lat": 34.0522, "lng": -118.2437, "size": "large", "pop": 617000},
    {"name": "Greater Miami Jewish Federation", "location": "Miami, FL", "lat": 25.7617, "lng": -80.1918, "size": "large", "pop": 525000},
    {"name": "Jewish United Fund of Metropolitan Chicago", "location": "Chicago, IL", "lat": 41.8781, "lng": -87.6298, "size": "large", "pop": 315000},
    {"name": "Jewish Federation of Greater Philadelphia", "location": "Philadelphia, PA", "lat": 39.9526, "lng": -75.1652, "size": "large", "pop": 310000},
    {"name": "Combined Jewish Philanthropies of Boston", "location": "Boston, MA", "lat": 42.3601, "lng": -71.0589, "size": "large", "pop": 248000},
    {"name": "Jewish Community Federation of San Francisco", "location": "San Francisco, CA", "lat": 37.7749, "lng": -122.4194, "size": "large", "pop": 228000},
    {"name": "Jewish Federation of Greater Washington", "location": "Washington, DC", "lat": 38.9072, "lng": -77.0369, "size": "large", "pop": 165000},
    {"name": "Jewish Federation of Greater Atlanta", "location": "Atlanta, GA", "lat": 33.7490, "lng": -84.3880, "size": "large", "pop": 120000},
    {"name": "Associated: Jewish Federation of Baltimore", "location": "Baltimore, MD", "lat": 39.2904, "lng": -76.6122, "size": "large", "pop": 100000},
    {"name": "Jewish Federation of Greater Phoenix", "location": "Phoenix, AZ", "lat": 33.4484, "lng": -112.0740, "size": "medium", "pop": 83000},
    {"name": "Jewish Federation of San Diego County", "location": "San Diego, CA", "lat": 32.7157, "lng": -117.1611, "size": "medium", "pop": 80000},
    {"name": "Jewish Federation of Las Vegas", "location": "Las Vegas, NV", "lat": 36.1699, "lng": -115.1398, "size": "medium", "pop": 77000},
    {"name": "Jewish Federation of Greater Dallas", "location": "Dallas, TX", "lat": 32.7767, "lng": -96.7970, "size": "medium", "pop": 75000},
    {"name": "Allied Jewish Federation of Colorado", "location": "Denver, CO", "lat": 39.7392, "lng": -104.9903, "size": "medium", "pop": 75000},
    {"name": "Jewish Federation of Metropolitan Detroit", "location": "Detroit, MI", "lat": 42.3314, "lng": -83.0458, "size": "medium", "pop": 70000},
    {"name": "Jewish Federation of Greater Seattle", "location": "Seattle, WA", "lat": 47.6062, "lng": -122.3321, "size": "medium", "pop": 63000},
    {"name": "Jewish Federation of Orange County", "location": "Irvine, CA", "lat": 33.6846, "lng": -117.8265, "size": "medium", "pop": 60000},
    {"name": "Jewish Federation of St. Louis", "location": "St. Louis, MO", "lat": 38.6270, "lng": -90.1994, "size": "medium", "pop": 58000},
    {"name": "Jewish Federation of Cleveland", "location": "Cleveland, OH", "lat": 41.4993, "lng": -81.6944, "size": "medium", "pop": 55000},
    {"name": "Jewish Federation of Greater Houston", "location": "Houston, TX", "lat": 29.7604, "lng": -95.3698, "size": "medium", "pop": 51000},
    {"name": "Minneapolis Jewish Federation", "location": "Minneapolis, MN", "lat": 44.9778, "lng": -93.2650, "size": "medium", "pop": 46000},
    {"name": "Jewish Federation of Greater Pittsburgh", "location": "Pittsburgh, PA", "lat": 40.4406, "lng": -79.9959, "size": "medium", "pop": 45000},
    {"name": "Jewish Federation of Silicon Valley", "location": "San Jose, CA", "lat": 37.3382, "lng": -121.8863, "size": "medium", "pop": 42000},
    {"name": "Jewish Community Foundation of Greater Tampa Bay", "location": "Tampa, FL", "lat": 27.9506, "lng": -82.4572, "size": "medium", "pop": 40000},
    {"name": "Jewish Federation of Greater Portland", "location": "Portland, OR", "lat": 45.5152, "lng": -122.6784, "size": "medium", "pop": 35000},
    {"name": "Jewish Federation of Greater Hartford", "location": "Hartford, CT", "lat": 41.7658, "lng": -72.6734, "size": "medium", "pop": 33000},
    {"name": "Jewish Federation of Columbus", "location": "Columbus, OH", "lat": 39.9612, "lng": -82.9988, "size": "medium", "pop": 30000},
    {"name": "Jewish Federation of Greater New Haven", "location": "New Haven, CT", "lat": 41.3083, "lng": -72.9279, "size": "small", "pop": 26000},
    {"name": "Jewish Federation of Greater Sacramento", "location": "Sacramento, CA", "lat": 38.5816, "lng": -121.4944, "size": "small", "pop": 25000},
    {"name": "Jewish Community Federation of Virginia", "location": "Norfolk, VA", "lat": 36.8508, "lng": -76.2859, "size": "small", "pop": 25000},
    {"name": "Jewish Federation of Cincinnati", "location": "Cincinnati, OH", "lat": 39.1031, "lng": -84.5120, "size": "small", "pop": 25000},
    {"name": "Shalom Austin", "location": "Austin, TX", "lat": 30.2672, "lng": -97.7431, "size": "small", "pop": 22000},
    {"name": "Jewish Federation of Greater Rochester", "location": "Rochester, NY", "lat": 43.1566, "lng": -77.6088, "size": "small", "pop": 22000},
    {"name": "Milwaukee Jewish Federation", "location": "Milwaukee, WI", "lat": 43.0389, "lng": -87.9065, "size": "small", "pop": 21000},
    {"name": "Jewish Federation of Greater Kansas City", "location": "Overland Park, KS", "lat": 38.9822, "lng": -94.6708, "size": "small", "pop": 19000},
    {"name": "Jewish Federation of Nashville", "location": "Nashville, TN", "lat": 36.1627, "lng": -86.7816, "size": "small", "pop": 18000},
    {"name": "Jewish Federation of Greater Albany", "location": "Albany, NY", "lat": 42.6526, "lng": -73.7562, "size": "small", "pop": 13000},
    {"name": "Jewish Federation of Greater Buffalo", "location": "Buffalo, NY", "lat": 42.8864, "lng": -78.8784, "size": "small", "pop": 11000},
    {"name": "Jewish Federation of Greater Indianapolis", "location": "Indianapolis, IN", "lat": 39.7684, "lng": -86.1581, "size": "small", "pop": 10000},

    # Canada - Top 10
    {"name": "UJA Federation of Greater Toronto", "location": "Toronto, ON, Canada", "lat": 43.6532, "lng": -79.3832, "size": "large", "pop": 200000},
    {"name": "Federation CJA Montreal", "location": "Montreal, QC, Canada", "lat": 45.5017, "lng": -73.5673, "size": "large", "pop": 90000},
    {"name": "Jewish Federation of Greater Vancouver", "location": "Vancouver, BC, Canada", "lat": 49.2827, "lng": -123.1207, "size": "medium", "pop": 30000},
    {"name": "Jewish Federation of Ottawa", "location": "Ottawa, ON, Canada", "lat": 45.4215, "lng": -75.6972, "size": "small", "pop": 15000},
    {"name": "Jewish Federation of Winnipeg", "location": "Winnipeg, MB, Canada", "lat": 49.8951, "lng": -97.1384, "size": "small", "pop": 14000},
    {"name": "Calgary Jewish Federation", "location": "Calgary, AB, Canada", "lat": 51.0447, "lng": -114.0719, "size": "small", "pop": 10000},
    {"name": "Jewish Federation of Edmonton", "location": "Edmonton, AB, Canada", "lat": 53.5461, "lng": -113.4938, "size": "small", "pop": 6000},
    {"name": "Hamilton Jewish Federation", "location": "Hamilton, ON, Canada", "lat": 43.2557, "lng": -79.8711, "size": "small", "pop": 5000},
    {"name": "London Jewish Federation", "location": "London, ON, Canada", "lat": 42.9849, "lng": -81.2453, "size": "small", "pop": 2500},
    {"name": "Atlantic Jewish Council", "location": "Halifax, NS, Canada", "lat": 44.6488, "lng": -63.5752, "size": "small", "pop": 2000},
]


async def seed_communities():
    """Seed the database with Jewish communities."""
    # Get database URL from environment
    database_url = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:postgres@localhost:5432/kolamba"
    )

    # Handle Railway's postgres:// URL format
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif database_url.startswith("postgresql://") and "+asyncpg" not in database_url:
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

    print(f"Connecting to database...")

    engine = create_async_engine(database_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        print(f"Seeding {len(COMMUNITIES)} Jewish communities...")

        added = 0
        skipped = 0

        for i, comm in enumerate(COMMUNITIES, 1):
            # Check if community already exists by name
            result = await session.execute(
                select(Community).where(Community.name == comm["name"])
            )
            existing = result.scalar_one_or_none()

            if existing:
                print(f"  [{i}/{len(COMMUNITIES)}] Skipping: {comm['name']} (already exists)")
                skipped += 1
                continue

            # Generate a unique email for the community contact
            email_slug = comm["name"].lower().replace(" ", "-").replace(",", "")[:30]
            email = f"contact-{email_slug}@kolamba.org"

            # Check if email already exists
            result = await session.execute(
                select(User).where(User.email == email)
            )
            if result.scalar_one_or_none():
                # Add number suffix
                email = f"contact-{email_slug}-{i}@kolamba.org"

            # Create user account for community
            user = User(
                email=email,
                name=f"{comm['name']} Contact",
                role="community",
                status="active",
            )
            session.add(user)
            await session.flush()

            # Create community
            community = Community(
                user_id=user.id,
                name=comm["name"],
                location=comm["location"],
                latitude=comm["lat"],
                longitude=comm["lng"],
                audience_size=comm["size"],
                language="English",
                status="active",
            )
            session.add(community)
            added += 1
            print(f"  [{i}/{len(COMMUNITIES)}] Added: {comm['name']} ({comm['location']})")

        await session.commit()
        print(f"\nDone! Added {added} communities, skipped {skipped} existing.")


if __name__ == "__main__":
    asyncio.run(seed_communities())
