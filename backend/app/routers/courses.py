"""Course management router."""

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Course, Lesson, UserProgress
from app.schemas import (
    CourseCreate,
    CourseDetailResponse,
    CourseListResponse,
    CourseResponse,
    CourseSearchRequest,
    EnrollRequest,
    EnrollResponse,
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
) -> EnrollResponse:
    """Enroll the current user in a course."""
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    user_id = request.user_id if request and request.user_id else uuid.uuid4()
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
