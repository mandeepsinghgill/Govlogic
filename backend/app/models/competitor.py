"""
Competitor intelligence and Program management models
"""
from sqlalchemy import Column, String, Integer, Float, Date, Text, ForeignKey, JSON, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ARRAY
from datetime import datetime, date
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin, TenantMixin
import enum


class Competitor(Base, UUIDMixin, TimestampMixin, TenantMixin):
    """Competitor profiles"""
    __tablename__ = "competitors"
    
    # Company info
    company_name = Column(String(255), nullable=False, unique=True)
    cage_code = Column(String(50), nullable=True)
    duns_number = Column(String(50), nullable=True)
    
    # Capabilities
    primary_naics = Column(ARRAY(String), nullable=True)
    capabilities = Column(JSON, nullable=True)
    
    # Win history
    total_wins = Column(Integer, default=0)
    total_contract_value = Column(Float, default=0.0)
    win_rate = Column(Float, nullable=True)
    
    # SWOT
    strengths = Column(Text, nullable=True)
    weaknesses = Column(Text, nullable=True)
    
    # Pricing patterns
    avg_contract_size = Column(Float, nullable=True)
    pricing_notes = Column(Text, nullable=True)
    
    # Teaming history
    common_partners = Column(ARRAY(String), nullable=True)
    
    # Protest history
    protest_count = Column(Integer, default=0)
    protest_success_rate = Column(Float, nullable=True)
    
    # Notes
    notes = Column(Text, nullable=True)
    
    # Organization
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)


class CompetitorWin(Base, UUIDMixin, TimestampMixin):
    """Competitor win/loss records"""
    __tablename__ = "competitor_wins"
    
    competitor_id = Column(String(36), ForeignKey("competitors.id"), nullable=False)
    
    # Contract info
    contract_number = Column(String(100), nullable=False)
    contract_title = Column(String(500), nullable=False)
    agency = Column(String(255), nullable=True)
    
    # Value and date
    contract_value = Column(Float, nullable=True)
    award_date = Column(Date, nullable=True)
    
    # Type
    contract_type = Column(String(50), nullable=True)
    set_aside = Column(String(50), nullable=True)
    
    # Source
    source = Column(String(100), default="fpds")  # fpds, sam.gov, manual



