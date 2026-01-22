"""Seed superuser accounts

Revision ID: 20260122_000008
Revises: 20260122_000007
Create Date: 2026-01-22

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from passlib.context import CryptContext

# revision identifiers, used by Alembic.
revision: str = "20260122_000008"
down_revision: Union[str, None] = "20260122_000007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def upgrade() -> None:
    # Get connection
    conn = op.get_bind()

    superusers = [
        ("avi@kolamba.org", "Avi Luvchik", "Kolamba!26"),
        ("avital@kolamba.org", "Avital", "Kolamba!26"),
    ]

    for email, name, password in superusers:
        # Check if user exists
        result = conn.execute(
            sa.text("SELECT id FROM users WHERE email = :email"),
            {"email": email}
        )
        existing = result.fetchone()

        if existing:
            # Update existing user to be superuser
            conn.execute(
                sa.text("""
                    UPDATE users
                    SET is_superuser = true, role = 'admin', status = 'active', is_active = true
                    WHERE email = :email
                """),
                {"email": email}
            )
        else:
            # Create new superuser
            password_hash = pwd_context.hash(password)
            conn.execute(
                sa.text("""
                    INSERT INTO users (email, password_hash, name, role, status, is_active, is_superuser, created_at, updated_at)
                    VALUES (:email, :password_hash, :name, 'admin', 'active', true, true, NOW(), NOW())
                """),
                {"email": email, "password_hash": password_hash, "name": name}
            )


def downgrade() -> None:
    # Remove superuser status (don't delete the users)
    conn = op.get_bind()
    conn.execute(
        sa.text("""
            UPDATE users
            SET is_superuser = false
            WHERE email IN ('avi@kolamba.org', 'avital@kolamba.org')
        """)
    )
