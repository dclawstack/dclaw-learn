"""Study plan router."""

import json
import uuid
from datetime import datetime, timedelta, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models import Course, Lesson, StudyPlan
from app.schemas import (
    StudyPlanAdjustRequest,
    StudyPlanCreateRequest,
    StudyPlanResponse,
    StudyPlanTask,
)

router = APIRouter()

_LLM_PLAN_PROMPT = """Create a personalized study plan for a student.

Goal: {goal}
Pace: {pace} ({hours_per_day} hours/day)
Duration: {weeks} weeks ({total_days} days)
Course syllabus (lesson titles and durations):
{syllabus}

Return ONLY a JSON array (no extra text). Each element must have:
- "day": integer (1-{total_days})
- "date": "YYYY-MM-DD" string
- "task": descriptive string of what to study that day
- "lesson_id": lesson UUID string or null
- "completed": false

Distribute lessons evenly. Include review sessions on rest days. Keep tasks specific and actionable."""


async def _generate_via_llm(
    goal: str,
    pace: str,
    weeks: int,
    start_date: datetime,
    syllabus: list[dict],
) -> list[StudyPlanTask] | None:
    """Try to generate a personalized study plan via Ollama. Returns None if unavailable."""
    hours_per_day = {"relaxed": 1, "moderate": 2, "intense": 3}.get(pace, 2)
    total_days = weeks * 7
    syllabus_text = "\n".join(
        f"- [{l['id']}] {l['title']} ({l['duration_minutes']} min)" for l in syllabus
    ) or "(No lessons yet)"

    prompt = _LLM_PLAN_PROMPT.format(
        goal=goal,
        pace=pace,
        hours_per_day=hours_per_day,
        weeks=weeks,
        total_days=total_days,
        syllabus=syllabus_text,
    )

    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
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
            tasks = []
            for item in parsed[:total_days]:
                tasks.append(StudyPlanTask(
                    day=int(item["day"]),
                    date=str(item["date"]),
                    task=str(item["task"]),
                    lesson_id=item.get("lesson_id") or None,
                    completed=False,
                ))
            return tasks if tasks else None
    except Exception:
        return None


def _build_daily_tasks(
    weeks: int,
    pace: str,
    start_date: datetime,
) -> list[StudyPlanTask]:
    """Fallback: generate daily study tasks heuristically."""
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

    # Fetch syllabus if course is specified
    syllabus: list[dict] = []
    if request.course_id:
        result = await db.execute(
            select(Lesson)
            .where(Lesson.course_id == request.course_id)
            .order_by(Lesson.order_index)
        )
        lessons = result.scalars().all()
        syllabus = [
            {"id": str(l.id), "title": l.title, "duration_minutes": l.duration_minutes}
            for l in lessons
        ]

    # Try LLM-generated plan, fall back to heuristic
    daily_tasks = await _generate_via_llm(
        request.goal, request.pace, request.weeks, start, syllabus
    )
    if not daily_tasks:
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
        plan.end_date = datetime.now(timezone.utc) + timedelta(weeks=request.weeks)
        plan.daily_tasks = [
            t.model_dump()
            for t in _build_daily_tasks(request.weeks, plan.pace, plan.start_date)
        ]

    await db.commit()
    await db.refresh(plan)
    return StudyPlanResponse.model_validate(plan)
