"""Dashboard router tests."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Course, UserProgress


@pytest.mark.asyncio
async def test_dashboard_empty(client: AsyncClient) -> None:
    """Dashboard with no data returns zeros."""
    response = await client.get("/api/v1/learn/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert data["streak_days"] == 0
    assert data["total_hours_studied"] == 0.0
    assert data["total_courses_completed"] == 0
    assert data["enrolled_courses"] == []


@pytest.mark.asyncio
async def test_dashboard_with_data(client: AsyncClient, db_session: AsyncSession) -> None:
    """Dashboard aggregates real data correctly."""
    course = Course(
        title="ML 101",
        category="tech",
        difficulty="beginner",
        estimated_hours=10,
    )
    db_session.add(course)
    await db_session.flush()

    progress = UserProgress(
        user_id="11111111-1111-1111-1111-111111111111",
        course_id=course.id,
        streak_days=7,
        overall_score=85.0,
    )
    db_session.add(progress)
    await db_session.commit()

    response = await client.get("/api/v1/learn/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert data["streak_days"] == 7
    assert data["total_hours_studied"] == 10.0
    assert data["total_courses_completed"] == 1
    assert len(data["enrolled_courses"]) == 1
