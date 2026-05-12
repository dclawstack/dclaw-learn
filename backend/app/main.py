"""FastAPI application entrypoint."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import assignments, auth, certificates, courses, dashboard, forum, health, quiz, recommendations, study_plan
from app.seed import seed_data


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan handler."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_data()
    yield
    await engine.dispose()


app = FastAPI(
    title="DClaw Learn API",
    description="Adaptive learning platform",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/learn")
app.include_router(courses.router, prefix="/api/v1/learn")
app.include_router(quiz.router, prefix="/api/v1/learn")
app.include_router(study_plan.router, prefix="/api/v1/learn")
app.include_router(dashboard.router, prefix="/api/v1/learn")
app.include_router(certificates.router, prefix="/api/v1/learn")
app.include_router(recommendations.router, prefix="/api/v1/learn")
app.include_router(forum.router, prefix="/api/v1/learn")
app.include_router(assignments.router, prefix="/api/v1/learn")
app.include_router(health.router)
