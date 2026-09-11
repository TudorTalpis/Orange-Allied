"""add token revocation and login lockout fields

Revision ID: 20260911072955
Revises: 20260911071402
Create Date: 2026-09-11 07:29:55
"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260911072955"
down_revision: str | None = "20260911071402"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "users", sa.Column("tokens_valid_from", sa.DateTime(timezone=True), nullable=True)
    )
    op.add_column(
        "users",
        sa.Column("failed_login_attempts", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column("users", sa.Column("locked_until", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "locked_until")
    op.drop_column("users", "failed_login_attempts")
    op.drop_column("users", "tokens_valid_from")
