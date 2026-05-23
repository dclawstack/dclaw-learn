"""Course management router."""

import uuid
from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_optional_user, require_instructor
from app.database import get_db
from app.models import Course, CourseRating, Lesson, User, UserProgress
from app.schemas import (
    CourseCreate,
    CourseDetailResponse,
    CourseListResponse,
    CourseResponse,
    CourseSearchRequest,
    EnrollRequest,
    EnrollResponse,
    InstructorCourseStats,
    InstructorDashboardResponse,
    LessonCompleteResponse,
    LessonCreate,
    NextLessonResponse,
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


@router.get("/instructor/dashboard", response_model=InstructorDashboardResponse)
async def instructor_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_instructor),
) -> InstructorDashboardResponse:
    """Instructor dashboard: their courses with enrollment counts and avg ratings."""
    courses_result = await db.execute(
        select(Course).where(Course.instructor_id == current_user.id)
    )
    courses = courses_result.scalars().all()

    stats = []
    total_students = 0
    for course in courses:
        enroll_result = await db.execute(
            select(func.count(UserProgress.id)).where(UserProgress.course_id == course.id)
        )
        count = enroll_result.scalar() or 0
        total_students += count

        rating_result = await db.execute(
            select(CourseRating).where(CourseRating.course_id == course.id)
        )
        ratings = rating_result.scalars().all()
        avg = round(sum(r.stars for r in ratings) / len(ratings), 2) if ratings else 0.0

        stats.append(InstructorCourseStats(
            course_id=course.id,
            course_title=course.title,
            enrollment_count=count,
            avg_rating=avg,
        ))

    return InstructorDashboardResponse(courses=stats, total_students=total_students)


@router.post("/instructor/courses", response_model=CourseResponse, status_code=201)
async def create_course(
    request: CourseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_instructor),
) -> CourseResponse:
    """Create a new course (instructor only)."""
    course = Course(
        instructor_id=current_user.id,
        title=request.title,
        description=request.description,
        category=request.category,
        difficulty=request.difficulty,
        estimated_hours=request.estimated_hours,
    )
    db.add(course)
    await db.commit()
    await db.refresh(course)
    return CourseResponse.model_validate(course)


@router.post("/instructor/courses/{course_id}/lessons", response_model=CourseDetailResponse, status_code=201)
async def add_lesson(
    course_id: uuid.UUID,
    request: LessonCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_instructor),
) -> CourseDetailResponse:
    """Add a lesson to a course (instructor only)."""
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.instructor_id and course.instructor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your course")

    lesson = Lesson(
        course_id=course_id,
        title=request.title,
        content=request.content,
        order_index=request.order_index,
        duration_minutes=request.duration_minutes,
        video_url=request.video_url,
        video_duration=request.video_duration,
    )
    db.add(lesson)
    await db.commit()
    await db.refresh(course)
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

    # Award XP and update streak for authenticated users
    if current_user:
        current_user.xp_total = (current_user.xp_total or 0) + 10
        today = date.today()
        last = current_user.last_streak_date
        if last is None or (today - last).days > 1:
            current_user.streak_days = 1
        elif (today - last).days == 1:
            current_user.streak_days = (current_user.streak_days or 0) + 1
        # same day: no change to streak_days
        current_user.last_streak_date = today

    await db.commit()

    return LessonCompleteResponse(
        lesson_id=lesson_id,
        completed_lesson_ids=completed_ids,
        completion_percentage=completion_pct,
        course_completed=course_completed,
    )


@router.get("/courses/{course_id}/next-lesson", response_model=NextLessonResponse)
async def get_next_lesson(
    course_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
) -> NextLessonResponse:
    """Return the recommended next lesson with adaptive difficulty adjustment."""
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    lessons_result = await db.execute(
        select(Lesson).where(Lesson.course_id == course_id).order_by(Lesson.order_index)
    )
    lessons = lessons_result.scalars().all()
    if not lessons:
        return NextLessonResponse(
            lesson_id=None,
            lesson_title=None,
            difficulty_adjustment="normal",
            mastery_score=0.0,
            message="No lessons in this course yet.",
        )

    mastery = 0.0
    completed_ids: set[str] = set()

    if current_user:
        prog_result = await db.execute(
            select(UserProgress).where(
                UserProgress.user_id == current_user.id,
                UserProgress.course_id == course_id,
            )
        )
        progress = prog_result.scalar_one_or_none()
        if progress:
            mastery = progress.mastery_score
            completed_ids = {str(lid) for lid in progress.completed_lesson_ids}

    # Find first incomplete lesson
    next_lesson = next(
        (l for l in lessons if str(l.id) not in completed_ids), None
    )

    if next_lesson is None:
        return NextLessonResponse(
            lesson_id=None,
            lesson_title=None,
            difficulty_adjustment="normal",
            mastery_score=mastery,
            message="You have completed all lessons in this course.",
        )

    # Determine adjustment
    if mastery >= 0.85:
        adjustment = "accelerated"
        message = "You're excelling — moving to advanced content."
    elif mastery > 0 and mastery < 0.5:
        adjustment = "remediation"
        message = "Let's review before continuing. Check your flashcards."
    else:
        adjustment = "normal"
        message = "Keep going!"

    return NextLessonResponse(
        lesson_id=next_lesson.id,
        lesson_title=next_lesson.title,
        difficulty_adjustment=adjustment,
        mastery_score=mastery,
        message=message,
    )
