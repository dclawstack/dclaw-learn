"""XP and streak awarding tests."""

from datetime import date, timedelta

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import create_access_token, hash_password
from app.models import Course, Lesson, User, UserProgress


async def _make_user(db: AsyncSession, email: str = "streak@test.com") -> User:
    user = User(email=email, name="Streak User", hashed_password=hash_password("pass"))
    db.add(user)
    await db.flush()
    return user


async def _make_enrolled_course(db: AsyncSession, user: User) -> tuple[Course, Lesson]:
    course = Course(
        title="Streak Course",
        description="test",
        category="test",
        difficulty="beginner",
        estimated_hours=1,
    )
    db.add(course)
    await db.flush()
    lesson = Lesson(course_id=course.id, title="L1", content="content", order_index=0)
    db.add(lesson)
    await db.flush()
    progress = UserProgress(user_id=user.id, course_id=course.id)
    db.add(progress)
    await db.commit()
    return course, lesson


@pytest.mark.asyncio
async def test_completing_lesson_awards_xp(client: AsyncClient, db_session: AsyncSession) -> None:
    """Completing a lesson adds 10 XP to the user."""
    user = await _make_user(db_session, "xp@test.com")
    course, lesson = await _make_enrolled_course(db_session, user)
    token = create_access_token(user.id)

    resp = await client.post(
        f"/api/v1/learn/courses/{course.id}/lessons/{lesson.id}/complete",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200

    await db_session.refresh(user)
    assert user.xp_total == 10


@pytest.mark.asyncio
async def test_streak_starts_at_one(client: AsyncClient, db_session: AsyncSession) -> None:
    """First lesson completion sets streak to 1."""
    user = await _make_user(db_session, "streak1@test.com")
    course, lesson = await _make_enrolled_course(db_session, user)
    token = create_access_token(user.id)

    await client.post(
        f"/api/v1/learn/courses/{course.id}/lessons/{lesson.id}/complete",
        headers={"Authorization": f"Bearer {token}"},
    )

    await db_session.refresh(user)
    assert user.streak_days == 1
    assert user.last_streak_date == date.today()


@pytest.mark.asyncio
async def test_streak_increments_on_consecutive_day(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """Streak increments when last activity was yesterday."""
    user = await _make_user(db_session, "streak2@test.com")
    user.streak_days = 3
    user.last_streak_date = date.today() - timedelta(days=1)
    db_session.add(user)
    course, lesson = await _make_enrolled_course(db_session, user)
    token = create_access_token(user.id)

    await client.post(
        f"/api/v1/learn/courses/{course.id}/lessons/{lesson.id}/complete",
        headers={"Authorization": f"Bearer {token}"},
    )

    await db_session.refresh(user)
    assert user.streak_days == 4


@pytest.mark.asyncio
async def test_streak_resets_after_gap(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """Streak resets to 1 when last activity was more than 1 day ago."""
    user = await _make_user(db_session, "streak3@test.com")
    user.streak_days = 10
    user.last_streak_date = date.today() - timedelta(days=3)
    db_session.add(user)
    course, lesson = await _make_enrolled_course(db_session, user)
    token = create_access_token(user.id)

    await client.post(
        f"/api/v1/learn/courses/{course.id}/lessons/{lesson.id}/complete",
        headers={"Authorization": f"Bearer {token}"},
    )

    await db_session.refresh(user)
    assert user.streak_days == 1


@pytest.mark.asyncio
async def test_get_my_stats(client: AsyncClient, db_session: AsyncSession) -> None:
    """GET /me/stats returns XP and streak for authenticated user."""
    user = await _make_user(db_session, "stats@test.com")
    user.xp_total = 50
    user.streak_days = 5
    user.last_streak_date = date.today()
    db_session.add(user)
    await db_session.commit()
    token = create_access_token(user.id)

    resp = await client.get(
        "/api/v1/learn/me/stats",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["xp_total"] == 50
    assert data["streak_days"] == 5
