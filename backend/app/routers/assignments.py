"""Assignments and grading router."""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.database import get_db
from app.models import Assignment, Course, Submission, User
from app.schemas import (
    AssignmentCreate,
    AssignmentResponse,
    GradeSubmissionRequest,
    SubmissionCreate,
    SubmissionResponse,
)

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
    current_user: User = Depends(get_current_user),
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
    current_user: User = Depends(get_current_user),
) -> SubmissionResponse:
    """Grade a submission (instructor action)."""
    submission = await db.get(Submission, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    submission.score = request.score
    submission.feedback = request.feedback
    submission.graded_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(submission)
    return SubmissionResponse.model_validate(submission)
