"""Add rejection_reason column to artists

Revision ID: 20260208_000019
Revises: 20260208_000018
Create Date: 2026-02-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "20260208_000019"
down_revision: Union[str, None] = "20260208_000018"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("artists", sa.Column("rejection_reason", sa.String(50), nullable=True))


def downgrade() -> None:
    op.drop_column("artists", "rejection_reason")
