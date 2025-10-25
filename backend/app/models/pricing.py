"""
Pricing and cost estimation models
"""
from sqlalchemy import Column, String, Float, Integer, Text, ForeignKey, JSON, Boolean, Date, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin, TenantMixin
import enum


class ContractType(str, enum.Enum):
    """Contract pricing types"""
    FFP = "ffp"  # Firm Fixed Price
    T_AND_M = "t_and_m"  # Time & Materials
    COST_PLUS_FIXED_FEE = "cpff"
    COST_PLUS_AWARD_FEE = "cpaf"
    COST_PLUS_INCENTIVE_FEE = "cpif"
    LABOR_HOUR = "labor_hour"
    IDIQ = "idiq"


class LaborCategory(Base, UUIDMixin, TimestampMixin, TenantMixin):
    """Labor rate library"""
    __tablename__ = "labor_categories"
    
    # Category
    category_name = Column(String(255), nullable=False)
    category_code = Column(String(50), nullable=True)
    
    # Rates
    hourly_rate = Column(Float, nullable=False)
    loaded_rate = Column(Float, nullable=True)  # With fringe + overhead + G&A
    
    # Year
    rate_year = Column(Integer, nullable=False)
    escalation_rate = Column(Float, default=3.0)  # Annual % increase
    
    # Requirements
    education_requirement = Column(String(255), nullable=True)
    experience_years = Column(Integer, nullable=True)
    clearance_required = Column(String(50), nullable=True)
    
    # GSA Schedule
    gsa_sin = Column(String(50), nullable=True)  # Special Item Number
    gsa_rate = Column(Float, nullable=True)
    
    # Organization
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)


class IndirectRate(Base, UUIDMixin, TimestampMixin, TenantMixin):
    """Indirect rate structure"""
    __tablename__ = "indirect_rates"
    
    # Rate type
    rate_type = Column(String(50), nullable=False)  # fringe, overhead, g_and_a, profit
    
    # Rate
    rate_percentage = Column(Float, nullable=False)
    
    # Fiscal year
    fiscal_year = Column(Integer, nullable=False)
    
    # DCAA approval
    is_dcaa_approved = Column(Boolean, default=False)
    approval_date = Column(Date, nullable=True)
    
    # Ceiling
    ceiling_amount = Column(Float, nullable=True)
    
    # Organization
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)


class PriceEstimate(Base, UUIDMixin, TimestampMixin, TenantMixin):
    """Price estimates for opportunities"""
    __tablename__ = "price_estimates"
    
    # Opportunity
    opportunity_id = Column(String(36), ForeignKey("opportunities.id"), nullable=False)
    
    # Contract details
    contract_type = Column(SQLEnum(ContractType), nullable=False)
    period_of_performance_months = Column(Integer, nullable=False)
    
    # Labor
    labor_hours = Column(JSON, nullable=True)  # {category: hours}
    labor_cost = Column(Float, default=0.0)
    
    # Other Direct Costs (ODCs)
    travel_cost = Column(Float, default=0.0)
    materials_cost = Column(Float, default=0.0)
    subcontractor_cost = Column(Float, default=0.0)
    other_direct_cost = Column(Float, default=0.0)
    
    # Indirects
    fringe_cost = Column(Float, default=0.0)
    overhead_cost = Column(Float, default=0.0)
    ga_cost = Column(Float, default=0.0)
    
    # Total Cost
    total_cost = Column(Float, default=0.0)
    
    # Fee/Profit
    fee_percentage = Column(Float, default=10.0)
    fee_amount = Column(Float, default=0.0)
    
    # Total Price
    total_price = Column(Float, default=0.0)
    
    # Price-to-Win Analysis
    estimated_government_budget = Column(Float, nullable=True)
    competitor_likely_price = Column(Float, nullable=True)
    price_position = Column(String(50), nullable=True)  # low, competitive, high
    
    # Risk
    cost_risk_percentage = Column(Float, default=5.0)
    risk_amount = Column(Float, default=0.0)
    
    # Notes
    assumptions = Column(Text, nullable=True)
    basis_of_estimate = Column(Text, nullable=True)
    
    # Status
    status = Column(String(50), default="draft")
    approved_by = Column(String(36), nullable=True)
    approved_at = Column(Date, nullable=True)
    
    # Organization
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)


class BasisOfEstimate(Base, UUIDMixin, TimestampMixin):
    """Detailed BOE for labor categories"""
    __tablename__ = "basis_of_estimates"
    
    # Price estimate
    price_estimate_id = Column(String(36), ForeignKey("price_estimates.id"), nullable=False)
    
    # Labor category
    labor_category_id = Column(String(36), ForeignKey("labor_categories.id"), nullable=False)
    
    # Effort
    hours_per_month = Column(Float, nullable=False)
    number_of_months = Column(Integer, nullable=False)
    total_hours = Column(Float, nullable=False)
    
    # Tasks
    tasks = Column(JSON, nullable=True)  # List of tasks this category performs
    
    # Justification
    justification = Column(Text, nullable=True)
    
    # Rates
    hourly_rate = Column(Float, nullable=False)
    escalation_applied = Column(Boolean, default=False)
    
    # Total
    total_cost = Column(Float, nullable=False)


class PriceToWinAnalysis(Base, UUIDMixin, TimestampMixin, TenantMixin):
    """Price-to-win competitive analysis"""
    __tablename__ = "price_to_win_analyses"
    
    # Opportunity
    opportunity_id = Column(String(36), ForeignKey("opportunities.id"), nullable=False)
    
    # Government Budget Intelligence
    estimated_budget = Column(Float, nullable=True)
    budget_source = Column(String(255), nullable=True)  # FPDS, agency forecast, etc.
    budget_confidence = Column(Integer, default=50)  # 0-100
    
    # Competitive Intelligence
    incumbent_price = Column(Float, nullable=True)
    competitor_prices = Column(JSON, nullable=True)  # {competitor: price}
    
    # Our Position
    our_cost = Column(Float, nullable=False)
    our_target_price = Column(Float, nullable=False)
    our_fee_percentage = Column(Float, nullable=False)
    
    # Analysis
    price_position = Column(String(50), nullable=True)  # low, competitive, high
    win_probability_at_price = Column(Integer, nullable=True)  # 0-100
    
    # Recommendations
    recommended_price = Column(Float, nullable=True)
    recommended_strategy = Column(Text, nullable=True)
    
    # Scenarios
    scenarios = Column(JSON, nullable=True)  # Different price points
    
    # Organization
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)


class HistoricalPricing(Base, UUIDMixin, TimestampMixin, TenantMixin):
    """Historical pricing data from FPDS"""
    __tablename__ = "historical_pricing"
    
    # Contract info
    contract_number = Column(String(100), nullable=False)
    agency = Column(String(255), nullable=True)
    
    # Award
    award_amount = Column(Float, nullable=False)
    award_date = Column(Date, nullable=True)
    
    # Contract details
    contract_type = Column(String(50), nullable=True)
    naics_code = Column(String(20), nullable=True)
    set_aside = Column(String(50), nullable=True)
    
    # Winner
    winner_name = Column(String(255), nullable=True)
    winner_duns = Column(String(50), nullable=True)
    
    # Normalized metrics
    price_per_fte = Column(Float, nullable=True)
    price_per_year = Column(Float, nullable=True)
    
    # Source
    source = Column(String(50), default="fpds")
    
    # Organization
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)

