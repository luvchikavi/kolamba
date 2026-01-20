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
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


class RegisterRequest(BaseModel):
    """Request body for user registration."""
    email: str
    password: str
    name: str
    role: str  # 'artist' or 'community'


async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """Get current user from token, return None if not authenticated."""
    if not token:
        return None

    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id: int = payload.get("sub")
        if user_id is None:
            return None
    except JWTError:
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
    if request.role not in ["artist", "community", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be 'artist', 'community', or 'admin'",
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
    # Get artist or community ID if exists
    artist_id = None
    community_id = None

    if current_user.role == "artist" and current_user.artist:
        artist_id = current_user.artist.id
    elif current_user.role == "community" and current_user.community:
        community_id = current_user.community.id

    return UserMeResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role,
        is_active=current_user.is_active,
        artist_id=artist_id,
        community_id=community_id,
    )
