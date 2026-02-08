"""Add GIN index on artists.languages for fast array search

Revision ID: 20260208_000017
Revises: 20260208_000016
Create Date: 2026-02-08

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "20260208_000017"
down_revision: Union[str, None] = "20260208_000016"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_artists_languages_gin ON artists USING GIN (languages)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_artists_languages_gin")
