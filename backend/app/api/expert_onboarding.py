"""
Expert Onboarding API
Handles expert matching, session scheduling, and onboarding guidance
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

from app.services.expert_matching_service import get_expert_matching_service
from app.models.expert import Expert, OnboardingSession
from app.core.auth import get_current_user
from app.core.database import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/v1/expert-onboarding", tags=["expert-onboarding"])


class ScheduleSessionRequest(BaseModel):
    scheduled_at: Optional[str] = None  # ISO datetime string
    expert_id: Optional[str] = None
    session_type: str = "initial"


@router.post("/match-expert")
async def match_expert(
    user_profile: Optional[Dict[str, Any]] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Match user with best available expert"""
    matching_service = get_expert_matching_service(db)
    
    expert = matching_service.match_expert(
        user_id=current_user.id,
        user_profile=user_profile
    )
    
    if not expert:
        raise HTTPException(status_code=404, detail="No available expert found")
    
    return {
        "expert": {
            "id": expert.id,
            "name": expert.name,
            "email": expert.email,
            "expertise_areas": expert.expertise_areas,
            "years_experience": expert.years_experience,
            "rating": expert.rating,
            "bio": expert.bio
        }
    }


@router.get("/available-experts")
async def get_available_experts(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all available experts"""
    experts = db.query(Expert).filter(
        Expert.availability == True
    ).all()
    
    return {
        "experts": [
            {
                "id": expert.id,
                "name": expert.name,
                "expertise_areas": expert.expertise_areas,
                "years_experience": expert.years_experience,
                "rating": expert.rating,
                "bio": expert.bio
            }
            for expert in experts
        ]
    }


@router.post("/schedule-session")
async def schedule_session(
    request: ScheduleSessionRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Schedule onboarding session with expert"""
    matching_service = get_expert_matching_service(db)
    
    # Parse scheduled_at if provided
    scheduled_at = None
    if request.scheduled_at:
        try:
            scheduled_at = datetime.fromisoformat(request.scheduled_at.replace('Z', '+00:00'))
        except:
            scheduled_at = datetime.now()
    
    # Create session
    session = matching_service.create_session(
        user_id=current_user.id,
        expert_id=request.expert_id,
        scheduled_at=scheduled_at or datetime.now()
    )
    
    return {
        "message": "Session scheduled successfully",
        "session": {
            "id": session.id,
            "expert_id": session.expert_id,
            "status": session.status,
            "scheduled_at": str(session.scheduled_at) if session.scheduled_at else None
        }
    }


@router.get("/my-sessions")
async def get_my_sessions(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's onboarding sessions"""
    sessions = db.query(OnboardingSession).filter(
        OnboardingSession.user_id == current_user.id
    ).order_by(OnboardingSession.scheduled_at.desc()).all()
    
    return {
        "sessions": [
            {
                "id": session.id,
                "expert_id": session.expert_id,
                "status": session.status,
                "scheduled_at": str(session.scheduled_at) if session.scheduled_at else None,
                "meeting_url": session.meeting_url
            }
            for session in sessions
        ]
    }


@router.post("/session/{session_id}/complete")
async def complete_session(
    session_id: str,
    rating: Optional[int] = Query(None, ge=1, le=5),
    feedback: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark session as completed and provide feedback"""
    session = db.query(OnboardingSession).filter(
        OnboardingSession.id == session_id,
        OnboardingSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session.status = "completed"
    session.completed_at = datetime.now()
    if rating:
        session.rating = rating
    if feedback:
        session.feedback = feedback
    
    # Update expert rating
    if session.expert_id and rating:
        expert = db.query(Expert).filter(Expert.id == session.expert_id).first()
        if expert:
            # Recalculate average rating
            completed_sessions = db.query(OnboardingSession).filter(
                OnboardingSession.expert_id == expert.id,
                OnboardingSession.rating.isnot(None)
            ).all()
            if completed_sessions:
                avg_rating = sum(s.rating for s in completed_sessions) / len(completed_sessions)
                expert.rating = round(avg_rating)
                expert.total_sessions = len(completed_sessions)
    
    db.commit()
    
    return {
        "message": "Session completed successfully",
        "session_id": session_id
    }

