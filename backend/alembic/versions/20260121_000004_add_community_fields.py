"""Add new community fields for enhanced registration.

Revision ID: 20260121_000004
Revises: 20260120_000003
Create Date: 2026-01-21

New fields:
- community_type: Type of organization (JCC, Synagogue, etc.)
- member_count_min/max: Numeric range instead of categorical
- event_types: Array of event types the community hosts
- contact_role: Role of the contact person
- phone: Phone number with country code
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "20260121_000004"
down_revision: Union[str, None] = "20260120_000003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new columns to communities table
    op.add_column(
        "communities",
        sa.Column("community_type", sa.String(100), nullable=True),
    )
    op.add_column(
        "communities",
        sa.Column("member_count_min", sa.Integer(), nullable=True),
    )
    op.add_column(
        "communities",
        sa.Column("member_count_max", sa.Integer(), nullable=True),
    )
    op.add_column(
        "communities",
        sa.Column(
            "event_types",
            postgresql.ARRAY(sa.String(100)),
            nullable=True,
        ),
    )
    op.add_column(
        "communities",
        sa.Column("contact_role", sa.String(100), nullable=True),
    )
    op.add_column(
        "communities",
        sa.Column("phone", sa.String(50), nullable=True),
    )

    # Create index on community name for duplicate checking
    op.create_index(
        "ix_communities_name_lower",
        "communities",
        [sa.text("lower(name)")],
        unique=False,
    )


def downgrade() -> None:
    # Drop index
    op.drop_index("ix_communities_name_lower", table_name="communities")

    # Remove columns
    op.drop_column("communities", "phone")
    op.drop_column("communities", "contact_role")
    op.drop_column("communities", "event_types")
    op.drop_column("communities", "member_count_max")
    op.drop_column("communities", "member_count_min")
    op.drop_column("communities", "community_type")
