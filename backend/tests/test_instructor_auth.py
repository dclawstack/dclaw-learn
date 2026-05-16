"""Instructor role gating tests."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import create_access_token, hash_password
from app.models import Course, User


async def _make_user(db: AsyncSession, email: str, role: str = "student") -> User:
    user = User(email=email, name="Test", hashed_password=hash_password("pass"), role=role)
    db.add(user)
    await db.flush()
    await db.commit()
    return user


@pytest.mark.asyncio
async def test_instructor_can_create_course(client: AsyncClient, db_session: AsyncSession) -> None:
    """Instructor role can create a course."""
    instructor = await _make_user(db_session, "instr1@test.com", role="instructor")
    token = create_access_token(instructor.id)

    resp = await client.post(
        "/api/v1/learn/instructor/courses",
        json={"title": "My Course", "description": "desc", "category": "tech", "difficulty": "beginner", "estimated_hours": 5},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "My Course"


@pytest.mark.asyncio
async def test_student_cannot_create_course(client: AsyncClient, db_session: AsyncSession) -> None:
    """Student role is rejected from creating a course (403)."""
    student = await _make_user(db_session, "stud1@test.com", role="student")
    token = create_access_token(student.id)

    resp = await client.post(
        "/api/v1/learn/instructor/courses",
        json={"title": "Sneaky Course", "description": "", "category": "test", "difficulty": "beginner", "estimated_hours": 1},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_instructor_dashboard_returns_their_courses(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """Instructor dashboard only shows courses they own."""
    instructor = await _make_user(db_session, "instr2@test.com", role="instructor")
    token = create_access_token(instructor.id)

    # Create a course via the endpoint
    await client.post(
        "/api/v1/learn/instructor/courses",
        json={"title": "Dashboard Course", "description": "", "category": "test", "difficulty": "beginner", "estimated_hours": 2},
        headers={"Authorization": f"Bearer {token}"},
    )

    resp = await client.get(
        "/api/v1/learn/instructor/dashboard",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    titles = [c["course_title"] for c in data["courses"]]
    assert "Dashboard Course" in titles


@pytest.mark.asyncio
async def test_student_cannot_create_assignment(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """Students cannot create assignments (403)."""
    student = await _make_user(db_session, "stud2@test.com", role="student")
    token = create_access_token(student.id)
    # Use a fake course_id — we expect 403 before 404
    resp = await client.post(
        "/api/v1/learn/courses/00000000-0000-0000-0000-000000000001/assignments",
        json={"title": "Sneaky Assignment", "description": ""},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403
