"""Study plan router tests — LLM path (mocked) and fallback path."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Course, Lesson


async def _make_course_with_lessons(db: AsyncSession) -> Course:
    course = Course(title="SP Course", description="", category="test", difficulty="beginner", estimated_hours=4)
    db.add(course)
    await db.flush()
    for i in range(3):
        db.add(Lesson(course_id=course.id, title=f"Lesson {i+1}", content="content", order_index=i, duration_minutes=30))
    await db.commit()
    return course


@pytest.mark.asyncio
async def test_study_plan_fallback_path(client: AsyncClient, db_session: AsyncSession) -> None:
    """When Ollama is unavailable, heuristic tasks are generated."""
    with patch("app.routers.study_plan.httpx.AsyncClient") as mock_cls:
        mock_c = AsyncMock()
        mock_c.__aenter__ = AsyncMock(return_value=mock_c)
        mock_c.__aexit__ = AsyncMock(return_value=False)
        mock_c.post = AsyncMock(side_effect=Exception("down"))
        mock_cls.return_value = mock_c

        resp = await client.post(
            "/api/v1/learn/study-plan",
            json={"title": "My Plan", "goal": "Learn Python", "pace": "moderate", "weeks": 1},
        )

    assert resp.status_code == 200
    data = resp.json()
    assert len(data["daily_tasks"]) == 7
    assert data["daily_tasks"][0]["day"] == 1


@pytest.mark.asyncio
async def test_study_plan_llm_path(client: AsyncClient, db_session: AsyncSession) -> None:
    """When Ollama returns valid JSON, LLM tasks are used."""
    import json as _json
    llm_tasks = [
        {"day": i + 1, "date": f"2026-05-{i + 1:02d}", "task": f"LLM task {i+1}", "lesson_id": None, "completed": False}
        for i in range(7)
    ]
    llm_response = _json.dumps(llm_tasks)

    mock_resp = AsyncMock()
    mock_resp.status_code = 200
    # httpx Response.json() is synchronous, so the mock must return the dict
    # directly (not a coroutine) — otherwise the router's resp.json().get(...)
    # raises and the LLM path silently falls back to the heuristic plan.
    mock_resp.json = MagicMock(return_value={"response": llm_response})

    with patch("app.routers.study_plan.httpx.AsyncClient") as mock_cls:
        mock_c = AsyncMock()
        mock_c.__aenter__ = AsyncMock(return_value=mock_c)
        mock_c.__aexit__ = AsyncMock(return_value=False)
        mock_c.post = AsyncMock(return_value=mock_resp)
        mock_cls.return_value = mock_c

        resp = await client.post(
            "/api/v1/learn/study-plan",
            json={"title": "LLM Plan", "goal": "Master FastAPI", "pace": "intense", "weeks": 1},
        )

    assert resp.status_code == 200
    data = resp.json()
    assert len(data["daily_tasks"]) == 7
    assert "LLM task" in data["daily_tasks"][0]["task"]


@pytest.mark.asyncio
async def test_study_plan_with_course_syllabus(client: AsyncClient, db_session: AsyncSession) -> None:
    """Study plan creation with a course_id fetches the syllabus."""
    course = await _make_course_with_lessons(db_session)

    with patch("app.routers.study_plan.httpx.AsyncClient") as mock_cls:
        mock_c = AsyncMock()
        mock_c.__aenter__ = AsyncMock(return_value=mock_c)
        mock_c.__aexit__ = AsyncMock(return_value=False)
        mock_c.post = AsyncMock(side_effect=Exception("down"))
        mock_cls.return_value = mock_c

        resp = await client.post(
            "/api/v1/learn/study-plan",
            json={
                "title": "Course Plan",
                "goal": "Complete the course",
                "pace": "moderate",
                "weeks": 2,
                "course_id": str(course.id),
            },
        )

    assert resp.status_code == 200
    data = resp.json()
    assert data["course_id"] == str(course.id)
    assert len(data["daily_tasks"]) == 14


@pytest.mark.asyncio
async def test_adjust_plan(client: AsyncClient, db_session: AsyncSession) -> None:
    """Adjusting a plan regenerates tasks."""
    with patch("app.routers.study_plan._generate_via_llm", return_value=None):
        create_resp = await client.post(
            "/api/v1/learn/study-plan",
            json={"title": "Plan", "goal": "Goal", "pace": "moderate", "weeks": 1},
        )
    plan_id = create_resp.json()["id"]

    adjust_resp = await client.patch(
        f"/api/v1/learn/study-plan/{plan_id}",
        json={"weeks": 2},
    )
    assert adjust_resp.status_code == 200
    assert len(adjust_resp.json()["daily_tasks"]) == 14
