"""
Brief Generation API Endpoints
Generate AI-powered opportunity briefs
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any
from app.services.brief_service import brief_service
from app.services.samgov_service import samgov_service
from app.core.auth import get_current_user
from app.models.organization import User
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class BriefGenerationRequest(BaseModel):
    opportunityId: str


@router.post("/generate")
async def generate_brief(
    request: BriefGenerationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate AI-powered opportunity brief
    
    Includes:
    - Fit score analysis
    - Company match assessment (why we match, strengths, gaps)
    - Relevant past performance examples  
    - Competitive analysis
    - Actionable next steps
    """
    try:
        opportunity_id = request.opportunityId
        logger.info(f"✅ Generating AI-powered brief for opportunity: {opportunity_id}")
        
        # Fetch opportunity details from SAM.gov
        opportunity_data = await samgov_service.get_opportunity_by_id(opportunity_id)
        
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
        brief = await brief_service.generate_brief(opportunity_id, opportunity_data)
        
        logger.info(f"✅ Brief generated successfully for {opportunity_id}")
        return brief
        
    except Exception as e:
        logger.error(f"❌ Brief generation error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate brief: {str(e)}"
        )


@router.get("/{opportunity_id}")
async def get_brief(
    opportunity_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get existing brief for an opportunity
    (Currently generates new brief each time - caching can be added later)
    """
    try:
        # Fetch opportunity details
        opportunity_data = await samgov_service.get_opportunity_by_id(opportunity_id)
        
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
        
        # Generate the brief
        brief = await brief_service.generate_brief(opportunity_id, opportunity_data)
        
        return brief
        
    except Exception as e:
        logger.error(f"❌ Error getting brief: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get brief: {str(e)}"
        )

