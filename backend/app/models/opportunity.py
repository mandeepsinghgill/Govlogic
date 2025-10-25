"""
Opportunity models for pipeline management
"""
from sqlalchemy import Column, String, Integer, Float, Date, Text, ForeignKey, Enum as SQLEnum, JSON, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin, TenantMixin, SoftDeleteMixin
import enum


class OpportunityStage(str, enum.Enum):
    """Opportunity pipeline stages"""
    TRACKING = "tracking"
    QUALIFIED = "qualified"
    CAPTURE = "capture"
    BID = "bid"
    SUBMITTED = "submitted"
    WON = "won"
    LOST = "lost"


class OpportunityType(str, enum.Enum):
    """Type of opportunity"""
    RFP = "rfp"
    RFQ = "rfq"
    NOFO = "nofo"
    FOA = "foa"
    SOURCES_SOUGHT = "sources_sought"
    RFI = "rfi"


class SetAsideType(str, enum.Enum):
    """Set-aside categories"""
    FULL_OPEN = "full_open"
    SMALL_BUSINESS = "small_business"
    EIGHT_A = "8a"
    WOSB = "wosb"
    HUBZONE = "hubzone"
    SDVOSB = "sdvosb"


class Opportunity(Base, UUIDMixin, TimestampMixin, TenantMixin, SoftDeleteMixin):
    """Opportunity model"""
    __tablename__ = "opportunities"
    
    # Basic info
    title = Column(String(500), nullable=False)
    solicitation_number = Column(String(100), nullable=True, index=True)
    opportunity_type = Column(SQLEnum(OpportunityType), nullable=False)
    
    # Agency info
    agency = Column(String(255), nullable=True)
    office = Column(String(255), nullable=True)
    
    # Contract details
    contract_value = Column(Float, nullable=True)
    contract_type = Column(String(50), nullable=True)  # FFP, T&M, Cost-Plus
    set_aside = Column(SQLEnum(SetAsideType), nullable=True)
    naics_code = Column(String(20), nullable=True)
    
    # Dates
    posted_date = Column(Date, nullable=True)
    due_date = Column(Date, nullable=True)
    award_date = Column(Date, nullable=True)
    
    # Stage and PWin
    stage = Column(SQLEnum(OpportunityStage), default=OpportunityStage.TRACKING, nullable=False)
    pwin_score = Column(Integer, default=0, nullable=False)  # 0-100
    
    # Description
    description = Column(Text, nullable=True)
    requirements_summary = Column(Text, nullable=True)
    
    # Scoring factors (JSON)
    qualification_scores = Column(JSON, nullable=True)  # 10-factor scores
    
    # SAM.gov integration
    sam_gov_id = Column(String(100), nullable=True, unique=True)
    sam_gov_url = Column(String(500), nullable=True)
    
    # Relationships
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    organization = relationship("Organization", back_populates="opportunities")
    
    capture_plan = relationship("CapturePlan", back_populates="opportunity", uselist=False)
    proposals = relationship("Proposal", back_populates="opportunity")
    competitors = relationship("OpportunityCompetitor", back_populates="opportunity")
    team_members = relationship("OpportunityTeam", back_populates="opportunity")
    awards = relationship("AwardTracking")
    lessons_learned = relationship("LessonsLearned")
    protest_decisions = relationship("ProtestDecision", back_populates="opportunity")


class CapturePlan(Base, UUIDMixin, TimestampMixin, TenantMixin):
    """Capture plan for opportunities"""
    __tablename__ = "capture_plans"
    
    opportunity_id = Column(String(36), ForeignKey("opportunities.id"), nullable=False, unique=True)
    opportunity = relationship("Opportunity", back_populates="capture_plan")
    
    # Shipley capture plan sections
    situation_analysis = Column(Text, nullable=True)
    win_strategy = Column(Text, nullable=True)
    win_themes = Column(JSON, nullable=True)  # List of themes
    discriminators = Column(JSON, nullable=True)  # List of discriminators
    solution_architecture = Column(Text, nullable=True)
    teaming_strategy = Column(Text, nullable=True)
    pricing_strategy = Column(Text, nullable=True)
    action_plan = Column(JSON, nullable=True)  # Timeline with milestones
    
    # Customer engagement
    customer_contacts = Column(JSON, nullable=True)
    touchpoints = Column(JSON, nullable=True)
    
    # Status
    status = Column(String(50), default="draft")
    approved_by = Column(String(36), nullable=True)
    approved_at = Column(Date, nullable=True)


class OpportunityCompetitor(Base, UUIDMixin, TimestampMixin):
    """Competitors for an opportunity"""
    __tablename__ = "opportunity_competitors"
    
    opportunity_id = Column(String(36), ForeignKey("opportunities.id"), nullable=False)
    opportunity = relationship("Opportunity", back_populates="competitors")
    
    competitor_name = Column(String(255), nullable=False)
    is_incumbent = Column(Boolean, default=False)
    
    # SWOT
    strengths = Column(Text, nullable=True)
    weaknesses = Column(Text, nullable=True)
    differentiators = Column(Text, nullable=True)
    
    # Likelihood
    likelihood_score = Column(Integer, default=50)  # 0-100


class OpportunityTeam(Base, UUIDMixin, TimestampMixin):
    """Team members assigned to opportunity"""
    __tablename__ = "opportunity_teams"
    
    opportunity_id = Column(String(36), ForeignKey("opportunities.id"), nullable=False)
    opportunity = relationship("Opportunity", back_populates="team_members")
    
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    role = Column(String(100), nullable=False)  # Capture Manager, Proposal Manager, etc.
    
    is_lead = Column(Boolean, default=False)

