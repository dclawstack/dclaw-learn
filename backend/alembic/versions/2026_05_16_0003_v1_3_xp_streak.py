"""v1.3: add xp_total, streak_days, last_streak_date to users

Revision ID: 2026_05_16_0003
Revises: 2026_05_11_0002
Create Date: 2026-05-16 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "2026_05_16_0003"
down_revision: Union[str, None] = "2026_05_11_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("xp_total", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("users", sa.Column("streak_days", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("users", sa.Column("last_streak_date", sa.Date(), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "last_streak_date")
    op.drop_column("users", "streak_days")
    op.drop_column("users", "xp_total")
