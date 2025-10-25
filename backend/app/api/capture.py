"""
Capture Management API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.models.opportunity import CapturePlan
from app.models.opportunity import Opportunity
from app.services.llm_service import llm_service

router = APIRouter()


class CapturePlanCreate(BaseModel):
    opportunity_id: str
    organization_id: str


class CapturePlanResponse(BaseModel):
    id: str
    opportunity_id: str
    situation_analysis: Optional[str]
    win_strategy: Optional[str]
    win_themes: Optional[list]
    discriminators: Optional[list]
    solution_architecture: Optional[str]
    teaming_strategy: Optional[str]
    pricing_strategy: Optional[str]
    status: str
    
    class Config:
        from_attributes = True


@router.post("/", response_model=CapturePlanResponse)
async def create_capture_plan(
    plan: CapturePlanCreate,
    db: Session = Depends(get_db)
):
    """Create a new capture plan"""
    
    # Check if opportunity exists
    opportunity = db.query(Opportunity).filter(
        Opportunity.id == plan.opportunity_id
    ).first()
    
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    # Check if capture plan already exists
    existing = db.query(CapturePlan).filter(
        CapturePlan.opportunity_id == plan.opportunity_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Capture plan already exists")
    
    db_plan = CapturePlan(**plan.dict())
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    
    return db_plan


@router.get("/{capture_plan_id}", response_model=CapturePlanResponse)
async def get_capture_plan(
    capture_plan_id: str,
    db: Session = Depends(get_db)
):
    """Get capture plan by ID"""
    
    plan = db.query(CapturePlan).filter(CapturePlan.id == capture_plan_id).first()
    
    if not plan:
        raise HTTPException(status_code=404, detail="Capture plan not found")
    
    return plan


@router.post("/{capture_plan_id}/generate")
async def generate_capture_plan(
    capture_plan_id: str,
    db: Session = Depends(get_db)
):
    """Generate capture plan using AI"""
    
    plan = db.query(CapturePlan).filter(CapturePlan.id == capture_plan_id).first()
    
    if not plan:
        raise HTTPException(status_code=404, detail="Capture plan not found")
    
    # Get opportunity
    opportunity = db.query(Opportunity).filter(
        Opportunity.id == plan.opportunity_id
    ).first()
    
    # Prepare data
    opp_data = {
        "title": opportunity.title,
        "agency": opportunity.agency,
        "contract_value": opportunity.contract_value,
        "description": opportunity.description
    }
    
    company_data = {
        "name": "Your Company"  # Would pull from organization
    }
    
    # Generate using AI
    result = await llm_service.generate_capture_plan(opp_data, company_data)
    
    # Update capture plan
    plan.situation_analysis = result.get('situation_analysis', '')
    plan.win_strategy = result.get('win_strategy', '')
    plan.win_themes = result.get('win_themes', [])
    plan.discriminators = result.get('discriminators', [])
    plan.solution_architecture = result.get('solution_architecture', '')
    plan.teaming_strategy = result.get('teaming_strategy', '')
    plan.pricing_strategy = result.get('pricing_strategy', '')
    plan.status = "generated"
    
    db.commit()
    
    return {
        "message": "Capture plan generated",
        "plan": result
    }

