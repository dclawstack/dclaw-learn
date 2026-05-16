"""v1.3: add flashcards table

Revision ID: 2026_05_16_0007
Revises: 2026_05_16_0006
Create Date: 2026-05-16 00:04:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "2026_05_16_0007"
down_revision: Union[str, None] = "2026_05_16_0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "flashcards",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("lesson_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("front", sa.Text(), nullable=False),
        sa.Column("back", sa.Text(), nullable=False),
        sa.Column("ease_factor", sa.Float(), nullable=False, server_default="2.5"),
        sa.Column("interval_days", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("review_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("due_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["lesson_id"], ["lessons.id"], name=op.f("fk_flashcards_lesson_id_lessons")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_flashcards")),
    )
    op.create_index(op.f("ix_flashcards_user_id"), "flashcards", ["user_id"])
    op.create_index(op.f("ix_flashcards_lesson_id"), "flashcards", ["lesson_id"])
    op.create_index(op.f("ix_flashcards_due_date"), "flashcards", ["due_date"])


def downgrade() -> None:
    op.drop_index(op.f("ix_flashcards_due_date"), table_name="flashcards")
    op.drop_index(op.f("ix_flashcards_lesson_id"), table_name="flashcards")
    op.drop_index(op.f("ix_flashcards_user_id"), table_name="flashcards")
    op.drop_table("flashcards")
