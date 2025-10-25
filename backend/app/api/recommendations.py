"""
AI Opportunity Recommendations API
Provides Top 25 recommended opportunities based on AI matching
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel

from app.core.database import get_db
from app.services.opportunity_matching_service import OpportunityMatchingService

router = APIRouter(prefix="/api/v1/recommendations", tags=["recommendations"])


class OpportunityRecommendation(BaseModel):
    """Opportunity recommendation response"""
    opportunity_id: str
    title: str
    solicitation_number: str
    agency: str
    value: float
    due_date: Optional[str]
    ai_match_score: float
    match_grade: str
    pwin_score: float
    recommendation_reasons: List[str]
    match_color: str  # green/yellow/red
    

@router.get("/top25")
async def get_top_25_recommendations(
    organization_id: str,
    limit: int = Query(25, ge=1, le=100),
    filter_new: bool = Query(False, description="Only show opportunities posted in last 7 days"),
    filter_expiring: bool = Query(False, description="Only show opportunities expiring in next 14 days"),
    filter_high_value: bool = Query(False, description="Only show opportunities > $1M"),
    set_aside: Optional[str] = Query(None, description="Filter by set-aside type"),
    db: Session = Depends(get_db)
):
    """
    Get Top 25 AI-recommended opportunities for an organization
    
    Returns opportunities sorted by AI match score with:
    - AI match score (0-100)
    - Match grade (A+, A, B+, etc.)
    - PWin score
    - Recommendation reasons
    - Color indicator (green/yellow/red)
    
    Filters:
    - new: Posted in last 7 days
    - expiring_soon: Due in next 14 days
    - high_value: Value > $1M
    - set_aside: Filter by set-aside type
    """
    
    service = OpportunityMatchingService(db)
    
    # Build filters
    filters = {}
    if filter_new:
        filters["new"] = True
    if filter_expiring:
        filters["expiring_soon"] = True
    if filter_high_value:
        filters["high_value"] = True
    if set_aside:
        filters["set_aside"] = set_aside
    
    # Get recommendations
    recommendations = service.get_top_recommendations(
        organization_id=organization_id,
        limit=limit,
        filters=filters if filters else None
    )
    
    # Format response
    results = []
    for rec in recommendations:
        opp = rec["opportunity"]
        match_details = rec["match_details"]
        
        results.append({
            "opportunity_id": opp.id,
            "title": opp.title,
            "solicitation_number": opp.solicitation_number,
            "agency": opp.agency,
            "value": opp.estimated_value,
            "due_date": opp.response_deadline.isoformat() if opp.response_deadline else None,
            "posted_date": opp.posted_date.isoformat() if opp.posted_date else None,
            "ai_match_score": rec["ai_match_score"],
            "match_grade": match_details["grade"],
            "pwin_score": rec["pwin_score"],
            "recommendation_reasons": rec["recommendation_reason"],
            "match_color": service.get_match_color(rec["ai_match_score"]),
            "set_aside": opp.set_aside_type,
            "naics_code": opp.naics_code,
            "place_of_performance": opp.place_of_performance,
            "stage": opp.stage.value if opp.stage else "discovery"
        })
    
    return {
        "total": len(results),
        "organization_id": organization_id,
        "filters_applied": filters,
        "recommendations": results
    }


@router.get("/match-score/{opportunity_id}")
async def get_match_score(
    opportunity_id: str,
    organization_id: str,
    db: Session = Depends(get_db)
):
    """
    Get detailed AI match score breakdown for a specific opportunity
    
    Returns:
    - Overall score (0-100)
    - Score breakdown by factor:
      - Capability match (30 points)
      - Past performance (25 points)
      - Set-aside eligibility (20 points)
      - Contract size (15 points)
      - Geography (10 points)
      - Clearance (10 bonus points)
    - Match grade (A+, A, B+, etc.)
    - Recommendation reasons
    """
    
    from app.models.opportunity import Opportunity
    from app.models.organization import Organization
    
    service = OpportunityMatchingService(db)
    
    # Get opportunity and organization
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    org = db.query(Organization).filter(Organization.id == organization_id).first()
    if not org:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Organization not found")
    
    # Calculate match score
    match_score = service.calculate_ai_match_score(opp, org)
    
    # Generate reasons
    reasons = service._generate_recommendation_reason(match_score, opp, org)
    
    return {
        "opportunity_id": opportunity_id,
        "organization_id": organization_id,
        "overall_score": match_score["overall_score"],
        "grade": match_score["grade"],
        "color": service.get_match_color(match_score["overall_score"]),
        "score_breakdown": {
            "capability_match": {
                "score": match_score["scores"]["capability"],
                "max": 30,
                "percentage": round(match_score["scores"]["capability"] / 30 * 100, 1)
            },
            "past_performance": {
                "score": match_score["scores"]["past_performance"],
                "max": 25,
                "percentage": round(match_score["scores"]["past_performance"] / 25 * 100, 1)
            },
            "set_aside_eligibility": {
                "score": match_score["scores"]["set_aside"],
                "max": 20,
                "percentage": round(match_score["scores"]["set_aside"] / 20 * 100, 1)
            },
            "contract_size": {
                "score": match_score["scores"]["size"],
                "max": 15,
                "percentage": round(match_score["scores"]["size"] / 15 * 100, 1)
            },
            "geography": {
                "score": match_score["scores"]["geography"],
                "max": 10,
                "percentage": round(match_score["scores"]["geography"] / 10 * 100, 1)
            },
            "clearance_bonus": {
                "score": match_score["scores"]["clearance"],
                "max": 10,
                "percentage": round(match_score["scores"]["clearance"] / 10 * 100, 1) if match_score["scores"]["clearance"] > 0 else 0
            }
        },
        "recommendation_reasons": reasons
    }

