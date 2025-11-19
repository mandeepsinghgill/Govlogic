"""
Proposal models
"""
from sqlalchemy import Column, String, Integer, Float, Text, ForeignKey, Enum as SQLEnum, JSON, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, date
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin, TenantMixin, SoftDeleteMixin
import enum


class ProposalStatus(str, enum.Enum):
    """Proposal status"""
    DRAFT = "draft"
    IN_PROGRESS = "in_progress"
    PINK_TEAM = "pink_team"
    RED_TEAM = "red_team"
    GOLD_TEAM = "gold_team"
    FINAL = "final"
    SUBMITTED = "submitted"


class Proposal(Base, UUIDMixin, TimestampMixin, TenantMixin, SoftDeleteMixin):
    """Proposal model"""
    __tablename__ = "proposals"
    
    # Basic info
    title = Column(String(500), nullable=False)
    solicitation_number = Column(String(100), nullable=True)
    
    # Status
    status = Column(SQLEnum(ProposalStatus), default=ProposalStatus.DRAFT, nullable=False)
    
    # Opportunity link
    opportunity_id = Column(String(36), ForeignKey("opportunities.id"), nullable=True)
    opportunity = relationship("Opportunity", back_populates="proposals")
    
    # Organization
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    organization = relationship("Organization", back_populates="proposals")
    
    # Creator (user who created this proposal)
    created_by = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    
    # RFP document
    rfp_file_path = Column(String(500), nullable=True)
    rfp_text = Column(Text, nullable=True)
    
    # Extracted requirements
    requirements = Column(JSON, nullable=True)  # List of requirements
    
    # Compliance matrix
    compliance_matrix = Column(JSON, nullable=True)
    
    # Outline
    outline = Column(JSON, nullable=True)  # Shipley-compliant outline
    page_budget = Column(JSON, nullable=True)  # Page limits per section
    
    # Content
    sections = Column(JSON, nullable=True)  # AI-drafted sections
    
    # Quality scores
    readability_score = Column(Float, nullable=True)
    compliance_score = Column(Float, nullable=True)
    citation_score = Column(Float, nullable=True)
    
    # Red team
    red_team_report = Column(JSON, nullable=True)
    red_team_score = Column(Integer, nullable=True)
    
    # Output files
    docx_file_path = Column(String(500), nullable=True)
    pdf_file_path = Column(String(500), nullable=True)
    excel_file_path = Column(String(500), nullable=True)
    
    # 508 compliance
    is_508_compliant = Column(Boolean, default=False)
    
    # SharePoint integration (temporarily commented out - columns don't exist in DB yet)
    # TODO: Add database migration to add these columns
    # sharepoint_url = Column(String(1000), nullable=True)
    # sharepoint_file_id = Column(String(100), nullable=True)
    # auto_sync_sharepoint = Column(Boolean, default=False)
    # sharepoint_folder_path = Column(String(500), nullable=True)
    
    # Relationships
    sections_rel = relationship("ProposalSection", back_populates="proposal")
    reviews = relationship("ProposalReview", back_populates="proposal")
    award_tracking = relationship("AwardTracking", back_populates="proposal", uselist=False)
    lessons_learned = relationship("LessonsLearned", back_populates="proposal")



class ProposalSection(Base, UUIDMixin, TimestampMixin):
    """Individual proposal sections"""
    __tablename__ = "proposal_sections"
    
    proposal_id = Column(String(36), ForeignKey("proposals.id"), nullable=False)
    proposal = relationship("Proposal", back_populates="sections_rel")
    
    # Section info
    section_number = Column(String(20), nullable=False)
    section_title = Column(String(255), nullable=False)
    
    # Content
    content = Column(Text, nullable=True)
    word_count = Column(Integer, default=0)
    page_count = Column(Integer, default=0)
    
    # AI generation
    ai_generated = Column(Boolean, default=False)
    ai_model = Column(String(50), nullable=True)
    prompt_used = Column(Text, nullable=True)
    
    # Status
    status = Column(String(50), default="draft")
    assigned_to = Column(String(36), nullable=True)
    
    # Order
    order = Column(Integer, default=0)


class ProposalReview(Base, UUIDMixin, TimestampMixin):
    """Color team reviews"""
    __tablename__ = "proposal_reviews"
    
    proposal_id = Column(String(36), ForeignKey("proposals.id"), nullable=False)
    proposal = relationship("Proposal", back_populates="reviews")
    
    # Review type
    review_type = Column(String(50), nullable=False)  # pink, red, gold
    
    # Reviewer
    reviewer_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    # Scores
    overall_score = Column(Integer, nullable=True)
    technical_score = Column(Integer, nullable=True)
    management_score = Column(Integer, nullable=True)
    past_performance_score = Column(Integer, nullable=True)
    
    # Feedback
    strengths = Column(Text, nullable=True)
    weaknesses = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    
    # Detailed comments
    comments = Column(JSON, nullable=True)
    
    # Status
    status = Column(String(50), default="in_progress")
    completed_at = Column(DateTime, nullable=True)

