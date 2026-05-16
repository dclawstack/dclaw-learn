"""Spaced repetition flashcard router (SM-2 algorithm)."""

import json
import uuid
from datetime import datetime, timedelta, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.auth import get_current_user
from app.database import get_db
from app.models import Flashcard, Lesson, User
from app.schemas import (
    FlashcardResponse,
    FlashcardReviewRequest,
    FlashcardReviewResponse,
)

router = APIRouter()

_FLASHCARD_PROMPT = """Generate exactly 5 flashcards from the following lesson content.
Return ONLY a JSON array with no extra text. Each element must have:
- "front": a question or term (string)
- "back": the answer or definition (string)

Content:
{content}"""


def _sm2_update(
    ease_factor: float,
    interval_days: int,
    review_count: int,
    quality: int,
) -> tuple[float, int]:
    """Apply SM-2 algorithm. Returns (new_ease_factor, new_interval_days)."""
    new_ef = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    new_ef = max(1.3, new_ef)

    if quality < 3:
        # Reset — relearn card
        new_interval = 1
    elif review_count == 0:
        new_interval = 1
    elif review_count == 1:
        new_interval = 6
    else:
        new_interval = round(interval_days * new_ef)

    return new_ef, new_interval


async def _generate_flashcards_via_ollama(content: str) -> list[dict] | None:
    prompt = _FLASHCARD_PROMPT.format(content=content[:4000])
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{settings.ollama_base_url}/api/generate",
                json={"model": "llama3", "prompt": prompt, "stream": False},
            )
            if resp.status_code != 200:
                return None
            raw = resp.json().get("response", "")
            start = raw.find("[")
            end = raw.rfind("]") + 1
            if start == -1 or end == 0:
                return None
            parsed = json.loads(raw[start:end])
            return [{"front": str(p["front"]), "back": str(p["back"])} for p in parsed[:5]]
    except Exception:
        return None


def _extract_keyword_flashcards(content: str) -> list[dict]:
    """Fallback: extract key terms from content as flashcards."""
    sentences = [s.strip() for s in content.split(".") if len(s.strip()) > 15][:5]
    cards = []
    for sentence in sentences:
        words = sentence.split()
        if len(words) >= 3:
            term = " ".join(words[:3])
            cards.append({"front": f"What is: '{term}...'?", "back": sentence})
    return cards or [{"front": "What is the main topic?", "back": content[:100]}]


@router.post("/lessons/{lesson_id}/flashcards/generate", response_model=list[FlashcardResponse], status_code=201)
async def generate_flashcards(
    lesson_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[FlashcardResponse]:
    """Generate flashcards from lesson content for the current user."""
    lesson = await db.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    # Delete existing cards for this user+lesson (re-generate)
    existing = await db.execute(
        select(Flashcard).where(
            Flashcard.lesson_id == lesson_id,
            Flashcard.user_id == current_user.id,
        )
    )
    for card in existing.scalars().all():
        await db.delete(card)

    pairs = await _generate_flashcards_via_ollama(lesson.content)
    if not pairs:
        pairs = _extract_keyword_flashcards(lesson.content)

    cards = []
    now = datetime.now(timezone.utc)
    for pair in pairs:
        card = Flashcard(
            lesson_id=lesson_id,
            user_id=current_user.id,
            front=pair["front"],
            back=pair["back"],
            due_date=now,
        )
        db.add(card)
        cards.append(card)

    await db.commit()
    for card in cards:
        await db.refresh(card)
    return [FlashcardResponse.model_validate(c) for c in cards]


@router.post("/flashcards/{card_id}/review", response_model=FlashcardReviewResponse)
async def review_flashcard(
    card_id: uuid.UUID,
    request: FlashcardReviewRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FlashcardReviewResponse:
    """Submit a review for a flashcard and update its SM-2 schedule."""
    card = await db.get(Flashcard, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    if card.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your flashcard")

    new_ef, new_interval = _sm2_update(
        card.ease_factor, card.interval_days, card.review_count, request.quality
    )
    card.ease_factor = new_ef
    card.interval_days = new_interval
    card.review_count += 1
    card.due_date = datetime.now(timezone.utc) + timedelta(days=new_interval)

    await db.commit()
    await db.refresh(card)
    return FlashcardReviewResponse(
        id=card.id,
        next_due_date=card.due_date,
        interval_days=card.interval_days,
        ease_factor=card.ease_factor,
    )


@router.get("/flashcards/due", response_model=list[FlashcardResponse])
async def get_due_flashcards(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[FlashcardResponse]:
    """Return all flashcards due for review today."""
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(Flashcard).where(
            Flashcard.user_id == current_user.id,
            Flashcard.due_date <= now,
        ).order_by(Flashcard.due_date)
    )
    return [FlashcardResponse.model_validate(c) for c in result.scalars().all()]
