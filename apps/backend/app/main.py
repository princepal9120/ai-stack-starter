"""
AI Stack FastAPI - Main Application Entry Point
================================================
Production-grade FastAPI application with RAG capabilities.
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse

from app.api.v1 import router as api_v1_router
from app.core.config import settings
from app.core.database import init_db, close_db
from app.core.logging import setup_logging
from app.middleware.logging import LoggingMiddleware
from app.middleware.error_handler import error_handler_middleware
from app.middleware.auth import AuthMiddleware

# Initialize structured logging
setup_logging()
logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan manager.
    Handles startup and shutdown events.
    """
    # Startup
    logger.info("Starting AI Stack FastAPI application", env=settings.APP_ENV)
    
    # Initialize database
    await init_db()
    logger.info("Database initialized successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down AI Stack FastAPI application")
    await close_db()
    logger.info("Database connections closed")


def create_application() -> FastAPI:
    """
    Application factory pattern.
    Creates and configures the FastAPI application.
    """
    app = FastAPI(
        title=settings.APP_NAME,
        description="Production-grade FastAPI boilerplate for AI applications with RAG, vector databases, and zero vendor lock-in",
        version="0.1.0",
        docs_url="/docs" if settings.DEBUG else None,
        redoc_url="/redoc" if settings.DEBUG else None,
        openapi_url="/openapi.json" if settings.DEBUG else None,
        default_response_class=ORJSONResponse,
        lifespan=lifespan,
    )
    
    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Custom Middleware
    app.add_middleware(AuthMiddleware)
    app.add_middleware(LoggingMiddleware)
    app.middleware("http")(error_handler_middleware)
    
    # Include API routers
    app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)
    
    # Health check endpoint
    @app.get("/health", tags=["Health"])
    async def health_check() -> dict[str, str]:
        """Health check endpoint for container orchestration."""
        return {"status": "healthy", "service": settings.APP_NAME}
    
    @app.get("/", tags=["Root"])
    async def root() -> dict[str, str]:
        """Root endpoint with API information."""
        return {
            "message": f"Welcome to {settings.APP_NAME}",
            "docs": "/docs",
            "health": "/health",
        }
    
    return app


# Create the application instance
app = create_application()
