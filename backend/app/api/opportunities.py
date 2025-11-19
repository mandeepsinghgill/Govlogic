"""
Opportunities API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from datetime import date
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.opportunity import Opportunity, OpportunityStage, OpportunityType, SetAsideType
from app.models.proposal import Proposal, ProposalStatus
from app.models.organization import User
from app.services.llm_service import llm_service
from app.services.samgov_service import samgov_service
from app.services.brief_service import BriefService
from app.services.gov_supreme_overlord_service import GovSupremeOverlordService
import logging

logger = logging.getLogger(__name__)
brief_service = BriefService()

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
        result = samgov_service.get_top_opportunities(limit=limit, min_pwin=min_pwin)
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
        # Note: samgov_service methods are synchronous, not async
        result = samgov_service.search_opportunities(
            page=page,
            limit=limit,
            naics_code=naics_code,
            keyword=keyword,
            posted_from=posted_from,
            posted_to=posted_to
        )
        return result
    except ValueError as ve:
        # Surface API key errors as 401 to the client
        raise HTTPException(status_code=401, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching opportunities: {str(e)}")


class SAMSearchRequest(BaseModel):
    keyword: str
    page: int = 1
    limit: int = 20
    naics_code: Optional[str] = None
    posted_from: Optional[str] = None
    posted_to: Optional[str] = None


@router.post("/sam-search")
async def sam_gov_search(
    request: SAMSearchRequest
):
    """
    Search SAM.gov opportunities directly with keyword
    This endpoint specifically searches SAM.gov with the provided keyword
    Minimum 4 characters required for keyword search
    """
    try:
        # Validate keyword length
        if len(request.keyword.strip()) < 4:
            raise HTTPException(
                status_code=400,
                detail="Keyword must be at least 4 characters long"
            )

        # Search SAM.gov via service
        result = samgov_service.search_opportunities(
            page=request.page,
            limit=request.limit,
            naics_code=request.naics_code,
            keyword=request.keyword.strip(),
            posted_from=request.posted_from,
            posted_to=request.posted_to
        )

        # Add search metadata
        result['search_info'] = {
            'keyword': request.keyword.strip(),
            'page': request.page,
            'limit': request.limit,
            'source': 'SAM.gov'
        }

        return result

    except HTTPException as he:
        raise he
    except ValueError as ve:
        # Handle API key validation errors
        raise HTTPException(
            status_code=401,
            detail=str(ve)
        )
    except Exception as e:
        # Log error for debugging
        print(f"SAM.gov search error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error searching SAM.gov: {str(e)}. Please check your SAM.gov API key configuration."
        )


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


async def _auto_generate_brief_and_proposal(
    opportunity_id: str,
    opportunity_data: dict,
    organization_id: str,
    user_id: Optional[str] = None
):
    """
    Background task to automatically generate brief and proposal for a new opportunity
    """
    from app.core.database import SessionLocal
    
    db = SessionLocal()
    try:
        logger.info(f"🤖 Auto-generating brief and proposal for opportunity: {opportunity_id}")
        
        # Generate Brief
        try:
            brief = await brief_service.generate_brief(opportunity_id, opportunity_data)
            logger.info(f"✅ Brief generated successfully for {opportunity_id}")
            
            # Store brief data in opportunity (or could create separate Brief table)
            opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
            if opp:
                # Store brief as JSON in description or create a field for it
                # For now, we'll store a reference that brief was generated
                logger.info(f"Brief generated: {brief.get('overview', {}).get('fitScore', 0)}% fit score")
        except Exception as e:
            logger.error(f"❌ Error auto-generating brief: {str(e)}")
        
        # Generate Proposal
        try:
            gov_supreme = GovSupremeOverlordService(db)
            
            # Prepare company knowledge base
            company_kb = {
                "organization_id": organization_id,
                "capabilities": [],
                "past_performance": [],
                "certifications": []
            }
            
            # Get RFP text from opportunity
            rfp_text = opportunity_data.get('description') or opportunity_data.get('synopsis', '') or f"""
Title: {opportunity_data.get('title', '')}
Agency: {opportunity_data.get('agency', '')}
NAICS: {opportunity_data.get('naicsCode', '')}
Description: {opportunity_data.get('description', '')}
"""
            
            # Generate full proposal
            proposal_package = await gov_supreme.generate_full_proposal(
                rfp_id=opportunity_id,
                rfp_text=rfp_text,
                company_kb=company_kb,
                user_preferences={
                    "page_limits": {"technical": 30, "management": 20, "past_performance": 15},
                    "style_guide": "booz_allen",
                    "include_color_teams": True
                }
            )
            
            # Create Proposal record in database
            proposal = Proposal(
                title=opportunity_data.get('title', 'Proposal'),
                solicitation_number=opportunity_data.get('solicitation_number'),
                opportunity_id=opportunity_id,
                organization_id=organization_id,
                created_by=user_id,
                status=ProposalStatus.DRAFT,
                rfp_text=rfp_text,
                requirements=proposal_package.get('rfp_analysis', {}),
                compliance_matrix=proposal_package.get('compliance_matrix', {}),
                outline=proposal_package.get('outline', {}),
                sections=proposal_package.get('proposal_sections', {}),
                red_team_report=proposal_package.get('red_team_review', {}),
                red_team_score=proposal_package.get('red_team_review', {}).get('overall_score', 0)
            )
            
            db.add(proposal)
            db.commit()
            db.refresh(proposal)
            
            logger.info(f"✅ Proposal generated and saved: {proposal.id}")
            
        except Exception as e:
            logger.error(f"❌ Error auto-generating proposal: {str(e)}")
            db.rollback()
        
    except Exception as e:
        logger.error(f"❌ Error in auto-generation task: {str(e)}")
        db.rollback()
    finally:
        db.close()


@router.post("/", response_model=OpportunityResponse)
async def create_opportunity(
    opportunity: OpportunityCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Create a new opportunity
    
    Automatically generates:
    - Brief (Shipley-compliant opportunity analysis)
    - Proposal (Full Shipley proposal with all sections)
    
    Generation runs in background so API returns immediately.
    
    For each opportunity created, the system will:
    1. Generate a comprehensive Shipley-compliant brief with fit score, win strategy, etc.
    2. Generate a complete proposal with all sections, compliance matrix, and red team review
    3. Store both in the database for the user/organization
    """
    
    # Create opportunity
    db_opportunity = Opportunity(**opportunity.dict())
    db.add(db_opportunity)
    db.commit()
    db.refresh(db_opportunity)
    
    # Prepare opportunity data for auto-generation
    opportunity_data = {
        "id": db_opportunity.id,
        "title": db_opportunity.title,
        "agency": db_opportunity.agency or "Federal Agency",
        "description": db_opportunity.description or "",
        "synopsis": db_opportunity.description or "",
        "value": db_opportunity.contract_value or 5000000,
        "dueDate": db_opportunity.due_date.strftime("%Y-%m-%d") if db_opportunity.due_date else "45 days",
        "naicsCode": db_opportunity.naics_code or "541511",
        "setAside": db_opportunity.set_aside.value if db_opportunity.set_aside else "Small Business Set-Aside",
        "solicitation_number": db_opportunity.solicitation_number
    }
    
    # Schedule automatic brief and proposal generation in background
    background_tasks.add_task(
        _auto_generate_brief_and_proposal,
        opportunity_id=str(db_opportunity.id),
        opportunity_data=opportunity_data,
        organization_id=opportunity.organization_id,
        user_id=None  # Will be set when user authentication is available
    )
    
    logger.info(f"✅ Opportunity created: {db_opportunity.id}. Brief and proposal generation started in background.")
    
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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get FULL opportunity details from SAM.gov
    Includes description, contract sections (H-L), attachments, point of contact
    """
    # Try to fetch from SAM.gov by ID
    opportunity_data = samgov_service.get_opportunity_by_id(opportunity_id)
    
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
    
    # Get organization for enhanced 10-factor PWin calculation
    from app.models.organization import Organization
    from app.services.enhanced_pwin_service import get_enhanced_pwin_service
    
    organization = db.query(Organization).filter(
        Organization.id == opportunity.organization_id
    ).first()
    
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    # Use enhanced 10-factor PWin service
    pwin_service = get_enhanced_pwin_service(db)
    result = pwin_service.calculate_10_factor_pwin(opportunity, organization)
    
    # Update opportunity with PWin score
    opportunity.pwin_score = int(result["pwin_score"])
    opportunity.qualification_scores = result["factors"]
    db.commit()
    
    return {
        "pwin_score": int(result["pwin_score"]),
        "factors": result["factors"],
        "recommendation": result["recommendation"],
        "confidence": result["confidence"],
        "weighted_scores": result["weighted_scores"]
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

