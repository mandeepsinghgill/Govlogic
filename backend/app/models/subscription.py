from sqlalchemy import Column, String, Float, Integer, Text, ForeignKey, JSON, Boolean, Date, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, date
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin
import enum


class SubscriptionTier(str, enum.Enum):
    """Subscription tiers"""
    FREE = "free"
    STARTER = "starter"
    PROFESSIONAL = "professional"
    BUSINESS = "business"
    ENTERPRISE = "enterprise"


class BillingInterval(str, enum.Enum):
    """Billing intervals"""
    MONTHLY = "monthly"
    ANNUAL = "annual"


class Subscription(Base, UUIDMixin, TimestampMixin):
    """Organization subscription"""
    __tablename__ = "subscriptions"
    
    # Organization
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False, unique=True)
    
    # Tier
    tier = Column(SQLEnum(SubscriptionTier), default=SubscriptionTier.STARTER)
    billing_interval = Column(SQLEnum(BillingInterval), default=BillingInterval.MONTHLY)
    
    # Pricing
    monthly_price = Column(Float, nullable=False)  # Actual price (may be discounted)
    base_price = Column(Float, nullable=False)  # List price
    
    # Founder's pricing
    is_founder = Column(Boolean, default=False)
    founder_discount_percent = Column(Float, default=0.0)  # 25% for first 500
    
    # Status
    status = Column(String(50), default="active")  # active, past_due, canceled, trial
    trial_end_date = Column(Date, nullable=True)
    
    # Stripe
    stripe_customer_id = Column(String(255), nullable=True)
    stripe_subscription_id = Column(String(255), nullable=True)
    stripe_price_id = Column(String(255), nullable=True)
    
    # Billing
    current_period_start = Column(Date, nullable=True)
    current_period_end = Column(Date, nullable=True)
    next_billing_date = Column(Date, nullable=True)
    
    # Payment method
    payment_method_last4 = Column(String(4), nullable=True)
    payment_method_brand = Column(String(50), nullable=True)  # visa, mastercard, etc.
    
    # Limits (based on tier)
    limits = Column(JSON, nullable=True)  # Dynamic limits per tier
    
    # Cancellation
    cancel_at_period_end = Column(Boolean, default=False)
    canceled_at = Column(DateTime, nullable=True)
    cancellation_reason = Column(Text, nullable=True)


class UsageTracking(Base, UUIDMixin, TimestampMixin):
    """Track usage for billing and limits"""
    __tablename__ = "usage_tracking"
    
    # Organization
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    
    # Period
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    
    # Proposals
    proposals_generated = Column(Integer, default=0)
    proposals_limit = Column(Integer, nullable=False)
    proposals_overage = Column(Integer, default=0)
    
    # Opportunities
    opportunities_tracked = Column(Integer, default=0)
    opportunities_limit = Column(Integer, nullable=False)
    
    # Contacts
    contacts_count = Column(Integer, default=0)
    contacts_limit = Column(Integer, nullable=False)
    
    # Users
    users_count = Column(Integer, default=0)
    users_limit = Column(Integer, nullable=False)
    
    # Capture plans
    capture_plans_active = Column(Integer, default=0)
    capture_plans_limit = Column(Integer, nullable=False)
    
    # PWin calculations
    pwin_calculations = Column(Integer, default=0)
    pwin_limit = Column(Integer, nullable=False)
    
    # AI email generations
    ai_emails_generated = Column(Integer, default=0)
    ai_emails_limit = Column(Integer, nullable=False)
    
    # Partner searches
    partner_searches = Column(Integer, default=0)
    partner_searches_limit = Column(Integer, nullable=False)
    
    # BOE generations
    boe_generations = Column(Integer, default=0)
    boe_limit = Column(Integer, nullable=False)
    
    # Price-to-win analyses
    price_to_win_analyses = Column(Integer, default=0)
    price_to_win_limit = Column(Integer, nullable=False)
    
    # Resume formatting
    resumes_formatted = Column(Integer, default=0)
    resumes_limit = Column(Integer, nullable=False)
    
    # SWOT analyses
    swot_analyses = Column(Integer, default=0)
    swot_limit = Column(Integer, nullable=False)
    
    # Storage
    storage_used_mb = Column(Float, default=0.0)
    storage_limit_mb = Column(Float, nullable=False)
    
    # API calls
    api_calls = Column(Integer, default=0)
    api_calls_limit = Column(Integer, nullable=True)


class Invoice(Base, UUIDMixin, TimestampMixin):
    """Invoices and billing history"""
    __tablename__ = "invoices"
    
    # Organization
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    subscription_id = Column(String(36), ForeignKey("subscriptions.id"), nullable=False)
    
    # Invoice details
    invoice_number = Column(String(100), nullable=False, unique=True)
    invoice_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=False)
    
    # Amounts
    subtotal = Column(Float, nullable=False)
    tax = Column(Float, default=0.0)
    total = Column(Float, nullable=False)
    
    # Line items
    line_items = Column(JSON, nullable=True)  # List of charges
    
    # Status
    status = Column(String(50), default="draft")  # draft, open, paid, void, uncollectible
    paid_at = Column(DateTime, nullable=True)
    
    # Stripe
    stripe_invoice_id = Column(String(255), nullable=True)
    stripe_payment_intent_id = Column(String(255), nullable=True)
    
    # Payment
    payment_method = Column(String(50), nullable=True)
    payment_date = Column(Date, nullable=True)


class AddOnPurchase(Base, UUIDMixin, TimestampMixin):
    """One-time add-on purchases"""
    __tablename__ = "addon_purchases"
    
    # Organization
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    
    # Add-on type
    addon_type = Column(String(100), nullable=False)  # extra_proposal, expert_review, etc.
    addon_name = Column(String(255), nullable=False)
    
    # Pricing
    price = Column(Float, nullable=False)
    quantity = Column(Integer, default=1)
    total = Column(Float, nullable=False)
    
    # Details
    description = Column(Text, nullable=True)
    extra_metadata = Column(JSON, nullable=True)  # Additional info
    
    # Status
    status = Column(String(50), default="pending")  # pending, completed, refunded
    
    # Stripe
    stripe_payment_intent_id = Column(String(255), nullable=True)
    
    # Fulfillment
    fulfilled_at = Column(DateTime, nullable=True)
    fulfilled_by = Column(String(36), nullable=True)


class ServiceEngagement(Base, UUIDMixin, TimestampMixin):
    """Professional services engagements"""
    __tablename__ = "service_engagements"
    
    # Organization
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    
    # Service type
    service_type = Column(String(100), nullable=False)  # expert_review, full_service, capture_retainer, etc.
    service_name = Column(String(255), nullable=False)
    
    # Pricing
    price = Column(Float, nullable=False)
    payment_terms = Column(String(100), nullable=True)  # 50% upfront, net 30, etc.
    
    # Scope
    scope_of_work = Column(Text, nullable=False)
    deliverables = Column(JSON, nullable=True)
    
    # Timeline
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    estimated_hours = Column(Float, nullable=True)
    
    # Status
    status = Column(String(50), default="pending")  # pending, in_progress, completed, canceled
    
    # Assignment
    assigned_to = Column(String(36), ForeignKey("users.id"), nullable=True)
    
    # Related opportunity/proposal
    opportunity_id = Column(String(36), ForeignKey("opportunities.id"), nullable=True)
    proposal_id = Column(String(36), ForeignKey("proposals.id"), nullable=True)
    
    # Completion
    completed_at = Column(DateTime, nullable=True)
    completion_notes = Column(Text, nullable=True)


class UpgradePrompt(Base, UUIDMixin, TimestampMixin):
    """Track upgrade prompts shown to users"""
    __tablename__ = "upgrade_prompts"
    
    # User/Organization
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    
    # Trigger
    trigger_event = Column(String(100), nullable=False)  # hit_proposal_limit, hit_contact_limit, etc.
    trigger_context = Column(JSON, nullable=True)
    
    # Prompt details
    current_tier = Column(String(50), nullable=False)
    suggested_tier = Column(String(50), nullable=False)
    
    # Message shown
    message_title = Column(String(255), nullable=False)
    message_body = Column(Text, nullable=False)
    
    # User action
    user_action = Column(String(50), nullable=True)  # upgraded, dismissed, maybe_later
    action_taken_at = Column(DateTime, nullable=True)
    
    # Conversion tracking
    converted_to_upgrade = Column(Boolean, default=False)
    upgraded_at = Column(DateTime, nullable=True)


class FeatureUsageLog(Base, UUIDMixin, TimestampMixin):
    """Detailed feature usage logging"""
    __tablename__ = "feature_usage_logs"
    
    # User/Organization
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    
    # Feature
    feature_name = Column(String(100), nullable=False)  # proposal_generation, pwin_calculation, etc.
    feature_category = Column(String(50), nullable=False)  # proposals, capture, pricing, etc.
    
    # Usage
    usage_count = Column(Integer, default=1)
    
    # Context
    context = Column(JSON, nullable=True)  # Additional metadata
    
    # Date
    usage_date = Column(Date, nullable=False)


# Tier limits configuration
TIER_LIMITS = {
    SubscriptionTier.FREE: {
        "monthly_price": 0,
        "founder_price": 0,
        "proposals_per_month": 1,
        "opportunities_max": 5,
        "contacts_max": 10,
        "users_max": 1,
        "storage_mb": 10,
        "features": {
            "proposal_generation": True,
            "opportunity_tracking": True,
            "basic_analytics": False,
            "ai_assistant": False,
            "team_collaboration": False
        }
    },
    SubscriptionTier.STARTER: {
        "monthly_price": 99,
        "founder_price": 79,
        "proposals_per_month": 5,
        "opportunities_max": 20,
        "contacts_max": 100,
        "users_max": 1,
        "storage_mb": 100,
        "features": {
            "proposal_generation": True,
            "opportunity_tracking": True,
            "basic_analytics": True,
            "ai_assistant": False,
            "team_collaboration": False
        }
    },
    SubscriptionTier.PROFESSIONAL: {
        "monthly_price": 299,
        "founder_price": 249,
        "proposals_per_month": 20,
        "opportunities_max": 100,
        "contacts_max": 1000,
        "users_max": 5,
        "storage_mb": 1024,
        "features": {
            "proposal_generation": True,
            "opportunity_tracking": True,
            "basic_analytics": True,
            "ai_assistant": True,
            "team_collaboration": True,
            "advanced_analytics": True,
            "custom_templates": True
        }
    },
    SubscriptionTier.BUSINESS: {
        "monthly_price": 799,
        "founder_price": 649,
        "proposals_per_month": 100,
        "opportunities_max": 500,
        "contacts_max": 5000,
        "users_max": 20,
        "storage_mb": 10240,
        "features": {
            "proposal_generation": True,
            "opportunity_tracking": True,
            "basic_analytics": True,
            "ai_assistant": True,
            "team_collaboration": True,
            "advanced_analytics": True,
            "custom_templates": True,
            "api_access": True,
            "dedicated_support": True
        }
    },
    SubscriptionTier.ENTERPRISE: {
        "monthly_price": 1999,
        "founder_price": 1599,
        "proposals_per_month": 99999,
        "opportunities_max": 99999,
        "contacts_max": 99999,
        "users_max": 99999,
        "storage_mb": 99999,
        "features": {
            "proposal_generation": True,
            "opportunity_tracking": True,
            "basic_analytics": True,
            "ai_assistant": True,
            "team_collaboration": True,
            "advanced_analytics": True,
            "custom_templates": True,
            "api_access": True,
            "dedicated_support": True,
            "on_premise": True,
            "custom_integrations": True
        }
    }
}

# Add-on pricing configuration
ADDON_PRICING = {
    "extra_proposals": {
        SubscriptionTier.FREE: 15,
        SubscriptionTier.STARTER: 10,
        SubscriptionTier.PROFESSIONAL: 8,
        SubscriptionTier.BUSINESS: 6,
        SubscriptionTier.ENTERPRISE: 4
    },
    "ai_assistant_hours": {
        SubscriptionTier.FREE: 30,
        SubscriptionTier.STARTER: 25,
        SubscriptionTier.PROFESSIONAL: 20,
        SubscriptionTier.BUSINESS: 15,
        SubscriptionTier.ENTERPRISE: 10
    },
    "additional_users": {
        SubscriptionTier.FREE: 60,
        SubscriptionTier.STARTER: 50,
        SubscriptionTier.PROFESSIONAL: 40,
        SubscriptionTier.BUSINESS: 30,
        SubscriptionTier.ENTERPRISE: 20
    },
    "storage_gb": 5
}

