"""AI tutor chat router — per-lesson context, streaming response."""

import json
import uuid
from typing import Any, AsyncGenerator

import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.auth import get_optional_user
from app.database import get_db
from app.models import Lesson, User

router = APIRouter()

_TUTOR_SYSTEM = """You are a helpful AI tutor for the lesson: "{lesson_title}".
Use the following lesson content as your primary knowledge source.
Answer the student's question clearly and concisely. Stay on topic.

Lesson content:
{lesson_content}"""


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []


async def _stream_ollama(system: str, history: list[dict], message: str) -> AsyncGenerator[str, None]:
    """Stream tokens from Ollama."""
    messages = [{"role": "system", "content": system}]
    for h in history[-6:]:  # last 3 turns
        messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": message})

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream(
                "POST",
                f"{settings.ollama_base_url}/api/chat",
                json={"model": "llama3", "messages": messages, "stream": True},
            ) as resp:
                if resp.status_code != 200:
                    yield "data: " + json.dumps({"token": "[Ollama unavailable — please try again later]"}) + "\n\n"
                    return
                async for line in resp.aiter_lines():
                    if not line.strip():
                        continue
                    try:
                        chunk = json.loads(line)
                        token = chunk.get("message", {}).get("content", "")
                        if token:
                            yield "data: " + json.dumps({"token": token}) + "\n\n"
                        if chunk.get("done"):
                            yield "data: [DONE]\n\n"
                            return
                    except json.JSONDecodeError:
                        continue
    except Exception:
        yield "data: " + json.dumps({"token": "[AI tutor is currently unavailable. Please review the lesson content directly.]"}) + "\n\n"
        yield "data: [DONE]\n\n"


@router.post("/lessons/{lesson_id}/chat")
async def lesson_chat(
    lesson_id: uuid.UUID,
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    _: User | None = Depends(get_optional_user),
) -> StreamingResponse:
    """Chat with the AI tutor about a lesson. Returns a streaming SSE response."""
    lesson = await db.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    # Get course title for richer context
    from app.models import Course
    course = await db.get(Course, lesson.course_id)
    course_title = course.title if course else ""

    system_prompt = _TUTOR_SYSTEM.format(
        lesson_title=f"{course_title} — {lesson.title}",
        lesson_content=lesson.content[:3000],
    )

    history_dicts = [{"role": m.role, "content": m.content} for m in request.history]

    return StreamingResponse(
        _stream_ollama(system_prompt, history_dicts, request.message),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
