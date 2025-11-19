"""
Expert Onboarding Models
"""
from sqlalchemy import Column, String, Integer, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class Expert(Base, UUIDMixin, TimestampMixin):
    """Expert model for ProTeam onboarding"""
    __tablename__ = "experts"
    
    # Basic info
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    
    # Expertise
    expertise_areas = Column(JSON, nullable=True)  # List of expertise areas (Defense, IT, Consulting, etc.)
    years_experience = Column(Integer, nullable=True)
    certifications = Column(JSON, nullable=True)  # List of certifications
    
    # Availability
    availability = Column(Boolean, default=True)
    max_concurrent_sessions = Column(Integer, default=5)
    
    # Rating
    rating = Column(Integer, default=5)  # 1-5 stars
    total_sessions = Column(Integer, default=0)
    
    # Bio
    bio = Column(Text, nullable=True)
    
    # Relationships
    sessions = relationship("OnboardingSession", back_populates="expert")


class OnboardingSession(Base, UUIDMixin, TimestampMixin):
    """Onboarding session with expert"""
    __tablename__ = "onboarding_sessions"
    
    # User
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    user = relationship("User", backref="onboarding_sessions")
    
    # Expert
    expert_id = Column(String(36), ForeignKey("experts.id"), nullable=True)
    expert = relationship("Expert", back_populates="sessions")
    
    # Session details
    status = Column(String(50), default="scheduled")  # scheduled, in_progress, completed, cancelled
    scheduled_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    
    # Video conference
    meeting_url = Column(String(1000), nullable=True)
    meeting_id = Column(String(100), nullable=True)
    
    # Notes and feedback
    notes = Column(Text, nullable=True)
    expert_notes = Column(Text, nullable=True)
    rating = Column(Integer, nullable=True)  # User rating of session (1-5)
    feedback = Column(Text, nullable=True)
    
    # Session type
    session_type = Column(String(50), default="initial")  # initial, followup, specialized

