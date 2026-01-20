"""Add tours table and tour_id to bookings

Revision ID: 20260120_000003
Revises: 20260119_000002
Create Date: 2026-01-20

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "20260120_000003"
down_revision: Union[str, None] = "20260119_000002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add name and status columns to users table
    op.add_column("users", sa.Column("name", sa.String(255), nullable=True))
    op.add_column("users", sa.Column("status", sa.String(20), server_default="active"))

    # Make password_hash nullable for MVP (some users created without password)
    op.alter_column("users", "password_hash", nullable=True)

    # Tours table
    op.create_table(
        "tours",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("artist_id", sa.Integer(), sa.ForeignKey("artists.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("region", sa.String(255), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("total_budget", sa.Integer(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.String(20), server_default="draft"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Tour-Bookings junction table with metadata
    op.create_table(
        "tour_bookings",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("tour_id", sa.Integer(), sa.ForeignKey("tours.id", ondelete="CASCADE"), nullable=False),
        sa.Column("booking_id", sa.Integer(), sa.ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False),
        sa.Column("sequence_order", sa.Integer(), server_default="0"),
        sa.Column("suggested_date", sa.Date(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
    )

    # Add tour_id to bookings
    op.add_column(
        "bookings",
        sa.Column("tour_id", sa.Integer(), sa.ForeignKey("tours.id", ondelete="SET NULL"), nullable=True)
    )

    # Create indexes
    op.create_index("idx_tours_artist_id", "tours", ["artist_id"])
    op.create_index("idx_tours_status", "tours", ["status"])
    op.create_index("idx_bookings_tour_id", "bookings", ["tour_id"])


def downgrade() -> None:
    op.drop_index("idx_bookings_tour_id", "bookings")
    op.drop_index("idx_tours_status", "tours")
    op.drop_index("idx_tours_artist_id", "tours")
    op.drop_column("bookings", "tour_id")
    op.drop_table("tour_bookings")
    op.drop_table("tours")
    op.alter_column("users", "password_hash", nullable=False)
    op.drop_column("users", "status")
    op.drop_column("users", "name")
