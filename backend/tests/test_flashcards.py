"""Spaced repetition flashcard tests."""

from datetime import datetime, timedelta, timezone

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import create_access_token, hash_password
from app.models import Course, Flashcard, Lesson, User
from app.routers.flashcards import _sm2_update


# ── SM-2 unit tests ──────────────────────────────────────────────────────────

def test_sm2_perfect_score_increases_interval() -> None:
    """Quality 5 (perfect) increases interval."""
    ef, interval = _sm2_update(2.5, 6, 2, 5)
    assert interval > 6
    assert ef > 2.5


def test_sm2_low_quality_resets_interval() -> None:
    """Quality < 3 resets interval to 1."""
    _, interval = _sm2_update(2.5, 10, 5, 1)
    assert interval == 1


def test_sm2_ease_factor_floor() -> None:
    """Ease factor never drops below 1.3."""
    ef, _ = _sm2_update(1.3, 1, 0, 0)
    assert ef >= 1.3


def test_sm2_first_review_interval_is_1() -> None:
    """First review (review_count=0) interval is 1 regardless of quality."""
    _, interval = _sm2_update(2.5, 1, 0, 5)
    assert interval == 1


def test_sm2_second_review_interval_is_6() -> None:
    """Second review (review_count=1) with passing quality gives interval 6."""
    _, interval = _sm2_update(2.5, 1, 1, 4)
    assert interval == 6


# ── API tests ────────────────────────────────────────────────────────────────

async def _setup(db: AsyncSession, email: str) -> tuple[User, Lesson]:
    user = User(email=email, name="FC User", hashed_password=hash_password("pass"))
    db.add(user)
    course = Course(title="FC Course", description="", category="test", difficulty="beginner", estimated_hours=1)
    db.add(course)
    await db.flush()
    lesson = Lesson(course_id=course.id, title="FC Lesson", content="Python is a programming language. Variables store data. Functions are reusable blocks.", order_index=0)
    db.add(lesson)
    await db.commit()
    return user, lesson


@pytest.mark.asyncio
async def test_generate_flashcards(client: AsyncClient, db_session: AsyncSession) -> None:
    """Generate endpoint creates flashcards for the lesson."""
    user, lesson = await _setup(db_session, "fc1@test.com")
    token = create_access_token(user.id)

    resp = await client.post(
        f"/api/v1/learn/lessons/{lesson.id}/flashcards/generate",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert len(data) >= 1
    assert all("front" in c and "back" in c for c in data)


@pytest.mark.asyncio
async def test_review_updates_schedule(client: AsyncClient, db_session: AsyncSession) -> None:
    """Reviewing a flashcard updates its due_date and interval."""
    user, lesson = await _setup(db_session, "fc2@test.com")
    token = create_access_token(user.id)

    gen_resp = await client.post(
        f"/api/v1/learn/lessons/{lesson.id}/flashcards/generate",
        headers={"Authorization": f"Bearer {token}"},
    )
    card_id = gen_resp.json()[0]["id"]

    review_resp = await client.post(
        f"/api/v1/learn/flashcards/{card_id}/review",
        json={"quality": 5},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert review_resp.status_code == 200
    data = review_resp.json()
    assert data["interval_days"] >= 1


@pytest.mark.asyncio
async def test_due_cards_returned(client: AsyncClient, db_session: AsyncSession) -> None:
    """GET /flashcards/due returns cards due now."""
    user, lesson = await _setup(db_session, "fc3@test.com")
    token = create_access_token(user.id)

    await client.post(
        f"/api/v1/learn/lessons/{lesson.id}/flashcards/generate",
        headers={"Authorization": f"Bearer {token}"},
    )

    resp = await client.get(
        "/api/v1/learn/flashcards/due",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    # Cards were just created with due_date=now, so they should all be due
    assert len(resp.json()) >= 1


@pytest.mark.asyncio
async def test_review_other_user_card_forbidden(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """Cannot review another user's flashcard."""
    user1, lesson = await _setup(db_session, "fc4@test.com")
    user2 = User(email="fc5@test.com", name="Other", hashed_password=hash_password("pass"))
    db_session.add(user2)
    await db_session.commit()

    token1 = create_access_token(user1.id)
    gen_resp = await client.post(
        f"/api/v1/learn/lessons/{lesson.id}/flashcards/generate",
        headers={"Authorization": f"Bearer {token1}"},
    )
    card_id = gen_resp.json()[0]["id"]

    token2 = create_access_token(user2.id)
    resp = await client.post(
        f"/api/v1/learn/flashcards/{card_id}/review",
        json={"quality": 3},
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert resp.status_code == 403
