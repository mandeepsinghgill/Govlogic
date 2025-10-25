"""
Base models and mixins
"""
from sqlalchemy import Column, Integer, DateTime, String, Boolean
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class TimestampMixin:
    """Mixin for created_at and updated_at timestamps"""
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class UUIDMixin:
    """Mixin for UUID primary key"""
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))


class SoftDeleteMixin:
    """Mixin for soft delete functionality"""
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)


class TenantMixin:
    """Mixin for multi-tenancy"""
    organization_id = Column(String(36), nullable=False, index=True)

