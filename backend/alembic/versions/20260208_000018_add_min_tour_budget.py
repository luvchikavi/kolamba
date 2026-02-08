"""Add min_tour_budget column to tours

Revision ID: 20260208_000018
Revises: 20260208_000017
Create Date: 2026-02-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "20260208_000018"
down_revision: Union[str, None] = "20260208_000017"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("tours", sa.Column("min_tour_budget", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("tours", "min_tour_budget")
