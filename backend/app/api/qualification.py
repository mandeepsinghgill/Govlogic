"""
Qualification Analysis API
Provides "Why You Qualify" analysis for opportunities
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.services.qualification_service import QualificationAnalysisService

router = APIRouter(prefix="/api/v1/qualification", tags=["qualification"])


@router.get("/{opportunity_id}")
async def get_qualification_brief(
    opportunity_id: str,
    organization_id: str,
    db: Session = Depends(get_db)
):
    """
    Get comprehensive qualification brief for an opportunity
    
    Returns detailed analysis of:
    - Eligibility (set-aside, size, NAICS, clearance, location)
    - Technical capability
    - Past performance
    - Capacity
    - Overall qualification score
    - Recommendations
    """
    
    service = QualificationAnalysisService(db)
    
    try:
        brief = service.generate_qualification_brief(
            opportunity_id=opportunity_id,
            organization_id=organization_id
        )
        
        return brief
    
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate qualification brief: {str(e)}")


@router.get("/{opportunity_id}/pdf")
async def download_qualification_brief_pdf(
    opportunity_id: str,
    organization_id: str,
    db: Session = Depends(get_db)
):
    """
    Download qualification brief as PDF
    
    Returns a 1-page PDF summary for internal bid/no-bid meetings
    """
    
    from fastapi.responses import FileResponse
    from app.services.document_service import document_service
    import json
    from pathlib import Path
    
    service = QualificationAnalysisService(db)
    
    try:
        # Generate brief
        brief = service.generate_qualification_brief(
            opportunity_id=opportunity_id,
            organization_id=organization_id
        )
        
        # Create simple text version for PDF
        content = f"""
QUALIFICATION BRIEF

Opportunity: {brief['opportunity']['title']}
Solicitation: {brief['opportunity']['solicitation_number']}
Agency: {brief['opportunity']['agency']}

OVERALL QUALIFICATION: {brief['qualification_level']}
Score: {brief['overall_score']}/100

RECOMMENDATION: {brief['recommendation']['decision']}
{brief['recommendation']['rationale']}

ELIGIBILITY: {brief['eligibility']['summary']}
TECHNICAL: {brief['technical_capability']['summary']}
PAST PERFORMANCE: {brief['past_performance']['summary']}
CAPACITY: {brief['capacity']['summary']}

NEXT STEPS:
{chr(10).join(f"{i+1}. {step['action']}: {step['description']}" for i, step in enumerate(brief['next_steps']))}

Generated: {brief['generated_at']}
"""
        
        # Save as text file (in production, would generate proper PDF)
        output_path = Path(f"/tmp/qualification_brief_{opportunity_id}.txt")
        output_path.write_text(content)
        
        return FileResponse(
            path=str(output_path),
            filename=f"qualification_brief_{brief['opportunity']['solicitation_number']}.txt",
            media_type="text/plain"
        )
    
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

