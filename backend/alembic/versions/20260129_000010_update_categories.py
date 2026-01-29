"""Update categories to match required 10 categories

Revision ID: 20260129_000010
Revises: 20260128_000009
Create Date: 2026-01-29

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "20260129_000010"
down_revision: Union[str, None] = "20260128_000009"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Clear existing categories and insert the correct 10
    op.execute("DELETE FROM artist_categories;")  # Clear relationships first
    op.execute("DELETE FROM categories;")

    # Insert the 10 required categories
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


def downgrade() -> None:
    # Restore original categories
    op.execute("DELETE FROM artist_categories;")
    op.execute("DELETE FROM categories;")

    op.execute("""
        INSERT INTO categories (name_he, name_en, slug, icon, sort_order) VALUES
        ('שירה', 'Singing', 'singing', 'music', 1),
        ('חזנות', 'Cantorial', 'cantorial', 'synagogue', 2),
        ('הרצאה', 'Lecture', 'lecture', 'presentation', 3),
        ('סדנה', 'Workshop', 'workshop', 'users', 4),
        ('מופע לילדים', 'Children Show', 'children', 'child', 5),
        ('ריקוד', 'Dance', 'dance', 'dance', 6),
        ('תיאטרון', 'Theater', 'theater', 'theater', 7),
        ('מוסיקה', 'Music', 'music-instrumental', 'guitar', 8),
        ('קומדיה', 'Comedy', 'comedy', 'laugh', 9),
        ('אמנות ויזואלית', 'Visual Art', 'visual-art', 'palette', 10);
    """)
