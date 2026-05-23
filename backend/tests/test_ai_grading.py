"""AI assignment grading tests."""

from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import create_access_token, hash_password
from app.models import Assignment, Course, Submission, User


async def _setup(db: AsyncSession, student_email: str) -> tuple[User, Assignment]:
    student = User(email=student_email, name="S", hashed_password=hash_password("pass"))
    instructor = User(email=f"instr_{student_email}", name="I", hashed_password=hash_password("pass"), role="instructor")
    db.add(student)
    db.add(instructor)
    course = Course(title="AI Grade Course", description="", category="test", difficulty="beginner", estimated_hours=1)
    db.add(course)
    await db.flush()
    assignment = Assignment(
        course_id=course.id,
        title="Essay",
        description="Write about Python",
        max_score=100,
    )
    db.add(assignment)
    await db.commit()
    return student, assignment


@pytest.mark.asyncio
async def test_ai_grade_ollama_unavailable_returns_fallback(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """When Ollama is down, endpoint returns a fallback AiGradeFeedback."""
    student, assignment = await _setup(db_session, "aigrade1@test.com")
    token = create_access_token(student.id)

    # Submit
    sub_resp = await client.post(
        f"/api/v1/learn/assignments/{assignment.id}/submit",
        json={"content": "Python is a great language."},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert sub_resp.status_code == 201
    sub_id = sub_resp.json()["id"]

    # AI grade — Ollama mocked as unavailable
    with patch("app.routers.assignments.httpx.AsyncClient") as mock_client_cls:
        mock_client = AsyncMock()
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=False)
        mock_client.post = AsyncMock(side_effect=Exception("connection refused"))
        mock_client_cls.return_value = mock_client

        resp = await client.post(
            f"/api/v1/learn/submissions/{sub_id}/ai-grade",
            headers={"Authorization": f"Bearer {token}"},
        )
    assert resp.status_code == 200
    data = resp.json()
    assert "unavailable" in data["feedback"].lower() or data["score"] == 0
    assert data["graded_by"] == "ai"


@pytest.mark.asyncio
async def test_ai_grade_other_user_forbidden(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """A different student cannot request AI grading of another's submission."""
    student, assignment = await _setup(db_session, "aigrade2@test.com")
    other = User(email="aigrade_other@test.com", name="O", hashed_password=hash_password("pass"))
    db_session.add(other)
    await db_session.commit()

    token = create_access_token(student.id)
    sub_resp = await client.post(
        f"/api/v1/learn/assignments/{assignment.id}/submit",
        json={"content": "My answer."},
        headers={"Authorization": f"Bearer {token}"},
    )
    sub_id = sub_resp.json()["id"]

    other_token = create_access_token(other.id)
    resp = await client.post(
        f"/api/v1/learn/submissions/{sub_id}/ai-grade",
        headers={"Authorization": f"Bearer {other_token}"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_human_grade_not_overwritten_by_ai(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    """AI grade does not overwrite a human-graded submission."""
    student, assignment = await _setup(db_session, "aigrade3@test.com")

    # Manually create a human-graded submission
    submission = Submission(
        assignment_id=assignment.id,
        user_id=student.id,
        content="Good answer",
        score=85,
        feedback="Well done",
        graded_by="instructor",
    )
    db_session.add(submission)
    await db_session.commit()

    token = create_access_token(student.id)
    with patch("app.routers.assignments.httpx.AsyncClient") as mock_client_cls:
        mock_client = AsyncMock()
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=False)
        mock_client.post = AsyncMock(side_effect=Exception("down"))
        mock_client_cls.return_value = mock_client

        await client.post(
            f"/api/v1/learn/submissions/{submission.id}/ai-grade",
            headers={"Authorization": f"Bearer {token}"},
        )

    await db_session.refresh(submission)
    # Human grade preserved
    assert submission.graded_by == "instructor"
    assert submission.score == 85
