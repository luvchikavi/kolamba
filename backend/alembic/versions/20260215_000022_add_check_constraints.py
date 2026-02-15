"""Add CHECK constraints for data integrity.

Revision ID: 20260215_000022
Revises: 20260215_000021
Create Date: 2026-02-15

"""
from alembic import op

# revision identifiers
revision = "20260215_000022"
down_revision = "20260215_000021"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_check_constraint(
        "ck_communities_member_count",
        "communities",
        "member_count_max IS NULL OR member_count_min IS NULL OR member_count_max >= member_count_min",
    )
    op.create_check_constraint(
        "ck_tours_dates",
        "tours",
        "end_date IS NULL OR start_date IS NULL OR end_date >= start_date",
    )
    op.create_check_constraint(
        "ck_artist_tour_dates_dates",
        "artist_tour_dates",
        "end_date IS NULL OR start_date IS NULL OR end_date >= start_date",
    )


def downgrade() -> None:
    op.drop_constraint("ck_artist_tour_dates_dates", "artist_tour_dates", type_="check")
    op.drop_constraint("ck_tours_dates", "tours", type_="check")
    op.drop_constraint("ck_communities_member_count", "communities", type_="check")
