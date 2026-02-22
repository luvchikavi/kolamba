"""Create tour_stops table and migrate tour_bookings data.

Revision ID: 000027
Revises: b2c3d4e5f6a7
Create Date: 2026-02-22

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "c3d4e5f6a7b8"
down_revision = "b2c3d4e5f6a7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create tour_stops table
    op.create_table(
        "tour_stops",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("tour_id", sa.Integer(), sa.ForeignKey("tours.id", ondelete="CASCADE"), nullable=False),
        sa.Column("booking_id", sa.Integer(), sa.ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True, unique=True),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("city", sa.String(255), nullable=True),
        sa.Column("venue_name", sa.String(255), nullable=True),
        sa.Column("latitude", sa.Numeric(10, 8), nullable=True),
        sa.Column("longitude", sa.Numeric(11, 8), nullable=True),
        sa.Column("sequence_order", sa.Integer(), server_default="0"),
        sa.Column("travel_from_prev", sa.String(255), nullable=True),
        sa.Column("travel_cost", sa.Float(), nullable=True),
        sa.Column("accommodation_cost", sa.Float(), nullable=True),
        sa.Column("performance_fee", sa.Float(), nullable=True),
        sa.Column("shared_logistics", sa.Float(), nullable=True),
        sa.Column("net_revenue", sa.Float(), nullable=True),
        sa.Column("route_discount", sa.Float(), nullable=True),
        sa.Column("status", sa.String(30), server_default="open"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_tour_stops_tour_id", "tour_stops", ["tour_id"])
    op.create_index("ix_tour_stops_date", "tour_stops", ["date"])

    # Migrate data from tour_bookings into tour_stops
    op.execute("""
        INSERT INTO tour_stops (tour_id, booking_id, sequence_order, date, notes, created_at, updated_at)
        SELECT
            tb.tour_id,
            tb.booking_id,
            tb.sequence_order,
            COALESCE(tb.suggested_date, CURRENT_DATE),
            tb.notes,
            NOW(),
            NOW()
        FROM tour_bookings tb
    """)

    # Drop old tour_bookings table
    op.drop_table("tour_bookings")


def downgrade() -> None:
    # Recreate tour_bookings table
    op.create_table(
        "tour_bookings",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("tour_id", sa.Integer(), sa.ForeignKey("tours.id", ondelete="CASCADE"), nullable=False),
        sa.Column("booking_id", sa.Integer(), sa.ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False),
        sa.Column("sequence_order", sa.Integer(), server_default="0"),
        sa.Column("suggested_date", sa.Date(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
    )

    # Migrate data back
    op.execute("""
        INSERT INTO tour_bookings (tour_id, booking_id, sequence_order, suggested_date, notes)
        SELECT tour_id, booking_id, sequence_order, date, notes
        FROM tour_stops
        WHERE booking_id IS NOT NULL
    """)

    op.drop_index("ix_tour_stops_date", "tour_stops")
    op.drop_index("ix_tour_stops_tour_id", "tour_stops")
    op.drop_table("tour_stops")
