"""
Grants models for NOFO/FOA management
"""
from sqlalchemy import Column, String, Float, Date, Text, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin, TenantMixin, SoftDeleteMixin


class Grant(Base, UUIDMixin, TimestampMixin, TenantMixin, SoftDeleteMixin):
    """Grant application model"""
    __tablename__ = "grants"
    
    # Basic info
    title = Column(String(500), nullable=False)
    funding_opportunity_number = Column(String(100), nullable=True, index=True)
    
    # Agency
    agency = Column(String(255), nullable=True)
    program_name = Column(String(255), nullable=True)
    
    # Funding
    total_funding = Column(Float, nullable=True)
    award_ceiling = Column(Float, nullable=True)
    award_floor = Column(Float, nullable=True)
    
    # Dates
    open_date = Column(Date, nullable=True)
    close_date = Column(Date, nullable=True)
    
    # NOFO document
    nofo_file_path = Column(String(500), nullable=True)
    nofo_text = Column(Text, nullable=True)
    
    # Requirements
    requirements = Column(JSON, nullable=True)
    eligibility_criteria = Column(JSON, nullable=True)
    
    # SF-424 forms
    sf424_data = Column(JSON, nullable=True)
    sf424a_budget = Column(JSON, nullable=True)
    
    # Budget narrative
    budget_narrative = Column(Text, nullable=True)
    
    # Project narrative
    project_narrative = Column(Text, nullable=True)
    
    # Status
    status = Column(String(50), default="draft")
    
    # Organization
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    
    # Grants.gov integration
    grants_gov_id = Column(String(100), nullable=True, unique=True)

