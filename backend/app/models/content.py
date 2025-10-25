from sqlalchemy import Column, String, Float, Text, ForeignKey, JSON, Boolean, Date, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin, TenantMixin


class ContentTemplate(Base, UUIDMixin, TimestampMixin, TenantMixin):
    """Reusable content templates"""
    __tablename__ = "content_templates"
    
    # Template info
    title = Column(String(500), nullable=False)
    category = Column(String(100), nullable=False)  # executive_summary, technical, management
    
    # Content
    content = Column(Text, nullable=False)
    
    # Metadata
    tags = Column(JSON, nullable=True)
    keywords = Column(JSON, nullable=True)
    
    # Usage
    usage_count = Column(Integer, default=0)
    last_used = Column(Date, nullable=True)
    
    # Quality
    effectiveness_score = Column(Integer, nullable=True)  # Based on win rate
    
    # Version
    version = Column(Integer, default=1)
    parent_template_id = Column(String(36), nullable=True)  # For versioning
    
    # Approval
    is_approved = Column(Boolean, default=False)
    approved_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    approved_at = Column(Date, nullable=True)
    
    # Organization
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)


class Boilerplate(Base, UUIDMixin, TimestampMixin, TenantMixin):
    """Boilerplate content library"""
    __tablename__ = "boilerplate"
    
    # Content
    title = Column(String(500), nullable=False)
    section_type = Column(String(100), nullable=False)  # company_overview, facilities, etc.
    content = Column(Text, nullable=False)
    
    # Applicability
    applies_to_naics = Column(JSON, nullable=True)
    applies_to_agencies = Column(JSON, nullable=True)
    
    # Metadata
    word_count = Column(Integer, default=0)
    last_updated = Column(Date, nullable=True)
    
    # Usage tracking
    usage_count = Column(Integer, default=0)
    win_rate = Column(Float, nullable=True)  # When this content was used
    
    # Organization
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)


class EmailTemplate(Base, UUIDMixin, TimestampMixin, TenantMixin):
    """Email templates for campaigns"""
    __tablename__ = "email_templates"
    
    # Template
    name = Column(String(255), nullable=False)
    template_type = Column(String(100), nullable=False)  # capability_statement, follow_up, etc.
    
    # Content
    subject = Column(String(500), nullable=False)
    body_html = Column(Text, nullable=False)
    body_text = Column(Text, nullable=True)
    
    # Variables
    variables = Column(JSON, nullable=True)  # {{company_name}}, {{opportunity_title}}
    
    # SendGrid
    sendgrid_template_id = Column(String(100), nullable=True)
    
    # Usage
    sent_count = Column(Integer, default=0)
    open_rate = Column(Float, nullable=True)
    click_rate = Column(Float, nullable=True)
    response_rate = Column(Float, nullable=True)
    
    # Organization
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)


class EmailCampaign(Base, UUIDMixin, TimestampMixin, TenantMixin):
    """Email campaign tracking"""
    __tablename__ = "email_campaigns"
    
    # Campaign
    name = Column(String(255), nullable=False)
    template_id = Column(String(36), ForeignKey("email_templates.id"), nullable=False)
    
    # Opportunity (optional)
    opportunity_id = Column(String(36), ForeignKey("opportunities.id"), nullable=True)
    
    # Recipients
    recipient_list = Column(JSON, nullable=False)  # List of email addresses
    
    # Scheduling
    scheduled_send_date = Column(Date, nullable=True)
    sent_date = Column(Date, nullable=True)
    
    # Status
    status = Column(String(50), default="draft")  # draft, scheduled, sent, completed
    
    # Results
    total_sent = Column(Integer, default=0)
    total_delivered = Column(Integer, default=0)
    total_opened = Column(Integer, default=0)
    total_clicked = Column(Integer, default=0)
    total_responded = Column(Integer, default=0)
    
    # Organization
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)

