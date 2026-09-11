"""normalize existing user emails to lowercase

Addresses are normalized to lowercase on the API side from now on. Rows created
before that change may still hold mixed-case addresses, and those accounts could
no longer be logged into, so they are normalized here too.

Revision ID: 20260911071402
Revises: 20260910122450
Create Date: 2026-09-11 07:14:02
"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260911071402"
down_revision: str | None = "20260910122450"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    connection = op.get_bind()

    # Lowercasing could collide if both Foo@x.com and foo@x.com exist. Stop with
    # a clear message instead of letting the unique index fail mid-migration.
    collisions = connection.execute(
        sa.text(
            "SELECT lower(email) AS email, count(*) FROM users "
            "GROUP BY lower(email) HAVING count(*) > 1"
        )
    ).fetchall()
    if collisions:
        addresses = ", ".join(row.email for row in collisions)
        raise RuntimeError(
            "Cannot normalize emails: these addresses exist in several case "
            f"variants and must be merged manually first: {addresses}"
        )

    connection.execute(sa.text("UPDATE users SET email = lower(email) WHERE email <> lower(email)"))


def downgrade() -> None:
    # Original casing is not recorded anywhere, so this cannot be undone.
    pass
