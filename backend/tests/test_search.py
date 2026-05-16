"""Full-text search router tests."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Course, Lesson


@pytest.mark.asyncio
async def test_search_empty_query(client: AsyncClient) -> None:
    """Empty query returns empty results."""
    response = await client.get("/api/v1/learn/search?q=")
    assert response.status_code == 200
    data = response.json()
    assert data["courses"] == []
    assert data["lessons"] == []
    assert data["total"] == 0


@pytest.mark.asyncio
async def test_search_course_by_title(client: AsyncClient, db_session: AsyncSession) -> None:
    """Matches course by title substring."""
    course = Course(
        title="Python for Beginners",
        description="Learn Python",
        category="programming",
        difficulty="beginner",
        estimated_hours=10,
    )
    db_session.add(course)
    await db_session.commit()

    response = await client.get("/api/v1/learn/search?q=python")
    assert response.status_code == 200
    data = response.json()
    assert any(c["title"] == "Python for Beginners" for c in data["courses"])


@pytest.mark.asyncio
async def test_search_course_by_description(client: AsyncClient, db_session: AsyncSession) -> None:
    """Matches course by description substring."""
    course = Course(
        title="Data Science Track",
        description="Deep dive into machine learning",
        category="data",
        difficulty="intermediate",
        estimated_hours=20,
    )
    db_session.add(course)
    await db_session.commit()

    response = await client.get("/api/v1/learn/search?q=machine+learning")
    assert response.status_code == 200
    data = response.json()
    assert any(c["title"] == "Data Science Track" for c in data["courses"])


@pytest.mark.asyncio
async def test_search_lesson_by_title(client: AsyncClient, db_session: AsyncSession) -> None:
    """Matches lesson by title and returns its parent course title."""
    course = Course(
        title="Web Development",
        description="Build websites",
        category="programming",
        difficulty="beginner",
        estimated_hours=15,
    )
    db_session.add(course)
    await db_session.flush()

    lesson = Lesson(
        course_id=course.id,
        title="Introduction to HTML",
        content="HTML is the building block of the web.",
        order_index=0,
    )
    db_session.add(lesson)
    await db_session.commit()

    response = await client.get("/api/v1/learn/search?q=html")
    assert response.status_code == 200
    data = response.json()
    lesson_titles = [l["title"] for l in data["lessons"]]
    assert "Introduction to HTML" in lesson_titles
    matched = next(l for l in data["lessons"] if l["title"] == "Introduction to HTML")
    assert matched["course_title"] == "Web Development"


@pytest.mark.asyncio
async def test_search_no_results(client: AsyncClient) -> None:
    """Query with no matches returns empty results."""
    response = await client.get("/api/v1/learn/search?q=xyznonexistent")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
