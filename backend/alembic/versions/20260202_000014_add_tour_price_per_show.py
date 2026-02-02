"""Add price_per_show to tours table.

Revision ID: 20260202_000014
Revises: 20260201_000013
Create Date: 2026-02-02
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers
revision = "20260202_000014"
down_revision = "20260201_000013"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add price_per_show column to tours table
    op.add_column(
        "tours",
        sa.Column("price_per_show", sa.Integer(), nullable=True)
    )

    # Update default status from 'draft' to 'pending' for consistency with new workflow
    # Note: Existing tours with 'draft' status will remain as-is


def downgrade() -> None:
    op.drop_column("tours", "price_per_show")
