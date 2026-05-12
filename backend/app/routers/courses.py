"""Course management router."""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_optional_user
from app.database import get_db
from app.models import Course, Lesson, User, UserProgress
from app.schemas import (
    CourseCreate,
    CourseDetailResponse,
    CourseListResponse,
    CourseResponse,
    CourseSearchRequest,
    EnrollRequest,
    EnrollResponse,
    LessonCompleteResponse,
)

router = APIRouter()


@router.post("/courses", response_model=CourseListResponse)
async def list_courses(
    request: CourseSearchRequest | None = None,
    db: AsyncSession = Depends(get_db),
) -> CourseListResponse:
    """List and search courses with optional filtering."""
    stmt = select(Course)
    if request:
        if request.query:
            stmt = stmt.where(
                Course.title.ilike(f"%{request.query}%")
                | Course.description.ilike(f"%{request.query}%")
            )
        if request.category:
            stmt = stmt.where(Course.category == request.category)
        if request.difficulty:
            stmt = stmt.where(Course.difficulty == request.difficulty)
    result = await db.execute(stmt)
    items = result.scalars().all()
    return CourseListResponse(
        items=[CourseResponse.model_validate(i) for i in items],
        total=len(items),
    )


@router.post("/courses/{course_id}/enroll", response_model=EnrollResponse)
async def enroll_course(
    course_id: uuid.UUID,
    request: EnrollRequest | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
) -> EnrollResponse:
    """Enroll the current user in a course."""
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    user_id = (
        current_user.id
        if current_user
        else (request.user_id if request and request.user_id else uuid.uuid4())
    )
    existing = await db.execute(
        select(UserProgress).where(
            UserProgress.user_id == user_id,
            UserProgress.course_id == course_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Already enrolled")

    enrollment = UserProgress(
        user_id=user_id,
        course_id=course_id,
    )
    db.add(enrollment)
    await db.commit()
    await db.refresh(enrollment)
    return EnrollResponse(
        enrollment_id=enrollment.id,
        course_id=course_id,
    )


@router.get("/courses/{course_id}", response_model=CourseDetailResponse)
async def get_course(
    course_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> CourseDetailResponse:
    """Get a single course with its lessons."""
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return CourseDetailResponse.model_validate(course)


@router.post(
    "/courses/{course_id}/lessons/{lesson_id}/complete",
    response_model=LessonCompleteResponse,
)
async def complete_lesson(
    course_id: uuid.UUID,
    lesson_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
) -> LessonCompleteResponse:
    """Mark a lesson as completed for the current user."""
    lesson = await db.get(Lesson, lesson_id)
    if not lesson or lesson.course_id != course_id:
        raise HTTPException(status_code=404, detail="Lesson not found")

    user_id = current_user.id if current_user else uuid.uuid4()

    result = await db.execute(
        select(UserProgress).where(
            UserProgress.user_id == user_id,
            UserProgress.course_id == course_id,
        )
    )
    progress = result.scalar_one_or_none()
    if not progress:
        raise HTTPException(status_code=404, detail="Not enrolled in this course")

    lesson_id_str = str(lesson_id)
    completed_ids: list[str] = [str(lid) for lid in progress.completed_lesson_ids]
    if lesson_id_str not in completed_ids:
        completed_ids.append(lesson_id_str)
        progress.completed_lesson_ids = completed_ids  # type: ignore[assignment]

    total_result = await db.execute(
        select(func.count(Lesson.id)).where(Lesson.course_id == course_id)
    )
    total_lessons = total_result.scalar() or 0
    completion_pct = (len(completed_ids) / total_lessons * 100) if total_lessons > 0 else 0.0
    course_completed = total_lessons > 0 and len(completed_ids) >= total_lessons

    if course_completed and progress.completed_at is None:
        progress.completed_at = datetime.now(timezone.utc)

    await db.commit()

    return LessonCompleteResponse(
        lesson_id=lesson_id,
        completed_lesson_ids=completed_ids,
        completion_percentage=completion_pct,
        course_completed=course_completed,
    )
