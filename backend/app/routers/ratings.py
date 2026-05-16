"""Course rating and review router."""

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user, get_optional_user
from app.database import get_db
from app.models import Course, CourseRating, User
from app.schemas import CourseRatingCreate, CourseRatingResponse, CourseRatingSummary

router = APIRouter()


@router.post("/courses/{course_id}/ratings", response_model=CourseRatingResponse, status_code=201)
async def create_rating(
    course_id: uuid.UUID,
    request: CourseRatingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CourseRatingResponse:
    """Submit a star rating and review for a course."""
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    existing = await db.execute(
        select(CourseRating).where(
            CourseRating.user_id == current_user.id,
            CourseRating.course_id == course_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Already rated this course")

    rating = CourseRating(
        user_id=current_user.id,
        course_id=course_id,
        stars=request.stars,
        review=request.review,
    )
    db.add(rating)
    await db.commit()
    await db.refresh(rating)
    return CourseRatingResponse.model_validate(rating)


@router.get("/courses/{course_id}/ratings", response_model=CourseRatingSummary)
async def get_ratings(
    course_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User | None = Depends(get_optional_user),
) -> CourseRatingSummary:
    """Get all ratings and average score for a course."""
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    result = await db.execute(
        select(CourseRating).where(CourseRating.course_id == course_id)
    )
    ratings = result.scalars().all()
    avg = round(sum(r.stars for r in ratings) / len(ratings), 2) if ratings else 0.0
    return CourseRatingSummary(
        avg_rating=avg,
        rating_count=len(ratings),
        ratings=[CourseRatingResponse.model_validate(r) for r in ratings],
    )
