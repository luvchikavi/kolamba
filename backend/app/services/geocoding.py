"""Geocoding service - converts location text to lat/long coordinates."""

import httpx
import logging

logger = logging.getLogger(__name__)


async def geocode_location(location: str) -> tuple[float, float] | None:
    """
    Convert location text to lat/long using OpenStreetMap Nominatim API.

    Args:
        location: Location string (e.g., "Chicago, IL" or "New York, USA")

    Returns:
        Tuple of (latitude, longitude) or None if geocoding fails
    """
    if not location or not location.strip():
        return None

    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": location,
        "format": "json",
        "limit": 1,
    }
    headers = {
        "User-Agent": "Kolamba/1.0 (https://kolamba.org)",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params, headers=headers)
            response.raise_for_status()
            data = response.json()

            if data and len(data) > 0:
                lat = float(data[0]["lat"])
                lon = float(data[0]["lon"])
                logger.info(f"Geocoded '{location}' to ({lat}, {lon})")
                return lat, lon

            logger.warning(f"No geocoding results for location: {location}")
            return None

    except httpx.TimeoutException:
        logger.error(f"Geocoding timeout for location: {location}")
        return None
    except httpx.HTTPStatusError as e:
        logger.error(f"Geocoding HTTP error for '{location}': {e}")
        return None
    except (KeyError, ValueError, IndexError) as e:
        logger.error(f"Geocoding parse error for '{location}': {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected geocoding error for '{location}': {e}")
        return None
