"""
Brief Generation API Endpoints
Generate AI-powered opportunity briefs with database caching
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.services.brief_service import brief_service
from app.services.samgov_service import samgov_service
from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.organization import User
from app.models.brief import Brief
import logging
import uuid

logger = logging.getLogger(__name__)

router = APIRouter()


class BriefGenerationRequest(BaseModel):
    opportunityId: str


@router.post("/generate")
async def generate_brief(
    request: BriefGenerationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate AI-powered opportunity brief (force regenerate)
    
    This endpoint always generates a new brief, even if one exists in cache.
    Use GET /{opportunity_id} to get cached briefs.
    
    Includes:
    - Fit score analysis
    - Company match assessment (why we match, strengths, gaps)
    - Relevant past performance examples  
    - Competitive analysis
    - Actionable next steps
    """
    try:
        opportunity_id = request.opportunityId
        logger.info(f"✅ Force generating AI-powered brief for opportunity: {opportunity_id}")
        
        # Fetch opportunity details from SAM.gov (synchronous function)
        opportunity_data = samgov_service.get_opportunity_by_id(opportunity_id)
        
        if not opportunity_data:
            # If not found in SAM.gov, create basic data structure
            logger.warning(f"Opportunity {opportunity_id} not found, using basic structure")
            opportunity_data = {
                "id": opportunity_id,
                "title": f"Opportunity {opportunity_id}",
                "agency": "Federal Agency",
                "description": "",
                "value": 5000000,
                "dueDate": "45 days",
                "naicsCode": "541511",
                "setAside": "Small Business Set-Aside"
            }
        
        # Generate the brief
        brief_data = await brief_service.generate_brief(opportunity_id, opportunity_data)
        
        # Extract metadata
        overview = brief_data.get('overview', {})
        
        # Check if brief already exists and update, or create new
        existing_brief = db.query(Brief).filter(
            Brief.opportunity_id == opportunity_id,
            Brief.organization_id == current_user.organization_id,
            Brief.is_deleted == False
        ).first()
        
        if existing_brief:
            # Update existing brief
            existing_brief.brief_data = brief_data
            existing_brief.fit_score = str(overview.get('fitScore', 'N/A'))
            existing_brief.agency = overview.get('agency', '')
            existing_brief.estimated_value = overview.get('estimatedValue', '')
            existing_brief.due_date = overview.get('dueDate', '')
            existing_brief.naics_code = overview.get('naics', '')
            existing_brief.set_aside = overview.get('setAside', '')
            db.commit()
            logger.info(f"✅ Brief updated in database for opportunity: {opportunity_id}")
        else:
            # Create new brief
            new_brief = Brief(
                id=str(uuid.uuid4()),
                opportunity_id=opportunity_id,
                organization_id=current_user.organization_id,
                brief_data=brief_data,
                fit_score=str(overview.get('fitScore', 'N/A')),
                agency=overview.get('agency', ''),
                estimated_value=overview.get('estimatedValue', ''),
                due_date=overview.get('dueDate', ''),
                naics_code=overview.get('naics', ''),
                set_aside=overview.get('setAside', ''),
                ai_generated=True,
                ai_model="gpt-4o"
            )
            db.add(new_brief)
            db.commit()
            logger.info(f"✅ Brief saved to database for opportunity: {opportunity_id}")
        
        return brief_data
        
    except Exception as e:
        logger.error(f"❌ Brief generation error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate brief: {str(e)}"
        )


@router.get("/{opportunity_id}")
async def get_brief(
    opportunity_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get existing brief for an opportunity from database cache
    If not found, generate it, save to database, and return it
    """
    if not opportunity_id or opportunity_id == ":1" or opportunity_id.startswith(":"):
        raise HTTPException(
            status_code=400,
            detail="Invalid opportunity ID provided"
        )
    
    try:
        # First, check if brief exists in database
        existing_brief = db.query(Brief).filter(
            Brief.opportunity_id == opportunity_id,
            Brief.organization_id == current_user.organization_id,
            Brief.is_deleted == False
        ).first()
        
        if existing_brief:
            logger.info(f"✅ Returning cached brief for opportunity: {opportunity_id}")
            return existing_brief.brief_data
        
        # Brief doesn't exist, generate it
        logger.info(f"📝 Brief not found in cache, generating for opportunity: {opportunity_id}")
        
        # Fetch opportunity details from SAM.gov
        opportunity_data = samgov_service.get_opportunity_by_id(opportunity_id)
        
        if not opportunity_data:
            opportunity_data = {
                "id": opportunity_id,
                "title": f"Opportunity {opportunity_id}",
                "agency": "Federal Agency",
                "description": "",
                "value": 5000000,
                "dueDate": "45 days",
                "naicsCode": "541511",
                "setAside": "Small Business Set-Aside"
            }
        
        # Generate the brief using AI
        brief_data = await brief_service.generate_brief(opportunity_id, opportunity_data)
        
        # Extract metadata for easy querying
        overview = brief_data.get('overview', {})
        
        # Save to database for caching
        new_brief = Brief(
            id=str(uuid.uuid4()),
            opportunity_id=opportunity_id,
            organization_id=current_user.organization_id,
            brief_data=brief_data,
            fit_score=str(overview.get('fitScore', 'N/A')),
            agency=overview.get('agency', ''),
            estimated_value=overview.get('estimatedValue', ''),
            due_date=overview.get('dueDate', ''),
            naics_code=overview.get('naics', ''),
            set_aside=overview.get('setAside', ''),
            ai_generated=True,
            ai_model="gpt-4o"  # Update based on actual model used
        )
        
        db.add(new_brief)
        db.commit()
        db.refresh(new_brief)
        
        logger.info(f"✅ Brief generated and saved to database for opportunity: {opportunity_id}")
        return brief_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting brief: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get brief: {str(e)}"
        )

