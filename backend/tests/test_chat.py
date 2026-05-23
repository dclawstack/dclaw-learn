"""AI tutor chat router tests."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Course, Lesson


async def _make_lesson(db: AsyncSession, content: str = "Python is great.") -> Lesson:
    course = Course(title="Chat Course", description="", category="test", difficulty="beginner", estimated_hours=1)
    db.add(course)
    await db.flush()
    lesson = Lesson(course_id=course.id, title="Chat Lesson", content=content, order_index=0)
    db.add(lesson)
    await db.commit()
    return lesson


@pytest.mark.asyncio
async def test_chat_nonexistent_lesson_returns_404(client: AsyncClient, db_session: AsyncSession) -> None:
    """Chat with a non-existent lesson returns 404."""
    resp = await client.post(
        "/api/v1/learn/lessons/00000000-0000-0000-0000-000000000000/chat",
        json={"message": "hello"},
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_chat_returns_streaming_response(client: AsyncClient, db_session: AsyncSession) -> None:
    """Chat with a valid lesson returns a streaming SSE response."""
    lesson = await _make_lesson(db_session)

    async def _fake_stream(*args: object, **kwargs: object):
        yield 'data: {"token": "Hello"}\n\n'
        yield "data: [DONE]\n\n"

    with patch("app.routers.chat._stream_ollama", side_effect=_fake_stream):
        resp = await client.post(
            f"/api/v1/learn/lessons/{lesson.id}/chat",
            json={"message": "What is Python?"},
        )
    assert resp.status_code == 200
    assert "text/event-stream" in resp.headers["content-type"]


@pytest.mark.asyncio
async def test_chat_ollama_down_returns_fallback(client: AsyncClient, db_session: AsyncSession) -> None:
    """When Ollama is unavailable, response still streams a fallback message."""
    lesson = await _make_lesson(db_session)

    async def _unavailable_stream(*args: object, **kwargs: object):
        yield 'data: {"token": "[AI tutor is currently unavailable."}\n\n'
        yield "data: [DONE]\n\n"

    with patch("app.routers.chat._stream_ollama", side_effect=_unavailable_stream):
        resp = await client.post(
            f"/api/v1/learn/lessons/{lesson.id}/chat",
            json={"message": "explain this"},
        )
    assert resp.status_code == 200
    assert b"data:" in resp.content
