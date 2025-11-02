"""
Pipeline Item Database Model
"""
from sqlalchemy import Column, String, Integer, Float, Date, DateTime, JSON, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.models.base import Base


class PipelineStatus(str, enum.Enum):
    """Pipeline item status"""
    DRAFT = "draft"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    SUBMITTED = "submitted"


class PipelineStage(str, enum.Enum):
    """Pipeline stage"""
    PROSPECTING = "prospecting"
    QUALIFYING = "qualifying"
    PROPOSAL = "proposal"
    NEGOTIATION = "negotiation"
    WON = "won"
    LOST = "lost"


class PipelinePriority(str, enum.Enum):
    """Pipeline priority"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class PipelineItem(Base):
    """Pipeline Item model for tracking opportunities in the sales pipeline"""
    __tablename__ = "pipeline_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Opportunity reference
    opportunity_id = Column(String, nullable=False, index=True)
    
    # Basic information
    title = Column(String, nullable=False)
    agency = Column(String, nullable=False)
    description = Column(String, nullable=True)
    
    # Financial
    contract_value = Column(Float, nullable=True)
    
    # Dates
    due_date = Column(Date, nullable=True)
    
    # Status and tracking
    status = Column(SQLEnum(PipelineStatus), default=PipelineStatus.DRAFT, nullable=False, index=True)
    stage = Column(SQLEnum(PipelineStage), default=PipelineStage.PROSPECTING, nullable=False, index=True)
    priority = Column(SQLEnum(PipelinePriority), default=PipelinePriority.MEDIUM, nullable=False)
    progress = Column(Integer, default=0, nullable=False)  # 0-100
    
    # AI and analysis
    pwin_score = Column(Integer, nullable=True)  # Probability of win 0-100
    notes = Column(String, nullable=True)
    
    # Team and collaboration
    team_members = Column(JSON, default=list, nullable=True)  # List of user IDs
    
    # Features
    brief_generated = Column(Boolean, default=True, nullable=False)
    
    # Ownership
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=True, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="pipeline_items")
    organization = relationship("Organization", back_populates="pipeline_items")

    def __repr__(self):
        return f"<PipelineItem(id={self.id}, title={self.title}, status={self.status})>"

    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "opportunity_id": self.opportunity_id,
            "title": self.title,
            "agency": self.agency,
            "description": self.description,
            "contract_value": self.contract_value,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "status": self.status.value if isinstance(self.status, enum.Enum) else self.status,
            "stage": self.stage.value if isinstance(self.stage, enum.Enum) else self.stage,
            "priority": self.priority.value if isinstance(self.priority, enum.Enum) else self.priority,
            "progress": self.progress,
            "pwin_score": self.pwin_score,
            "notes": self.notes,
            "team_members": self.team_members or [],
            "brief_generated": self.brief_generated,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

