"""
Proposals Data API - CRUD operations for proposals
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.core.auth import get_current_user

router = APIRouter(prefix="/api/v1/proposals-data", tags=["proposals-data"])


class ProposalSectionCreate(BaseModel):
    title: str
    content: str
    order: int


class ProposalCreate(BaseModel):
    title: str
    rfp_number: str
    opportunity_id: Optional[str] = None
    sections: List[ProposalSectionCreate] = []


class ProposalUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    sections: Optional[List[ProposalSectionCreate]] = None


@router.get("/{proposal_id}")
async def get_proposal(
    proposal_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get proposal by ID with all sections
    """
    # In production, this would query the database
    # For now, return structured data
    
    return {
        "id": proposal_id,
        "title": "Fairfax County IT Staff Augmentation Proposal",
        "rfp_number": "RFP-2000003964",
        "status": "draft",
        "created_at": "2024-10-18T10:00:00Z",
        "updated_at": "2024-10-18T12:00:00Z",
        "sections": [
            {
                "id": "1",
                "title": "1.0 Introduction",
                "content": "We are pleased to submit this proposal in response to Fairfax County's request for IT Staff Augmentation services. Our company has extensive experience providing qualified IT professionals to government agencies, and we are confident in our ability to meet and exceed your requirements.",
                "order": 1
            },
            {
                "id": "2",
                "title": "2.0 Understanding of the Statement of Needs",
                "content": "We understand that Fairfax County requires highly skilled IT professionals to support various technology initiatives. Our team has carefully reviewed the requirements and developed a comprehensive approach to deliver the talent you need.",
                "order": 2
            },
            {
                "id": "3",
                "title": "3.0 Proposed Technical Approaches",
                "content": "Our technical approach focuses on three key areas: rapid talent acquisition, quality assurance, and ongoing performance management. We maintain a database of pre-screened professionals and can provide candidates within 48 hours of receiving requirements.",
                "order": 3
            },
            {
                "id": "4",
                "title": "4.0 Treatment of the Issues",
                "content": "We have identified several key challenges in IT staff augmentation and developed specific strategies to address each one. Our quality control processes ensure that all candidates meet or exceed your requirements.",
                "order": 4
            },
            {
                "id": "5",
                "title": "5.0 Statement of Qualifications",
                "content": "Our company has been providing IT staffing services for over 15 years. We have successfully supported numerous government agencies and have a proven track record of delivering high-quality professionals on time and within budget.",
                "order": 5
            },
            {
                "id": "6",
                "title": "6.0 Financial Statements",
                "content": "Our company maintains strong financial health with consistent revenue growth and positive cash flow. We have the resources necessary to support this contract and scale as needed.",
                "order": 6
            }
        ]
    }


@router.get("/")
async def list_proposals(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    List all proposals for current user's organization
    """
    # In production, query database filtered by organization_id
    
    return {
        "proposals": [
            {
                "id": "prop_001",
                "title": "Fairfax County IT Staff Augmentation Proposal",
                "rfp_number": "RFP-2000003964",
                "status": "draft",
                "created_at": "2024-10-18T10:00:00Z",
                "updated_at": "2024-10-18T12:00:00Z"
            },
            {
                "id": "prop_002",
                "title": "WMATA O&M Support Proposal",
                "rfp_number": "RFP-0000010023",
                "status": "submitted",
                "created_at": "2024-10-15T09:00:00Z",
                "updated_at": "2024-10-17T16:30:00Z"
            }
        ],
        "total": 2
    }


@router.post("/")
async def create_proposal(
    proposal: ProposalCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new proposal
    """
    # In production, create in database
    
    proposal_id = f"prop_{datetime.now().timestamp()}"
    
    return {
        "id": proposal_id,
        "title": proposal.title,
        "rfp_number": proposal.rfp_number,
        "status": "draft",
        "created_at": datetime.now().isoformat(),
        "sections": proposal.sections
    }


@router.put("/{proposal_id}")
async def update_proposal(
    proposal_id: str,
    proposal: ProposalUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Update proposal
    """
    # In production, update in database
    
    return {
        "id": proposal_id,
        "message": "Proposal updated successfully",
        "updated_at": datetime.now().isoformat()
    }


@router.put("/{proposal_id}/sections/{section_id}")
async def update_section(
    proposal_id: str,
    section_id: str,
    content: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Update a specific section
    """
    # In production, update in database
    
    return {
        "section_id": section_id,
        "content": content,
        "updated_at": datetime.now().isoformat()
    }


@router.delete("/{proposal_id}")
async def delete_proposal(
    proposal_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Delete proposal
    """
    # In production, delete from database
    
    return {
        "message": "Proposal deleted successfully"
    }

