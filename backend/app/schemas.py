"""Pydantic v2 schemas for API requests and responses."""

import uuid
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class LessonSchema(BaseModel):
    id: uuid.UUID
    title: str
    order_index: int
    duration_minutes: int


class CourseCreate(BaseModel):
    title: str
    description: str | None = None
    category: str = "general"
    difficulty: Literal["beginner", "intermediate", "advanced"] = "beginner"
    estimated_hours: int = 0


class CourseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str | None
    category: str
    difficulty: str
    estimated_hours: int
    course_metadata: dict[str, Any]
    created_at: datetime
    updated_at: datetime


class CourseDetailResponse(CourseResponse):
    lessons: list[LessonSchema] = []


class CourseListResponse(BaseModel):
    items: list[CourseResponse]
    total: int


class CourseSearchRequest(BaseModel):
    query: str | None = None
    category: str | None = None
    difficulty: str | None = None


class EnrollRequest(BaseModel):
    user_id: uuid.UUID | None = None


class EnrollResponse(BaseModel):
    enrollment_id: uuid.UUID
    course_id: uuid.UUID
    status: str = "enrolled"


class QuizQuestion(BaseModel):
    question: str
    options: list[str]
    correct_index: int
    explanation: str


class QuizGenerateRequest(BaseModel):
    content: str
    num_questions: int = Field(default=5, ge=1, le=20)


class QuizGenerateResponse(BaseModel):
    quiz_id: uuid.UUID
    title: str
    questions: list[QuizQuestion]


class QuizSubmitRequest(BaseModel):
    answers: list[int]


class QuizResultResponse(BaseModel):
    score: int
    total: int
    percentage: float
    explanations: list[str]


class StudyPlanTask(BaseModel):
    day: int
    date: str
    task: str
    lesson_id: uuid.UUID | None = None
    completed: bool = False


class StudyPlanCreateRequest(BaseModel):
    course_id: uuid.UUID | None = None
    title: str
    goal: str
    pace: Literal["relaxed", "moderate", "intense"] = "moderate"
    weeks: int = Field(default=4, ge=1, le=52)


class StudyPlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    course_id: uuid.UUID | None
    title: str
    goal: str
    pace: str
    daily_tasks: list[StudyPlanTask]
    start_date: datetime
    end_date: datetime | None
    created_at: datetime
    updated_at: datetime


class StudyPlanAdjustRequest(BaseModel):
    pace: Literal["relaxed", "moderate", "intense"] | None = None
    weeks: int | None = None


class UserProgressResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    course_id: uuid.UUID
    completed_lesson_ids: list[uuid.UUID]
    overall_score: float
    streak_days: int
    enrolled_at: datetime
    last_activity_at: datetime


class DashboardResponse(BaseModel):
    enrolled_courses: list[CourseResponse]
    total_courses_completed: int
    streak_days: int
    total_hours_studied: float
    recent_activity: list[dict[str, Any]]
