"""Assignments and grading router."""

import json
import uuid
from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.auth import get_current_user, require_instructor
from app.database import get_db
from app.models import Assignment, Course, Submission, User
from app.schemas import (
    AiGradeFeedback,
    AssignmentCreate,
    AssignmentResponse,
    GradeSubmissionRequest,
    SubmissionCreate,
    SubmissionResponse,
)

_AI_GRADE_PROMPT = """You are grading a student assignment.

Assignment: {title}
Instructions: {description}

Student submission:
{submission}

Return ONLY valid JSON (no extra text) in this format:
{{
  "score": <integer 0-{max_score}>,
  "feedback": "<overall feedback paragraph>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"]
}}"""

router = APIRouter()


@router.get("/courses/{course_id}/assignments", response_model=list[AssignmentResponse])
async def list_assignments(
    course_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> list[AssignmentResponse]:
    """List all assignments for a course."""
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    result = await db.execute(
        select(Assignment).where(Assignment.course_id == course_id).order_by(Assignment.created_at)
    )
    return [AssignmentResponse.model_validate(a) for a in result.scalars().all()]


@router.post("/courses/{course_id}/assignments", response_model=AssignmentResponse, status_code=201)
async def create_assignment(
    course_id: uuid.UUID,
    request: AssignmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_instructor),
) -> AssignmentResponse:
    """Create an assignment (instructor action)."""
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    assignment = Assignment(
        course_id=course_id,
        title=request.title,
        description=request.description,
        due_date=request.due_date,
        max_score=request.max_score,
    )
    db.add(assignment)
    await db.commit()
    await db.refresh(assignment)
    return AssignmentResponse.model_validate(assignment)


@router.post(
    "/assignments/{assignment_id}/submit",
    response_model=SubmissionResponse,
    status_code=201,
)
async def submit_assignment(
    assignment_id: uuid.UUID,
    request: SubmissionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SubmissionResponse:
    """Submit an assignment."""
    assignment = await db.get(Assignment, assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    existing = await db.execute(
        select(Submission).where(
            Submission.assignment_id == assignment_id,
            Submission.user_id == current_user.id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Already submitted")

    submission = Submission(
        assignment_id=assignment_id,
        user_id=current_user.id,
        content=request.content,
    )
    db.add(submission)
    await db.commit()
    await db.refresh(submission)
    return SubmissionResponse.model_validate(submission)


@router.patch("/submissions/{submission_id}/grade", response_model=SubmissionResponse)
async def grade_submission(
    submission_id: uuid.UUID,
    request: GradeSubmissionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_instructor),
) -> SubmissionResponse:
    """Grade a submission (instructor action)."""
    submission = await db.get(Submission, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    submission.score = request.score
    submission.feedback = request.feedback
    submission.graded_at = datetime.now(timezone.utc)
    submission.graded_by = "instructor"
    await db.commit()
    await db.refresh(submission)
    return SubmissionResponse.model_validate(submission)


@router.post("/submissions/{submission_id}/ai-grade", response_model=AiGradeFeedback)
async def ai_grade_submission(
    submission_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AiGradeFeedback:
    """Request AI feedback on a submission. Available to the submitter or instructors."""
    submission = await db.get(Submission, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    if submission.user_id != current_user.id and current_user.role != "instructor":
        raise HTTPException(status_code=403, detail="Not authorized")

    assignment = await db.get(Assignment, submission.assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    prompt = _AI_GRADE_PROMPT.format(
        title=assignment.title,
        description=assignment.description,
        submission=submission.content[:3000],
        max_score=assignment.max_score,
    )

    result: AiGradeFeedback | None = None
    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            resp = await client.post(
                f"{settings.ollama_base_url}/api/generate",
                json={"model": "llama3", "prompt": prompt, "stream": False},
            )
            if resp.status_code == 200:
                raw = resp.json().get("response", "")
                start = raw.find("{")
                end = raw.rfind("}") + 1
                if start != -1 and end > 0:
                    parsed = json.loads(raw[start:end])
                    result = AiGradeFeedback(
                        score=min(int(parsed.get("score", 0)), assignment.max_score),
                        feedback=str(parsed.get("feedback", "")),
                        strengths=[str(s) for s in parsed.get("strengths", [])],
                        improvements=[str(s) for s in parsed.get("improvements", [])],
                    )
    except Exception:
        pass

    if result is None:
        result = AiGradeFeedback(
            score=0,
            feedback="AI grading is currently unavailable. Please request instructor review.",
            strengths=[],
            improvements=["Ollama service is not reachable"],
        )

    # Persist the AI grade (does not overwrite a human grade)
    if submission.graded_by != "instructor":
        submission.score = result.score
        submission.feedback = result.feedback
        submission.graded_at = datetime.now(timezone.utc)
        submission.graded_by = "ai"
        await db.commit()

    return result
