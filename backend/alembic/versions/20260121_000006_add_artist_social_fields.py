"""Add artist social fields

Revision ID: 20260121_000006
Revises: 20260121_000005
Create Date: 2026-01-21

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ARRAY

# revision identifiers, used by Alembic.
revision: str = "20260121_000006"
down_revision: Union[str, None] = "20260121_000005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new columns to artists table
    op.add_column("artists", sa.Column("phone", sa.String(50), nullable=True))
    op.add_column("artists", sa.Column("website", sa.String(500), nullable=True))
    op.add_column("artists", sa.Column("instagram", sa.String(100), nullable=True))
    op.add_column("artists", sa.Column("youtube", sa.String(500), nullable=True))
    op.add_column("artists", sa.Column("performance_types", ARRAY(sa.String(100)), server_default="{}"))


def downgrade() -> None:
    op.drop_column("artists", "performance_types")
    op.drop_column("artists", "youtube")
    op.drop_column("artists", "instagram")
    op.drop_column("artists", "website")
    op.drop_column("artists", "phone")
