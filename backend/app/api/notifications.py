"""
Notification models for push notifications and alerts
"""
from sqlalchemy import Column, String, Text, ForeignKey, JSON, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin, TenantMixin
import enum


class NotificationType(str, enum.Enum):
    """Notification types"""
    NEW_OPPORTUNITY = "new_opportunity"
    OPPORTUNITY_DEADLINE = "opportunity_deadline"
    PROPOSAL_STATUS = "proposal_status"
    TEAM_MENTION = "team_mention"
    COMMENT_REPLY = "comment_reply"
    REVIEW_REQUEST = "review_request"
    AWARD_UPDATE = "award_update"
    SYSTEM_ALERT = "system_alert"
    USAGE_LIMIT = "usage_limit"
    UPGRADE_AVAILABLE = "upgrade_available"


class NotificationPriority(str, enum.Enum):
    """Notification priority levels"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class Notification(Base, UUIDMixin, TimestampMixin, TenantMixin):
    """User notifications"""
    __tablename__ = "notifications"
    
    # Recipient
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    # Notification details
    type = Column(SQLEnum(NotificationType), nullable=False)
    priority = Column(SQLEnum(NotificationPriority), default=NotificationPriority.NORMAL)
    
    # Content
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    
    # Action
    action_url = Column(String(500), nullable=True)
    action_text = Column(String(100), nullable=True)
    
    # Context
    context = Column(JSON, nullable=True)  # Related IDs, metadata
    
    # Status
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime, nullable=True)
    
    # Delivery
    sent_push = Column(Boolean, default=False)
    sent_email = Column(Boolean, default=False)
    sent_sms = Column(Boolean, default=False)


class DeviceToken(Base, UUIDMixin, TimestampMixin):
    """Mobile device tokens for push notifications"""
    __tablename__ = "device_tokens"
    
    # User
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    # Device info
    device_type = Column(String(50), nullable=False)  # ios, android, web
    device_token = Column(String(500), nullable=False, unique=True)
    device_name = Column(String(255), nullable=True)
    
    # Platform-specific
    platform = Column(String(50), nullable=True)  # fcm, apns
    
    # Status
    is_active = Column(Boolean, default=True)
    last_used = Column(DateTime, nullable=True)


class NotificationPreference(Base, UUIDMixin, TimestampMixin):
    """User notification preferences"""
    __tablename__ = "notification_preferences"
    
    # User
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, unique=True)
    
    # Channel preferences
    email_enabled = Column(Boolean, default=True)
    push_enabled = Column(Boolean, default=True)
    sms_enabled = Column(Boolean, default=False)
    
    # Type preferences (JSON: type -> enabled)
    type_preferences = Column(JSON, nullable=True)
    
    # Quiet hours
    quiet_hours_enabled = Column(Boolean, default=False)
    quiet_hours_start = Column(String(5), nullable=True)  # HH:MM
    quiet_hours_end = Column(String(5), nullable=True)  # HH:MM
    
    # Digest
    daily_digest_enabled = Column(Boolean, default=False)
    weekly_digest_enabled = Column(Boolean, default=False)

