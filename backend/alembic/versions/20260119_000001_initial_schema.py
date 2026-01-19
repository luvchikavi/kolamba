"""Initial schema - all tables

Revision ID: 20260119_000001
Revises:
Create Date: 2026-01-19

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB, ARRAY

# revision identifiers, used by Alembic.
revision: str = "20260119_000001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users table
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False, index=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("role", sa.String(20), nullable=False),
        sa.Column("is_active", sa.Boolean(), default=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Categories table
    op.create_table(
        "categories",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("name_he", sa.String(100), nullable=False),
        sa.Column("name_en", sa.String(100), nullable=False),
        sa.Column("slug", sa.String(50), unique=True, nullable=False, index=True),
        sa.Column("icon", sa.String(50), nullable=True),
        sa.Column("sort_order", sa.Integer(), default=0),
    )

    # Artists table
    op.create_table(
        "artists",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False),
        sa.Column("name_he", sa.String(255), nullable=False),
        sa.Column("name_en", sa.String(255), nullable=True),
        sa.Column("bio_he", sa.Text(), nullable=True),
        sa.Column("bio_en", sa.Text(), nullable=True),
        sa.Column("profile_image", sa.String(500), nullable=True),
        sa.Column("price_single", sa.Integer(), nullable=True),
        sa.Column("price_tour", sa.Integer(), nullable=True),
        sa.Column("languages", ARRAY(sa.String(50)), server_default="{}"),
        sa.Column("availability", JSONB(), server_default="{}"),
        sa.Column("city", sa.String(100), nullable=True),
        sa.Column("country", sa.String(100), server_default="Israel"),
        sa.Column("status", sa.String(20), server_default="pending"),
        sa.Column("is_featured", sa.Boolean(), server_default="false"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Artist-Category junction table
    op.create_table(
        "artist_categories",
        sa.Column("artist_id", sa.Integer(), sa.ForeignKey("artists.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("category_id", sa.Integer(), sa.ForeignKey("categories.id", ondelete="CASCADE"), primary_key=True),
    )

    # Communities table
    op.create_table(
        "communities",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("location", sa.String(255), nullable=False),
        sa.Column("latitude", sa.Numeric(10, 8), nullable=True),
        sa.Column("longitude", sa.Numeric(11, 8), nullable=True),
        sa.Column("audience_size", sa.String(50), nullable=True),
        sa.Column("language", sa.String(50), server_default="English"),
        sa.Column("status", sa.String(20), server_default="active"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Bookings table
    op.create_table(
        "bookings",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("artist_id", sa.Integer(), sa.ForeignKey("artists.id", ondelete="CASCADE"), nullable=False),
        sa.Column("community_id", sa.Integer(), sa.ForeignKey("communities.id", ondelete="CASCADE"), nullable=False),
        sa.Column("requested_date", sa.Date(), nullable=True),
        sa.Column("location", sa.String(255), nullable=True),
        sa.Column("budget", sa.Integer(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("status", sa.String(20), server_default="pending"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Create indexes
    op.create_index("idx_artists_status", "artists", ["status"])
    op.create_index("idx_artists_is_featured", "artists", ["is_featured"])
    op.create_index("idx_bookings_status", "bookings", ["status"])
    op.create_index("idx_bookings_artist_id", "bookings", ["artist_id"])
    op.create_index("idx_bookings_community_id", "bookings", ["community_id"])


def downgrade() -> None:
    op.drop_table("bookings")
    op.drop_table("communities")
    op.drop_table("artist_categories")
    op.drop_table("artists")
    op.drop_table("categories")
    op.drop_table("users")
