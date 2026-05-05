"""Seed sample data for development."""

import uuid

from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.models import Course, Lesson


async def seed_data() -> None:
    """Create sample courses if none exist."""
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Course).limit(1))
        existing = result.scalar_one_or_none()
        if existing:
            return

        sample_course = Course(
            id=uuid.UUID("11111111-1111-1111-1111-111111111111"),
            title="Introduction to Machine Learning",
            description="Learn the fundamentals of ML with hands-on projects.",
            category="technology",
            difficulty="beginner",
            estimated_hours=12,
            course_metadata={"instructor": "Dr. Ada Lovelace", "language": "en"},
        )
        db.add(sample_course)
        await db.flush()

        lessons = [
            Lesson(
                id=uuid.UUID("22222222-2222-2222-2222-222222222222"),
                course_id=sample_course.id,
                title="What is Machine Learning?",
                content="Machine learning is a subset of AI that enables systems to learn from data.",
                order_index=1,
                duration_minutes=30,
            ),
            Lesson(
                id=uuid.UUID("33333333-3333-3333-3333-333333333333"),
                course_id=sample_course.id,
                title="Supervised vs Unsupervised Learning",
                content="Supervised learning uses labeled data. Unsupervised learning finds patterns in unlabeled data.",
                order_index=2,
                duration_minutes=45,
            ),
            Lesson(
                id=uuid.UUID("44444444-4444-4444-4444-444444444444"),
                course_id=sample_course.id,
                title="Building Your First Model",
                content="Let's build a simple linear regression model using Python and scikit-learn.",
                order_index=3,
                duration_minutes=60,
            ),
        ]
        db.add_all(lessons)
        await db.commit()
