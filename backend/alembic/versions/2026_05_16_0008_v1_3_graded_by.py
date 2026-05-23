"""v1.3: add graded_by to submissions

Revision ID: 2026_05_16_0008
Revises: 2026_05_16_0007
Create Date: 2026-05-16 00:05:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "2026_05_16_0008"
down_revision: Union[str, None] = "2026_05_16_0007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("submissions", sa.Column("graded_by", sa.String(50), nullable=True))


def downgrade() -> None:
    op.drop_column("submissions", "graded_by")
