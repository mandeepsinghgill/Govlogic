from sqlalchemy import Column, String, Text, ForeignKey, JSON, Boolean, Date, DateTime, Float, Integer, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin
import enum


class PortalAccess(Base, UUIDMixin, TimestampMixin):
    """Portal access for government customers"""
    __tablename__ = "portal_access"
    
    # Contract/Program
    program_id = Column(String(36), ForeignKey("programs.id"), nullable=False)
    
    # Customer info
    customer_email = Column(String(255), nullable=False)
    customer_name = Column(String(255), nullable=False)
    customer_organization = Column(String(255), nullable=False)
    customer_role = Column(String(100), nullable=True)  # COR, PM, etc.
    
    # Access
    access_token = Column(String(500), nullable=False, unique=True)
    is_active = Column(Boolean, default=True)
    
    # Permissions
    can_view_deliverables = Column(Boolean, default=True)
    can_approve_deliverables = Column(Boolean, default=False)
    can_view_financials = Column(Boolean, default=False)
    can_add_comments = Column(Boolean, default=True)
    
    # Last activity
    last_login = Column(DateTime, nullable=True)
    login_count = Column(Integer, default=0)


class DeliverableSubmission(Base, UUIDMixin, TimestampMixin):
    """Deliverable submissions for customer review"""
    __tablename__ = "deliverable_submissions"
    
    # Program/Milestone
    program_id = Column(String(36), ForeignKey("programs.id"), nullable=False)
    milestone_id = Column(String(36), ForeignKey("milestones.id"), nullable=True)
    
    # Deliverable info
    deliverable_name = Column(String(255), nullable=False)
    deliverable_number = Column(String(50), nullable=True)  # CLIN, etc.
    description = Column(Text, nullable=True)
    
    # Due date
    due_date = Column(Date, nullable=False)
    submitted_date = Column(Date, nullable=True)
    
    # Status
    status = Column(String(50), default="pending")  # pending, submitted, under_review, approved, rejected
    
    # Files
    file_urls = Column(JSON, nullable=True)  # List of S3 URLs
    file_metadata = Column(JSON, nullable=True)
    
    # Review
    reviewed_by = Column(String(255), nullable=True)
    reviewed_date = Column(Date, nullable=True)
    review_comments = Column(Text, nullable=True)
    
    # Approval
    approved_by = Column(String(255), nullable=True)
    approved_date = Column(Date, nullable=True)
    approval_signature = Column(String(500), nullable=True)


class CustomerFeedback(Base, UUIDMixin, TimestampMixin):
    """Customer feedback and comments"""
    __tablename__ = "customer_feedback"
    
    # Program
    program_id = Column(String(36), ForeignKey("programs.id"), nullable=False)
    
    # Customer
    portal_access_id = Column(String(36), ForeignKey("portal_access.id"), nullable=False)
    customer_name = Column(String(255), nullable=False)
    
    # Related item
    deliverable_id = Column(String(36), ForeignKey("deliverable_submissions.id"), nullable=True)
    milestone_id = Column(String(36), ForeignKey("milestones.id"), nullable=True)
    
    # Feedback
    feedback_type = Column(String(50), nullable=False)  # comment, issue, praise, question
    subject = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    
    # Priority
    priority = Column(String(50), default="normal")  # low, normal, high, urgent
    
    # Response
    response = Column(Text, nullable=True)
    responded_by = Column(String(36), nullable=True)
    responded_at = Column(DateTime, nullable=True)
    
    # Status
    status = Column(String(50), default="open")  # open, in_progress, resolved, closed


class PerformanceReport(Base, UUIDMixin, TimestampMixin):
    """Performance reports for customer portal"""
    __tablename__ = "performance_reports"
    
    # Program
    program_id = Column(String(36), ForeignKey("programs.id"), nullable=False)
    
    # Report period
    report_period = Column(String(50), nullable=False)  # "2024-Q1", "2024-03", etc.
    report_date = Column(Date, nullable=False)
    
    # Deliverables
    deliverables_due = Column(Integer, default=0)
    deliverables_submitted = Column(Integer, default=0)
    deliverables_on_time = Column(Integer, default=0)
    deliverables_late = Column(Integer, default=0)
    
    # Milestones
    milestones_due = Column(Integer, default=0)
    milestones_completed = Column(Integer, default=0)
    milestones_on_track = Column(Integer, default=0)
    milestones_at_risk = Column(Integer, default=0)
    
    # Schedule
    schedule_variance_days = Column(Float, default=0.0)
    schedule_performance_index = Column(Float, default=1.0)  # SPI
    
    # Cost (if customer has access)
    cost_variance = Column(Float, nullable=True)
    cost_performance_index = Column(Float, nullable=True)  # CPI
    
    # Quality
    quality_score = Column(Float, nullable=True)  # 0-100
    customer_satisfaction = Column(Float, nullable=True)  # 0-100
    
    # Risks
    open_risks = Column(Integer, default=0)
    high_priority_risks = Column(Integer, default=0)
    
    # Issues
    open_issues = Column(Integer, default=0)
    resolved_issues = Column(Integer, default=0)
    
    # Executive summary
    executive_summary = Column(Text, nullable=True)
    key_accomplishments = Column(JSON, nullable=True)
    upcoming_milestones = Column(JSON, nullable=True)
    
    # Report file
    report_file_url = Column(String(500), nullable=True)


class CustomerNotification(Base, UUIDMixin, TimestampMixin):
    """Notifications sent to government customers"""
    __tablename__ = "customer_notifications"
    
    # Portal access
    portal_access_id = Column(String(36), ForeignKey("portal_access.id"), nullable=False)
    
    # Notification
    notification_type = Column(String(50), nullable=False)  # deliverable_submitted, milestone_completed, etc.
    subject = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    
    # Related items
    program_id = Column(String(36), ForeignKey("programs.id"), nullable=True)
    deliverable_id = Column(String(36), ForeignKey("deliverable_submissions.id"), nullable=True)
    
    # Delivery
    sent_email = Column(Boolean, default=False)
    sent_at = Column(DateTime, nullable=True)
    
    # Read status
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime, nullable=True)


class PortalActivity(Base, UUIDMixin, TimestampMixin):
    """Track customer portal activity"""
    __tablename__ = "portal_activity"
    
    # Portal access
    portal_access_id = Column(String(36), ForeignKey("portal_access.id"), nullable=False)
    
    # Activity
    activity_type = Column(String(50), nullable=False)  # login, view_deliverable, download, comment, etc.
    activity_description = Column(String(255), nullable=True)
    
    # Context
    program_id = Column(String(36), nullable=True)
    deliverable_id = Column(String(36), nullable=True)
    
    # Activity_metadata
    activity_metadata = Column(JSON, nullable=True)
    
    # IP and user agent
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)

