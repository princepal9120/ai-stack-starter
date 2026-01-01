"""
AI Stack FastAPI - User Model
=============================
SQLAlchemy user model for custom JWT authentication.
When using Clerk, users are synced from Clerk to this table.
"""

import uuid
from datetime import datetime, UTC
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.document import Document
    from app.models.conversation import Conversation


class User(Base):
    """
    User model for authentication and ownership.
    
    When AUTH_PROVIDER=clerk:
    - id matches Clerk user ID (e.g., "user_xxx")
    - Most fields synced from Clerk
    - hashed_password is empty
    
    When AUTH_PROVIDER=jwt:
    - id is a UUID
    - hashed_password used for authentication
    """
    
    __tablename__ = "users"
    
    # Primary key (UUID or Clerk ID)
    id: Mapped[str] = mapped_column(
        String(255),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    
    # Email (required, unique)
    email: Mapped[str] = mapped_column(
        String(320),
        unique=True,
        nullable=False,
        index=True,
    )
    email_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    
    # Password (only for JWT auth)
    hashed_password: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    
    # Profile info
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    first_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    last_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    # Account status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # External provider info
    auth_provider: Mapped[str] = mapped_column(
        String(50),
        default="jwt",
        nullable=False,
    )
    external_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        index=True,
    )
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )
    last_login_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    
    # Relationships
    # documents: Mapped[list["Document"]] = relationship(
    #     "Document",
    #     back_populates="user",
    #     cascade="all, delete-orphan",
    # )
    # conversations: Mapped[list["Conversation"]] = relationship(
    #     "Conversation",
    #     back_populates="user",
    #     cascade="all, delete-orphan",
    # )
    
    def __repr__(self) -> str:
        return f"<User {self.email}>"
    
    @property
    def full_name(self) -> str | None:
        """Get full name from first and last name."""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.name or self.first_name or self.last_name
