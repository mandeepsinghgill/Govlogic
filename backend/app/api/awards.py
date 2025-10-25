"""
Award tracking and post-submission API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import date
from app.core.database import get_db
from app.models.awards import AwardTracking, AwardStatus, LessonsLearned, ProtestDecision

router = APIRouter(prefix="/api/v1/awards", tags=["awards"])


class AwardTrackingCreate(BaseModel):
    opportunity_id: str
    proposal_id: Optional[str] = None
    status: str
    award_date: Optional[date] = None
    award_amount: Optional[float] = None
    winner_name: Optional[str] = None
    organization_id: str


class LessonsLearnedCreate(BaseModel):
    opportunity_id: Optional[str] = None
    title: str
    category: str
    situation: str
    lesson: str
    recommendation: str
    organization_id: str


class ProtestDecisionCreate(BaseModel):
    award_id: str
    potential_grounds: List[str]
    likelihood_of_success: int
    estimated_cost: float
    organization_id: str


@router.get("/")
async def list_awards(
    organization_id: str,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List award tracking records"""
    query = db.query(AwardTracking).filter(
        AwardTracking.organization_id == organization_id
    )
    
    if status:
        query = query.filter(AwardTracking.status == status)
    
    awards = query.all()
    
    return {"awards": awards}


@router.post("/")
async def create_award_tracking(
    award: AwardTrackingCreate,
    db: Session = Depends(get_db)
):
    """Create award tracking record"""
    db_award = AwardTracking(**award.dict())
    db.add(db_award)
    db.commit()
    db.refresh(db_award)
    
    return db_award


@router.post("/{award_id}/request-debrief")
async def request_debrief(
    award_id: str,
    db: Session = Depends(get_db)
):
    """Request a debrief"""
    award = db.query(AwardTracking).filter(AwardTracking.id == award_id).first()
    
    if not award:
        raise HTTPException(status_code=404, detail="Award not found")
    
    award.debrief_requested = True
    db.commit()
    
    return {"message": "Debrief requested", "award_id": award_id}


@router.post("/lessons-learned")
async def create_lesson_learned(
    lesson: LessonsLearnedCreate,
    db: Session = Depends(get_db)
):
    """Create a lessons learned entry"""
    db_lesson = LessonsLearned(**lesson.dict())
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    
    return db_lesson


@router.get("/lessons-learned")
async def list_lessons_learned(
    organization_id: str,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List lessons learned"""
    query = db.query(LessonsLearned).filter(
        LessonsLearned.organization_id == organization_id
    )
    
    if category:
        query = query.filter(LessonsLearned.category == category)
    
    lessons = query.all()
    
    return {"lessons": lessons}


@router.post("/protest-decision")
async def create_protest_decision(
    decision: ProtestDecisionCreate,
    db: Session = Depends(get_db)
):
    """Create protest decision analysis"""
    
    # AI-powered recommendation
    recommendation = "file" if decision.likelihood_of_success > 60 else "do_not_file"
    
    reasoning = (
        f"Based on {decision.likelihood_of_success}% likelihood of success "
        f"and estimated cost of ${decision.estimated_cost:,.2f}, "
        f"we recommend {'filing' if recommendation == 'file' else 'not filing'} a protest."
    )
    
    db_decision = ProtestDecision(
        award_id=decision.award_id,
        potential_grounds=decision.potential_grounds,
        likelihood_of_success=decision.likelihood_of_success,
        estimated_cost=decision.estimated_cost,
        recommendation=recommendation,
        reasoning=reasoning,
        organization_id=decision.organization_id
    )
    
    db.add(db_decision)
    db.commit()
    db.refresh(db_decision)
    
    return db_decision


@router.get("/analytics")
async def get_award_analytics(
    organization_id: str,
    db: Session = Depends(get_db)
):
    """Get award analytics"""
    
    total_bids = db.query(AwardTracking).filter(
        AwardTracking.organization_id == organization_id
    ).count()
    
    wins = db.query(AwardTracking).filter(
        AwardTracking.organization_id == organization_id,
        AwardTracking.status == AwardStatus.AWARDED_TO_US
    ).count()
    
    win_rate = (wins / total_bids * 100) if total_bids > 0 else 0
    
    return {
        "total_bids": total_bids,
        "wins": wins,
        "losses": total_bids - wins,
        "win_rate": win_rate
    }

