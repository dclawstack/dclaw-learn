"""Dashboard aggregate data router."""

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_optional_user
from app.database import get_db
from app.models import Course, User, UserProgress
from app.schemas import CourseResponse, DashboardResponse

router = APIRouter()


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
) -> DashboardResponse:
    """Return aggregate dashboard metrics from the database."""
    courses_result = await db.execute(select(Course))
    courses = courses_result.scalars().all()

    progress_result = await db.execute(
        select(
            func.count(UserProgress.id),
            func.coalesce(func.max(UserProgress.streak_days), 0),
            func.coalesce(func.sum(UserProgress.overall_score), 0.0),
        )
    )
    total_enrollments, max_streak, total_score = progress_result.one_or_none() or (0, 0, 0.0)

    enrolled_course_ids_result = await db.execute(
        select(UserProgress.course_id).distinct()
    )
    enrolled_course_ids = [row[0] for row in enrolled_course_ids_result.all()]

    total_hours = 0
    if enrolled_course_ids:
        hours_result = await db.execute(
            select(func.coalesce(func.sum(Course.estimated_hours), 0)).where(
                Course.id.in_(enrolled_course_ids)
            )
        )
        total_hours = hours_result.scalar() or 0

    recent_activity = []
    if total_enrollments > 0:
        recent = await db.execute(
            select(UserProgress).order_by(UserProgress.enrolled_at.desc()).limit(5)
        )
        for p in recent.scalars().all():
            recent_activity.append(
                {
                    "type": "enrollment",
                    "course_id": str(p.course_id),
                    "score": p.overall_score,
                    "streak": p.streak_days,
                    "at": p.enrolled_at.isoformat(),
                }
            )

    # Simple recommendations: courses not yet enrolled, same categories as user's courses
    recommendations: list[CourseResponse] = []
    if current_user:
        user_progress_result = await db.execute(
            select(UserProgress).where(UserProgress.user_id == current_user.id)
        )
        user_enrollments = user_progress_result.scalars().all()
        enrolled_ids = {e.course_id for e in user_enrollments}

        if enrolled_ids:
            enrolled_cats_result = await db.execute(
                select(Course.category).where(Course.id.in_(enrolled_ids)).distinct()
            )
            categories = [r[0] for r in enrolled_cats_result.all()]
            rec_result = await db.execute(
                select(Course)
                .where(Course.id.notin_(enrolled_ids), Course.category.in_(categories))
                .limit(4)
            )
            recommendations = [CourseResponse.model_validate(c) for c in rec_result.scalars().all()]

    return DashboardResponse(
        enrolled_courses=[CourseResponse.model_validate(c) for c in courses],
        total_courses_completed=total_enrollments,
        streak_days=max_streak,
        total_hours_studied=float(total_hours),
        recent_activity=recent_activity,
        recommendations=recommendations,
    )
