"""Add tour_join_requests table.

Revision ID: 20260121_000005
Revises: 20260121_000004
Create Date: 2026-01-21

Adds table for communities to request joining existing tours.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "20260121_000005"
down_revision: Union[str, None] = "20260121_000004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create tour_join_requests table
    op.create_table(
        "tour_join_requests",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("tour_id", sa.Integer(), nullable=False),
        sa.Column("community_id", sa.Integer(), nullable=False),
        sa.Column("preferred_date", sa.Date(), nullable=True),
        sa.Column("budget", sa.Integer(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, default="pending"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(
            ["tour_id"],
            ["tours.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["community_id"],
            ["communities.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create indexes for efficient querying
    op.create_index(
        "ix_tour_join_requests_tour_id",
        "tour_join_requests",
        ["tour_id"],
    )
    op.create_index(
        "ix_tour_join_requests_community_id",
        "tour_join_requests",
        ["community_id"],
    )
    op.create_index(
        "ix_tour_join_requests_status",
        "tour_join_requests",
        ["status"],
    )


def downgrade() -> None:
    op.drop_index("ix_tour_join_requests_status", table_name="tour_join_requests")
    op.drop_index("ix_tour_join_requests_community_id", table_name="tour_join_requests")
    op.drop_index("ix_tour_join_requests_tour_id", table_name="tour_join_requests")
    op.drop_table("tour_join_requests")
