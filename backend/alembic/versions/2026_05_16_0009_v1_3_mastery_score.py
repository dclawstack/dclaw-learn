"""v1.3: add mastery_score to user_progress

Revision ID: 2026_05_16_0009
Revises: 2026_05_16_0008
Create Date: 2026-05-16 00:06:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "2026_05_16_0009"
down_revision: Union[str, None] = "2026_05_16_0008"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "user_progress",
        sa.Column("mastery_score", sa.Float(), nullable=False, server_default="0.0"),
    )


def downgrade() -> None:
    op.drop_column("user_progress", "mastery_score")
