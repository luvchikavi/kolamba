"""Artist Tour Dates router - CRUD operations for artist tour announcements."""

from typing import Optional
from datetime import date as date_type, datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.artist_tour_date import ArtistTourDate
from app.models.artist import Artist
from app.schemas.artist_tour_date import (
    ArtistTourDateCreate,
    ArtistTourDateUpdate,
    ArtistTourDateResponse,
)
from app.services.geocoding import geocode_location

router = APIRouter()


@router.get("/tour-dates/recent")
async def get_recent_tour_dates(
    limit: int = Query(10, description="Number of tour dates to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get recent upcoming tour dates across all artists (for home page)."""
    from datetime import date

    query = (
        select(ArtistTourDate, Artist)
        .join(Artist, ArtistTourDate.artist_id == Artist.id)
        .where(ArtistTourDate.start_date >= date.today())
        .where(Artist.status == "active")
        .order_by(ArtistTourDate.start_date)
        .limit(limit)
    )

    result = await db.execute(query)
    rows = result.all()

    return [
        {
            "id": tour_date.id,
            "location": tour_date.location,
            "start_date": tour_date.start_date.isoformat(),
            "end_date": tour_date.end_date.isoformat() if tour_date.end_date else None,
            "description": tour_date.description,
            "artist": {
                "id": artist.id,
                "name_en": artist.name_en,
                "name_he": artist.name_he,
                "profile_image": artist.profile_image,
                "city": artist.city,
                "country": artist.country,
            },
        }
        for tour_date, artist in rows
    ]


@router.get("/{artist_id}/tour-dates", response_model=list[ArtistTourDateResponse])
async def get_artist_tour_dates(
    artist_id: int,
    include_past: bool = Query(False, description="Include past tour dates"),
    db: AsyncSession = Depends(get_db),
):
    """Get all tour dates for an artist."""
    # Verify artist exists
    artist_result = await db.execute(
        select(Artist).where(Artist.id == artist_id)
    )
    artist = artist_result.scalar_one_or_none()
    if not artist:
        raise HTTPException(status_code=404, detail="Talent not found")

    query = select(ArtistTourDate).where(ArtistTourDate.artist_id == artist_id)

    if not include_past:
        from datetime import date
        query = query.where(ArtistTourDate.start_date >= date.today())

    query = query.order_by(ArtistTourDate.start_date)

    result = await db.execute(query)
    tour_dates = result.scalars().all()
    return tour_dates


@router.get("/{artist_id}/tour-dates/ical")
async def export_tour_dates_ical(
    artist_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Export artist tour dates as iCal (.ics) file."""
    # Get artist
    artist_result = await db.execute(
        select(Artist).where(Artist.id == artist_id)
    )
    artist = artist_result.scalar_one_or_none()
    if not artist:
        raise HTTPException(status_code=404, detail="Talent not found")

    # Get upcoming tour dates
    query = (
        select(ArtistTourDate)
        .where(ArtistTourDate.artist_id == artist_id)
        .where(ArtistTourDate.start_date >= date_type.today())
        .order_by(ArtistTourDate.start_date)
    )
    result = await db.execute(query)
    tour_dates = result.scalars().all()

    artist_name = artist.name_en or artist.name_he or f"Artist {artist_id}"
    now = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")

    # Build iCal content
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Kolamba//Tour Dates//EN",
        f"X-WR-CALNAME:{artist_name} - Tour Dates",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
    ]

    for td in tour_dates:
        dtstart = td.start_date.strftime("%Y%m%d")
        # For all-day events, DTEND is the day after the last day
        if td.end_date:
            dtend = (td.end_date + timedelta(days=1)).strftime("%Y%m%d")
        else:
            dtend = (td.start_date + timedelta(days=1)).strftime("%Y%m%d")

        summary = f"{artist_name} - {td.location}"
        description = td.description or ""

        lines.extend([
            "BEGIN:VEVENT",
            f"UID:kolamba-tour-{td.id}@kolamba.app",
            f"DTSTAMP:{now}",
            f"DTSTART;VALUE=DATE:{dtstart}",
            f"DTEND;VALUE=DATE:{dtend}",
            f"SUMMARY:{summary}",
            f"LOCATION:{td.location}",
            f"DESCRIPTION:{description}",
            "END:VEVENT",
        ])

    lines.append("END:VCALENDAR")

    ical_content = "\r\n".join(lines) + "\r\n"
    filename = f"{artist_name.replace(' ', '_')}_tour_dates.ics"

    return Response(
        content=ical_content,
        media_type="text/calendar",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )


@router.post("/{artist_id}/tour-dates", response_model=ArtistTourDateResponse)
async def create_artist_tour_date(
    artist_id: int,
    tour_date_data: ArtistTourDateCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new tour date for an artist."""
    # Verify artist exists
    artist_result = await db.execute(
        select(Artist).where(Artist.id == artist_id)
    )
    artist = artist_result.scalar_one_or_none()
    if not artist:
        raise HTTPException(status_code=404, detail="Talent not found")

    # Geocode location if lat/long not provided
    latitude = tour_date_data.latitude
    longitude = tour_date_data.longitude
    if latitude is None or longitude is None:
        coords = await geocode_location(tour_date_data.location)
        if coords:
            latitude, longitude = coords

    # Create tour date
    tour_date = ArtistTourDate(
        artist_id=artist_id,
        location=tour_date_data.location,
        latitude=latitude,
        longitude=longitude,
        start_date=tour_date_data.start_date,
        end_date=tour_date_data.end_date,
        description=tour_date_data.description,
    )
    db.add(tour_date)
    await db.commit()
    await db.refresh(tour_date)

    return tour_date


@router.get("/{artist_id}/tour-dates/{tour_date_id}", response_model=ArtistTourDateResponse)
async def get_artist_tour_date(
    artist_id: int,
    tour_date_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific tour date."""
    result = await db.execute(
        select(ArtistTourDate).where(
            ArtistTourDate.id == tour_date_id,
            ArtistTourDate.artist_id == artist_id,
        )
    )
    tour_date = result.scalar_one_or_none()

    if not tour_date:
        raise HTTPException(status_code=404, detail="Tour date not found")

    return tour_date


@router.put("/{artist_id}/tour-dates/{tour_date_id}", response_model=ArtistTourDateResponse)
async def update_artist_tour_date(
    artist_id: int,
    tour_date_id: int,
    update_data: ArtistTourDateUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a tour date."""
    result = await db.execute(
        select(ArtistTourDate).where(
            ArtistTourDate.id == tour_date_id,
            ArtistTourDate.artist_id == artist_id,
        )
    )
    tour_date = result.scalar_one_or_none()

    if not tour_date:
        raise HTTPException(status_code=404, detail="Tour date not found")

    # Update fields
    update_dict = update_data.model_dump(exclude_unset=True)

    # If location changed and no new coords provided, geocode
    if "location" in update_dict and "latitude" not in update_dict:
        coords = await geocode_location(update_dict["location"])
        if coords:
            update_dict["latitude"], update_dict["longitude"] = coords

    for field, value in update_dict.items():
        setattr(tour_date, field, value)

    await db.commit()
    await db.refresh(tour_date)

    return tour_date


@router.delete("/{artist_id}/tour-dates/{tour_date_id}")
async def delete_artist_tour_date(
    artist_id: int,
    tour_date_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a tour date."""
    result = await db.execute(
        select(ArtistTourDate).where(
            ArtistTourDate.id == tour_date_id,
            ArtistTourDate.artist_id == artist_id,
        )
    )
    tour_date = result.scalar_one_or_none()

    if not tour_date:
        raise HTTPException(status_code=404, detail="Tour date not found")

    await db.delete(tour_date)
    await db.commit()

    return {"message": "Tour date deleted successfully"}
