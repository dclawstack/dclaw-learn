"""Certificate issuance router."""

import hashlib
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.database import get_db
from app.models import Certificate, Course, Lesson, User, UserProgress
from app.schemas import CertificateResponse

router = APIRouter()


def _make_cert_number(user_id: uuid.UUID, course_id: uuid.UUID) -> str:
    raw = f"{user_id}-{course_id}"
    return "CERT-" + hashlib.sha256(raw.encode()).hexdigest()[:16].upper()


@router.get("/courses/{course_id}/certificate", response_model=CertificateResponse)
async def get_or_issue_certificate(
    course_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CertificateResponse:
    """Issue (or retrieve) a certificate for a completed course."""
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Check enrollment and completion
    result = await db.execute(
        select(UserProgress).where(
            UserProgress.user_id == current_user.id,
            UserProgress.course_id == course_id,
        )
    )
    progress = result.scalar_one_or_none()
    if not progress:
        raise HTTPException(status_code=404, detail="Not enrolled in this course")

    # Verify all lessons are completed
    from sqlalchemy import func
    total_result = await db.execute(
        select(func.count(Lesson.id)).where(Lesson.course_id == course_id)
    )
    total_lessons = total_result.scalar() or 0
    completed_count = len(progress.completed_lesson_ids)

    if total_lessons > 0 and completed_count < total_lessons:
        raise HTTPException(
            status_code=400,
            detail=f"Course not completed ({completed_count}/{total_lessons} lessons done)",
        )

    # Return existing certificate if one was already issued
    existing = await db.execute(
        select(Certificate).where(
            Certificate.user_id == current_user.id,
            Certificate.course_id == course_id,
        )
    )
    cert = existing.scalar_one_or_none()
    if not cert:
        cert = Certificate(
            user_id=current_user.id,
            course_id=course_id,
            certificate_number=_make_cert_number(current_user.id, course_id),
        )
        db.add(cert)
        await db.commit()
        await db.refresh(cert)

    return CertificateResponse(
        id=cert.id,
        user_id=cert.user_id,
        course_id=cert.course_id,
        certificate_number=cert.certificate_number,
        issued_at=cert.issued_at,
        course_title=course.title,
        user_name=current_user.name,
    )
