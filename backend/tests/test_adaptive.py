"""Adaptive difficulty engine tests."""

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import create_access_token, hash_password
from app.models import Course, Lesson, User, UserProgress


async def _setup(db: AsyncSession, email: str, mastery: float = 0.0) -> tuple[User, Course, Lesson]:
    user = User(email=email, name="U", hashed_password=hash_password("pass"))
    db.add(user)
    course = Course(title="Adaptive Course", description="", category="test", difficulty="intermediate", estimated_hours=3)
    db.add(course)
    await db.flush()
    lesson = Lesson(course_id=course.id, title="First Lesson", content="content", order_index=0)
    db.add(lesson)
    await db.flush()
    progress = UserProgress(user_id=user.id, course_id=course.id, mastery_score=mastery)
    db.add(progress)
    await db.commit()
    return user, course, lesson


@pytest.mark.asyncio
async def test_next_lesson_normal_pace(client: AsyncClient, db_session: AsyncSession) -> None:
    """User with no quiz history gets normal adjustment."""
    user, course, lesson = await _setup(db_session, "adapt1@test.com", mastery=0.0)
    token = create_access_token(user.id)

    resp = await client.get(
        f"/api/v1/learn/courses/{course.id}/next-lesson",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["lesson_id"] == str(lesson.id)
    assert data["difficulty_adjustment"] == "normal"


@pytest.mark.asyncio
async def test_next_lesson_accelerated_for_high_mastery(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """User with mastery >= 0.85 gets accelerated flag."""
    user, course, lesson = await _setup(db_session, "adapt2@test.com", mastery=0.9)
    token = create_access_token(user.id)

    resp = await client.get(
        f"/api/v1/learn/courses/{course.id}/next-lesson",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["difficulty_adjustment"] == "accelerated"
    assert "excelling" in data["message"].lower()


@pytest.mark.asyncio
async def test_next_lesson_remediation_for_low_mastery(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """User with mastery < 0.5 (but > 0) gets remediation flag."""
    user, course, lesson = await _setup(db_session, "adapt3@test.com", mastery=0.3)
    token = create_access_token(user.id)

    resp = await client.get(
        f"/api/v1/learn/courses/{course.id}/next-lesson",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["difficulty_adjustment"] == "remediation"
    assert "review" in data["message"].lower()


@pytest.mark.asyncio
async def test_next_lesson_completed_returns_none(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """When all lessons are completed, lesson_id is null."""
    user, course, lesson = await _setup(db_session, "adapt4@test.com")
    # Mark the lesson complete
    prog_result = await db_session.execute(
        select(UserProgress).where(
            UserProgress.user_id == user.id, UserProgress.course_id == course.id
        )
    )
    progress = prog_result.scalar_one()
    progress.completed_lesson_ids = [str(lesson.id)]
    await db_session.commit()

    token = create_access_token(user.id)
    resp = await client.get(
        f"/api/v1/learn/courses/{course.id}/next-lesson",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["lesson_id"] is None


@pytest.mark.asyncio
async def test_mastery_updated_after_quiz(client: AsyncClient, db_session: AsyncSession) -> None:
    """Quiz submission updates mastery_score on UserProgress."""
    from app.models import Quiz
    user, course, lesson = await _setup(db_session, "adapt5@test.com")
    token = create_access_token(user.id)

    quiz = Quiz(
        course_id=course.id,
        title="Mastery Quiz",
        questions=[
            {"question": "Q?", "options": ["A", "B", "C", "D"], "correct_index": 0, "explanation": "A"},
        ],
    )
    db_session.add(quiz)
    await db_session.commit()

    resp = await client.post(
        f"/api/v1/learn/quiz/{quiz.id}/submit",
        json={"answers": [0]},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200

    prog_result = await db_session.execute(
        select(UserProgress).where(
            UserProgress.user_id == user.id, UserProgress.course_id == course.id
        )
    )
    progress = prog_result.scalar_one()
    # 100% score → mastery 1.0
    assert progress.mastery_score == 1.0
