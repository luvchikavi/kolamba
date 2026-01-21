#!/usr/bin/env python3
"""
Synchronous seed script to add the 50 largest Jewish communities.
Uses psycopg2 for better connection handling with Railway.
"""

import os
import sys
import psycopg2
from psycopg2.extras import execute_values

# 50 Largest Jewish Communities in US and Canada
COMMUNITIES = [
    # United States - Top 40
    {"name": "Jewish Federation of Greater New York", "location": "New York, NY", "lat": 40.7128, "lng": -74.0060, "size": "large"},
    {"name": "Jewish Federation of Greater Los Angeles", "location": "Los Angeles, CA", "lat": 34.0522, "lng": -118.2437, "size": "large"},
    {"name": "Greater Miami Jewish Federation", "location": "Miami, FL", "lat": 25.7617, "lng": -80.1918, "size": "large"},
    {"name": "Jewish United Fund of Metropolitan Chicago", "location": "Chicago, IL", "lat": 41.8781, "lng": -87.6298, "size": "large"},
    {"name": "Jewish Federation of Greater Philadelphia", "location": "Philadelphia, PA", "lat": 39.9526, "lng": -75.1652, "size": "large"},
    {"name": "Combined Jewish Philanthropies of Boston", "location": "Boston, MA", "lat": 42.3601, "lng": -71.0589, "size": "large"},
    {"name": "Jewish Community Federation of San Francisco", "location": "San Francisco, CA", "lat": 37.7749, "lng": -122.4194, "size": "large"},
    {"name": "Jewish Federation of Greater Washington", "location": "Washington, DC", "lat": 38.9072, "lng": -77.0369, "size": "large"},
    {"name": "Jewish Federation of Greater Atlanta", "location": "Atlanta, GA", "lat": 33.7490, "lng": -84.3880, "size": "large"},
    {"name": "Associated: Jewish Federation of Baltimore", "location": "Baltimore, MD", "lat": 39.2904, "lng": -76.6122, "size": "large"},
    {"name": "Jewish Federation of Greater Phoenix", "location": "Phoenix, AZ", "lat": 33.4484, "lng": -112.0740, "size": "medium"},
    {"name": "Jewish Federation of San Diego County", "location": "San Diego, CA", "lat": 32.7157, "lng": -117.1611, "size": "medium"},
    {"name": "Jewish Federation of Las Vegas", "location": "Las Vegas, NV", "lat": 36.1699, "lng": -115.1398, "size": "medium"},
    {"name": "Jewish Federation of Greater Dallas", "location": "Dallas, TX", "lat": 32.7767, "lng": -96.7970, "size": "medium"},
    {"name": "Allied Jewish Federation of Colorado", "location": "Denver, CO", "lat": 39.7392, "lng": -104.9903, "size": "medium"},
    {"name": "Jewish Federation of Metropolitan Detroit", "location": "Detroit, MI", "lat": 42.3314, "lng": -83.0458, "size": "medium"},
    {"name": "Jewish Federation of Greater Seattle", "location": "Seattle, WA", "lat": 47.6062, "lng": -122.3321, "size": "medium"},
    {"name": "Jewish Federation of Orange County", "location": "Irvine, CA", "lat": 33.6846, "lng": -117.8265, "size": "medium"},
    {"name": "Jewish Federation of St. Louis", "location": "St. Louis, MO", "lat": 38.6270, "lng": -90.1994, "size": "medium"},
    {"name": "Jewish Federation of Cleveland", "location": "Cleveland, OH", "lat": 41.4993, "lng": -81.6944, "size": "medium"},
    {"name": "Jewish Federation of Greater Houston", "location": "Houston, TX", "lat": 29.7604, "lng": -95.3698, "size": "medium"},
    {"name": "Minneapolis Jewish Federation", "location": "Minneapolis, MN", "lat": 44.9778, "lng": -93.2650, "size": "medium"},
    {"name": "Jewish Federation of Greater Pittsburgh", "location": "Pittsburgh, PA", "lat": 40.4406, "lng": -79.9959, "size": "medium"},
    {"name": "Jewish Federation of Silicon Valley", "location": "San Jose, CA", "lat": 37.3382, "lng": -121.8863, "size": "medium"},
    {"name": "Jewish Community Foundation of Greater Tampa Bay", "location": "Tampa, FL", "lat": 27.9506, "lng": -82.4572, "size": "medium"},
    {"name": "Jewish Federation of Greater Portland", "location": "Portland, OR", "lat": 45.5152, "lng": -122.6784, "size": "medium"},
    {"name": "Jewish Federation of Greater Hartford", "location": "Hartford, CT", "lat": 41.7658, "lng": -72.6734, "size": "medium"},
    {"name": "Jewish Federation of Columbus", "location": "Columbus, OH", "lat": 39.9612, "lng": -82.9988, "size": "medium"},
    {"name": "Jewish Federation of Greater New Haven", "location": "New Haven, CT", "lat": 41.3083, "lng": -72.9279, "size": "small"},
    {"name": "Jewish Federation of Greater Sacramento", "location": "Sacramento, CA", "lat": 38.5816, "lng": -121.4944, "size": "small"},
    {"name": "Jewish Community Federation of Virginia", "location": "Norfolk, VA", "lat": 36.8508, "lng": -76.2859, "size": "small"},
    {"name": "Jewish Federation of Cincinnati", "location": "Cincinnati, OH", "lat": 39.1031, "lng": -84.5120, "size": "small"},
    {"name": "Shalom Austin", "location": "Austin, TX", "lat": 30.2672, "lng": -97.7431, "size": "small"},
    {"name": "Jewish Federation of Greater Rochester", "location": "Rochester, NY", "lat": 43.1566, "lng": -77.6088, "size": "small"},
    {"name": "Milwaukee Jewish Federation", "location": "Milwaukee, WI", "lat": 43.0389, "lng": -87.9065, "size": "small"},
    {"name": "Jewish Federation of Greater Kansas City", "location": "Overland Park, KS", "lat": 38.9822, "lng": -94.6708, "size": "small"},
    {"name": "Jewish Federation of Nashville", "location": "Nashville, TN", "lat": 36.1627, "lng": -86.7816, "size": "small"},
    {"name": "Jewish Federation of Greater Albany", "location": "Albany, NY", "lat": 42.6526, "lng": -73.7562, "size": "small"},
    {"name": "Jewish Federation of Greater Buffalo", "location": "Buffalo, NY", "lat": 42.8864, "lng": -78.8784, "size": "small"},
    {"name": "Jewish Federation of Greater Indianapolis", "location": "Indianapolis, IN", "lat": 39.7684, "lng": -86.1581, "size": "small"},
    # Canada - Top 10
    {"name": "UJA Federation of Greater Toronto", "location": "Toronto, ON, Canada", "lat": 43.6532, "lng": -79.3832, "size": "large"},
    {"name": "Federation CJA Montreal", "location": "Montreal, QC, Canada", "lat": 45.5017, "lng": -73.5673, "size": "large"},
    {"name": "Jewish Federation of Greater Vancouver", "location": "Vancouver, BC, Canada", "lat": 49.2827, "lng": -123.1207, "size": "medium"},
    {"name": "Jewish Federation of Ottawa", "location": "Ottawa, ON, Canada", "lat": 45.4215, "lng": -75.6972, "size": "small"},
    {"name": "Jewish Federation of Winnipeg", "location": "Winnipeg, MB, Canada", "lat": 49.8951, "lng": -97.1384, "size": "small"},
    {"name": "Calgary Jewish Federation", "location": "Calgary, AB, Canada", "lat": 51.0447, "lng": -114.0719, "size": "small"},
    {"name": "Jewish Federation of Edmonton", "location": "Edmonton, AB, Canada", "lat": 53.5461, "lng": -113.4938, "size": "small"},
    {"name": "Hamilton Jewish Federation", "location": "Hamilton, ON, Canada", "lat": 43.2557, "lng": -79.8711, "size": "small"},
    {"name": "London Jewish Federation", "location": "London, ON, Canada", "lat": 42.9849, "lng": -81.2453, "size": "small"},
    {"name": "Atlantic Jewish Council", "location": "Halifax, NS, Canada", "lat": 44.6488, "lng": -63.5752, "size": "small"},
]


def seed_communities():
    """Seed the database with Jewish communities."""
    database_url = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/kolamba"
    )

    # Handle Railway's URL format (remove asyncpg)
    if "+asyncpg" in database_url:
        database_url = database_url.replace("+asyncpg", "")

    print(f"Connecting to database...")

    # Connect with SSL disabled for Railway proxy
    try:
        conn = psycopg2.connect(database_url, sslmode='disable')
    except Exception as e:
        print(f"Connection with sslmode=disable failed: {e}")
        print("Trying with sslmode=prefer...")
        conn = psycopg2.connect(database_url, sslmode='prefer')

    conn.autocommit = False
    cur = conn.cursor()

    print(f"Seeding {len(COMMUNITIES)} Jewish communities...")

    added = 0
    skipped = 0

    for i, comm in enumerate(COMMUNITIES, 1):
        # Check if community already exists by name
        cur.execute("SELECT id FROM communities WHERE name = %s", (comm["name"],))
        existing = cur.fetchone()

        if existing:
            print(f"  [{i}/{len(COMMUNITIES)}] Skipping: {comm['name']} (already exists)")
            skipped += 1
            continue

        # Generate a unique email for the community contact
        email_slug = comm["name"].lower().replace(" ", "-").replace(",", "")[:30]
        email = f"contact-{email_slug}@kolamba.org"

        # Check if email already exists
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            email = f"contact-{email_slug}-{i}@kolamba.org"

        # Create user account for community
        cur.execute(
            """
            INSERT INTO users (email, name, role, status, created_at, updated_at)
            VALUES (%s, %s, %s, %s, NOW(), NOW())
            RETURNING id
            """,
            (email, f"{comm['name']} Contact", "community", "active")
        )
        user_id = cur.fetchone()[0]

        # Create community
        cur.execute(
            """
            INSERT INTO communities (user_id, name, location, latitude, longitude, audience_size, language, status, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """,
            (user_id, comm["name"], comm["location"], comm["lat"], comm["lng"], comm["size"], "English", "active")
        )

        added += 1
        print(f"  [{i}/{len(COMMUNITIES)}] Added: {comm['name']} ({comm['location']})")

    conn.commit()
    cur.close()
    conn.close()

    print(f"\nDone! Added {added} communities, skipped {skipped} existing.")


if __name__ == "__main__":
    seed_communities()
