"""Conversations router - inbox messaging between artists and communities."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.user import User
from app.models.artist import Artist
from app.models.community import Community
from app.models.booking import Booking
from app.models.conversation import Conversation, Message
from app.schemas.conversation import (
    MessageCreate,
    MessageResponse,
    ConversationResponse,
    ConversationListItem,
    VenueInfoSchema,
)
from app.routers.auth import get_current_active_user

router = APIRouter()


async def _get_user_artist_and_community_ids(user: User, db: AsyncSession):
    """Get the artist_id and community_id for a user."""
    artist_id = None
    community_id = None

    if user.role in ("artist", "agent"):
        # For artists, get their artist ID
        result = await db.execute(select(Artist.id).where(Artist.user_id == user.id))
        artist_id = result.scalar_one_or_none()

        # For agents, get all artist IDs they manage
        if user.role == "agent" and not artist_id:
            result = await db.execute(select(Artist.id).where(Artist.agent_user_id == user.id))
            agent_artist_ids = [row[0] for row in result.all()]
            return agent_artist_ids, None, True  # is_agent flag

    if user.role == "community":
        result = await db.execute(select(Community.id).where(Community.user_id == user.id))
        community_id = result.scalar_one_or_none()

    return artist_id, community_id, False


async def _verify_conversation_access(conversation: Conversation, user: User, db: AsyncSession):
    """Verify user has access to this conversation."""
    booking = conversation.booking

    # Admin access
    if user.is_superuser:
        return True

    # Community manager access
    if user.role == "community":
        result = await db.execute(select(Community.id).where(Community.user_id == user.id))
        community_id = result.scalar_one_or_none()
        if community_id and booking.community_id == community_id:
            return True

    # Artist access
    if user.role == "artist":
        result = await db.execute(select(Artist.id).where(Artist.user_id == user.id))
        artist_id = result.scalar_one_or_none()
        if artist_id and booking.artist_id == artist_id:
            return True

    # Agent access (manages the artist)
    if user.role == "agent":
        result = await db.execute(
            select(Artist.id).where(Artist.agent_user_id == user.id, Artist.id == booking.artist_id)
        )
        if result.scalar_one_or_none():
            return True

    return False


@router.get("", response_model=list[ConversationListItem])
async def list_conversations(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List conversations for the current user (inbox)."""
    artist_id, community_id, is_agent = await _get_user_artist_and_community_ids(current_user, db)

    query = (
        select(Conversation)
        .join(Booking, Conversation.booking_id == Booking.id)
        .options(
            selectinload(Conversation.booking).selectinload(Booking.artist),
            selectinload(Conversation.booking).selectinload(Booking.community),
            selectinload(Conversation.messages),
        )
    )

    if current_user.role == "community" and community_id:
        query = query.where(Booking.community_id == community_id)
    elif current_user.role == "artist" and artist_id:
        query = query.where(Booking.artist_id == artist_id)
    elif is_agent and artist_id:
        # agent_artist_ids is a list
        query = query.where(Booking.artist_id.in_(artist_id))
    elif current_user.is_superuser:
        pass  # admin sees all
    else:
        return []

    query = query.order_by(Conversation.updated_at.desc())

    result = await db.execute(query)
    conversations = result.scalars().unique().all()

    items = []
    for conv in conversations:
        last_msg = conv.messages[-1].content if conv.messages else None
        # Truncate last message for preview
        if last_msg and len(last_msg) > 100:
            last_msg = last_msg[:100] + "..."

        items.append(ConversationListItem(
            id=conv.id,
            booking_id=conv.booking_id,
            artist_name=conv.booking.artist.name_en or conv.booking.artist.name_he if conv.booking.artist else None,
            community_name=conv.booking.community.name if conv.booking.community else None,
            last_message=last_msg,
            message_count=len(conv.messages),
            booking_status=conv.booking.status,
            updated_at=conv.updated_at,
        ))

    return items


@router.get("/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a full conversation with all messages."""
    result = await db.execute(
        select(Conversation)
        .options(
            selectinload(Conversation.booking),
            selectinload(Conversation.messages).selectinload(Message.sender),
        )
        .where(Conversation.id == conversation_id)
    )
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if not await _verify_conversation_access(conversation, current_user, db):
        raise HTTPException(status_code=403, detail="Access denied")

    # Build message responses with sender info
    messages = [
        MessageResponse(
            id=msg.id,
            sender_id=msg.sender_id,
            sender_name=msg.sender.name if msg.sender else None,
            sender_role=msg.sender.role if msg.sender else None,
            content=msg.content,
            created_at=msg.created_at,
        )
        for msg in conversation.messages
    ]

    return ConversationResponse(
        id=conversation.id,
        booking_id=conversation.booking_id,
        venue_info=conversation.venue_info,
        messages=messages,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
    )


@router.post("/{conversation_id}/messages", response_model=MessageResponse)
async def send_message(
    conversation_id: int,
    message_data: MessageCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Send a message in a conversation."""
    result = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.booking))
        .where(Conversation.id == conversation_id)
    )
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if not await _verify_conversation_access(conversation, current_user, db):
        raise HTTPException(status_code=403, detail="Access denied")

    message = Message(
        conversation_id=conversation_id,
        sender_id=current_user.id,
        content=message_data.content,
    )
    db.add(message)

    # Update conversation timestamp
    from datetime import datetime, timezone
    conversation.updated_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(message)

    return MessageResponse(
        id=message.id,
        sender_id=message.sender_id,
        sender_name=current_user.name,
        sender_role=current_user.role,
        content=message.content,
        created_at=message.created_at,
    )


@router.put("/{conversation_id}/venue-info")
async def update_venue_info(
    conversation_id: int,
    venue_info: VenueInfoSchema,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update venue info for a conversation (community managers only)."""
    if current_user.role != "community" and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Only host managers can update venue info")

    result = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.booking))
        .where(Conversation.id == conversation_id)
    )
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if not await _verify_conversation_access(conversation, current_user, db):
        raise HTTPException(status_code=403, detail="Access denied")

    conversation.venue_info = venue_info.model_dump(exclude_none=True)

    from datetime import datetime, timezone
    conversation.updated_at = datetime.now(timezone.utc)

    await db.commit()

    return {"message": "Venue info updated", "venue_info": conversation.venue_info}
