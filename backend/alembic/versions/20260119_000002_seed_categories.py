"""Seed categories data

Revision ID: 20260119_000002
Revises: 20260119_000001
Create Date: 2026-01-19

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "20260119_000002"
down_revision: Union[str, None] = "20260119_000001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Seed categories
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


def downgrade() -> None:
    op.execute("DELETE FROM categories;")
