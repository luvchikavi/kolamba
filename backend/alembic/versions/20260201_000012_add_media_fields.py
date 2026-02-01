"""Add media fields to artists table

Revision ID: 20260201_000012
Revises: 20260201_000011
Create Date: 2026-02-01

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ARRAY


# revision identifiers, used by Alembic.
revision: str = "20260201_000012"
down_revision: Union[str, None] = "20260201_000011"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add social media fields
    op.add_column("artists", sa.Column("facebook", sa.String(500), nullable=True))
    op.add_column("artists", sa.Column("twitter", sa.String(100), nullable=True))
    op.add_column("artists", sa.Column("linkedin", sa.String(500), nullable=True))

    # Add media fields
    op.add_column("artists", sa.Column("video_urls", ARRAY(sa.String(500)), nullable=True))
    op.add_column("artists", sa.Column("portfolio_images", ARRAY(sa.String(500)), nullable=True))
    op.add_column("artists", sa.Column("spotify_links", ARRAY(sa.String(500)), nullable=True))
    op.add_column("artists", sa.Column("media_links", ARRAY(sa.String(500)), nullable=True))


def downgrade() -> None:
    op.drop_column("artists", "media_links")
    op.drop_column("artists", "spotify_links")
    op.drop_column("artists", "portfolio_images")
    op.drop_column("artists", "video_urls")
    op.drop_column("artists", "linkedin")
    op.drop_column("artists", "twitter")
    op.drop_column("artists", "facebook")
