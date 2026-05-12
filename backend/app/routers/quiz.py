"""Quiz generation and submission router."""

import json
import uuid

import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models import Quiz
from app.schemas import (
    QuizGenerateRequest,
    QuizGenerateResponse,
    QuizQuestion,
    QuizResultResponse,
    QuizSubmitRequest,
)

router = APIRouter()

_OLLAMA_PROMPT = """Generate {n} multiple-choice quiz questions based on the following content.
Return ONLY a JSON array with no extra text. Each element must have these fields:
- "question": string
- "options": array of 4 strings
- "correct_index": integer (0-3)
- "explanation": string explaining why the answer is correct

Content:
{content}"""


async def _generate_via_ollama(content: str, num_questions: int) -> list[QuizQuestion] | None:
    """Try to generate questions using Ollama. Returns None if unavailable."""
    prompt = _OLLAMA_PROMPT.format(n=num_questions, content=content[:4000])
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{settings.ollama_base_url}/api/generate",
                json={"model": "llama3", "prompt": prompt, "stream": False},
            )
            if resp.status_code != 200:
                return None
            raw = resp.json().get("response", "")
            # Extract the JSON array from the response
            start = raw.find("[")
            end = raw.rfind("]") + 1
            if start == -1 or end == 0:
                return None
            parsed = json.loads(raw[start:end])
            questions = []
            for item in parsed[:num_questions]:
                questions.append(
                    QuizQuestion(
                        question=str(item["question"]),
                        options=[str(o) for o in item["options"][:4]],
                        correct_index=int(item["correct_index"]),
                        explanation=str(item.get("explanation", "")),
                    )
                )
            return questions if questions else None
    except Exception:
        return None


def _generate_keyword_questions(content: str, num_questions: int) -> list[QuizQuestion]:
    """Fallback: keyword-extraction quiz generation."""
    sentences = [s.strip() for s in content.split(".") if len(s.strip()) > 20]
    questions: list[QuizQuestion] = []
    for i in range(min(num_questions, len(sentences))):
        sentence = sentences[i]
        words = sentence.split()
        if len(words) < 5:
            continue
        key_word = words[len(words) // 2].strip(",.!?;:")
        options = [
            key_word,
            f"not {key_word}",
            f"related to {key_word}",
            "none of the above",
        ]
        questions.append(
            QuizQuestion(
                question=f"What is discussed in: '{sentence[:80]}...'?",
                options=options,
                correct_index=0,
                explanation=f"The passage mentions '{key_word}' as a central concept.",
            )
        )
    return questions


@router.post("/quiz/generate", response_model=QuizGenerateResponse)
async def generate_quiz(
    request: QuizGenerateRequest,
    db: AsyncSession = Depends(get_db),
) -> QuizGenerateResponse:
    """Generate a quiz from provided content using AI, with keyword fallback."""
    questions = await _generate_via_ollama(request.content, request.num_questions)
    if not questions:
        questions = _generate_keyword_questions(request.content, request.num_questions)

    quiz = Quiz(
        title="Generated Quiz",
        questions=[q.model_dump() for q in questions],
    )
    db.add(quiz)
    await db.commit()
    await db.refresh(quiz)
    return QuizGenerateResponse(
        quiz_id=quiz.id,
        title=quiz.title,
        questions=questions,
    )


@router.post("/quiz/{quiz_id}/submit", response_model=QuizResultResponse)
async def submit_quiz(
    quiz_id: uuid.UUID,
    request: QuizSubmitRequest,
    db: AsyncSession = Depends(get_db),
) -> QuizResultResponse:
    """Submit quiz answers and return results."""
    quiz = await db.get(Quiz, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = quiz.questions
    total = len(questions)
    score = 0
    explanations: list[str] = []
    for i, question in enumerate(questions):
        correct = question.get("correct_index", 0)
        if i < len(request.answers) and request.answers[i] == correct:
            score += 1
            explanations.append(f"Correct! {question.get('explanation', '')}")
        else:
            explanations.append(f"Incorrect. {question.get('explanation', '')}")

    percentage = (score / total * 100) if total > 0 else 0.0
    return QuizResultResponse(
        score=score,
        total=total,
        percentage=percentage,
        explanations=explanations,
    )
