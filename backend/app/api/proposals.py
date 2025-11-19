"""
Proposals API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, Query
from fastapi.responses import FileResponse
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


class GenerateFullProposalRequest(BaseModel):
    opportunity_id: Optional[str] = None
    contract_id: Optional[str] = None
    min_pages: int = 25
    max_pages: int = 100
    description: Optional[str] = None


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
    opportunity_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    List proposals
    - If opportunity_id provided: Get proposals for that opportunity (auto-generated)
    - Otherwise: Get all proposals
    """
    query = db.query(Proposal).filter(Proposal.is_deleted == False)
    
    # Filter by opportunity if provided
    if opportunity_id:
        query = query.filter(Proposal.opportunity_id == opportunity_id)
    
    if status:
        query = query.filter(Proposal.status == status)
    
    proposals = query.order_by(Proposal.created_at.desc()).offset(skip).limit(limit).all()
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


# IMPORTANT: This route MUST come before /{proposal_id} to avoid route conflicts
# Route: POST /api/v1/proposals/generate-full
@router.post("/generate-full", status_code=200)
async def generate_full_proposal(
    request: GenerateFullProposalRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate a comprehensive proposal (25-100 pages) using OpenAI
    Fetches opportunity data from SAM.gov if opportunity_id provided
    
    Route: POST /api/v1/proposals/generate-full
    """
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"✅ POST /api/v1/proposals/generate-full - Received request: opportunity_id={request.opportunity_id}, min_pages={request.min_pages}, max_pages={request.max_pages}")
    
    try:
        # Validate page limits
        if request.min_pages < 25 or request.max_pages > 100:
            raise HTTPException(
                status_code=400,
                detail="Page limits must be between 25 and 100 pages"
            )
        
        # Fetch contract details from SAM.gov if ID provided
        contract_data = None
        description = request.description
        if request.opportunity_id:
            contract_data = samgov_service.get_opportunity_by_id(request.opportunity_id)
        elif request.contract_id:
            contract_data = samgov_service.get_opportunity_by_id(request.contract_id)
        
        # Prepare comprehensive prompt for OpenAI
        if contract_data:
            title = contract_data.get('title', 'Government Contract Opportunity')
            agency = contract_data.get('agency', 'Federal Agency')
            description = contract_data.get('description') or contract_data.get('synopsis', '') or description
            naics = contract_data.get('naicsCode', '')
            value = contract_data.get('value', '')
            
            prompt = f"""Generate a comprehensive, professional government proposal for the following opportunity:

TITLE: {title}
AGENCY: {agency}
NAICS CODE: {naics}
ESTIMATED VALUE: {value}
DESCRIPTION: {description}

REQUIREMENTS:
1. Generate a complete proposal between {request.min_pages} and {request.max_pages} pages
2. Follow Shipley methodology and government contracting best practices
3. Include all standard proposal volumes:
   - Executive Summary (2-5 pages)
   - Technical Approach (15-40 pages)
   - Management Plan (10-25 pages)
   - Past Performance (5-15 pages)
   - Cost Proposal Overview (3-10 pages)
   - Compliance Matrix
   - Appendices as needed

4. Ensure content is:
   - Evaluator-focused and compliant
   - Professional and well-structured
   - Addresses all RFP requirements
   - Includes specific technical details
   - Demonstrates past performance relevance
   - Shows clear value proposition

5. Use proper government contracting terminology and formatting
6. Include section headers, subsections, and detailed content
7. Ensure total page count is between {request.min_pages} and {request.max_pages} pages

Generate the complete proposal document now."""
        else:
            prompt = f"""Generate a comprehensive, professional government proposal based on:

DESCRIPTION: {request.description or 'General government contracting opportunity'}

REQUIREMENTS:
1. Generate a complete proposal between {request.min_pages} and {request.max_pages} pages
2. Follow Shipley methodology and government contracting best practices
3. Include all standard proposal volumes with detailed content
4. Ensure professional, evaluator-focused writing
5. Total page count must be between {request.min_pages} and {request.max_pages} pages

Generate the complete proposal document now."""
        
        # Check for OpenAI API key
        openai_key = os.getenv("OPENAI_API_KEY")
        if not openai_key:
            raise HTTPException(
                status_code=400,
                detail="OPENAI_API_KEY not configured. Please set your OpenAI API key in environment variables."
            )
        
        # Generate proposal using OpenAI with safe token limit
        try:
            # Calculate approximate tokens needed (roughly 250 words per page, ~750 tokens per page)
            # Cap at 10,000 tokens to avoid errors (model supports max 16,384)
            estimated_tokens = request.max_pages * 750
            # Enforce hard limit of 10,000 tokens regardless of page count
            safe_max_tokens = min(estimated_tokens, 10000)
            
            # Log for debugging
            logger.info(f"Generating proposal: max_pages={request.max_pages}, estimated_tokens={estimated_tokens}, safe_max_tokens={safe_max_tokens}")
            
            generated_content = await llm_service.generate_completion(
                prompt=prompt,
                system_prompt="You are an expert government proposal writer with 20+ years of experience. Generate comprehensive, Shipley-compliant proposals that win contracts. Your proposals are evaluator-focused, compliant, and demonstrate clear value.",
                max_tokens=safe_max_tokens,  # Hard capped at 16,000
                temperature=0.7,
                model="gpt-4o",  # Use GPT-4 for better quality long-form content
                provider="openai"
            )
            
            # Calculate actual page count (rough estimate: 500 words per page)
            word_count = len(generated_content.split())
            estimated_pages = max(request.min_pages, min(request.max_pages, word_count // 500))
            
            # Save proposal to database
            proposal_title = contract_data.get('title', 'Generated Proposal') if contract_data else 'Generated Proposal'
            proposal_rfp_text = description if description else (contract_data.get('description', '') if contract_data else '')
            
            # Get organization_id from user
            organization_id = current_user.organization_id
            
            proposal = Proposal(
                id=str(uuid.uuid4()),
                title=proposal_title,
                solicitation_number=contract_data.get('solicitationNumber') if contract_data else None,
                opportunity_id=request.opportunity_id or request.contract_id,
                organization_id=organization_id,
                created_by=current_user.id,
                status=ProposalStatus.DRAFT,
                rfp_text=proposal_rfp_text,
                sections={"content": generated_content, "estimated_pages": estimated_pages},
                compliance_score=98.0,
                is_508_compliant=False
            )
            
            db.add(proposal)
            db.commit()
            db.refresh(proposal)
            
            return {
                "success": True,
                "proposal_id": proposal.id,
                "content": generated_content,
                "estimated_pages": estimated_pages,
                "word_count": word_count,
                "opportunity_id": request.opportunity_id or request.contract_id,
                "generated_at": datetime.now().isoformat(),
                "mockGenerated": False,
                "source": "OpenAI GPT-4"
            }
            
        except Exception as ai_error:
            import logging
            logging.error(f"OpenAI generation failed: {str(ai_error)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate proposal with OpenAI: {str(ai_error)}"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating full proposal: {str(e)}")


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
        # Fetch contract details from SAM.gov if ID provided (synchronous function)
        contract_data = None
        if contract_id:
            contract_data = samgov_service.get_opportunity_by_id(contract_id)
        
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
        
        # Check for AI services: Ollama (local), OpenAI, or Anthropic
        use_ollama = os.getenv("USE_OLLAMA", "true").lower() == "true"
        ai_key = os.getenv("OPENAI_API_KEY") or os.getenv("ANTHROPIC_API_KEY")
        
        # Try Ollama first (local AI)
        if use_ollama:
            try:
                import requests
                ollama_response = requests.post(
                    "http://localhost:11434/api/generate",
                    json={
                        "model": "llama2",  # or mistral, codellama, etc.
                        "prompt": prompt,
                        "stream": False
                    },
                    timeout=120
                )
                
                if ollama_response.status_code == 200:
                    ollama_data = ollama_response.json()
                    generated_content = ollama_data.get("response", "")
                    
                    return {
                        "content": generated_content,
                        "mockGenerated": False,
                        "source": "Ollama (Local AI)"
                    }
            except Exception as e:
                print(f"Ollama error: {e}")
                # Fall through to other methods
        
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
    upload_dir = "/tmp/GovSure/uploads"
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


@router.delete("/{proposal_id}")
async def delete_proposal(
    proposal_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a proposal (soft delete)
    User-scoped: only creator can delete
    """
    proposal = db.query(Proposal).filter(
        Proposal.id == proposal_id,
        Proposal.is_deleted == False
    ).first()
    
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    if proposal.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this proposal")
    
    # Soft delete
    proposal.is_deleted = True
    db.commit()
    
    return {"message": "Proposal deleted successfully", "id": proposal_id}


@router.post("/{proposal_id}/export")
async def export_proposal(
    proposal_id: str,
    format: str = Query("docx", description="Export format: docx, pdf, excel"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export proposal to DOCX/PDF/Excel"""
    from fastapi.responses import FileResponse
    
    proposal = db.query(Proposal).filter(
        Proposal.id == proposal_id,
        Proposal.is_deleted == False
    ).first()
    
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    if proposal.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to export this proposal")
    
    # Get content from sections or from proposal.sections JSON
    sections_data = []
    if proposal.sections and isinstance(proposal.sections, dict) and 'content' in proposal.sections:
        # If content is stored in sections JSON, create a single section
        sections_data = [{
            "number": "1",
            "title": "Proposal Content",
            "content": proposal.sections.get('content', '')
        }]
    else:
        # Get all sections from ProposalSection table
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
    
    output_dir = "/tmp/GovSure/exports"
    os.makedirs(output_dir, exist_ok=True)
    
    if format == "docx":
        output_path = os.path.join(output_dir, f"{proposal_id}.docx")
        try:
            document_service.create_proposal_docx(
                title=proposal.title,
                sections=sections_data,
                output_path=output_path
            )
            proposal.docx_file_path = output_path
            db.commit()
            
            return FileResponse(
                output_path,
                media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                filename=f"{proposal.title.replace(' ', '_')}.docx"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to create DOCX: {str(e)}")
    
    elif format == "excel":
        output_path = os.path.join(output_dir, f"{proposal_id}_compliance.xlsx")
        try:
            document_service.create_compliance_matrix_excel(
                requirements=proposal.requirements or [],
                compliance_data=proposal.compliance_matrix or {},
                output_path=output_path
            )
            proposal.excel_file_path = output_path
            db.commit()
            
            return FileResponse(
                output_path,
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                filename=f"{proposal.title.replace(' ', '_')}_compliance.xlsx"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to create Excel: {str(e)}")
    
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported format: {format}. Supported formats: docx, excel")

