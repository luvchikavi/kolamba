"""Add indexes on frequently filtered status columns.

Revision ID: 20260215_000021
Revises: 20260208_000020
Create Date: 2026-02-15

"""
from alembic import op

# revision identifiers
revision = "20260215_000021"
down_revision = "20260208_000020"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index("ix_artists_status", "artists", ["status"])
    op.create_index("ix_communities_status", "communities", ["status"])
    op.create_index("ix_bookings_status", "bookings", ["status"])
    op.create_index("ix_bookings_artist_id", "bookings", ["artist_id"])
    op.create_index("ix_bookings_community_id", "bookings", ["community_id"])


def downgrade() -> None:
    op.drop_index("ix_bookings_community_id", table_name="bookings")
    op.drop_index("ix_bookings_artist_id", table_name="bookings")
    op.drop_index("ix_bookings_status", table_name="bookings")
    op.drop_index("ix_communities_status", table_name="communities")
    op.drop_index("ix_artists_status", table_name="artists")
