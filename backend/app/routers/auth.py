"""Authentication router - login, register, tokens."""

import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError, jwt
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.models.artist import Artist
from app.models.category import Category
from app.schemas.user import UserCreate, UserResponse, Token, TokenData
from app.utils.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
)
from app.config import get_settings

settings = get_settings()
router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)
logger = logging.getLogger("kolamba.auth")

from app.rate_limit import limiter
from app.services.email import send_welcome


class RegisterRequest(BaseModel):
    """Request body for user registration."""
    email: str
    password: str
    name: str
    role: str  # 'artist' or 'community'


class ArtistRegisterRequest(BaseModel):
    """Request body for artist registration."""
    email: str
    name: str  # Full legal name
    artist_name: str  # Stage name
    category: str  # Primary category name
    subcategories: list[str] = []  # Subcategories within primary category
    other_categories: list[str] = []  # Additional category names
    bio: Optional[str] = None
    city: Optional[str] = None
    country: str = "Israel"
    languages: list[str] = ["English"]
    performance_types: list[str] = []
    price_range_min: Optional[int] = None
    price_range_max: Optional[int] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    instagram: Optional[str] = None
    youtube: Optional[str] = None
    facebook: Optional[str] = None
    twitter: Optional[str] = None
    linkedin: Optional[str] = None
    # Media fields
    profile_image: Optional[str] = None  # Profile image URL
    video_urls: list[str] = []  # Video clip URLs
    portfolio_images: list[str] = []  # Gallery images URLs
    spotify_links: list[str] = []  # Spotify track/album links
    media_links: list[str] = []  # Press/media article links
    password: Optional[str] = None  # Password for self-registration (not needed for agent submissions)
    is_agent_submission: bool = False  # Whether this is submitted by an agent


async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """Get current user from token, return None if not authenticated."""
    if not token:
        return None

    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        user_id = int(user_id)
    except (JWTError, ValueError):
        return None

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    return user


async def get_current_user(
    user: Optional[User] = Depends(get_current_user_optional),
) -> User:
    """Get current user from token, raise error if not authenticated."""
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user",
        )
    return user


async def get_current_active_user(
    user: User = Depends(get_current_user),
) -> User:
    """Get current active user."""
    return user


@router.post("/register", response_model=Token)
@limiter.limit("5/minute")
async def register(
    request: Request,
    body: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """Register new user (artist, community, or admin)."""
    # Validate role
    if body.role not in ["artist", "community", "admin", "agent"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be 'artist', 'community', 'admin', or 'agent'",
        )

    # Check if email already exists
    existing_user = await db.execute(
        select(User).where(User.email == body.email)
    )
    if existing_user.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create user
    user = User(
        email=body.email,
        password_hash=get_password_hash(body.password),
        name=body.name,
        role=body.role,
        status="active",
        is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    logger.info("User registered: id=%d email=%s role=%s", user.id, user.email, user.role)
    send_welcome(user.email, user.name or "there", user.role)

    # Create tokens
    access_token = create_access_token(data={"sub": user.id, "email": user.email, "role": user.role})
    refresh_token = create_refresh_token(data={"sub": user.id})

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
    )


@router.post("/register/artist", response_model=Token)
@limiter.limit("5/minute")
async def register_artist(
    request: Request,
    body: ArtistRegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """Register new artist with profile."""
    import secrets

    agent_user = None

    if body.is_agent_submission:
        # Agent mode: Check if agent already exists
        existing_agent = await db.execute(
            select(User).where(User.email == body.email, User.role == "agent")
        )
        agent_user = existing_agent.scalar_one_or_none()

        if not agent_user:
            # Check if email exists with different role
            existing_user = await db.execute(
                select(User).where(User.email == body.email)
            )
            if existing_user.scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered with a different role",
                )

            # Create agent user
            temp_password = secrets.token_urlsafe(16)
            agent_user = User(
                email=body.email,
                password_hash=get_password_hash(temp_password),
                name=body.name,
                role="agent",
                status="active",
                is_active=True,
            )
            db.add(agent_user)
            await db.flush()

        # Generate unique email for the artist (based on stage name + random suffix)
        artist_email_base = body.artist_name.lower().replace(" ", ".").replace("'", "")
        artist_email = f"{artist_email_base}.{secrets.token_hex(4)}@artist.kolamba.com"

        # Create artist user account
        artist_password = secrets.token_urlsafe(16)
        artist_user = User(
            email=artist_email,
            password_hash=get_password_hash(artist_password),
            name=body.artist_name,
            role="artist",
            status="active",
            is_active=True,
        )
        db.add(artist_user)
        await db.flush()
        user = artist_user
    else:
        # Regular artist registration
        existing_user = await db.execute(
            select(User).where(User.email == body.email)
        )
        if existing_user.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        # Use provided password or generate a temporary one
        password = body.password if body.password else secrets.token_urlsafe(16)

        # Create user with artist role
        user = User(
            email=body.email,
            password_hash=get_password_hash(password),
            name=body.name,
            role="artist",
            status="active",  # MVP: Auto-approve artists
            is_active=True,
        )
        db.add(user)
        await db.flush()

    # Get categories by name (case-insensitive matching on name_en)
    all_category_names = [body.category] + body.other_categories

    # Fetch all categories and match by name (case-insensitive, with fuzzy matching)
    categories_result = await db.execute(select(Category))
    all_categories = categories_result.scalars().all()

    categories = []
    for cat in all_categories:
        for name in all_category_names:
            name_lower = name.lower()
            cat_lower = cat.name_en.lower()
            # Exact match, slug match, or partial match (e.g. "Film & Television" contains "Film" or "Television")
            if (cat_lower == name_lower
                or cat.slug == name_lower.replace(" ", "-").replace("&", "and")
                or cat_lower in name_lower
                or name_lower in cat_lower):
                categories.append(cat)
                break

    # Create artist profile
    artist = Artist(
        user_id=user.id,
        agent_user_id=agent_user.id if agent_user else None,
        name_he=body.artist_name,  # Using artist_name for name_he (primary)
        name_en=body.artist_name,  # Also set English name
        bio_en=body.bio,
        city=body.city,
        country=body.country,
        languages=body.languages,
        performance_types=body.performance_types,
        subcategories=body.subcategories,
        price_single=body.price_range_min,
        price_tour=body.price_range_max,
        phone=body.phone,
        website=body.website,
        instagram=body.instagram,
        youtube=body.youtube,
        facebook=body.facebook,
        twitter=body.twitter,
        linkedin=body.linkedin,
        # Media fields
        profile_image=body.profile_image,
        video_urls=body.video_urls,
        portfolio_images=body.portfolio_images,
        spotify_links=body.spotify_links,
        media_links=body.media_links,
        status="pending",  # Requires admin approval
    )

    # Link categories
    for cat in categories:
        artist.categories.append(cat)

    db.add(artist)
    await db.commit()

    # Return tokens for agent (if agent mode) or artist user
    token_user = agent_user if agent_user else user
    await db.refresh(token_user)

    # Create tokens
    access_token = create_access_token(data={"sub": token_user.id, "email": token_user.email, "role": token_user.role})
    refresh_token = create_refresh_token(data={"sub": token_user.id})

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
    )


@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """Login and get JWT tokens."""
    # Find user by email
    result = await db.execute(
        select(User).where(User.email == form_data.username)
    )
    user = result.scalar_one_or_none()

    if not user or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(form_data.password, user.password_hash):
        logger.warning("Failed login attempt for email=%s", form_data.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user",
        )

    logger.info("User logged in: id=%d email=%s role=%s", user.id, user.email, user.role)

    # Create tokens
    access_token = create_access_token(data={"sub": user.id, "email": user.email, "role": user.role})
    refresh_token = create_refresh_token(data={"sub": user.id})

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
    )


class RefreshRequest(BaseModel):
    """Request body for token refresh."""
    refresh_token: str


@router.post("/refresh", response_model=Token)
@limiter.limit("10/minute")
async def refresh_token(
    request: Request,
    body: RefreshRequest,
    db: AsyncSession = Depends(get_db),
):
    """Refresh access token using refresh token."""
    try:
        payload = jwt.decode(body.refresh_token, settings.secret_key, algorithms=[settings.algorithm])
        user_id_str = payload.get("sub")
        if user_id_str is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )
        user_id = int(user_id_str)
    except (JWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    # Get user
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    # Create new tokens
    access_token = create_access_token(data={"sub": user.id, "email": user.email, "role": user.role})
    new_refresh_token = create_refresh_token(data={"sub": user.id})

    return Token(
        access_token=access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
    )


class UserMeResponse(BaseModel):
    """Response for current user info."""
    id: int
    email: str
    name: Optional[str]
    role: str
    is_active: bool
    is_superuser: bool = False
    artist_id: Optional[int] = None
    community_id: Optional[int] = None

    class Config:
        from_attributes = True


@router.get("/me", response_model=UserMeResponse)
async def get_me(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current authenticated user."""
    # Get artist or community ID if exists (query separately to avoid lazy loading issues)
    artist_id = None
    community_id = None

    if current_user.role == "artist":
        from app.models.artist import Artist
        result = await db.execute(select(Artist.id).where(Artist.user_id == current_user.id))
        artist_id = result.scalar_one_or_none()
    elif current_user.role == "community":
        from app.models.community import Community
        result = await db.execute(select(Community.id).where(Community.user_id == current_user.id))
        community_id = result.scalar_one_or_none()

    return UserMeResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role,
        is_active=current_user.is_active,
        is_superuser=current_user.is_superuser,
        artist_id=artist_id,
        community_id=community_id,
    )


class AdminPasswordReset(BaseModel):
    """Request body for admin password reset."""
    email: str
    new_password: str


@router.post("/admin/reset-password")
async def admin_reset_password(
    request: AdminPasswordReset,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Admin endpoint to reset user password. Requires superuser."""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Superuser access required",
        )

    # Find user
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Update password
    user.password_hash = get_password_hash(request.new_password)
    await db.commit()

    return {"message": f"Password updated for {request.email}"}


# --- Superuser Impersonation ---


class ImpersonateRequest(BaseModel):
    """Request body for impersonation."""
    user_id: int


class UserListItem(BaseModel):
    """User summary for impersonation list."""
    id: int
    email: str
    name: Optional[str]
    role: str
    is_superuser: bool = False

    class Config:
        from_attributes = True


@router.get("/users", response_model=list[UserListItem])
async def list_users_for_impersonation(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List users for superuser impersonation. Requires superuser."""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Superuser access required",
        )

    result = await db.execute(
        select(User).where(User.is_active == True).order_by(User.id).limit(50)
    )
    users = result.scalars().all()
    return users


@router.post("/impersonate", response_model=Token)
async def impersonate_user(
    body: ImpersonateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Impersonate another user. Requires superuser."""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Superuser access required",
        )

    result = await db.execute(select(User).where(User.id == body.user_id))
    target_user = result.scalar_one_or_none()

    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    logger.info(
        "Superuser impersonation: admin=%d (%s) -> target=%d (%s)",
        current_user.id, current_user.email, target_user.id, target_user.email,
    )

    access_token = create_access_token(
        data={"sub": target_user.id, "email": target_user.email, "role": target_user.role}
    )
    refresh_token = create_refresh_token(data={"sub": target_user.id})

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
    )


class CompleteProfileRequest(BaseModel):
    """Request body for completing onboarding profile."""
    role: str  # "community" or "artist"
    community_name: Optional[str] = None
    location: Optional[str] = None


@router.post("/complete-profile", response_model=UserMeResponse)
async def complete_profile(
    body: CompleteProfileRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Complete onboarding profile for a new Google OAuth user."""
    from app.models.community import Community
    from app.services.geocoding import geocode_location

    # Guard: check if user already has a profile
    artist_result = await db.execute(
        select(Artist.id).where(Artist.user_id == current_user.id)
    )
    if artist_result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Profile already completed")

    community_result = await db.execute(
        select(Community.id).where(Community.user_id == current_user.id)
    )
    if community_result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Profile already completed")

    if body.role not in ("community", "artist"):
        raise HTTPException(status_code=400, detail="Role must be 'community' or 'artist'")

    if body.role == "community":
        if not body.community_name or not body.community_name.strip():
            raise HTTPException(status_code=400, detail="Community name is required")
        if not body.location or not body.location.strip():
            raise HTTPException(status_code=400, detail="Location is required")

        # Check duplicate community name (case-insensitive)
        existing = await db.execute(
            select(Community).where(
                func.lower(Community.name) == body.community_name.strip().lower()
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=400,
                detail="A host with this name already exists. Please use a different name.",
            )

        # Geocode location
        coords = await geocode_location(body.location.strip())
        lat = coords[0] if coords else None
        lng = coords[1] if coords else None

        # Create community
        community = Community(
            user_id=current_user.id,
            name=body.community_name.strip(),
            location=body.location.strip(),
            latitude=lat,
            longitude=lng,
            status="active",
        )
        db.add(community)

        # Update user role
        current_user.role = "community"
        await db.commit()
        await db.refresh(community)

        return UserMeResponse(
            id=current_user.id,
            email=current_user.email,
            name=current_user.name,
            role=current_user.role,
            is_active=current_user.is_active,
            is_superuser=current_user.is_superuser,
            community_id=community.id,
        )

    # role == "artist"
    current_user.role = "artist"
    await db.commit()

    return UserMeResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role,
        is_active=current_user.is_active,
        is_superuser=current_user.is_superuser,
        artist_id=None,
    )


class GoogleAuthRequest(BaseModel):
    """Request body for Google OAuth login."""
    credential: str  # Google ID token


@router.post("/google", response_model=Token)
@limiter.limit("5/minute")
async def google_auth(
    request: Request,
    body: GoogleAuthRequest,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate with Google ID token."""
    from google.oauth2 import id_token as google_id_token
    from google.auth.transport import requests as google_requests

    if not settings.google_client_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth is not configured",
        )

    # Verify the Google ID token using google-auth library (official method)
    try:
        token_data = google_id_token.verify_oauth2_token(
            body.credential,
            google_requests.Request(),
            settings.google_client_id,
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token",
        )

    email = token_data.get("email")
    name = token_data.get("name", "")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email not available from Google",
        )

    # Check if user already exists
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        # Create new user as community role (default for Google sign-ups)
        user = User(
            email=email,
            password_hash=None,  # No password for Google users
            name=name,
            role="community",
            status="active",
            is_active=True,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        logger.info("Google OAuth new user: id=%d email=%s", user.id, user.email)
    else:
        logger.info("Google OAuth login: id=%d email=%s", user.id, user.email)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is inactive",
        )

    # Create tokens
    access_token = create_access_token(data={"sub": user.id, "email": user.email, "role": user.role})
    refresh_token = create_refresh_token(data={"sub": user.id})

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
    )
