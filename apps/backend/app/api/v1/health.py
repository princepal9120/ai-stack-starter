"""
AI Stack FastAPI - Health Check Endpoints
==========================================
Health and readiness probes for container orchestration.
"""

from datetime import datetime, UTC

import structlog
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.factory import get_provider_info
from app.core.config import settings
from app.core.database import get_db

logger = structlog.get_logger(__name__)

router = APIRouter()


class HealthResponse(BaseModel):
    """Health check response model."""
    status: str
    service: str
    version: str
    timestamp: str
    environment: str


class ReadinessResponse(BaseModel):
    """Readiness check response model."""
    status: str
    database: str
    auth_provider: str
    llm_provider: str
    vector_db: str


@router.get("", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """
    Basic health check endpoint.
    Returns service status for load balancers.
    """
    return HealthResponse(
        status="healthy",
        service=settings.APP_NAME,
        version="0.1.0",
        timestamp=datetime.now(UTC).isoformat(),
        environment=settings.APP_ENV,
    )


@router.get("/ready", response_model=ReadinessResponse)
async def readiness_check(
    db: AsyncSession = Depends(get_db),
) -> ReadinessResponse:
    """
    Readiness check for Kubernetes.
    Verifies database connectivity and service configuration.
    """
    # Check database connection
    db_status = "connected"
    try:
        await db.execute(text("SELECT 1"))
    except Exception as e:
        logger.error("Database health check failed", error=str(e))
        db_status = "disconnected"
    
    # Get auth provider info
    auth_info = get_provider_info()
    
    return ReadinessResponse(
        status="ready" if db_status == "connected" else "not_ready",
        database=db_status,
        auth_provider=auth_info["provider"],
        llm_provider=settings.LLM_PROVIDER,
        vector_db=settings.VECTOR_DB_PROVIDER,
    )


@router.get("/live")
async def liveness_check() -> dict[str, str]:
    """
    Liveness check for Kubernetes.
    Simple check that the service is running.
    """
    return {"status": "alive"}
