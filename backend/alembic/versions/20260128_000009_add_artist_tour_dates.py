"""Add artist_tour_dates table

Revision ID: 20260128_000009
Revises: 20260122_000008
Create Date: 2026-01-28

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260128_000009"
down_revision: Union[str, None] = "20260122_000008"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "artist_tour_dates",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("artist_id", sa.Integer(), sa.ForeignKey("artists.id", ondelete="CASCADE"), nullable=False),
        sa.Column("location", sa.String(255), nullable=False),
        sa.Column("latitude", sa.Numeric(10, 8), nullable=True),
        sa.Column("longitude", sa.Numeric(11, 8), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_booked", sa.Boolean(), server_default="false"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )

    # Create indexes
    op.create_index("idx_artist_tour_dates_artist_id", "artist_tour_dates", ["artist_id"])
    op.create_index("idx_artist_tour_dates_start_date", "artist_tour_dates", ["start_date"])
    op.create_index("idx_artist_tour_dates_location", "artist_tour_dates", ["latitude", "longitude"])


def downgrade() -> None:
    op.drop_index("idx_artist_tour_dates_location", "artist_tour_dates")
    op.drop_index("idx_artist_tour_dates_start_date", "artist_tour_dates")
    op.drop_index("idx_artist_tour_dates_artist_id", "artist_tour_dates")
    op.drop_table("artist_tour_dates")
