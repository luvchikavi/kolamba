"""Add quote flow columns to bookings.

Revision ID: 000025
Revises: 20260217_114217
Create Date: 2026-02-22

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "a1b2c3d4e5f6"
down_revision = "5ccee505446e"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # MVP event detail columns
    op.add_column("bookings", sa.Column("event_type", sa.String(30), nullable=True))
    op.add_column("bookings", sa.Column("audience_size", sa.Integer(), nullable=True))
    op.add_column("bookings", sa.Column("audience_description", sa.Text(), nullable=True))
    op.add_column("bookings", sa.Column("is_online", sa.Boolean(), server_default="false", nullable=True))

    # MVP quote flow columns
    op.add_column("bookings", sa.Column("quote_amount", sa.Float(), nullable=True))
    op.add_column("bookings", sa.Column("quote_notes", sa.Text(), nullable=True))
    op.add_column("bookings", sa.Column("quoted_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("bookings", sa.Column("decline_reason", sa.Text(), nullable=True))

    # POST-MVP placeholder columns
    op.add_column("bookings", sa.Column("deposit_amount", sa.Float(), nullable=True))
    op.add_column("bookings", sa.Column("deposit_paid_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("bookings", sa.Column("visa_required", sa.Boolean(), nullable=True))
    op.add_column("bookings", sa.Column("visa_status", sa.String(30), nullable=True))
    op.add_column("bookings", sa.Column("review_host_rating", sa.Integer(), nullable=True))
    op.add_column("bookings", sa.Column("review_host_text", sa.Text(), nullable=True))
    op.add_column("bookings", sa.Column("review_talent_rating", sa.Integer(), nullable=True))
    op.add_column("bookings", sa.Column("review_talent_text", sa.Text(), nullable=True))

    # Widen status column from String(20) to String(30)
    op.alter_column("bookings", "status", type_=sa.String(30), existing_type=sa.String(20))


def downgrade() -> None:
    op.alter_column("bookings", "status", type_=sa.String(20), existing_type=sa.String(30))

    op.drop_column("bookings", "review_talent_text")
    op.drop_column("bookings", "review_talent_rating")
    op.drop_column("bookings", "review_host_text")
    op.drop_column("bookings", "review_host_rating")
    op.drop_column("bookings", "visa_status")
    op.drop_column("bookings", "visa_required")
    op.drop_column("bookings", "deposit_paid_at")
    op.drop_column("bookings", "deposit_amount")

    op.drop_column("bookings", "decline_reason")
    op.drop_column("bookings", "quoted_at")
    op.drop_column("bookings", "quote_notes")
    op.drop_column("bookings", "quote_amount")

    op.drop_column("bookings", "is_online")
    op.drop_column("bookings", "audience_description")
    op.drop_column("bookings", "audience_size")
    op.drop_column("bookings", "event_type")
