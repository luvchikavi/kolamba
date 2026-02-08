"""Add subcategories field to artists table

Revision ID: 20260208_000015
Revises: 20260202_000014
Create Date: 2026-02-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ARRAY


# revision identifiers, used by Alembic.
revision: str = "20260208_000015"
down_revision: Union[str, None] = "20260202_000014"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("artists", sa.Column("subcategories", ARRAY(sa.String(100)), nullable=True))


def downgrade() -> None:
    op.drop_column("artists", "subcategories")
