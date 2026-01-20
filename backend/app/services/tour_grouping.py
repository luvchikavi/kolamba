"""Tour grouping service - clusters communities for efficient touring."""

from math import radians, cos, sin, sqrt, atan2
from datetime import date, timedelta
from typing import Optional
from collections import defaultdict

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.booking import Booking
from app.models.community import Community
from app.schemas.tour import TourSuggestion


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on earth (in km).
    Uses the Haversine formula.
    """
    R = 6371  # Earth's radius in kilometers

    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return R * c


def find_nearby_communities(
    communities: list[dict],
    max_distance_km: float
) -> list[list[int]]:
    """
    Group communities that are within max_distance_km of each other.
    Uses a simple clustering approach based on distance.

    Returns a list of clusters, where each cluster is a list of community indices.
    """
    n = len(communities)
    if n == 0:
        return []

    # Build adjacency list based on distance
    adj = defaultdict(set)
    for i in range(n):
        c1 = communities[i]
        if c1.get("latitude") is None or c1.get("longitude") is None:
            continue
        for j in range(i + 1, n):
            c2 = communities[j]
            if c2.get("latitude") is None or c2.get("longitude") is None:
                continue
            dist = haversine_distance(
                c1["latitude"], c1["longitude"],
                c2["latitude"], c2["longitude"]
            )
            if dist <= max_distance_km:
                adj[i].add(j)
                adj[j].add(i)

    # Find connected components (clusters)
    visited = set()
    clusters = []

    for i in range(n):
        if i in visited:
            continue
        c = communities[i]
        if c.get("latitude") is None or c.get("longitude") is None:
            continue

        # BFS to find all connected communities
        cluster = []
        queue = [i]
        while queue:
            node = queue.pop(0)
            if node in visited:
                continue
            visited.add(node)
            cluster.append(node)
            for neighbor in adj[node]:
                if neighbor not in visited:
                    queue.append(neighbor)

        if cluster:
            clusters.append(cluster)

    return clusters


def determine_region_name(communities: list[dict]) -> str:
    """
    Determine a region name based on the communities in a cluster.
    Uses the most common country/city combination.
    """
    if not communities:
        return "Unknown Region"

    # Count locations
    location_counts = defaultdict(int)
    for c in communities:
        location = c.get("location", "")
        if location:
            # Try to extract city/state/country
            parts = [p.strip() for p in location.split(",")]
            if len(parts) >= 2:
                # Use last two parts (usually city, state or state, country)
                key = ", ".join(parts[-2:])
            else:
                key = location
            location_counts[key] += 1

    if location_counts:
        return max(location_counts.items(), key=lambda x: x[1])[0]
    return "Unknown Region"


def calculate_tour_dates(
    bookings: list[dict],
    buffer_days: int = 2
) -> tuple[Optional[date], Optional[date]]:
    """
    Calculate suggested start and end dates for a tour based on requested dates.
    """
    dates = [
        b["requested_date"]
        for b in bookings
        if b.get("requested_date")
    ]

    if not dates:
        return None, None

    min_date = min(dates)
    max_date = max(dates)

    # Add buffer days
    start_date = min_date - timedelta(days=buffer_days)
    end_date = max_date + timedelta(days=buffer_days)

    return start_date, end_date


def calculate_total_distance(communities: list[dict]) -> float:
    """
    Calculate total distance for a tour visiting all communities.
    Uses a simple nearest-neighbor approach (not optimal but fast).
    """
    if len(communities) < 2:
        return 0.0

    # Filter communities with coordinates
    valid_communities = [
        c for c in communities
        if c.get("latitude") is not None and c.get("longitude") is not None
    ]

    if len(valid_communities) < 2:
        return 0.0

    total_distance = 0.0
    visited = [False] * len(valid_communities)
    current = 0
    visited[0] = True
    visits = 1

    while visits < len(valid_communities):
        min_dist = float("inf")
        next_idx = -1

        for i, c in enumerate(valid_communities):
            if visited[i]:
                continue
            dist = haversine_distance(
                valid_communities[current]["latitude"],
                valid_communities[current]["longitude"],
                c["latitude"],
                c["longitude"]
            )
            if dist < min_dist:
                min_dist = dist
                next_idx = i

        if next_idx >= 0:
            total_distance += min_dist
            visited[next_idx] = True
            current = next_idx
            visits += 1

    return round(total_distance, 2)


async def suggest_tours(
    db: AsyncSession,
    artist_id: int,
    max_distance_km: float = 500,
    min_bookings: int = 2,
    date_range_days: int = 30,
) -> list[TourSuggestion]:
    """
    Analyze pending bookings for an artist and suggest tour groupings.

    Args:
        db: Database session
        artist_id: The artist's ID
        max_distance_km: Maximum distance between communities to group
        min_bookings: Minimum number of bookings to form a tour
        date_range_days: Consider bookings within this date range

    Returns:
        List of tour suggestions
    """
    # Get pending bookings for the artist with community info
    result = await db.execute(
        select(Booking)
        .options(selectinload(Booking.community))
        .where(
            Booking.artist_id == artist_id,
            Booking.status == "pending",
            Booking.tour_id.is_(None),  # Not already in a tour
        )
    )
    bookings = result.scalars().all()

    if len(bookings) < min_bookings:
        return []

    # Prepare community data with coordinates
    communities_data = []
    booking_map = {}  # Map community index to booking info

    for booking in bookings:
        community = booking.community
        idx = len(communities_data)

        communities_data.append({
            "id": community.id,
            "name": community.name,
            "location": community.location,
            "latitude": float(community.latitude) if community.latitude else None,
            "longitude": float(community.longitude) if community.longitude else None,
        })

        if idx not in booking_map:
            booking_map[idx] = []
        booking_map[idx].append({
            "id": booking.id,
            "requested_date": booking.requested_date,
            "budget": booking.budget,
        })

    # Find clusters of nearby communities
    clusters = find_nearby_communities(communities_data, max_distance_km)

    # Generate tour suggestions
    suggestions = []
    for cluster_indices in clusters:
        if len(cluster_indices) < min_bookings:
            continue

        # Get communities and bookings for this cluster
        cluster_communities = [communities_data[i] for i in cluster_indices]
        cluster_bookings = []
        cluster_booking_ids = []

        for idx in cluster_indices:
            if idx in booking_map:
                for b in booking_map[idx]:
                    cluster_bookings.append(b)
                    cluster_booking_ids.append(b["id"])

        if len(cluster_booking_ids) < min_bookings:
            continue

        # Calculate tour metrics
        region = determine_region_name(cluster_communities)
        start_date, end_date = calculate_tour_dates(cluster_bookings)
        total_distance = calculate_total_distance(cluster_communities)
        estimated_budget = sum(b.get("budget", 0) or 0 for b in cluster_bookings)

        suggestions.append(TourSuggestion(
            region=region,
            booking_ids=cluster_booking_ids,
            communities=[
                {
                    "id": c["id"],
                    "name": c["name"],
                    "location": c["location"],
                    "latitude": c["latitude"],
                    "longitude": c["longitude"],
                }
                for c in cluster_communities
            ],
            suggested_start=start_date,
            suggested_end=end_date,
            total_distance_km=total_distance,
            estimated_budget=estimated_budget if estimated_budget > 0 else None,
        ))

    # Sort by number of bookings (most bookings first)
    suggestions.sort(key=lambda x: len(x.booking_ids), reverse=True)

    return suggestions
