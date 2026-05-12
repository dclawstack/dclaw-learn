"""Discussion forum router."""

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user, get_optional_user
from app.database import get_db
from app.models import Course, Post, Thread, User
from app.schemas import PostCreate, PostResponse, ThreadCreate, ThreadResponse

router = APIRouter()


@router.get("/courses/{course_id}/forum", response_model=list[ThreadResponse])
async def list_threads(
    course_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> list[ThreadResponse]:
    """List all discussion threads for a course."""
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    result = await db.execute(
        select(Thread).where(Thread.course_id == course_id).order_by(Thread.created_at.desc())
    )
    return [ThreadResponse.model_validate(t) for t in result.scalars().all()]


@router.post("/courses/{course_id}/forum", response_model=ThreadResponse, status_code=201)
async def create_thread(
    course_id: uuid.UUID,
    request: ThreadCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ThreadResponse:
    """Create a new discussion thread."""
    course = await db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    thread = Thread(
        course_id=course_id,
        user_id=current_user.id,
        title=request.title,
        body=request.body,
    )
    db.add(thread)
    await db.commit()
    await db.refresh(thread)
    return ThreadResponse.model_validate(thread)


@router.get("/forum/{thread_id}", response_model=ThreadResponse)
async def get_thread(
    thread_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> ThreadResponse:
    """Get a thread with all its replies."""
    thread = await db.get(Thread, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    return ThreadResponse.model_validate(thread)


@router.post("/forum/{thread_id}/reply", response_model=PostResponse, status_code=201)
async def reply_to_thread(
    thread_id: uuid.UUID,
    request: PostCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PostResponse:
    """Post a reply to a thread."""
    thread = await db.get(Thread, thread_id)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")

    post = Post(
        thread_id=thread_id,
        user_id=current_user.id,
        body=request.body,
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return PostResponse.model_validate(post)
