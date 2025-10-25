from sqlalchemy import Column, String, Integer, Float, Date, Text, ForeignKey, JSON, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ARRAY
from datetime import datetime, date
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin, TenantMixin
import enum


class MilestoneStatus(str, enum.Enum):
    """Milestone status"""
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    DELAYED = "delayed"
    BLOCKED = "blocked"


class Program(Base, UUIDMixin, TimestampMixin, TenantMixin):
    """Program/Project management"""
    __tablename__ = "programs"
    
    # Basic info
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Contract info
    contract_number = Column(String(100), nullable=True)
    customer = Column(String(255), nullable=True)
    
    # Budget
    total_budget = Column(Float, nullable=True)
    spent_to_date = Column(Float, default=0.0)
    
    # Dates
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    
    # Status
    status = Column(String(50), default="active")
    health_score = Column(Integer, default=100)  # 0-100
    
    # Organization
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    
    # Relationships
    milestones = relationship("Milestone", back_populates="program")
    raid_items = relationship("RAIDItem", back_populates="program")


class Milestone(Base, UUIDMixin, TimestampMixin):
    """Program milestones"""
    __tablename__ = "milestones"
    
    program_id = Column(String(36), ForeignKey("programs.id"), nullable=False)
    program = relationship("Program", back_populates="milestones")
    
    # Milestone info
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Dates
    due_date = Column(Date, nullable=False)
    completed_date = Column(Date, nullable=True)
    
    # Status
    status = Column(SQLEnum(MilestoneStatus), default=MilestoneStatus.NOT_STARTED)
    
    # Dependencies
    dependencies = Column(ARRAY(String), nullable=True)  # IDs of other milestones
    
    # Assigned
    assigned_to = Column(String(36), nullable=True)
    
    # Order
    order = Column(Integer, default=0)


class RAIDType(str, enum.Enum):
    """RAID log item types"""
    RISK = "risk"
    ACTION = "action"
    ISSUE = "issue"
    DECISION = "decision"


class RAIDItem(Base, UUIDMixin, TimestampMixin):
    """RAID log items"""
    __tablename__ = "raid_items"
    
    program_id = Column(String(36), ForeignKey("programs.id"), nullable=False)
    program = relationship("Program", back_populates="raid_items")
    
    # Type
    item_type = Column(SQLEnum(RAIDType), nullable=False)
    
    # Content
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Risk-specific
    probability = Column(Integer, nullable=True)  # 1-5
    impact = Column(Integer, nullable=True)  # 1-5
    mitigation = Column(Text, nullable=True)
    
    # Status
    status = Column(String(50), default="open")
    
    # Assigned
    assigned_to = Column(String(36), nullable=True)
    
    # Dates
    due_date = Column(Date, nullable=True)
    resolved_date = Column(Date, nullable=True)

