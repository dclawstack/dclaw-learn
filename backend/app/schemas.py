"""Pydantic v2 schemas for API requests and responses."""

import uuid
from datetime import date, datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ── Auth ────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    name: str = ""
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    name: str
    role: str
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class UserStatsResponse(BaseModel):
    xp_total: int
    streak_days: int
    last_streak_date: date | None


# ── Lessons ─────────────────────────────────────────────────────────────────

class LessonSchema(BaseModel):
    id: uuid.UUID
    title: str
    order_index: int
    duration_minutes: int
    video_url: str | None = None
    video_duration: int | None = None


class LessonCreate(BaseModel):
    title: str
    content: str = ""
    order_index: int = 0
    duration_minutes: int = 0
    video_url: str | None = None
    video_duration: int | None = None


# ── Courses ─────────────────────────────────────────────────────────────────

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


# ── Progress ─────────────────────────────────────────────────────────────────

class LessonCompleteResponse(BaseModel):
    lesson_id: uuid.UUID
    completed_lesson_ids: list[str]
    completion_percentage: float
    course_completed: bool


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


# ── Quiz ─────────────────────────────────────────────────────────────────────

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
    attempt_id: uuid.UUID | None = None


class QuizAttemptResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    quiz_id: uuid.UUID
    user_id: uuid.UUID
    score: float
    answers: list[int]
    taken_at: datetime


# ── Study Plan ───────────────────────────────────────────────────────────────

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


# ── Certificates ─────────────────────────────────────────────────────────────

class CertificateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    course_id: uuid.UUID
    certificate_number: str
    issued_at: datetime
    course_title: str = ""
    user_name: str = ""


# ── Dashboard ────────────────────────────────────────────────────────────────

class DashboardResponse(BaseModel):
    enrolled_courses: list[CourseResponse]
    total_courses_completed: int
    streak_days: int
    total_hours_studied: float
    recent_activity: list[dict[str, Any]]
    recommendations: list[CourseResponse] = []


# ── Forum ────────────────────────────────────────────────────────────────────

class ThreadCreate(BaseModel):
    title: str
    body: str = ""


class PostCreate(BaseModel):
    body: str


class PostResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    thread_id: uuid.UUID
    user_id: uuid.UUID
    body: str
    created_at: datetime


class ThreadResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    course_id: uuid.UUID
    user_id: uuid.UUID
    title: str
    body: str
    created_at: datetime
    posts: list[PostResponse] = []


# ── Assignments ───────────────────────────────────────────────────────────────

# ── Adaptive difficulty ───────────────────────────────────────────────────────

class NextLessonResponse(BaseModel):
    lesson_id: uuid.UUID | None
    lesson_title: str | None
    difficulty_adjustment: str  # "accelerated" | "remediation" | "normal"
    mastery_score: float
    message: str


# ── Flashcards ────────────────────────────────────────────────────────────────

class FlashcardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    lesson_id: uuid.UUID
    user_id: uuid.UUID
    front: str
    back: str
    ease_factor: float
    interval_days: int
    review_count: int
    due_date: datetime


class FlashcardReviewRequest(BaseModel):
    quality: int = Field(..., ge=0, le=5)


class FlashcardReviewResponse(BaseModel):
    id: uuid.UUID
    next_due_date: datetime
    interval_days: int
    ease_factor: float


# ── Instructor ───────────────────────────────────────────────────────────────

class InstructorCourseStats(BaseModel):
    course_id: uuid.UUID
    course_title: str
    enrollment_count: int
    avg_rating: float


class InstructorDashboardResponse(BaseModel):
    courses: list[InstructorCourseStats]
    total_students: int


# ── Ratings ───────────────────────────────────────────────────────────────────

class CourseRatingCreate(BaseModel):
    stars: int = Field(..., ge=1, le=5)
    review: str = ""


class CourseRatingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    course_id: uuid.UUID
    stars: int
    review: str
    created_at: datetime


class CourseRatingSummary(BaseModel):
    avg_rating: float
    rating_count: int
    ratings: list[CourseRatingResponse]


# ── Assignments ───────────────────────────────────────────────────────────────

class AssignmentCreate(BaseModel):
    title: str
    description: str = ""
    due_date: datetime | None = None
    max_score: int = 100


class SubmissionCreate(BaseModel):
    content: str


class GradeSubmissionRequest(BaseModel):
    score: int
    feedback: str = ""


class AiGradeFeedback(BaseModel):
    score: int
    feedback: str
    strengths: list[str]
    improvements: list[str]
    graded_by: str = "ai"


class SubmissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    assignment_id: uuid.UUID
    user_id: uuid.UUID
    content: str
    score: int | None
    feedback: str | None
    submitted_at: datetime
    graded_at: datetime | None
    graded_by: str | None = None


class AssignmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    course_id: uuid.UUID
    title: str
    description: str
    due_date: datetime | None
    max_score: int
    created_at: datetime
    submissions: list[SubmissionResponse] = []
