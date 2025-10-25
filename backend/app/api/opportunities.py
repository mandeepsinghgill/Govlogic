"""
Opportunities API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from datetime import date
from app.core.database import get_db
from app.models.opportunity import Opportunity, OpportunityStage, OpportunityType, SetAsideType
from app.services.llm_service import llm_service
from app.services.samgov_service import samgov_service

router = APIRouter()


# Pydantic schemas
class OpportunityCreate(BaseModel):
    title: str
    solicitation_number: Optional[str] = None
    opportunity_type: OpportunityType
    agency: Optional[str] = None
    office: Optional[str] = None
    contract_value: Optional[float] = None
    contract_type: Optional[str] = None
    set_aside: Optional[SetAsideType] = None
    naics_code: Optional[str] = None
    due_date: Optional[date] = None
    description: Optional[str] = None
    organization_id: str


class OpportunityResponse(BaseModel):
    id: str
    title: str
    solicitation_number: Optional[str]
    opportunity_type: OpportunityType
    stage: OpportunityStage
    pwin_score: int
    contract_value: Optional[float]
    due_date: Optional[date]
    created_at: str
    
    class Config:
        from_attributes = True


class PWinCalculation(BaseModel):
    pwin_score: int
    factors: dict
    recommendation: str


@router.get("/top")
async def get_top_opportunities(
    limit: int = Query(default=10, le=50),
    min_pwin: Optional[int] = Query(default=60, ge=0, le=100)
):
    """
    Get top opportunities from SAM.gov
    Returns top opportunities with PWin scoring
    """
    try:
        result = await samgov_service.get_top_opportunities(limit=limit, min_pwin=min_pwin)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching opportunities: {str(e)}")


@router.get("/search")
async def search_opportunities(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, le=100),
    naics_code: Optional[str] = None,
    keyword: Optional[str] = None,
    posted_from: Optional[str] = None,
    posted_to: Optional[str] = None
):
    """
    Search SAM.gov opportunities with filters and pagination
    """
    try:
        result = await samgov_service.search_opportunities(
            page=page,
            limit=limit,
            naics_code=naics_code,
            keyword=keyword,
            posted_from=posted_from,
            posted_to=posted_to
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching opportunities: {str(e)}")


@router.get("/", response_model=List[OpportunityResponse])
async def list_opportunities(
    stage: Optional[OpportunityStage] = None,
    min_pwin: Optional[int] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """List all opportunities from database with optional filters"""
    query = db.query(Opportunity).filter(Opportunity.is_deleted == False)
    
    if stage:
        query = query.filter(Opportunity.stage == stage)
    
    if min_pwin is not None:
        query = query.filter(Opportunity.pwin_score >= min_pwin)
    
    opportunities = query.offset(skip).limit(limit).all()
    return opportunities


@router.post("/", response_model=OpportunityResponse)
async def create_opportunity(
    opportunity: OpportunityCreate,
    db: Session = Depends(get_db)
):
    """Create a new opportunity"""
    
    db_opportunity = Opportunity(**opportunity.dict())
    db.add(db_opportunity)
    db.commit()
    db.refresh(db_opportunity)
    
    return db_opportunity


@router.get("/{opportunity_id}", response_model=OpportunityResponse)
async def get_opportunity(
    opportunity_id: str,
    db: Session = Depends(get_db)
):
    """Get opportunity by ID"""
    
    opportunity = db.query(Opportunity).filter(
        Opportunity.id == opportunity_id,
        Opportunity.is_deleted == False
    ).first()
    
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    return opportunity


@router.get("/{opportunity_id}/details")
async def get_opportunity_details(
    opportunity_id: str,
    db: Session = Depends(get_db)
):
    """
    Get FULL opportunity details from SAM.gov
    Includes description, contract sections (H-L), attachments, point of contact
    """
    # Try to fetch from SAM.gov by ID
    opportunity_data = await samgov_service.get_opportunity_by_id(opportunity_id)
    
    if opportunity_data:
        return opportunity_data
    
    # Fallback: Check local database
    opportunity = db.query(Opportunity).filter(
        Opportunity.id == opportunity_id,
        Opportunity.is_deleted == False
    ).first()
    
    if opportunity:
        # Convert DB record to detailed format
        return {
            'id': opportunity.id,
            'title': opportunity.title,
            'synopsis': opportunity.description[:500] if opportunity.description else '',
            'fullDescription': opportunity.description or '',
            'solicitationNumber': opportunity.solicitation_number or '',
            'postedDate': opportunity.posted_date.isoformat() if opportunity.posted_date else None,
            'dueDate': opportunity.due_date.isoformat() if opportunity.due_date else None,
            'responseDeadline': opportunity.due_date.isoformat() if opportunity.due_date else None,
            'agency': opportunity.agency or '',
            'value': opportunity.contract_value,
            'naicsCode': opportunity.naics_code or '',
            'setAside': opportunity.set_aside or '',
            'type': opportunity.opportunity_type or '',
            'url': opportunity.source_url or '',
            'samGovUrl': opportunity.source_url or '',
            'active': opportunity.active,
            'sections': [],  # No sections in DB
            'attachments': [],
            'placeOfPerformance': {},
            'pointOfContact': [],
            'source': 'Database'
        }
    
    raise HTTPException(status_code=404, detail="Opportunity not found")


@router.post("/{opportunity_id}/calculate-pwin", response_model=PWinCalculation)
async def calculate_pwin(
    opportunity_id: str,
    db: Session = Depends(get_db)
):
    """Calculate PWin score for opportunity"""
    
    opportunity = db.query(Opportunity).filter(
        Opportunity.id == opportunity_id
    ).first()
    
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    # Prepare opportunity data for AI
    opp_data = {
        "title": opportunity.title,
        "agency": opportunity.agency,
        "contract_value": opportunity.contract_value,
        "set_aside": opportunity.set_aside,
        "description": opportunity.description
    }
    
    # Calculate PWin using AI
    result = await llm_service.calculate_pwin(opp_data)
    
    # Update opportunity
    opportunity.pwin_score = result.get("pwin", 0)
    opportunity.qualification_scores = result.get("factors", {})
    db.commit()
    
    return {
        "pwin_score": result.get("pwin", 0),
        "factors": result.get("factors", {}),
        "recommendation": result.get("recommendation", "")
    }


@router.post("/{opportunity_id}/qualify")
async def qualify_opportunity(
    opportunity_id: str,
    decision: str,  # "bid", "no-bid", "watch"
    db: Session = Depends(get_db)
):
    """Qualify opportunity (Bid/No-Bid decision)"""
    
    opportunity = db.query(Opportunity).filter(
        Opportunity.id == opportunity_id
    ).first()
    
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    if decision == "bid":
        opportunity.stage = OpportunityStage.QUALIFIED
    elif decision == "no-bid":
        opportunity.stage = OpportunityStage.LOST
    # "watch" keeps it in TRACKING
    
    db.commit()
    
    return {"message": f"Opportunity {decision} decision recorded", "stage": opportunity.stage}


@router.post("/{opportunity_id}/move-to-capture")
async def move_to_capture(
    opportunity_id: str,
    db: Session = Depends(get_db)
):
    """Move opportunity to capture stage"""
    
    opportunity = db.query(Opportunity).filter(
        Opportunity.id == opportunity_id
    ).first()
    
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    opportunity.stage = OpportunityStage.CAPTURE
    db.commit()
    
    return {"message": "Opportunity moved to capture stage"}


@router.delete("/{opportunity_id}")
async def delete_opportunity(
    opportunity_id: str,
    db: Session = Depends(get_db)
):
    """Soft delete opportunity"""
    
    opportunity = db.query(Opportunity).filter(
        Opportunity.id == opportunity_id
    ).first()
    
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    opportunity.is_deleted = True
    db.commit()
    
    return {"message": "Opportunity deleted"}


@router.get("/pipeline/summary")
async def get_pipeline_summary(
    db: Session = Depends(get_db)
):
    """Get pipeline summary statistics"""
    
    # Count by stage
    stages = {}
    for stage in OpportunityStage:
        count = db.query(Opportunity).filter(
            Opportunity.stage == stage,
            Opportunity.is_deleted == False
        ).count()
        stages[stage.value] = count
    
    # Total pipeline value
    total_value = db.query(func.sum(Opportunity.contract_value)).filter(
        Opportunity.is_deleted == False,
        Opportunity.stage.in_([
            OpportunityStage.QUALIFIED,
            OpportunityStage.CAPTURE,
            OpportunityStage.BID,
            OpportunityStage.SUBMITTED
        ])
    ).scalar() or 0
    
    # Average PWin
    avg_pwin = db.query(func.avg(Opportunity.pwin_score)).filter(
        Opportunity.is_deleted == False
    ).scalar() or 0
    
    return {
        "stages": stages,
        "total_pipeline_value": total_value,
        "average_pwin": round(avg_pwin, 1)
    }


@router.get("/stats")
async def get_opportunities_stats(
    db: Session = Depends(get_db)
):
    """
    Get summary statistics for opportunities
    Used by dashboard
    """
    total_count = db.query(Opportunity).filter(
        Opportunity.is_deleted == False,
        Opportunity.active == True
    ).count()
    
    avg_value = db.query(func.avg(Opportunity.contract_value)).filter(
        Opportunity.is_deleted == False,
        Opportunity.contract_value.isnot(None)
    ).scalar() or 0
    
    recent_count = db.query(Opportunity).filter(
        Opportunity.is_deleted == False,
        Opportunity.created_at >= datetime.now().date()
    ).count()
    
    return {
        "totalContracts": total_count,
        "totalActiveContracts": total_count,
        "averageValue": float(avg_value),
        "avgBidValue": float(avg_value),
        "recentOpportunitiesCount": recent_count
    }

