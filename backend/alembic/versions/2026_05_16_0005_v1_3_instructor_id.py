"""v1.3: add instructor_id to courses

Revision ID: 2026_05_16_0005
Revises: 2026_05_16_0004
Create Date: 2026-05-16 00:02:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "2026_05_16_0005"
down_revision: Union[str, None] = "2026_05_16_0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "courses",
        sa.Column("instructor_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.create_foreign_key(
        op.f("fk_courses_instructor_id_users"),
        "courses", "users",
        ["instructor_id"], ["id"],
    )


def downgrade() -> None:
    op.drop_constraint(op.f("fk_courses_instructor_id_users"), "courses", type_="foreignkey")
    op.drop_column("courses", "instructor_id")
