"""Content recommendation router."""

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_optional_user
from app.database import get_db
from app.models import Course, User, UserProgress
from app.schemas import CourseListResponse, CourseResponse

router = APIRouter()


@router.get("/recommendations", response_model=CourseListResponse)
async def get_recommendations(
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
) -> CourseListResponse:
    """Return course recommendations based on enrolled courses and difficulty progression."""
    enrolled_course_ids: set[uuid.UUID] = set()
    enrolled_categories: set[str] = set()
    enrolled_difficulties: list[str] = []

    if current_user:
        progress_result = await db.execute(
            select(UserProgress).where(UserProgress.user_id == current_user.id)
        )
        enrollments = progress_result.scalars().all()
        enrolled_course_ids = {e.course_id for e in enrollments}

        if enrolled_course_ids:
            enrolled_courses_result = await db.execute(
                select(Course).where(Course.id.in_(enrolled_course_ids))
            )
            for c in enrolled_courses_result.scalars().all():
                enrolled_categories.add(c.category)
                enrolled_difficulties.append(c.difficulty)

    difficulty_order = ["beginner", "intermediate", "advanced"]
    next_difficulty: str | None = None
    if enrolled_difficulties:
        max_idx = max(
            difficulty_order.index(d)
            for d in enrolled_difficulties
            if d in difficulty_order
        )
        if max_idx < len(difficulty_order) - 1:
            next_difficulty = difficulty_order[max_idx + 1]

    # Find courses not already enrolled, preferring same category + next difficulty
    stmt = select(Course)
    if enrolled_course_ids:
        stmt = stmt.where(Course.id.notin_(enrolled_course_ids))

    result = await db.execute(stmt)
    all_courses = result.scalars().all()

    def _score(course: Course) -> int:
        score = 0
        if course.category in enrolled_categories:
            score += 2
        if next_difficulty and course.difficulty == next_difficulty:
            score += 3
        return score

    ranked = sorted(all_courses, key=_score, reverse=True)[:6]
    return CourseListResponse(
        items=[CourseResponse.model_validate(c) for c in ranked],
        total=len(ranked),
    )
