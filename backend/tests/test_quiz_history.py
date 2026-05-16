"""Quiz attempt history tests."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import create_access_token, hash_password
from app.models import Quiz, User


async def _make_user(db: AsyncSession, email: str) -> User:
    user = User(email=email, name="Quiz User", hashed_password=hash_password("pass"))
    db.add(user)
    await db.flush()
    await db.commit()
    return user


async def _make_quiz(db: AsyncSession) -> Quiz:
    quiz = Quiz(
        title="Test Quiz",
        questions=[
            {"question": "Q1?", "options": ["A", "B", "C", "D"], "correct_index": 0, "explanation": "A is right"},
        ],
    )
    db.add(quiz)
    await db.flush()
    await db.commit()
    return quiz


@pytest.mark.asyncio
async def test_submit_saves_attempt_for_auth_user(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """Authenticated quiz submission persists an attempt."""
    user = await _make_user(db_session, "quizuser1@test.com")
    quiz = await _make_quiz(db_session)
    token = create_access_token(user.id)

    resp = await client.post(
        f"/api/v1/learn/quiz/{quiz.id}/submit",
        json={"answers": [0]},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["attempt_id"] is not None
    assert data["score"] == 1
    assert data["percentage"] == 100.0


@pytest.mark.asyncio
async def test_submit_no_attempt_for_anon(client: AsyncClient, db_session: AsyncSession) -> None:
    """Anonymous quiz submission returns no attempt_id."""
    quiz = await _make_quiz(db_session)
    resp = await client.post(
        f"/api/v1/learn/quiz/{quiz.id}/submit",
        json={"answers": [0]},
    )
    assert resp.status_code == 200
    assert resp.json()["attempt_id"] is None


@pytest.mark.asyncio
async def test_quiz_history_returns_attempts(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """GET /quiz/{id}/history returns past attempts for the user."""
    user = await _make_user(db_session, "quizuser2@test.com")
    quiz = await _make_quiz(db_session)
    token = create_access_token(user.id)

    # Submit twice
    for _ in range(2):
        await client.post(
            f"/api/v1/learn/quiz/{quiz.id}/submit",
            json={"answers": [0]},
            headers={"Authorization": f"Bearer {token}"},
        )

    resp = await client.get(
        f"/api/v1/learn/quiz/{quiz.id}/history",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    assert all(a["score"] == 100.0 for a in data)


@pytest.mark.asyncio
async def test_quiz_history_empty_for_anon(client: AsyncClient, db_session: AsyncSession) -> None:
    """Anonymous user gets empty history."""
    quiz = await _make_quiz(db_session)
    resp = await client.get(f"/api/v1/learn/quiz/{quiz.id}/history")
    assert resp.status_code == 200
    assert resp.json() == []
