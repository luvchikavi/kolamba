"""Application configuration using pydantic-settings."""

from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    database_url: str = "postgresql+asyncpg://postgres:password@localhost:5432/kolamba"

    # Security
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    # CORS
    cors_origins: str = "http://localhost:3000,http://localhost:3001"

    # Email
    resend_api_key: str = ""

    # Cloudinary (for media uploads)
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""

    # Environment
    env: str = "development"
    debug: bool = True

    @field_validator("database_url", mode="before")
    @classmethod
    def convert_database_url(cls, v: str) -> str:
        """Convert Railway's postgres:// URL to asyncpg format."""
        if v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql+asyncpg://", 1)
        if v.startswith("postgresql://"):
            return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

    @property
    def cors_origins_list(self) -> list[str]:
        """Get list of allowed CORS origins, including Vercel preview URLs."""
        origins = [origin.strip() for origin in self.cors_origins.split(",")]

        # Always allow Vercel preview URLs for the kolamba project
        # These have format: kolamba-*.vercel.app
        origins.extend([
            "https://kolamba.vercel.app",
            "https://kolamba-git-main-avi-luvchiks-projects.vercel.app",
        ])

        return list(set(origins))  # Remove duplicates

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()
