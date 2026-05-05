"""Quiz generation and submission router."""

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

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


def _generate_questions(content: str, num_questions: int) -> list[QuizQuestion]:
    """Auto-generate quiz questions from content (placeholder logic)."""
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
    """Auto-generate a quiz from provided content."""
    questions = _generate_questions(request.content, request.num_questions)
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
            explanations.append(
                f"Incorrect. {question.get('explanation', '')}"
            )

    percentage = (score / total * 100) if total > 0 else 0.0
    return QuizResultResponse(
        score=score,
        total=total,
        percentage=percentage,
        explanations=explanations,
    )
