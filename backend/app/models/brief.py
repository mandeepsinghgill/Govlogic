"""
Brief models for opportunity briefs
"""
from sqlalchemy import Column, String, Text, ForeignKey, JSON, Boolean, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin, TenantMixin, SoftDeleteMixin


class Brief(Base, UUIDMixin, TimestampMixin, TenantMixin, SoftDeleteMixin):
    """Opportunity brief model - stores AI-generated briefs for caching"""
    __tablename__ = "briefs"
    
    # Opportunity link
    opportunity_id = Column(String(100), nullable=False, index=True)
    
    # Brief content (stored as JSON)
    brief_data = Column(JSON, nullable=False)  # Stores the full brief object
    
    # Metadata
    fit_score = Column(String(10), nullable=True)  # e.g., "85%"
    agency = Column(String(255), nullable=True)
    estimated_value = Column(String(100), nullable=True)
    due_date = Column(String(100), nullable=True)
    naics_code = Column(String(50), nullable=True)
    set_aside = Column(String(100), nullable=True)
    
    # Generation info
    ai_generated = Column(Boolean, default=True)
    ai_model = Column(String(50), nullable=True)  # e.g., "gpt-4o"
    generation_cost = Column(String(50), nullable=True)  # Track API costs
    
    # Organization
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="briefs")
    
    # Unique constraint: one brief per opportunity per organization
    __table_args__ = (
        UniqueConstraint('opportunity_id', 'organization_id', name='uq_brief_opportunity_org'),
    )

