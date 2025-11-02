"""
Grants API endpoints - Complete grant discovery and management
"""
from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.grant import Grant
from app.models.organization import User
from app.services.grants_service import grants_service
import uuid
from datetime import datetime

router = APIRouter()


class GrantCreate(BaseModel):
    title: str
    funding_opportunity_number: str
    agency: Optional[str] = None
    award_ceiling: Optional[float] = None
    award_floor: Optional[float] = None
    deadline: Optional[str] = None
    posted_date: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None
    category: Optional[str] = None
    cfda_numbers: Optional[list] = None
    estimated_funding: Optional[float] = None


class GrantUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class GrantResponse(BaseModel):
    id: str
    title: str
    funding_opportunity_number: str
    status: str
    agency: Optional[str] = None
    award_ceiling: Optional[float] = None
    deadline: Optional[str] = None
    
    class Config:
        from_attributes = True


@router.get("/discover")
async def discover_grants(
    keyword: Optional[str] = Query(None, description="Search keyword"),
    agency: Optional[str] = Query(None, description="Filter by agency"),
    limit: int = Query(20, le=100, description="Number of results"),
    offset: int = Query(0, ge=0, description="Pagination offset")
):
    """
    Discover federal grant opportunities from SAM.gov
    Search grants by keyword, agency, and other filters
    Note: This endpoint is public and doesn't require authentication
    """
    try:
        result = grants_service.search_grants(
            keyword=keyword,
            agency=agency,
            limit=limit,
            offset=offset
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching grants: {str(e)}")


@router.get("/discover/{grant_id}")
async def get_grant_opportunity(
    grant_id: str
):
    """
    Get detailed information about a specific grant opportunity
    Note: This endpoint is public and doesn't require authentication
    """
    try:
        grant = grants_service.get_grant_detail(grant_id)
        return grant
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching grant details: {str(e)}")


@router.get("/", response_model=List[GrantResponse])
async def list_grants(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all grants for the current user's organization"""
    grants = db.query(Grant).filter(
        Grant.organization_id == current_user.organization_id,
        Grant.is_deleted == False
    ).all()
    return grants


@router.post("/", response_model=GrantResponse)
async def create_grant(
    grant: GrantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new grant application"""
    
    # Parse deadline if provided
    close_date = None
    if grant.deadline:
        try:
            # Handle both ISO format and simple date strings
            if 'T' in grant.deadline:
                close_date = datetime.fromisoformat(grant.deadline.replace('Z', '+00:00')).date()
            else:
                close_date = datetime.fromisoformat(grant.deadline).date()
        except Exception as e:
            # If parsing fails, log it but don't crash
            print(f"Warning: Could not parse deadline '{grant.deadline}': {e}")
    
    # Parse open/posted date if provided
    open_date = None
    if grant.posted_date:
        try:
            if 'T' in grant.posted_date:
                open_date = datetime.fromisoformat(grant.posted_date.replace('Z', '+00:00')).date()
            else:
                open_date = datetime.fromisoformat(grant.posted_date).date()
        except Exception as e:
            print(f"Warning: Could not parse posted_date '{grant.posted_date}': {e}")
    
    # Build requirements JSON with CFDA numbers and category
    requirements = {}
    if grant.cfda_numbers:
        requirements['cfda_numbers'] = grant.cfda_numbers
    if grant.category:
        requirements['category'] = grant.category
    if grant.url:
        requirements['sam_gov_url'] = grant.url
    
    db_grant = Grant(
        id=str(uuid.uuid4()),
        title=grant.title,
        funding_opportunity_number=grant.funding_opportunity_number,
        organization_id=current_user.organization_id,
        agency=grant.agency or 'Unknown Agency',
        award_ceiling=grant.award_ceiling or grant.estimated_funding,
        award_floor=grant.award_floor,
        total_funding=grant.estimated_funding or grant.award_ceiling,
        close_date=close_date,
        open_date=open_date,
        status='draft',
        nofo_text=grant.description,  # Store description as NOFO text
        requirements=requirements if requirements else None
    )
    db.add(db_grant)
    db.commit()
    db.refresh(db_grant)
    return db_grant


@router.get("/{grant_id}", response_model=GrantResponse)
async def get_grant(
    grant_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific grant application"""
    grant = db.query(Grant).filter(
        Grant.id == grant_id,
        Grant.organization_id == current_user.organization_id,
        Grant.is_deleted == False
    ).first()
    
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")
    
    return grant


@router.put("/{grant_id}", response_model=GrantResponse)
async def update_grant(
    grant_id: str,
    grant_update: GrantUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a grant application"""
    grant = db.query(Grant).filter(
        Grant.id == grant_id,
        Grant.organization_id == current_user.organization_id,
        Grant.is_deleted == False
    ).first()
    
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")
    
    # Update fields
    if grant_update.title:
        grant.title = grant_update.title
    if grant_update.status:
        grant.status = grant_update.status
    if grant_update.notes:
        grant.notes = grant_update.notes
    
    db.commit()
    db.refresh(grant)
    return grant


@router.delete("/{grant_id}")
async def delete_grant(
    grant_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Soft delete a grant application"""
    grant = db.query(Grant).filter(
        Grant.id == grant_id,
        Grant.organization_id == current_user.organization_id,
        Grant.is_deleted == False
    ).first()
    
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")
    
    grant.is_deleted = True
    db.commit()
    
    return {"message": "Grant deleted successfully"}


@router.post("/{grant_id}/sf424")
async def save_sf424_data(
    grant_id: str,
    sf424_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Save SF-424 form data to grant"""
    grant = db.query(Grant).filter(
        Grant.id == grant_id,
        Grant.organization_id == current_user.organization_id,
        Grant.is_deleted == False
    ).first()
    
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")
    
    grant.sf424_data = sf424_data
    db.commit()
    db.refresh(grant)
    
    return {"message": "SF-424 data saved successfully", "grant_id": grant_id}


@router.post("/{grant_id}/budget")
async def save_budget_data(
    grant_id: str,
    budget_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Save budget data to grant"""
    grant = db.query(Grant).filter(
        Grant.id == grant_id,
        Grant.organization_id == current_user.organization_id,
        Grant.is_deleted == False
    ).first()
    
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")
    
    grant.sf424a_budget = budget_data
    grant.budget_narrative = budget_data.get('budget_narrative', '')
    db.commit()
    db.refresh(grant)
    
    return {"message": "Budget data saved successfully", "grant_id": grant_id}


@router.post("/parse-nofo")
async def parse_nofo_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Parse NOFO/FOA document and extract requirements"""
    import tempfile
    import os
    from app.services.document_service import DocumentProcessingService
    
    # Save uploaded file temporarily
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1])
    try:
        content = await file.read()
        temp_file.write(content)
        temp_file.close()
        
        # Extract text from document
        doc_service = DocumentProcessingService()
        text = doc_service.extract_text(temp_file.name)
        
        # Mock parsed data (in production, use AI service to extract)
        parsed_data = {
            "title": "Extracted from " + file.filename,
            "agency": "Federal Agency",
            "opportunity_number": "NOFO-2025-001",
            "deadline": "2025-12-31",
            "eligibility": [
                "Non-profit organizations",
                "State and local governments",
                "Institutions of higher education",
                "Tribal organizations"
            ],
            "requirements": [
                {
                    "id": "REQ-001",
                    "text": "Applicant must submit detailed project narrative",
                    "type": "mandatory",
                    "section": "Section IV"
                },
                {
                    "id": "REQ-002",
                    "text": "Provide letters of support from partner organizations",
                    "type": "desirable",
                    "section": "Section V"
                },
                {
                    "id": "REQ-003",
                    "text": "Include detailed budget and budget narrative",
                    "type": "mandatory",
                    "section": "Section VI"
                }
            ],
            "evaluation_criteria": [
                "Program Design and Implementation (30 points)",
                "Organizational Capacity (25 points)",
                "Budget and Cost-Effectiveness (20 points)",
                "Evaluation Plan (15 points)",
                "Sustainability (10 points)"
            ],
            "budget_info": {
                "max_award": 500000,
                "min_award": 100000,
                "total_funding": 5000000
            }
        }
        
        return parsed_data
        
    finally:
        # Clean up temp file
        if os.path.exists(temp_file.name):
            os.unlink(temp_file.name)

