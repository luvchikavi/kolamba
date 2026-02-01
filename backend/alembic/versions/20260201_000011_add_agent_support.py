"""Add agent support - agent_user_id field on artists table

Revision ID: 20260201_000011
Revises: 20260129_000010
Create Date: 2026-02-01

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260201_000011"
down_revision: Union[str, None] = "20260129_000010"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add agent_user_id column to artists table
    op.add_column(
        "artists",
        sa.Column(
            "agent_user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
    )

    # Create index for efficient agent lookups
    op.create_index("idx_artists_agent_user_id", "artists", ["agent_user_id"])


def downgrade() -> None:
    op.drop_index("idx_artists_agent_user_id", "artists")
    op.drop_column("artists", "agent_user_id")
