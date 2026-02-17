"""add receive_artist_offers to communities

Revision ID: 5ccee505446e
Revises: f8bf15aa123e
Create Date: 2026-02-17 11:42:17.557882

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '5ccee505446e'
down_revision: Union[str, None] = 'f8bf15aa123e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('communities', sa.Column('receive_artist_offers', sa.Boolean(), nullable=False, server_default=sa.text('false')))


def downgrade() -> None:
    op.drop_column('communities', 'receive_artist_offers')
