"""Align categories with official list of 10

Revision ID: 20260208_000016
Revises: 20260208_000015
Create Date: 2026-02-08

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "20260208_000016"
down_revision: Union[str, None] = "20260208_000015"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Clear existing categories and insert the correct 10
    op.execute("DELETE FROM artist_categories;")
    op.execute("DELETE FROM categories;")

    op.execute("""
        INSERT INTO categories (name_he, name_en, slug, icon, sort_order) VALUES
        ('מוזיקה', 'Music', 'music', 'music', 1),
        ('ספרות', 'Literature', 'literature', 'book', 2),
        ('עיתונות', 'Journalism', 'journalism', 'newspaper', 3),
        ('קולנוע וטלוויזיה', 'Film & Television', 'film-television', 'film', 4),
        ('דת ויהדות', 'Religion & Judaism', 'religion-judaism', 'synagogue', 5),
        ('קומדיה', 'Comedy', 'comedy', 'laugh', 6),
        ('תיאטרון', 'Theater', 'theater', 'theater', 7),
        ('אמנות ויזואלית', 'Visual Arts', 'visual-arts', 'palette', 8),
        ('קולינריה', 'Culinary', 'culinary', 'chef', 9),
        ('השראה', 'Inspiration', 'inspiration', 'sparkles', 10);
    """)


def downgrade() -> None:
    # Restore previous categories
    op.execute("DELETE FROM artist_categories;")
    op.execute("DELETE FROM categories;")

    op.execute("""
        INSERT INTO categories (name_he, name_en, slug, icon, sort_order) VALUES
        ('מוזיקה', 'Music', 'music', 'music', 1),
        ('ריקוד', 'Dance', 'dance', 'dance', 2),
        ('קומדיה', 'Comedy', 'comedy', 'laugh', 3),
        ('תיאטרון', 'Theater', 'theater', 'theater', 4),
        ('אמנות ויזואלית', 'Visual Arts', 'visual-arts', 'palette', 5),
        ('ספרות', 'Literature', 'literature', 'book', 6),
        ('קולנוע', 'Film', 'film', 'film', 7),
        ('טלוויזיה', 'Television', 'television', 'tv', 8),
        ('דת', 'Religion', 'religion', 'synagogue', 9),
        ('קולינריה', 'Culinary', 'culinary', 'chef', 10);
    """)
