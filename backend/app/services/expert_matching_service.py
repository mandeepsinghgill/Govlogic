"""
Expert Matching Service
Matches users with appropriate experts for onboarding
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc
from app.core.database import get_db
from app.models.expert import Expert, OnboardingSession
from app.models.organization import User

import logging

logger = logging.getLogger(__name__)


class ExpertMatchingService:
    """Service for matching users with onboarding experts"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def match_expert(
        self,
        user_id: str,
        user_profile: Optional[Dict[str, Any]] = None
    ) -> Optional[Expert]:
        """
        Match user with best expert based on:
        - Industry
        - Use case (proposals vs grants)
        - Team size
        - Goals
        
        Returns best matching expert or None if no match found
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.error(f"User not found: {user_id}")
            return None
        
        # Get onboarding data
        import json
        onboarding_data = {}
        if hasattr(user, 'onboarding_data') and user.onboarding_data:
            try:
                onboarding_data = json.loads(user.onboarding_data) if isinstance(user.onboarding_data, str) else user.onboarding_data
            except:
                pass
        
        # If user_profile not provided, extract from onboarding_data
        if not user_profile:
            user_profile = {
                "industry": onboarding_data.get("industry", ""),
                "primary_use": onboarding_data.get("primary_use", ""),
                "team_size": onboarding_data.get("team_size", ""),
                "goals": onboarding_data.get("goals", [])
            }
        
        # Find available experts
        experts = self.db.query(Expert).filter(
            Expert.availability == True
        ).all()
        
        if not experts:
            logger.warning("No available experts found")
            return None
        
        # Score and rank experts
        scored_experts = []
        for expert in experts:
            score = self._calculate_match_score(expert, user_profile)
            scored_experts.append({
                "expert": expert,
                "score": score
            })
        
        # Sort by score (highest first)
        scored_experts.sort(key=lambda x: x["score"], reverse=True)
        
        # Return best match
        if scored_experts and scored_experts[0]["score"] > 0:
            return scored_experts[0]["expert"]
        
        # If no good match, return first available expert
        return experts[0] if experts else None
    
    def _calculate_match_score(
        self,
        expert: Expert,
        user_profile: Dict[str, Any]
    ) -> float:
        """Calculate match score (0-100)"""
        score = 0.0
        
        # Industry match (40 points)
        industry = user_profile.get("industry", "").lower()
        if expert.expertise_areas:
            expert_areas = [area.lower() for area in expert.expertise_areas] if isinstance(expert.expertise_areas, list) else []
            if industry in expert_areas or any(industry in area for area in expert_areas):
                score += 40
        
        # Experience level (30 points)
        if expert.years_experience:
            if expert.years_experience >= 10:
                score += 30
            elif expert.years_experience >= 5:
                score += 20
            else:
                score += 10
        
        # Rating (20 points)
        if expert.rating:
            score += (expert.rating / 5.0) * 20
        
        # Availability (10 points)
        if expert.availability:
            # Check current session count
            active_sessions = self.db.query(OnboardingSession).filter(
                OnboardingSession.expert_id == expert.id,
                OnboardingSession.status.in_(["scheduled", "in_progress"])
            ).count()
            
            if active_sessions < expert.max_concurrent_sessions:
                score += 10
        
        return score
    
    def get_available_experts(self) -> List[Expert]:
        """Get all available experts"""
        return self.db.query(Expert).filter(
            Expert.availability == True
        ).all()
    
    def create_session(
        self,
        user_id: str,
        expert_id: Optional[str] = None,
        scheduled_at: Optional[datetime] = None
    ) -> OnboardingSession:
        """Create onboarding session"""
        # If no expert_id provided, match one
        if not expert_id:
            expert = self.match_expert(user_id)
            if not expert:
                raise Exception("No available expert found")
            expert_id = expert.id
        
        session = OnboardingSession(
            user_id=user_id,
            expert_id=expert_id,
            status="scheduled",
            scheduled_at=scheduled_at
        )
        
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        
        return session


# Singleton function
def get_expert_matching_service(db: Session) -> ExpertMatchingService:
    return ExpertMatchingService(db)

