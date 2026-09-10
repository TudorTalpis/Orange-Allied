"""add profile fields to users

Revision ID: 20260910122450
Revises: 20260908211001
Create Date: 2026-09-10 12:24:50
"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260910122450"
down_revision: str | None = "20260908211001"
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("users", sa.Column("full_name", sa.String(), nullable=False, server_default=""))
    op.add_column("users", sa.Column("role", sa.String(), nullable=False, server_default="owner"))
    op.add_column(
        "users", sa.Column("organisation", sa.String(), nullable=False, server_default="")
    )
    op.add_column("users", sa.Column("avatar_url", sa.String(), nullable=True))
    op.add_column("users", sa.Column("job_title", sa.String(), nullable=True))
    op.add_column(
        "users", sa.Column("last_active_at", sa.DateTime(timezone=True), nullable=True)
    )


def downgrade() -> None:
    op.drop_column("users", "last_active_at")
    op.drop_column("users", "job_title")
    op.drop_column("users", "avatar_url")
    op.drop_column("users", "organisation")
    op.drop_column("users", "role")
    op.drop_column("users", "full_name")
