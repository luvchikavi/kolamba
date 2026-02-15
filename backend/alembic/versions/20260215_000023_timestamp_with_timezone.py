"""Convert timestamp columns to TIMESTAMP WITH TIME ZONE.

Revision ID: 20260215_000023
Revises: 20260215_000022
Create Date: 2026-02-15

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = "20260215_000023"
down_revision = "20260215_000022"
branch_labels = None
depends_on = None

# All tables and their timestamp columns
TIMESTAMP_COLUMNS = [
    ("users", ["created_at", "updated_at"]),
    ("artists", ["created_at", "updated_at"]),
    ("communities", ["created_at", "updated_at"]),
    ("bookings", ["created_at", "updated_at"]),
    ("tours", ["created_at", "updated_at"]),
    ("tour_join_requests", ["created_at", "updated_at"]),
    ("artist_tour_dates", ["created_at"]),
    ("conversations", ["created_at", "updated_at"]),
    ("messages", ["created_at"]),
]


def upgrade() -> None:
    for table, columns in TIMESTAMP_COLUMNS:
        for col in columns:
            op.alter_column(
                table,
                col,
                type_=sa.DateTime(timezone=True),
                existing_type=sa.DateTime(),
                existing_nullable=True,
                postgresql_using=f"{col} AT TIME ZONE 'UTC'",
            )


def downgrade() -> None:
    for table, columns in TIMESTAMP_COLUMNS:
        for col in columns:
            op.alter_column(
                table,
                col,
                type_=sa.DateTime(),
                existing_type=sa.DateTime(timezone=True),
                existing_nullable=True,
            )
