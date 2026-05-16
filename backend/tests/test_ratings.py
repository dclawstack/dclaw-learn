"""Course ratings router tests."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import create_access_token, hash_password
from app.models import Course, User


async def _make_user(db: AsyncSession, email: str) -> User:
    user = User(email=email, name="Rater", hashed_password=hash_password("pass"))
    db.add(user)
    await db.flush()
    return user


async def _make_course(db: AsyncSession) -> Course:
    course = Course(
        title="Rated Course",
        description="desc",
        category="test",
        difficulty="beginner",
        estimated_hours=5,
    )
    db.add(course)
    await db.flush()
    await db.commit()
    return course


@pytest.mark.asyncio
async def test_create_rating(client: AsyncClient, db_session: AsyncSession) -> None:
    """Authenticated user can rate a course."""
    user = await _make_user(db_session, "rater1@test.com")
    course = await _make_course(db_session)
    token = create_access_token(user.id)

    resp = await client.post(
        f"/api/v1/learn/courses/{course.id}/ratings",
        json={"stars": 5, "review": "Great course!"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["stars"] == 5
    assert data["review"] == "Great course!"


@pytest.mark.asyncio
async def test_duplicate_rating_rejected(client: AsyncClient, db_session: AsyncSession) -> None:
    """User cannot rate the same course twice."""
    user = await _make_user(db_session, "rater2@test.com")
    course = await _make_course(db_session)
    token = create_access_token(user.id)

    await client.post(
        f"/api/v1/learn/courses/{course.id}/ratings",
        json={"stars": 4, "review": "Good"},
        headers={"Authorization": f"Bearer {token}"},
    )
    resp = await client.post(
        f"/api/v1/learn/courses/{course.id}/ratings",
        json={"stars": 3, "review": "Changed mind"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_get_ratings_summary(client: AsyncClient, db_session: AsyncSession) -> None:
    """GET /courses/{id}/ratings returns avg and count."""
    user1 = await _make_user(db_session, "rater3@test.com")
    user2 = await _make_user(db_session, "rater4@test.com")
    course = await _make_course(db_session)

    for user, stars in [(user1, 4), (user2, 2)]:
        token = create_access_token(user.id)
        await client.post(
            f"/api/v1/learn/courses/{course.id}/ratings",
            json={"stars": stars, "review": ""},
            headers={"Authorization": f"Bearer {token}"},
        )

    resp = await client.get(f"/api/v1/learn/courses/{course.id}/ratings")
    assert resp.status_code == 200
    data = resp.json()
    assert data["rating_count"] == 2
    assert data["avg_rating"] == 3.0


@pytest.mark.asyncio
async def test_rating_requires_auth(client: AsyncClient, db_session: AsyncSession) -> None:
    """Unauthenticated request to rate returns 401."""
    course = await _make_course(db_session)
    resp = await client.post(
        f"/api/v1/learn/courses/{course.id}/ratings",
        json={"stars": 5, "review": ""},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_rating_out_of_range_rejected(client: AsyncClient, db_session: AsyncSession) -> None:
    """Stars must be 1–5; 0 or 6 are rejected."""
    user = await _make_user(db_session, "rater5@test.com")
    course = await _make_course(db_session)
    token = create_access_token(user.id)

    for bad_stars in [0, 6]:
        resp = await client.post(
            f"/api/v1/learn/courses/{course.id}/ratings",
            json={"stars": bad_stars, "review": ""},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 422
