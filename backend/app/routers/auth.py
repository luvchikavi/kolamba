"""Authentication router - login, register, tokens."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import select
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
    is_agent_submission: bool = False  # Whether this is submitted by an agent


async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """Get current user from token, return None if not authenticated."""
    if not token:
        return None

    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm], options={"verify_sub": False})
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
async def register(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """Register new user (artist, community, or admin)."""
    # Validate role
    if request.role not in ["artist", "community", "admin", "agent"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be 'artist', 'community', 'admin', or 'agent'",
        )

    # Check if email already exists
    existing_user = await db.execute(
        select(User).where(User.email == request.email)
    )
    if existing_user.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create user
    user = User(
        email=request.email,
        password_hash=get_password_hash(request.password),
        name=request.name,
        role=request.role,
        status="active",
        is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Create tokens
    access_token = create_access_token(data={"sub": user.id, "email": user.email, "role": user.role})
    refresh_token = create_refresh_token(data={"sub": user.id})

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
    )


@router.post("/register/artist", response_model=Token)
async def register_artist(
    request: ArtistRegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """Register new artist with profile."""
    import secrets

    agent_user = None

    if request.is_agent_submission:
        # Agent mode: Check if agent already exists
        existing_agent = await db.execute(
            select(User).where(User.email == request.email, User.role == "agent")
        )
        agent_user = existing_agent.scalar_one_or_none()

        if not agent_user:
            # Check if email exists with different role
            existing_user = await db.execute(
                select(User).where(User.email == request.email)
            )
            if existing_user.scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered with a different role",
                )

            # Create agent user
            temp_password = secrets.token_urlsafe(16)
            agent_user = User(
                email=request.email,
                password_hash=get_password_hash(temp_password),
                name=request.name,
                role="agent",
                status="active",
                is_active=True,
            )
            db.add(agent_user)
            await db.flush()

        # Generate unique email for the artist (based on stage name + random suffix)
        artist_email_base = request.artist_name.lower().replace(" ", ".").replace("'", "")
        artist_email = f"{artist_email_base}.{secrets.token_hex(4)}@artist.kolamba.com"

        # Create artist user account
        artist_password = secrets.token_urlsafe(16)
        artist_user = User(
            email=artist_email,
            password_hash=get_password_hash(artist_password),
            name=request.artist_name,
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
            select(User).where(User.email == request.email)
        )
        if existing_user.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        # Generate a temporary password (artist will need to set it on first login)
        temp_password = secrets.token_urlsafe(16)

        # Create user with artist role
        user = User(
            email=request.email,
            password_hash=get_password_hash(temp_password),
            name=request.name,
            role="artist",
            status="active",  # MVP: Auto-approve artists
            is_active=True,
        )
        db.add(user)
        await db.flush()

    # Get categories by name (case-insensitive matching on name_en)
    all_category_names = [request.category] + request.other_categories

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
        name_he=request.artist_name,  # Using artist_name for name_he (primary)
        name_en=request.artist_name,  # Also set English name
        bio_en=request.bio,
        city=request.city,
        country=request.country,
        languages=request.languages,
        performance_types=request.performance_types,
        subcategories=request.subcategories,
        price_single=request.price_range_min,
        price_tour=request.price_range_max,
        phone=request.phone,
        website=request.website,
        instagram=request.instagram,
        youtube=request.youtube,
        facebook=request.facebook,
        twitter=request.twitter,
        linkedin=request.linkedin,
        # Media fields
        profile_image=request.profile_image,
        video_urls=request.video_urls,
        portfolio_images=request.portfolio_images,
        spotify_links=request.spotify_links,
        media_links=request.media_links,
        status="active",  # MVP: Auto-approve artists
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
async def login(
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
async def refresh_token(
    request: RefreshRequest,
    db: AsyncSession = Depends(get_db),
):
    """Refresh access token using refresh token."""
    try:
        payload = jwt.decode(request.refresh_token, settings.secret_key, algorithms=[settings.algorithm])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )
    except JWTError:
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
    admin_secret: str


@router.post("/admin/reset-password")
async def admin_reset_password(
    request: AdminPasswordReset,
    db: AsyncSession = Depends(get_db),
):
    """Admin endpoint to reset user password. Requires admin secret."""
    # Verify admin secret (use the app's secret key for now)
    if request.admin_secret != settings.secret_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid admin secret",
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
