"""Add tour constraint fields.

Revision ID: 000026
Revises: a1b2c3d4e5f6
Create Date: 2026-02-22

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "b2c3d4e5f6a7"
down_revision = "a1b2c3d4e5f6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("tours", sa.Column("max_travel_hours", sa.Float(), nullable=True))
    op.add_column("tours", sa.Column("min_shows_per_week", sa.Integer(), nullable=True))
    op.add_column("tours", sa.Column("max_shows_per_week", sa.Integer(), nullable=True))
    op.add_column("tours", sa.Column("rest_day_rule", sa.String(100), nullable=True))
    op.add_column("tours", sa.Column("min_net_profit", sa.Float(), nullable=True))
    op.add_column("tours", sa.Column("efficiency_score", sa.Integer(), nullable=True))
    op.add_column("tours", sa.Column("visa_status", sa.String(30), nullable=True))


def downgrade() -> None:
    op.drop_column("tours", "visa_status")
    op.drop_column("tours", "efficiency_score")
    op.drop_column("tours", "min_net_profit")
    op.drop_column("tours", "rest_day_rule")
    op.drop_column("tours", "max_shows_per_week")
    op.drop_column("tours", "min_shows_per_week")
    op.drop_column("tours", "max_travel_hours")
