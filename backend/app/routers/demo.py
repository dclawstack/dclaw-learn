"""Demo data seed/clear endpoints for development and demonstration."""

import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Course, Flashcard, Lesson, StudyPlan

router = APIRouter(tags=["demo"])

# DEMO_USER_ID: nil UUID used for demo data. These FK constraints allow NULL,
# so no real user row is required. If your DB enforces FK on user_id, seed
# a demo user first or change this to a real user UUID.
DEMO_USER_ID = uuid.UUID("00000000-0000-0000-0000-000000000000")

# Fixed UUIDs so re-seeding is idempotent
DEMO_COURSE_IDS = [
    uuid.UUID("aaaaaaaa-0001-0001-0001-000000000001"),
    uuid.UUID("aaaaaaaa-0002-0002-0002-000000000002"),
    uuid.UUID("aaaaaaaa-0003-0003-0003-000000000003"),
    uuid.UUID("aaaaaaaa-0004-0004-0004-000000000004"),
]

DEMO_COURSES = [
    {
        "id": DEMO_COURSE_IDS[0],
        "title": "Intro to Python",
        "description": "Learn Python from scratch with hands-on exercises covering variables, functions, and OOP.",
        "category": "technology",
        "difficulty": "beginner",
        "estimated_hours": 8,
        "course_metadata": {"instructor": "Dr. Ada Lovelace", "language": "en", "demo": True},
    },
    {
        "id": DEMO_COURSE_IDS[1],
        "title": "Data Structures & Algorithms",
        "description": "Master arrays, trees, graphs, and sorting algorithms with real interview problems.",
        "category": "technology",
        "difficulty": "intermediate",
        "estimated_hours": 15,
        "course_metadata": {"instructor": "Prof. Alan Turing", "language": "en", "demo": True},
    },
    {
        "id": DEMO_COURSE_IDS[2],
        "title": "Machine Learning Basics",
        "description": "Understand supervised and unsupervised learning, model evaluation, and scikit-learn.",
        "category": "technology",
        "difficulty": "intermediate",
        "estimated_hours": 12,
        "course_metadata": {"instructor": "Dr. Grace Hopper", "language": "en", "demo": True},
    },
    {
        "id": DEMO_COURSE_IDS[3],
        "title": "Web Dev Fundamentals",
        "description": "Build modern web apps with HTML, CSS, JavaScript, and React.",
        "category": "technology",
        "difficulty": "beginner",
        "estimated_hours": 10,
        "course_metadata": {"instructor": "Dr. Tim Berners-Lee", "language": "en", "demo": True},
    },
]

DEMO_LESSON_IDS = [
    uuid.UUID("bbbbbbbb-0001-0001-0001-000000000001"),
    uuid.UUID("bbbbbbbb-0002-0002-0002-000000000002"),
    uuid.UUID("bbbbbbbb-0003-0003-0003-000000000003"),
    uuid.UUID("bbbbbbbb-0004-0004-0004-000000000004"),
    uuid.UUID("bbbbbbbb-0005-0005-0005-000000000005"),
    uuid.UUID("bbbbbbbb-0006-0006-0006-000000000006"),
]

DEMO_LESSONS = [
    # Intro to Python
    {"id": DEMO_LESSON_IDS[0], "course_id": DEMO_COURSE_IDS[0], "title": "Variables and Types", "content": "Python variables are dynamically typed. Use int, str, float, and bool.", "order_index": 1, "duration_minutes": 30},
    {"id": DEMO_LESSON_IDS[1], "course_id": DEMO_COURSE_IDS[0], "title": "Functions", "content": "Define reusable blocks of code with def. Use parameters and return values.", "order_index": 2, "duration_minutes": 45},
    # Data Structures
    {"id": DEMO_LESSON_IDS[2], "course_id": DEMO_COURSE_IDS[1], "title": "Arrays and Lists", "content": "Arrays store elements at contiguous memory locations. Python lists are dynamic arrays.", "order_index": 1, "duration_minutes": 40},
    {"id": DEMO_LESSON_IDS[3], "course_id": DEMO_COURSE_IDS[1], "title": "Hash Maps", "content": "Hash maps provide O(1) average lookup using a hash function.", "order_index": 2, "duration_minutes": 50},
    # ML Basics
    {"id": DEMO_LESSON_IDS[4], "course_id": DEMO_COURSE_IDS[2], "title": "Supervised Learning", "content": "Supervised learning trains on labeled data. Examples: linear regression, decision trees.", "order_index": 1, "duration_minutes": 60},
    # Web Dev
    {"id": DEMO_LESSON_IDS[5], "course_id": DEMO_COURSE_IDS[3], "title": "HTML Basics", "content": "HTML defines the structure of web pages using tags like div, p, h1, and a.", "order_index": 1, "duration_minutes": 30},
]

DEMO_STUDY_PLAN_ID = uuid.UUID("cccccccc-0001-0001-0001-000000000001")

DEMO_FLASHCARD_IDS = [
    uuid.UUID("dddddddd-0001-0001-0001-000000000001"),
    uuid.UUID("dddddddd-0002-0002-0002-000000000002"),
    uuid.UUID("dddddddd-0003-0003-0003-000000000003"),
    uuid.UUID("dddddddd-0004-0004-0004-000000000004"),
    uuid.UUID("dddddddd-0005-0005-0005-000000000005"),
]

DEMO_FLASHCARDS = [
    {"id": DEMO_FLASHCARD_IDS[0], "lesson_id": DEMO_LESSON_IDS[0], "front": "What is a Python list?", "back": "A dynamic, ordered, mutable sequence that can hold items of different types."},
    {"id": DEMO_FLASHCARD_IDS[1], "lesson_id": DEMO_LESSON_IDS[0], "front": "What does `len()` do?", "back": "Returns the number of items in a sequence (list, string, tuple, etc.)."},
    {"id": DEMO_FLASHCARD_IDS[2], "lesson_id": DEMO_LESSON_IDS[2], "front": "What is the time complexity of array access by index?", "back": "O(1) — constant time, because elements are stored at contiguous memory addresses."},
    {"id": DEMO_FLASHCARD_IDS[3], "lesson_id": DEMO_LESSON_IDS[3], "front": "What is a hash collision?", "back": "When two different keys produce the same hash value, requiring a resolution strategy like chaining."},
    {"id": DEMO_FLASHCARD_IDS[4], "lesson_id": DEMO_LESSON_IDS[4], "front": "What is gradient descent?", "back": "An optimization algorithm that iteratively adjusts model parameters to minimize a loss function."},
]


# No authentication required — demo endpoints are intentionally open for development/demo purposes.
@router.post("/demo/seed", status_code=201)
async def seed_demo_data(db: AsyncSession = Depends(get_db)) -> dict:
    """Seed demo courses, lessons, flashcards, and a study plan. Idempotent."""
    now = datetime.now(timezone.utc)
    due = now + timedelta(days=1)

    # Upsert courses
    for data in DEMO_COURSES:
        existing = await db.get(Course, data["id"])
        if existing is None:
            db.add(Course(**data))
    await db.flush()

    # Upsert lessons
    for data in DEMO_LESSONS:
        existing = await db.get(Lesson, data["id"])
        if existing is None:
            db.add(Lesson(**data))
    await db.flush()

    # Upsert flashcards
    for data in DEMO_FLASHCARDS:
        existing = await db.get(Flashcard, data["id"])
        if existing is None:
            db.add(Flashcard(
                id=data["id"],
                lesson_id=data["lesson_id"],
                user_id=DEMO_USER_ID,
                front=data["front"],
                back=data["back"],
                ease_factor=2.5,
                interval_days=1,
                review_count=0,
                due_date=due,
            ))
    await db.flush()

    # Upsert study plan
    existing_plan = await db.get(StudyPlan, DEMO_STUDY_PLAN_ID)
    if existing_plan is None:
        db.add(StudyPlan(
            id=DEMO_STUDY_PLAN_ID,
            user_id=DEMO_USER_ID,
            course_id=DEMO_COURSE_IDS[0],
            title="Python in 4 Weeks",
            goal="Complete Intro to Python course",
            pace="moderate",
            daily_tasks=[
                {
                    "day": i + 1,
                    "date": (now + timedelta(days=i)).strftime("%Y-%m-%d"),
                    "task": f"Study session {i + 1}",
                    "lesson_id": None,
                    "completed": i < 3,
                }
                for i in range(14)
            ],
            start_date=now,
            end_date=now + timedelta(weeks=4),
        ))

    await db.commit()
    return {"status": "seeded", "courses": len(DEMO_COURSES), "flashcards": len(DEMO_FLASHCARDS)}


@router.delete("/demo/clear", status_code=200)
async def clear_demo_data(db: AsyncSession = Depends(get_db)) -> dict:
    """Remove all demo data seeded by /demo/seed."""
    # Delete flashcards for demo lessons first (FK dep)
    await db.execute(delete(Flashcard).where(Flashcard.lesson_id.in_(DEMO_LESSON_IDS)))

    # Delete study plan
    await db.execute(delete(StudyPlan).where(StudyPlan.id == DEMO_STUDY_PLAN_ID))

    # Delete lessons explicitly (don't rely on DB-level cascade from course delete)
    await db.execute(delete(Lesson).where(Lesson.id.in_(DEMO_LESSON_IDS)))

    # Delete courses
    await db.execute(delete(Course).where(Course.id.in_(DEMO_COURSE_IDS)))

    await db.commit()
    return {"status": "cleared"}
