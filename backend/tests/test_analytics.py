"""Learning analytics router tests."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import create_access_token, hash_password
from app.models import Course, Lesson, User, UserProgress


async def _make_enrolled_user(
    db: AsyncSession, email: str, role: str = "student"
) -> tuple[User, Course, Lesson]:
    user = User(email=email, name="Analytics User", hashed_password=hash_password("pass"), role=role)
    db.add(user)
    course = Course(title="Analytics Course", description="", category="test", difficulty="beginner", estimated_hours=2)
    db.add(course)
    await db.flush()
    lesson = Lesson(course_id=course.id, title="L1", content="content", order_index=0)
    db.add(lesson)
    await db.flush()
    progress = UserProgress(
        user_id=user.id,
        course_id=course.id,
        completed_lesson_ids=[str(lesson.id)],
        overall_score=80.0,
    )
    db.add(progress)
    await db.commit()
    return user, course, lesson


@pytest.mark.asyncio
async def test_student_analytics_returns_data(client: AsyncClient, db_session: AsyncSession) -> None:
    """Student analytics endpoint returns completion and XP data."""
    user, course, lesson = await _make_enrolled_user(db_session, "analytics1@test.com")
    user.xp_total = 30
    user.streak_days = 3
    db_session.add(user)
    await db_session.commit()
    token = create_access_token(user.id)

    resp = await client.get(
        "/api/v1/learn/analytics/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_lessons_completed"] == 1
    assert data["total_xp"] == 30
    assert data["streak_days"] == 3
    assert len(data["course_progress"]) == 1
    assert data["course_progress"][0]["completion_percentage"] == 100.0


@pytest.mark.asyncio
async def test_student_analytics_requires_auth(client: AsyncClient) -> None:
    """Unauthenticated request returns 401."""
    resp = await client.get("/api/v1/learn/analytics/me")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_instructor_analytics_returns_course_data(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """Instructor course analytics returns enrollment counts."""
    instructor = User(
        email="analytics_instr@test.com",
        name="Instructor",
        hashed_password=hash_password("pass"),
        role="instructor",
    )
    db_session.add(instructor)
    course = Course(
        title="Instructor Analytics Course",
        description="",
        category="test",
        difficulty="beginner",
        estimated_hours=1,
    )
    db_session.add(course)
    await db_session.flush()
    course.instructor_id = instructor.id
    lesson = Lesson(course_id=course.id, title="L1", content="content", order_index=0)
    db_session.add(lesson)
    await db_session.flush()
    # Enroll two students
    for i in range(2):
        student = User(
            email=f"stud_a{i}@test.com",
            name="S",
            hashed_password=hash_password("pass"),
        )
        db_session.add(student)
        await db_session.flush()
        db_session.add(UserProgress(
            user_id=student.id,
            course_id=course.id,
            completed_lesson_ids=[str(lesson.id)],
        ))
    await db_session.commit()
    token = create_access_token(instructor.id)

    resp = await client.get(
        f"/api/v1/learn/instructor/analytics/{course.id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_enrollments"] == 2
    assert data["avg_completion_percentage"] == 100.0
