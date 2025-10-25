"""
Proposals API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.proposal import Proposal, ProposalStatus, ProposalSection
from app.models.organization import User
from app.services.llm_service import llm_service
from app.services.document_service import document_service
from app.services.samgov_service import samgov_service
import os
import uuid
from datetime import datetime

router = APIRouter()


# Pydantic schemas
class ProposalCreate(BaseModel):
    title: str
    solicitation_number: Optional[str] = None
    opportunity_id: Optional[str] = None
    organization_id: str


class ProposalResponse(BaseModel):
    id: str
    title: str
    solicitation_number: Optional[str]
    status: ProposalStatus
    compliance_score: Optional[float]
    red_team_score: Optional[int]
    is_508_compliant: bool
    created_at: str
    
    class Config:
        from_attributes = True


class GenerateProposalRequest(BaseModel):
    use_ai: bool = True
    page_limit: Optional[int] = None


@router.get("/mine")
async def get_my_proposals(
    status: Optional[ProposalStatus] = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get proposals created by the current user
    User-scoped, only shows proposals they created
    """
    offset = (page - 1) * limit
    
    query = db.query(Proposal).filter(
        Proposal.is_deleted == False,
        Proposal.created_by == current_user.id  # User-scoped
    )
    
    if status:
        query = query.filter(Proposal.status == status)
    
    total = query.count()
    proposals = query.order_by(Proposal.created_at.desc()).offset(offset).limit(limit).all()
    
    # If no proposals, return mock data
    if total == 0:
        mock_proposals = [
            {
                "id": "mock-p-1",
                "title": "Mock Proposal: IT Infrastructure Modernization",
                "solicitation_number": "MOCK-2024-001",
                "status": "draft",
                "compliance_score": 85.0,
                "red_team_score": None,
                "is_508_compliant": False,
                "created_at": datetime.now().isoformat(),
                "mockGenerated": True
            },
            {
                "id": "mock-p-2",
                "title": "Mock Proposal: Cybersecurity Assessment",
                "solicitation_number": "MOCK-2024-002",
                "status": "in_progress",
                "compliance_score": 78.5,
                "red_team_score": 72,
                "is_508_compliant": True,
                "created_at": datetime.now().isoformat(),
                "mockGenerated": True
            }
        ]
        
        return {
            "items": mock_proposals[:limit],
            "total": len(mock_proposals),
            "page": page,
            "limit": limit,
            "mockGenerated": True,
            "note": "Using mock data. No proposals exist yet."
        }
    
    return {
        "items": [
            {
                "id": p.id,
                "title": p.title,
                "solicitation_number": p.solicitation_number,
                "status": p.status.value,
                "compliance_score": p.compliance_score,
                "red_team_score": p.red_team_score,
                "is_508_compliant": p.is_508_compliant,
                "created_at": p.created_at.isoformat() if p.created_at else None
            }
            for p in proposals
        ],
        "total": total,
        "page": page,
        "limit": limit
    }


@router.get("/stats")
async def get_proposals_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get proposal statistics for current user
    Used by dashboard
    """
    total = db.query(Proposal).filter(
        Proposal.is_deleted == False,
        Proposal.created_by == current_user.id
    ).count()
    
    in_progress = db.query(Proposal).filter(
        Proposal.is_deleted == False,
        Proposal.created_by == current_user.id,
        Proposal.status.in_([ProposalStatus.DRAFT, ProposalStatus.IN_PROGRESS])
    ).count()
    
    return {
        "proposalsCount": total,
        "activeProposalsCount": in_progress
    }


@router.get("/", response_model=List[ProposalResponse])
async def list_proposals(
    status: Optional[ProposalStatus] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """List all proposals (admin view)"""
    query = db.query(Proposal).filter(Proposal.is_deleted == False)
    
    if status:
        query = query.filter(Proposal.status == status)
    
    proposals = query.offset(skip).limit(limit).all()
    return proposals


@router.post("/", response_model=ProposalResponse)
async def create_proposal(
    proposal: ProposalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new proposal
    User-scoped: only creator can view/edit
    """
    
    db_proposal = Proposal(
        **proposal.dict(),
        created_by=current_user.id  # Track creator
    )
    db.add(db_proposal)
    db.commit()
    db.refresh(db_proposal)
    
    return db_proposal


@router.post("/generate")
async def generate_proposal_content(
    contract_id: Optional[str] = None,
    description: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate AI proposal content based on contract info
    Fetches from SAM.gov if contract_id provided
    """
    try:
        # Fetch contract details from SAM.gov if ID provided
        contract_data = None
        if contract_id:
            contract_data = await samgov_service.get_opportunity_by_id(contract_id)
        
        # Prepare prompt
        if contract_data:
            prompt = f"""Generate a professional proposal draft for the following government contract:

Title: {contract_data.get('title', '')}
Agency: {contract_data.get('agency', '')}
NAICS: {contract_data.get('naicsCode', '')}
Description: {contract_data.get('description', '')}

Please include:
1. Executive Summary
2. Technical Approach
3. Management Plan
4. Past Performance
5. Cost Proposal Overview
"""
        else:
            prompt = f"""Generate a professional proposal draft based on:

Description: {description or 'General government contracting opportunity'}

Please include:
1. Executive Summary
2. Technical Approach
3. Management Plan
4. Past Performance
5. Cost Proposal Overview
"""
        
        # Check if AI key is available
        ai_key = os.getenv("OPENAI_API_KEY") or os.getenv("ANTHROPIC_API_KEY")
        
        if not ai_key:
            # Return mock generated content
            mock_content = f"""# Executive Summary

[AI-Generated Content - Mock Mode]

This is a mock-generated proposal for demonstration purposes. To enable real AI generation, please configure your OPENAI_API_KEY or ANTHROPIC_API_KEY in the environment.

Contract: {contract_data.get('title') if contract_data else 'Sample Opportunity'}

## Technical Approach

Our team brings extensive experience in delivering high-quality solutions to government agencies. We propose a comprehensive approach that addresses all requirements outlined in the RFP.

## Management Plan

Our management structure ensures accountability and clear communication throughout the project lifecycle.

## Past Performance

We have successfully completed similar projects for federal agencies, demonstrating our capability to deliver on time and within budget.

## Cost Proposal

Competitive pricing aligned with government contracting standards.
"""
            
            return {
                "content": mock_content,
                "mockGenerated": True,
                "note": "This is mock AI-generated content. Configure AI_KEY for real generation."
            }
        
        # Real AI generation
        try:
            generated_content = await llm_service.generate_completion(
                prompt=prompt,
                system_prompt="You are an expert government proposal writer. Generate professional, compliant proposal content.",
                max_tokens=2000,
                temperature=0.7
            )
            
            return {
                "content": generated_content,
                "mockGenerated": False
            }
        except Exception as ai_error:
            # If AI generation fails, return mock content
            import logging
            logging.error(f"AI generation failed: {str(ai_error)}, falling back to mock")
            
            mock_content = f"""# Executive Summary

[AI-Generated Content - Mock Mode]

This is a mock-generated proposal for demonstration purposes. The AI service encountered an error or is not properly configured.

Contract: {contract_data.get('title') if contract_data else 'Sample Opportunity'}

## Technical Approach

Our team brings extensive experience in delivering high-quality solutions to government agencies. We propose a comprehensive approach that addresses all requirements outlined in the RFP.

## Management Plan

Our management structure ensures accountability and clear communication throughout the project lifecycle.

## Past Performance

We have successfully completed similar projects for federal agencies, demonstrating our capability to deliver on time and within budget.

## Cost Proposal

Competitive pricing aligned with government contracting standards.
"""
            
            return {
                "content": mock_content,
                "mockGenerated": True,
                "note": "AI generation failed. This is mock content. Please check AI_KEY configuration."
            }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating proposal: {str(e)}")


@router.get("/{proposal_id}", response_model=ProposalResponse)
async def get_proposal(
    proposal_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get proposal by ID
    User-scoped: only creator can access
    """
    
    proposal = db.query(Proposal).filter(
        Proposal.id == proposal_id,
        Proposal.is_deleted == False
    ).first()
    
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    # Check permissions - only creator can access
    if proposal.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied. You can only view your own proposals.")
    
    return proposal


@router.post("/{proposal_id}/upload-rfp")
async def upload_rfp(
    proposal_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload RFP document"""
    
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    # Save file
    upload_dir = "/tmp/govlogic/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, f"{proposal_id}_{file.filename}")
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # Extract text
    if file.filename.endswith('.pdf'):
        text = document_service.extract_text_from_pdf(file_path)
    else:
        # Handle DOCX
        text = "DOCX extraction not implemented"
    
    # Update proposal
    proposal.rfp_file_path = file_path
    proposal.rfp_text = text
    db.commit()
    
    return {"message": "RFP uploaded successfully", "file_path": file_path}


@router.post("/{proposal_id}/extract-requirements")
async def extract_requirements(
    proposal_id: str,
    db: Session = Depends(get_db)
):
    """Extract requirements from RFP"""
    
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    if not proposal.rfp_text:
        raise HTTPException(status_code=400, detail="No RFP text available")
    
    # Extract using AI
    requirements = await llm_service.extract_requirements(proposal.rfp_text)
    
    # Update proposal
    proposal.requirements = requirements
    db.commit()
    
    return {
        "message": f"Extracted {len(requirements)} requirements",
        "requirements": requirements
    }


@router.post("/{proposal_id}/generate-outline")
async def generate_outline(
    proposal_id: str,
    page_limit: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Generate Shipley-compliant outline"""
    
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    # Generate outline
    outline = document_service.create_shipley_outline(
        rfp_sections=[],  # Would parse from RFP
        page_limit=page_limit
    )
    
    # Update proposal
    proposal.outline = outline
    proposal.page_budget = {
        s['number']: s['page_budget'] 
        for s in outline['sections']
    }
    db.commit()
    
    return {
        "message": "Outline generated",
        "outline": outline
    }


@router.post("/{proposal_id}/generate-compliance-matrix")
async def generate_compliance_matrix(
    proposal_id: str,
    db: Session = Depends(get_db)
):
    """Generate compliance matrix"""
    
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    if not proposal.requirements or not proposal.outline:
        raise HTTPException(
            status_code=400,
            detail="Requirements and outline must be generated first"
        )
    
    # Generate compliance matrix using AI
    matrix = await llm_service.generate_compliance_matrix(
        requirements=proposal.requirements,
        outline=proposal.outline
    )
    
    # Update proposal
    proposal.compliance_matrix = matrix
    db.commit()
    
    return {
        "message": "Compliance matrix generated",
        "matrix": matrix
    }


@router.post("/{proposal_id}/generate-section/{section_number}")
async def generate_section(
    proposal_id: str,
    section_number: str,
    db: Session = Depends(get_db)
):
    """Generate a proposal section using AI"""
    
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    # Find section in outline
    section_info = None
    if proposal.outline:
        for section in proposal.outline.get('sections', []):
            if section['number'] == section_number:
                section_info = section
                break
    
    if not section_info:
        raise HTTPException(status_code=404, detail="Section not found in outline")
    
    # Get relevant requirements
    relevant_reqs = []
    if proposal.compliance_matrix:
        for req_id, mapping in proposal.compliance_matrix.items():
            if mapping.get('response_section') == section_number:
                # Find requirement text
                for req in proposal.requirements or []:
                    if req['id'] == req_id:
                        relevant_reqs.append(req['text'])
    
    # Generate section content
    content = await llm_service.generate_proposal_section(
        section_title=section_info['title'],
        requirements=relevant_reqs,
        knowledge_context="",  # Would pull from knowledge base
        word_limit=section_info.get('page_budget', 0) * 250  # ~250 words/page
    )
    
    # Create or update section
    db_section = db.query(ProposalSection).filter(
        ProposalSection.proposal_id == proposal_id,
        ProposalSection.section_number == section_number
    ).first()
    
    if not db_section:
        db_section = ProposalSection(
            proposal_id=proposal_id,
            section_number=section_number,
            section_title=section_info['title']
        )
        db.add(db_section)
    
    db_section.content = content
    db_section.ai_generated = True
    db_section.word_count = len(content.split())
    
    db.commit()
    
    return {
        "message": "Section generated",
        "section_number": section_number,
        "content": content
    }


@router.post("/{proposal_id}/red-team-review")
async def red_team_review(
    proposal_id: str,
    db: Session = Depends(get_db)
):
    """Perform Red Team review"""
    
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    # Get all sections
    sections = db.query(ProposalSection).filter(
        ProposalSection.proposal_id == proposal_id
    ).all()
    
    # Combine content
    full_text = "\n\n".join([s.content or "" for s in sections])
    
    # Perform red team review
    review = await llm_service.red_team_review(
        proposal_text=full_text,
        requirements=proposal.requirements or []
    )
    
    # Update proposal
    proposal.red_team_report = review
    proposal.red_team_score = review.get('score', 0)
    proposal.status = ProposalStatus.RED_TEAM
    db.commit()
    
    return {
        "message": "Red Team review completed",
        "review": review
    }


@router.post("/{proposal_id}/export")
async def export_proposal(
    proposal_id: str,
    format: str = "docx",  # docx, pdf, excel
    db: Session = Depends(get_db)
):
    """Export proposal to DOCX/PDF/Excel"""
    
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    # Get all sections
    sections = db.query(ProposalSection).filter(
        ProposalSection.proposal_id == proposal_id
    ).order_by(ProposalSection.order).all()
    
    sections_data = [
        {
            "number": s.section_number,
            "title": s.section_title,
            "content": s.content or ""
        }
        for s in sections
    ]
    
    output_dir = "/tmp/govlogic/exports"
    os.makedirs(output_dir, exist_ok=True)
    
    if format == "docx":
        output_path = os.path.join(output_dir, f"{proposal_id}.docx")
        document_service.create_proposal_docx(
            title=proposal.title,
            sections=sections_data,
            output_path=output_path
        )
        proposal.docx_file_path = output_path
    
    elif format == "excel":
        output_path = os.path.join(output_dir, f"{proposal_id}_compliance.xlsx")
        document_service.create_compliance_matrix_excel(
            requirements=proposal.requirements or [],
            compliance_data=proposal.compliance_matrix or {},
            output_path=output_path
        )
        proposal.excel_file_path = output_path
    
    db.commit()
    
    return {
        "message": f"Proposal exported as {format}",
        "file_path": output_path
    }

