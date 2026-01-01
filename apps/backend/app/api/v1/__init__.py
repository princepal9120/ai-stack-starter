"""
AI Stack FastAPI - API v1 Router
=================================
Main router for API version 1 endpoints.
"""

from fastapi import APIRouter

from app.api.v1 import auth, chat, documents, health

router = APIRouter()

# Include sub-routers
router.include_router(health.router, prefix="/health", tags=["Health"])
router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
router.include_router(chat.router, prefix="/chat", tags=["Chat"])
router.include_router(documents.router, prefix="/documents", tags=["Documents"])
