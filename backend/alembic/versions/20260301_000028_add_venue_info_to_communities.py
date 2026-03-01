"""Add venue_info JSONB column to communities table.

Revision ID: 000028
Revises: 000027
Create Date: 2026-03-01
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

# revision identifiers
revision = "d4e5f6a7b8c9"
down_revision = "c3d4e5f6a7b8"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("communities", sa.Column("venue_info", JSONB, nullable=True))


def downgrade() -> None:
    op.drop_column("communities", "venue_info")
