"""
Organization and User models
"""
from sqlalchemy import Column, String, Boolean, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin, SoftDeleteMixin
import enum


class UserRole(str, enum.Enum):
    """User roles for RBAC"""
    ADMIN = "admin"
    CAPTURE_LEAD = "capture_lead"
    PROPOSAL_MANAGER = "proposal_manager"
    SME = "sme"
    REVIEWER = "reviewer"
    VIEWER = "viewer"


class Organization(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """Organization model for multi-tenancy"""
    __tablename__ = "organizations"
    
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    website = Column(String(255), nullable=True)
    
    # Company details
    cage_code = Column(String(50), nullable=True)
    duns_number = Column(String(50), nullable=True)
    uei = Column(String(50), nullable=True)
    
    # Set-aside eligibility
    is_small_business = Column(Boolean, default=False)
    is_8a = Column(Boolean, default=False)
    is_wosb = Column(Boolean, default=False)
    is_hubzone = Column(Boolean, default=False)
    is_sdvosb = Column(Boolean, default=False)
    
    # Subscription
    subscription_tier = Column(String(50), default="free")
    is_active = Column(Boolean, default=True)
    
    # Relationships
    users = relationship("User", back_populates="organization")
    opportunities = relationship("Opportunity", back_populates="organization")
    proposals = relationship("Proposal", back_populates="organization")
    pipeline_items = relationship("PipelineItem", back_populates="organization")
    briefs = relationship("Brief", back_populates="organization")


class User(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """User model"""
    __tablename__ = "users"
    
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    
    # Role
    role = Column(SQLEnum(UserRole), default=UserRole.VIEWER, nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Organization
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    organization = relationship("Organization", back_populates="users")
    
    # User Types and Focus
    user_types = Column(JSON, default=["proposals"])  # ["proposals", "grants", "both"]
    primary_focus = Column(String(50), default="proposals")  # "proposals" or "grants"
    
    # MFA
    mfa_enabled = Column(Boolean, default=False)
    mfa_secret = Column(String(255), nullable=True)
    
    # Relationships
    pipeline_items = relationship("PipelineItem", back_populates="user")

