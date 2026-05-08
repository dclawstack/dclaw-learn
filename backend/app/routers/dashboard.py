"""Dashboard aggregate data router."""

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Course, UserProgress
from app.schemas import CourseResponse, DashboardResponse

router = APIRouter()


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(db: AsyncSession = Depends(get_db)) -> DashboardResponse:
    """Return aggregate dashboard metrics from the database."""
    # All courses
    courses_result = await db.execute(select(Course))
    courses = courses_result.scalars().all()

    # User progress aggregates
    progress_result = await db.execute(
        select(
            func.count(UserProgress.id),
            func.coalesce(func.max(UserProgress.streak_days), 0),
            func.coalesce(func.sum(UserProgress.overall_score), 0.0),
        )
    )
    total_enrollments, max_streak, total_score = progress_result.one_or_none() or (0, 0, 0.0)

    # Total "hours studied" — sum estimated_hours for courses with at least one enrollment
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

    return DashboardResponse(
        enrolled_courses=[CourseResponse.model_validate(c) for c in courses],
        total_courses_completed=total_enrollments,
        streak_days=max_streak,
        total_hours_studied=float(total_hours),
        recent_activity=recent_activity,
    )
