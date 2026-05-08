"""Course router tests."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Course


@pytest.mark.asyncio
async def test_list_courses_empty(client: AsyncClient) -> None:
    """Listing courses when none exist returns empty list."""
    response = await client.post("/api/v1/learn/courses", json={})
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []
    assert data["total"] == 0


@pytest.mark.asyncio
async def test_list_courses_with_data(client: AsyncClient, db_session: AsyncSession) -> None:
    """Listing courses returns seeded courses."""
    course = Course(
        title="Test Course",
        description="A test course",
        category="test",
        difficulty="beginner",
        estimated_hours=5,
    )
    db_session.add(course)
    await db_session.commit()

    response = await client.post("/api/v1/learn/courses", json={})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["title"] == "Test Course"


@pytest.mark.asyncio
async def test_get_course_not_found(client: AsyncClient) -> None:
    """Getting a non-existent course returns 404."""
    response = await client.get("/api/v1/learn/courses/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404
