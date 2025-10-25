from sqlalchemy import Column, String, Float, Integer, Text, ForeignKey, JSON, Date, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin, TenantMixin


class PipelineSnapshot(Base, UUIDMixin, TimestampMixin, TenantMixin):
    """Daily snapshot of pipeline metrics"""
    __tablename__ = "pipeline_snapshots"
    
    # Date
    snapshot_date = Column(Date, nullable=False)
    
    # Counts by stage
    leads_count = Column(Integer, default=0)
    qualified_count = Column(Integer, default=0)
    capture_count = Column(Integer, default=0)
    proposal_count = Column(Integer, default=0)
    submitted_count = Column(Integer, default=0)
    awarded_count = Column(Integer, default=0)
    
    # Values by stage
    leads_value = Column(Float, default=0.0)
    qualified_value = Column(Float, default=0.0)
    capture_value = Column(Float, default=0.0)
    proposal_value = Column(Float, default=0.0)
    submitted_value = Column(Float, default=0.0)
    awarded_value = Column(Float, default=0.0)
    
    # Weighted pipeline (value × PWin)
    weighted_pipeline = Column(Float, default=0.0)
    
    # Conversion rates
    lead_to_qualified_rate = Column(Float, default=0.0)
    qualified_to_capture_rate = Column(Float, default=0.0)
    capture_to_proposal_rate = Column(Float, default=0.0)
    proposal_to_submit_rate = Column(Float, default=0.0)
    submit_to_win_rate = Column(Float, default=0.0)
    
    # Velocity (days)
    avg_days_lead_to_qualified = Column(Float, default=0.0)
    avg_days_qualified_to_capture = Column(Float, default=0.0)
    avg_days_capture_to_proposal = Column(Float, default=0.0)
    avg_days_proposal_to_submit = Column(Float, default=0.0)
    avg_days_submit_to_award = Column(Float, default=0.0)


class RevenueForecast(Base, UUIDMixin, TimestampMixin, TenantMixin):
    """Revenue forecasts"""
    __tablename__ = "revenue_forecasts"
    
    # Forecast period
    forecast_month = Column(Date, nullable=False)
    
    # Forecasted revenue
    forecasted_revenue = Column(Float, nullable=False)
    
    # Breakdown
    existing_contracts = Column(Float, default=0.0)
    high_probability_wins = Column(Float, default=0.0)  # PWin > 70%
    medium_probability_wins = Column(Float, default=0.0)  # PWin 40-70%
    low_probability_wins = Column(Float, default=0.0)  # PWin < 40%
    
    # Confidence
    confidence_level = Column(Float, default=0.0)  # 0-100%
    
    # Actual (filled in after month ends)
    actual_revenue = Column(Float, nullable=True)
    variance = Column(Float, nullable=True)


class CapacityPlanning(Base, UUIDMixin, TimestampMixin, TenantMixin):
    """Capacity planning and resource allocation"""
    __tablename__ = "capacity_planning"
    
    # Planning period
    planning_month = Column(Date, nullable=False)
    
    # Available capacity
    total_staff = Column(Integer, nullable=False)
    total_hours_available = Column(Float, nullable=False)
    
    # Allocated capacity
    hours_allocated_existing = Column(Float, default=0.0)
    hours_allocated_capture = Column(Float, default=0.0)
    hours_allocated_proposal = Column(Float, default=0.0)
    
    # Remaining capacity
    hours_remaining = Column(Float, default=0.0)
    utilization_rate = Column(Float, default=0.0)  # Percentage
    
    # Hiring needs
    additional_staff_needed = Column(Integer, default=0)
    hiring_urgency = Column(String(50), nullable=True)  # low, medium, high
    
    # Skills breakdown
    skills_needed = Column(JSON, nullable=True)


class WinLossAnalysis(Base, UUIDMixin, TimestampMixin, TenantMixin):
    """Win/loss analysis aggregated data"""
    __tablename__ = "win_loss_analysis"
    
    # Time period
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    
    # Overall stats
    total_bids = Column(Integer, default=0)
    wins = Column(Integer, default=0)
    losses = Column(Integer, default=0)
    no_bids = Column(Integer, default=0)
    
    # Win rate
    overall_win_rate = Column(Float, default=0.0)
    
    # By contract type
    win_rate_by_type = Column(JSON, nullable=True)
    
    # By agency
    win_rate_by_agency = Column(JSON, nullable=True)
    
    # By NAICS
    win_rate_by_naics = Column(JSON, nullable=True)
    
    # By set-aside
    win_rate_by_set_aside = Column(JSON, nullable=True)
    
    # By contract size
    win_rate_small = Column(Float, default=0.0)  # < $1M
    win_rate_medium = Column(Float, default=0.0)  # $1M-$10M
    win_rate_large = Column(Float, default=0.0)  # > $10M
    
    # Loss reasons (aggregated)
    loss_reasons = Column(JSON, nullable=True)
    
    # Average metrics
    avg_bid_value = Column(Float, default=0.0)
    avg_win_value = Column(Float, default=0.0)
    avg_pwin_score = Column(Float, default=0.0)


class CompetitivePositioning(Base, UUIDMixin, TimestampMixin, TenantMixin):
    """Competitive positioning analysis"""
    __tablename__ = "competitive_positioning"
    
    # Competitor
    competitor_id = Column(String(36), ForeignKey("competitors.id"), nullable=False)
    
    # Time period
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    
    # Head-to-head stats
    opportunities_competed = Column(Integer, default=0)
    we_won = Column(Integer, default=0)
    they_won = Column(Integer, default=0)
    
    # Win rate against this competitor
    win_rate_vs_competitor = Column(Float, default=0.0)
    
    # Pricing comparison
    avg_our_price = Column(Float, default=0.0)
    avg_their_price = Column(Float, default=0.0)
    price_differential = Column(Float, default=0.0)  # Percentage
    
    # Strengths/weaknesses
    their_strengths = Column(JSON, nullable=True)
    their_weaknesses = Column(JSON, nullable=True)
    our_advantages = Column(JSON, nullable=True)
    
    # Recommended strategy
    recommended_strategy = Column(Text, nullable=True)


class MarketIntelligence(Base, UUIDMixin, TimestampMixin, TenantMixin):
    """Market intelligence and trends"""
    __tablename__ = "market_intelligence"
    
    # Market segment
    naics_code = Column(String(10), nullable=True)
    agency_name = Column(String(255), nullable=True)
    
    # Time period
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    
    # Market size
    total_opportunities = Column(Integer, default=0)
    total_value = Column(Float, default=0.0)
    avg_opportunity_value = Column(Float, default=0.0)
    
    # Competition
    avg_competitors_per_opp = Column(Float, default=0.0)
    top_competitors = Column(JSON, nullable=True)
    
    # Trends
    growth_rate = Column(Float, default=0.0)  # YoY percentage
    seasonality = Column(JSON, nullable=True)  # Monthly patterns
    
    # Set-aside distribution
    set_aside_distribution = Column(JSON, nullable=True)
    
    # Contract types
    contract_type_distribution = Column(JSON, nullable=True)
    
    # Insights
    key_insights = Column(JSON, nullable=True)
    opportunities_identified = Column(JSON, nullable=True)


class UserActivityMetrics(Base, UUIDMixin, TimestampMixin):
    """User activity and engagement metrics"""
    __tablename__ = "user_activity_metrics"
    
    # User
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    
    # Date
    activity_date = Column(Date, nullable=False)
    
    # Activity counts
    logins = Column(Integer, default=0)
    proposals_created = Column(Integer, default=0)
    opportunities_viewed = Column(Integer, default=0)
    searches_performed = Column(Integer, default=0)
    documents_uploaded = Column(Integer, default=0)
    comments_made = Column(Integer, default=0)
    
    # Time spent (minutes)
    total_time_minutes = Column(Float, default=0.0)
    
    # Features used
    features_used = Column(JSON, nullable=True)


class SystemMetrics(Base, UUIDMixin, TimestampMixin):
    """System performance and health metrics"""
    __tablename__ = "system_metrics"
    
    # Timestamp
    metric_timestamp = Column(DateTime, nullable=False)
    
    # Performance
    avg_response_time_ms = Column(Float, default=0.0)
    p95_response_time_ms = Column(Float, default=0.0)
    p99_response_time_ms = Column(Float, default=0.0)
    
    # API usage
    api_requests_count = Column(Integer, default=0)
    api_errors_count = Column(Integer, default=0)
    api_error_rate = Column(Float, default=0.0)
    
    # LLM usage
    llm_requests_count = Column(Integer, default=0)
    llm_tokens_used = Column(Integer, default=0)
    llm_cost = Column(Float, default=0.0)
    
    # Storage
    storage_used_gb = Column(Float, default=0.0)
    documents_stored = Column(Integer, default=0)
    
    # Active users
    active_users_count = Column(Integer, default=0)
    active_organizations_count = Column(Integer, default=0)

