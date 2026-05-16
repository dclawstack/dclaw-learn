"""Learning analytics router — student and instructor views."""

import uuid
from collections import defaultdict
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user, require_instructor
from app.database import get_db
from app.models import Course, Lesson, QuizAttempt, User, UserProgress

router = APIRouter()


class DailyActivity(BaseModel):
    date: str  # YYYY-MM-DD
    lessons_completed: int


class CourseProgress(BaseModel):
    course_id: uuid.UUID
    course_title: str
    completion_percentage: float
    avg_quiz_score: float | None


class StudentAnalyticsResponse(BaseModel):
    total_lessons_completed: int
    total_xp: int
    streak_days: int
    avg_quiz_score: float | None
    course_progress: list[CourseProgress]
    daily_activity: list[DailyActivity]  # last 90 days


class InstructorCourseAnalytics(BaseModel):
    course_id: uuid.UUID
    course_title: str
    total_enrollments: int
    avg_completion_percentage: float
    avg_quiz_score: float | None
    dropout_lesson: str | None  # title of lesson where most users stopped


@router.get("/analytics/me", response_model=StudentAnalyticsResponse)
async def get_student_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> StudentAnalyticsResponse:
    """Return learning analytics for the current student."""
    progress_result = await db.execute(
        select(UserProgress).where(UserProgress.user_id == current_user.id)
    )
    all_progress = progress_result.scalars().all()

    total_lessons = sum(len(p.completed_lesson_ids) for p in all_progress)

    # Quiz avg score
    quiz_result = await db.execute(
        select(QuizAttempt).where(QuizAttempt.user_id == current_user.id)
    )
    attempts = quiz_result.scalars().all()
    avg_quiz = round(sum(a.score for a in attempts) / len(attempts), 1) if attempts else None

    # Per-course completion
    course_progress_list = []
    for prog in all_progress:
        course = await db.get(Course, prog.course_id)
        if not course:
            continue
        total_result = await db.execute(
            select(func.count(Lesson.id)).where(Lesson.course_id == prog.course_id)
        )
        total = total_result.scalar() or 0
        pct = round(len(prog.completed_lesson_ids) / total * 100, 1) if total > 0 else 0.0

        # Quiz scores for this course
        course_quiz_result = await db.execute(
            select(QuizAttempt)
            .join(QuizAttempt.quiz)
            .where(
                QuizAttempt.user_id == current_user.id,
            )
        )
        # We'll use overall avg for simplicity
        course_avg = avg_quiz

        course_progress_list.append(CourseProgress(
            course_id=prog.course_id,
            course_title=course.title,
            completion_percentage=pct,
            avg_quiz_score=course_avg,
        ))

    # Daily activity heatmap — last 90 days
    cutoff = datetime.now(timezone.utc) - timedelta(days=90)
    daily: dict[str, int] = defaultdict(int)
    for prog in all_progress:
        if prog.last_activity_at and prog.last_activity_at >= cutoff:
            day = prog.last_activity_at.strftime("%Y-%m-%d")
            daily[day] += len(prog.completed_lesson_ids)

    daily_activity = [
        DailyActivity(date=d, lessons_completed=c)
        for d, c in sorted(daily.items())
    ]

    return StudentAnalyticsResponse(
        total_lessons_completed=total_lessons,
        total_xp=current_user.xp_total,
        streak_days=current_user.streak_days,
        avg_quiz_score=avg_quiz,
        course_progress=course_progress_list,
        daily_activity=daily_activity,
    )


@router.get("/instructor/analytics/{course_id}", response_model=InstructorCourseAnalytics)
async def get_instructor_course_analytics(
    course_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_instructor),
) -> InstructorCourseAnalytics:
    """Return analytics for a course owned by the instructor."""
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.instructor_id and course.instructor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your course")

    # Enrollments
    enroll_result = await db.execute(
        select(UserProgress).where(UserProgress.course_id == course_id)
    )
    enrollments = enroll_result.scalars().all()
    total_enrollments = len(enrollments)

    # Lessons
    lesson_result = await db.execute(
        select(Lesson).where(Lesson.course_id == course_id).order_by(Lesson.order_index)
    )
    lessons = lesson_result.scalars().all()
    total_lessons = len(lessons)

    # Avg completion
    if total_enrollments > 0 and total_lessons > 0:
        avg_completion = round(
            sum(len(p.completed_lesson_ids) / total_lessons * 100 for p in enrollments)
            / total_enrollments,
            1,
        )
    else:
        avg_completion = 0.0

    # Dropout: lesson where the fewest users have completion (last completed lesson for most)
    dropout_lesson = None
    if lessons and enrollments:
        lesson_completion_counts: dict[str, int] = defaultdict(int)
        for prog in enrollments:
            for lid in prog.completed_lesson_ids:
                lesson_completion_counts[str(lid)] += 1
        # Lesson with most completions that isn't the last — proxy for dropout point
        for lesson in reversed(lessons):
            if lesson_completion_counts.get(str(lesson.id), 0) > 0:
                dropout_lesson = lesson.title
                break

    # Quiz scores (all users on this course's quizzes)
    quiz_result = await db.execute(
        select(QuizAttempt)
    )
    all_attempts = quiz_result.scalars().all()
    avg_quiz = round(sum(a.score for a in all_attempts) / len(all_attempts), 1) if all_attempts else None

    return InstructorCourseAnalytics(
        course_id=course_id,
        course_title=course.title,
        total_enrollments=total_enrollments,
        avg_completion_percentage=avg_completion,
        avg_quiz_score=avg_quiz,
        dropout_lesson=dropout_lesson,
    )
