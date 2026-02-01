"""Fix media fields - add columns if missing

Revision ID: 20260201_000013
Revises: 20260201_000012
Create Date: 2026-02-01

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = "20260201_000013"
down_revision: Union[str, None] = "20260201_000012"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def column_exists(table_name: str, column_name: str) -> bool:
    """Check if a column exists in a table."""
    bind = op.get_bind()
    inspector = inspect(bind)
    columns = [col['name'] for col in inspector.get_columns(table_name)]
    return column_name in columns


def upgrade() -> None:
    # Add columns only if they don't exist (in case previous migration partially failed)

    # Social media fields
    if not column_exists("artists", "facebook"):
        op.add_column("artists", sa.Column("facebook", sa.String(500), nullable=True))
    if not column_exists("artists", "twitter"):
        op.add_column("artists", sa.Column("twitter", sa.String(100), nullable=True))
    if not column_exists("artists", "linkedin"):
        op.add_column("artists", sa.Column("linkedin", sa.String(500), nullable=True))

    # Media fields
    if not column_exists("artists", "video_urls"):
        op.add_column("artists", sa.Column("video_urls", ARRAY(sa.String(500)), nullable=True))
    if not column_exists("artists", "portfolio_images"):
        op.add_column("artists", sa.Column("portfolio_images", ARRAY(sa.String(500)), nullable=True))
    if not column_exists("artists", "spotify_links"):
        op.add_column("artists", sa.Column("spotify_links", ARRAY(sa.String(500)), nullable=True))
    if not column_exists("artists", "media_links"):
        op.add_column("artists", sa.Column("media_links", ARRAY(sa.String(500)), nullable=True))

    # Agent support field
    if not column_exists("artists", "agent_user_id"):
        op.add_column("artists", sa.Column("agent_user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True))
        op.create_index("idx_artists_agent_user_id", "artists", ["agent_user_id"])


def downgrade() -> None:
    # No downgrade needed - this is a fix migration
    pass
