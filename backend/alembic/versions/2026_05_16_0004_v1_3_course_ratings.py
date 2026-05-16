"""v1.3: add course_ratings table

Revision ID: 2026_05_16_0004
Revises: 2026_05_16_0003
Create Date: 2026-05-16 00:01:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "2026_05_16_0004"
down_revision: Union[str, None] = "2026_05_16_0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "course_ratings",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("course_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("stars", sa.Integer(), nullable=False),
        sa.Column("review", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"], name=op.f("fk_course_ratings_course_id_courses")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_course_ratings")),
    )
    op.create_index(op.f("ix_course_ratings_course_id"), "course_ratings", ["course_id"])
    op.create_index(op.f("ix_course_ratings_user_id"), "course_ratings", ["user_id"])


def downgrade() -> None:
    op.drop_index(op.f("ix_course_ratings_user_id"), table_name="course_ratings")
    op.drop_index(op.f("ix_course_ratings_course_id"), table_name="course_ratings")
    op.drop_table("course_ratings")
