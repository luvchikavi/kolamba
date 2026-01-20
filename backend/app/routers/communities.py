"""Communities router - CRUD operations for community profiles."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.community import Community
from app.schemas.community import CommunityResponse

router = APIRouter()


@router.get("", response_model=list[CommunityResponse])
async def list_communities(
    language: Optional[str] = Query(None, description="Filter by language"),
    audience_size: Optional[str] = Query(None, description="Filter by audience size"),
    limit: int = Query(20, le=100),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db),
):
    """List all communities with optional filters."""
    query = select(Community).where(Community.status == "active")

    if language:
        query = query.where(Community.language == language)

    if audience_size:
        query = query.where(Community.audience_size == audience_size)

    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    communities = result.scalars().all()
    return communities


@router.get("/{community_id}", response_model=CommunityResponse)
async def get_community(community_id: int, db: AsyncSession = Depends(get_db)):
    """Get community profile by ID."""
    result = await db.execute(
        select(Community).where(Community.id == community_id)
    )
    community = result.scalar_one_or_none()

    if not community:
        raise HTTPException(status_code=404, detail="Community not found")

    return community


@router.post("")
async def create_community():
    """Register new community (authenticated)."""
    return {"message": "Create community endpoint - to be implemented with auth"}


@router.put("/{community_id}")
async def update_community(community_id: int):
    """Update community profile (authenticated, owner only)."""
    return {"message": f"Update community {community_id} - to be implemented with auth"}
