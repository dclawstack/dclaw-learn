"""Study plan router."""

import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import StudyPlan
from app.schemas import (
    StudyPlanAdjustRequest,
    StudyPlanCreateRequest,
    StudyPlanResponse,
    StudyPlanTask,
)

router = APIRouter()


def _build_daily_tasks(
    weeks: int,
    pace: str,
    start_date: datetime,
) -> list[StudyPlanTask]:
    """Generate daily study tasks for a plan."""
    tasks: list[StudyPlanTask] = []
    days = weeks * 7
    for day in range(1, days + 1):
        task_date = start_date + timedelta(days=day - 1)
        tasks.append(
            StudyPlanTask(
                day=day,
                date=task_date.strftime("%Y-%m-%d"),
                task=f"Study session {day} ({pace} pace)",
                completed=False,
            )
        )
    return tasks


@router.post("/study-plan", response_model=StudyPlanResponse)
async def create_study_plan(
    request: StudyPlanCreateRequest,
    db: AsyncSession = Depends(get_db),
) -> StudyPlanResponse:
    """Create a personalized study plan."""
    start = datetime.now(timezone.utc)
    end = start + timedelta(weeks=request.weeks)
    daily_tasks = _build_daily_tasks(request.weeks, request.pace, start)

    plan = StudyPlan(
        user_id=uuid.uuid4(),
        course_id=request.course_id,
        title=request.title,
        goal=request.goal,
        pace=request.pace,
        daily_tasks=[t.model_dump() for t in daily_tasks],
        start_date=start,
        end_date=end,
    )
    db.add(plan)
    await db.commit()
    await db.refresh(plan)
    return StudyPlanResponse.model_validate(plan)


@router.get("/study-plan/{plan_id}", response_model=StudyPlanResponse)
async def get_study_plan(
    plan_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> StudyPlanResponse:
    """Retrieve a study plan by ID."""
    plan = await db.get(StudyPlan, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Study plan not found")
    return StudyPlanResponse.model_validate(plan)


@router.patch("/study-plan/{plan_id}", response_model=StudyPlanResponse)
async def adjust_study_plan(
    plan_id: uuid.UUID,
    request: StudyPlanAdjustRequest,
    db: AsyncSession = Depends(get_db),
) -> StudyPlanResponse:
    """Adjust study plan pace or duration."""
    plan = await db.get(StudyPlan, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Study plan not found")

    if request.pace:
        plan.pace = request.pace
    if request.weeks:
        plan.end_date = datetime.now(timezone.utc) + timedelta(
            weeks=request.weeks
        )
        plan.daily_tasks = [
            t.model_dump()
            for t in _build_daily_tasks(
                request.weeks, plan.pace, plan.start_date
            )
        ]

    await db.commit()
    await db.refresh(plan)
    return StudyPlanResponse.model_validate(plan)
