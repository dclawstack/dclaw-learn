"""Full-text search across courses and lessons."""

import uuid

from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Course, Lesson

router = APIRouter()


class LessonSearchResult(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    course_id: uuid.UUID
    course_title: str = ""


class CourseSearchResult(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str | None
    category: str
    difficulty: str
    estimated_hours: int


class SearchResponse(BaseModel):
    query: str
    courses: list[CourseSearchResult]
    lessons: list[LessonSearchResult]
    total: int


@router.get("/search", response_model=SearchResponse)
async def search(
    q: str = "",
    db: AsyncSession = Depends(get_db),
) -> SearchResponse:
    """Search courses and lessons by keyword."""
    if not q.strip():
        return SearchResponse(query=q, courses=[], lessons=[], total=0)

    pattern = f"%{q.strip()}%"

    course_result = await db.execute(
        select(Course).where(
            Course.title.ilike(pattern) | Course.description.ilike(pattern)
        )
    )
    courses = course_result.scalars().all()

    lesson_result = await db.execute(
        select(Lesson).where(
            Lesson.title.ilike(pattern) | Lesson.content.ilike(pattern)
        )
    )
    lessons = lesson_result.scalars().all()

    # Attach course titles to lesson results
    course_map: dict[uuid.UUID, str] = {c.id: c.title for c in courses}
    # For lessons whose course isn't already in results, fetch titles
    missing_course_ids = {l.course_id for l in lessons if l.course_id not in course_map}
    if missing_course_ids:
        extra = await db.execute(
            select(Course).where(Course.id.in_(missing_course_ids))
        )
        for c in extra.scalars().all():
            course_map[c.id] = c.title

    lesson_results = [
        LessonSearchResult(
            id=l.id,
            title=l.title,
            course_id=l.course_id,
            course_title=course_map.get(l.course_id, ""),
        )
        for l in lessons
    ]

    course_results = [CourseSearchResult.model_validate(c) for c in courses]

    return SearchResponse(
        query=q,
        courses=course_results,
        lessons=lesson_results,
        total=len(course_results) + len(lesson_results),
    )
