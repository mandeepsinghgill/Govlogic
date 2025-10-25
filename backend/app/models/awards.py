from sqlalchemy import Column, String, Text, ForeignKey, JSON, Boolean, Integer, Date, DateTime, Enum as SQLEnum, Float
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin, TenantMixin
import enum


class AwardStatus(str, enum.Enum):
    """Award status types"""
    PENDING = "pending"
    AWARDED = "awarded"
    LOST = "lost"
    PROTESTED = "protested"
    CANCELLED = "cancelled"


class AwardTracking(Base, UUIDMixin, TimestampMixin, TenantMixin):
    """Tracks the status and details of contract awards"""
    __tablename__ = "award_tracking"

    opportunity_id = Column(String(36), ForeignKey("opportunities.id"), nullable=False)
    proposal_id = Column(String(36), ForeignKey("proposals.id"), nullable=True)
    status = Column(SQLEnum(AwardStatus), default=AwardStatus.PENDING)
    award_date = Column(Date, nullable=True)
    award_amount = Column(Float, nullable=True)
    contract_number = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)

    opportunity = relationship("Opportunity", back_populates="awards")
    proposal = relationship("Proposal", back_populates="award_tracking")


class LessonsLearned(Base, UUIDMixin, TimestampMixin, TenantMixin):
    """Captures lessons learned from proposals and awards"""
    __tablename__ = "lessons_learned"

    opportunity_id = Column(String(36), ForeignKey("opportunities.id"), nullable=True)
    proposal_id = Column(String(36), ForeignKey("proposals.id"), nullable=True)
    category = Column(String(100), nullable=False)  # e.g., "Technical", "Pricing", "Management"
    lesson = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=True)
    implemented = Column(Boolean, default=False)

    opportunity = relationship("Opportunity", back_populates="lessons_learned")
    proposal = relationship("Proposal", back_populates="lessons_learned")


class ProtestDecision(Base, UUIDMixin, TimestampMixin, TenantMixin):
    """Tracks protest decisions and outcomes"""
    __tablename__ = "protest_decisions"

    opportunity_id = Column(String(36), ForeignKey("opportunities.id"), nullable=False)
    protest_date = Column(Date, nullable=False)
    protestor = Column(String(255), nullable=True)
    decision_date = Column(Date, nullable=True)
    outcome = Column(String(100), nullable=True)  # e.g., "Sustained", "Denied", "Dismissed"
    notes = Column(Text, nullable=True)

    opportunity = relationship("Opportunity", back_populates="protest_decisions")

