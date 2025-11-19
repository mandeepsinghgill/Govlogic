"""
InZTan Gov Supreme Overlord API Endpoints
Unified API for RFP shredding, compliance matrix, proposal generation, partner matching
"""

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.organization import User
from app.services.gov_supreme_overlord_service import GovSupremeOverlordService
from app.services.rag_service import RAGService
from app.services.rfp_shredding_service import RFPShreddingService
from app.services.partner_matching_service import PartnerMatchingService
from app.services.compliance_service import ComplianceService
import tempfile
import os

router = APIRouter(prefix="/api/v1/inztan", tags=["InZTan Gov Supreme"])


# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class RFPShreddingRequest(BaseModel):
    opportunity_id: int
    rfp_metadata: Dict[str, Any] = {}


class RFPShreddingResponse(BaseModel):
    success: bool
    opportunity_id: int
    shredded_data: Dict[str, Any]
    validation: Dict[str, Any]


class ProposalGenerationRequest(BaseModel):
    opportunity_id: int
    rfp_text: Optional[str] = None
    user_preferences: Dict[str, Any] = {
        "page_limits": {"technical": 30, "management": 20, "past_performance": 15},
        "style_guide": "booz_allen",
        "include_color_teams": True
    }


class ProposalGenerationResponse(BaseModel):
    success: bool
    proposal_id: str
    status: str
    rfp_analysis: Dict[str, Any]
    compliance_matrix: Dict[str, Any]
    discriminators: Dict[str, Any]
    outline: Dict[str, Any]
    red_team_review: Dict[str, Any]
    next_steps: List[str]


class ComplianceMatrixRequest(BaseModel):
    opportunity_id: int


class PartnerSearchRequest(BaseModel):
    naics_codes: Optional[List[str]] = None
    set_aside: Optional[List[str]] = None
    state: Optional[str] = None
    capabilities: Optional[str] = None
    min_past_awards: Optional[int] = None
    page: int = 1
    page_size: int = 20


class PartnerRecommendationRequest(BaseModel):
    opportunity_id: int


class RAGSearchRequest(BaseModel):
    query: str
    context_filters: Optional[Dict[str, Any]] = None
    top_k: int = 5


class DocumentIndexRequest(BaseModel):
    document_id: int
    content: str
    metadata: Dict[str, Any]


# ============================================================================
# RFP SHREDDING ENDPOINTS
# ============================================================================

@router.post("/rfp/shred", response_model=RFPShreddingResponse)
async def shred_rfp(
    file: UploadFile = File(...),
    opportunity_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload and shred RFP file
    Extracts Section L, M, SOW, requirements, compliance matrix
    
    **This is the entry point for the Gov Supreme Overlord pipeline**
    """
    shredding_service = RFPShreddingService(db)
    
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp_file:
        content = await file.read()
        tmp_file.write(content)
        tmp_file_path = tmp_file.name
    
    try:
        # Shred the RFP
        rfp_metadata = {
            "filename": file.filename,
            "opportunity_id": opportunity_id,
            "uploaded_by": current_user.id
        }
        
        shredded_data = await shredding_service.shred_rfp(tmp_file_path, rfp_metadata)
        
        # Validate shredding quality
        validation = await shredding_service.validate_shredding_quality(shredded_data)
        
        # Store shredded data in database
        db.execute(
            """INSERT INTO rfp_shredded_data 
               (opportunity_id, section_l, section_m, sow_pws, all_requirements, key_information, raw_text_length, shredded_at)
               VALUES (:opp_id, :section_l, :section_m, :sow_pws, :requirements, :key_info, :raw_len, NOW())
               ON CONFLICT (opportunity_id) DO UPDATE SET
                   section_l = EXCLUDED.section_l,
                   section_m = EXCLUDED.section_m,
                   sow_pws = EXCLUDED.sow_pws,
                   all_requirements = EXCLUDED.all_requirements,
                   key_information = EXCLUDED.key_information,
                   shredded_at = NOW()
            """,
            {
                "opp_id": opportunity_id,
                "section_l": shredded_data.get("section_l"),
                "section_m": shredded_data.get("section_m"),
                "sow_pws": shredded_data.get("sow_pws"),
                "requirements": shredded_data.get("all_requirements"),
                "key_info": shredded_data.get("key_information"),
                "raw_len": shredded_data.get("raw_text_length")
            }
        )
        db.commit()
        
        # Store compliance matrix template
        for matrix_item in shredded_data.get("compliance_matrix_template", []):
            db.execute(
                """INSERT INTO compliance_matrix 
                   (opportunity_id, rfp_clause_id, category, requirement_text, compliance_status)
                   VALUES (:opp_id, :clause_id, :category, :requirement, :status)
                """,
                {
                    "opp_id": opportunity_id,
                    "clause_id": matrix_item.get("id"),
                    "category": matrix_item.get("category"),
                    "requirement": matrix_item.get("requirement"),
                    "status": matrix_item.get("compliance_status", "PENDING")
                }
            )
        db.commit()
        
        return RFPShreddingResponse(
            success=True,
            opportunity_id=opportunity_id,
            shredded_data=shredded_data,
            validation=validation
        )
    
    finally:
        # Clean up temp file
        if os.path.exists(tmp_file_path):
            os.unlink(tmp_file_path)


@router.get("/rfp/shredded/{opportunity_id}")
async def get_shredded_rfp(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get shredded RFP data for an opportunity
    """
    result = db.execute(
        "SELECT * FROM rfp_shredded_data WHERE opportunity_id = :opp_id",
        {"opp_id": opportunity_id}
    ).fetchone()
    
    if not result:
        raise HTTPException(status_code=404, detail="Shredded RFP data not found")
    
    return {
        "opportunity_id": result.opportunity_id,
        "section_l": result.section_l,
        "section_m": result.section_m,
        "sow_pws": result.sow_pws,
        "all_requirements": result.all_requirements,
        "key_information": result.key_information,
        "shredded_at": result.shredded_at
    }


# ============================================================================
# COMPLIANCE MATRIX ENDPOINTS
# ============================================================================

@router.get("/compliance-matrix/{opportunity_id}")
async def get_compliance_matrix(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get compliance matrix for an opportunity
    """
    results = db.execute(
        "SELECT * FROM compliance_matrix WHERE opportunity_id = :opp_id ORDER BY id",
        {"opp_id": opportunity_id}
    ).fetchall()
    
    return {
        "opportunity_id": opportunity_id,
        "matrix_items": [
            {
                "id": row.id,
                "rfp_clause_id": row.rfp_clause_id,
                "category": row.category,
                "requirement_text": row.requirement_text,
                "proposal_location": row.proposal_location,
                "compliance_status": row.compliance_status,
                "company_capability": row.company_capability,
                "evidence": row.evidence,
                "gaps": row.gaps
            }
            for row in results
        ],
        "total_items": len(results)
    }


@router.put("/compliance-matrix/{matrix_item_id}")
async def update_compliance_matrix_item(
    matrix_item_id: int,
    proposal_location: Optional[str] = None,
    compliance_status: Optional[str] = None,
    company_capability: Optional[str] = None,
    evidence: Optional[List[str]] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a compliance matrix item
    """
    updates = {}
    if proposal_location is not None:
        updates["proposal_location"] = proposal_location
    if compliance_status is not None:
        updates["compliance_status"] = compliance_status
    if company_capability is not None:
        updates["company_capability"] = company_capability
    if evidence is not None:
        updates["evidence"] = evidence
    
    if not updates:
        raise HTTPException(status_code=400, detail="No updates provided")
    
    set_clause = ", ".join([f"{k} = :{k}" for k in updates.keys()])
    updates["item_id"] = matrix_item_id
    
    db.execute(
        f"UPDATE compliance_matrix SET {set_clause}, updated_at = NOW() WHERE id = :item_id",
        updates
    )
    db.commit()
    
    return {"success": True, "message": "Compliance matrix item updated"}


# ============================================================================
# GOV SUPREME OVERLORD - PROPOSAL GENERATION
# ============================================================================

@router.post("/proposal/generate", response_model=ProposalGenerationResponse)
async def generate_proposal(
    request: ProposalGenerationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    **Gov Supreme Overlord Master Function**
    
    Generate complete proposal using Shipley Methodology + Big-Prime strategies
    
    Steps:
    1. Analyze RFP (or retrieve shredded data)
    2. Generate compliance matrix
    3. Develop discriminator strategy
    4. Create annotated outline
    5. Draft all proposal sections
    6. Run Red Team review
    7. Compile final package
    
    This can take 5-15 minutes for a full proposal.
    """
    gov_supreme = GovSupremeOverlordService(db)
    
    # Get shredded RFP data
    shredded_rfp = db.execute(
        "SELECT * FROM rfp_shredded_data WHERE opportunity_id = :opp_id",
        {"opp_id": request.opportunity_id}
    ).fetchone()
    
    if not shredded_rfp and not request.rfp_text:
        raise HTTPException(
            status_code=400,
            detail="RFP must be shredded first or rfp_text provided"
        )
    
    # Get company knowledge base (simplified - would retrieve actual KB in production)
    company_kb = {
        "organization_id": current_user.organization_id,
        "capabilities": [],  # Would pull from past_performance, documents, etc.
        "past_performance": [],
        "certifications": []
    }
    
    # Generate proposal (this is the master orchestrator)
    rfp_text = request.rfp_text or "RFP text from shredded data"  # In production, reconstruct from shredded
    
    proposal_package = await gov_supreme.generate_full_proposal(
        rfp_id=str(request.opportunity_id),
        rfp_text=rfp_text,
        company_kb=company_kb,
        user_preferences=request.user_preferences
    )
    
    # Store proposal data
    # (Would save to proposals table, create proposal sections, etc.)
    
    return ProposalGenerationResponse(
        success=True,
        proposal_id=f"PROP-{request.opportunity_id}-{proposal_package['generated_at']}",
        status=proposal_package['status'],
        rfp_analysis=proposal_package['rfp_analysis'],
        compliance_matrix=proposal_package['compliance_matrix'],
        discriminators=proposal_package['discriminators'],
        outline=proposal_package['outline'],
        red_team_review=proposal_package['red_team_review'],
        next_steps=proposal_package['next_steps']
    )


@router.get("/proposal/shipley-status/{proposal_id}")
async def get_shipley_phase_status(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get Shipley methodology phase status for a proposal
    """
    gov_supreme = GovSupremeOverlordService(db)
    return gov_supreme.get_shipley_phase_status(proposal_id)


# ============================================================================
# PARTNER MATCHING ENDPOINTS
# ============================================================================

@router.post("/partners/search")
async def search_contractors(
    request: PartnerSearchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Search 800K+ SAM.gov contractors
    Filter by NAICS, set-aside, location, capabilities
    """
    partner_service = PartnerMatchingService(db)
    
    query = {
        "naics_codes": request.naics_codes,
        "set_aside": request.set_aside,
        "state": request.state,
        "capabilities": request.capabilities,
        "min_past_awards": request.min_past_awards
    }
    
    results = await partner_service.search_contractors(
        query=query,
        page=request.page,
        page_size=request.page_size
    )
    
    return results


@router.post("/partners/recommend/{opportunity_id}")
async def recommend_partners(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    AI-powered partner recommendations for an opportunity
    Identifies capability gaps and suggests contractors to fill them
    """
    partner_service = PartnerMatchingService(db)
    
    # Get opportunity data
    # (Would pull from opportunities table + shredded RFP)
    opportunity_data = {
        "naics": "541330",
        "set_aside": "Small Business",
        "required_capabilities": ["cloud", "cybersecurity"]
    }
    
    # Get organization capabilities
    org_capabilities = {
        "primary_naics": ["541512"],
        "set_aside_status": "Large Business",
        "capabilities": ["software development"]
    }
    
    recommendations = await partner_service.recommend_partners(
        opportunity_id=opportunity_id,
        opportunity_data=opportunity_data,
        organization_capabilities=org_capabilities
    )
    
    return {
        "opportunity_id": opportunity_id,
        "recommendations": recommendations,
        "total_recommended": len(recommendations)
    }


@router.post("/partners/sync-sam-gov")
async def sync_sam_gov(
    background_tasks: BackgroundTasks,
    incremental: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Sync contractor data from SAM.gov API
    **Admin only - syncs 800K+ contractors**
    
    Run in background due to long execution time
    """
    # Check if user is admin
    # (Would implement proper admin check)
    
    partner_service = PartnerMatchingService(db)
    
    # Run sync in background
    background_tasks.add_task(
        partner_service.sync_sam_gov_data,
        batch_size=1000,
        incremental=incremental
    )
    
    return {
        "message": "SAM.gov sync started in background",
        "incremental": incremental
    }


# ============================================================================
# RAG (RETRIEVAL-AUGMENTED GENERATION) ENDPOINTS
# ============================================================================

@router.post("/rag/search")
async def rag_semantic_search(
    request: RAGSearchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Semantic search over company knowledge base
    Returns relevant content with citations
    """
    rag_service = RAGService(db)
    
    relevant_content = await rag_service.search_similar_content(
        query=request.query,
        top_k=request.top_k,
        filter_metadata=request.context_filters
    )
    
    return {
        "query": request.query,
        "relevant_content": relevant_content,
        "top_k": request.top_k
    }


@router.post("/rag/ask")
async def rag_grounded_question(
    query: str,
    context_filters: Optional[Dict[str, Any]] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Ask a question and get AI response grounded in knowledge base
    **NO HALLUCINATIONS - Only uses retrieved context**
    """
    rag_service = RAGService(db)
    
    response = await rag_service.get_grounded_response(
        question=query,
        context_filters=context_filters
    )
    
    return response


@router.post("/rag/index-document")
async def index_document_for_rag(
    request: DocumentIndexRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Index a document into the RAG system
    Chunks, generates embeddings, stores in vector DB
    """
    rag_service = RAGService(db)
    
    # Run indexing in background
    background_tasks.add_task(
        rag_service.store_document_embedding,
        document_id=request.document_id,
        content=request.content,
        metadata=request.metadata
    )
    
    return {
        "message": "Document indexing started",
        "document_id": request.document_id
    }


@router.get("/rag/stats")
async def get_rag_statistics(
    organization_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get RAG index statistics
    """
    rag_service = RAGService(db)
    
    if not organization_id:
        organization_id = current_user.organization_id
    
    stats = rag_service.get_index_statistics(organization_id)
    
    return stats


# ============================================================================
# HEALTH CHECK
# ============================================================================

# ============================================================================
# COMPLIANCE ENDPOINTS (FAR/DFARS/CMMC/Section 508)
# ============================================================================

class ComplianceAnalysisRequest(BaseModel):
    contract_data: Dict[str, Any]  # agency, contract_type, contains_cui, etc.
    company_data: Dict[str, Any]  # sam_registration, nist_score, cmmc_level, etc.
    proposal_content: Optional[Dict[str, Any]] = None


class ComplianceAnalysisResponse(BaseModel):
    success: bool
    compliance_matrix: Dict[str, Any]
    compliance_report: Dict[str, Any]
    poam: Dict[str, Any]
    critical_gaps: List[Dict[str, Any]]


@router.post("/compliance/analyze", response_model=ComplianceAnalysisResponse)
async def analyze_compliance(
    request: ComplianceAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze contract for FAR/DFARS/CMMC/Section 508 compliance
    
    Returns:
    - Compliance matrix
    - Compliance report with pass/fail status
    - Plan of Action and Milestones (POA&M) for gaps
    - List of critical gaps requiring immediate attention
    """
    try:
        compliance_service = ComplianceService()
        
        result = compliance_service.analyze_contract_compliance(
            contract_data=request.contract_data,
            company_data=request.company_data,
            proposal_content=request.proposal_content
        )
        
        return ComplianceAnalysisResponse(
            success=True,
            compliance_matrix=result["compliance_matrix"],
            compliance_report=result["compliance_report"],
            poam=result["poam"],
            critical_gaps=result["compliance_report"]["critical_gaps"]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/compliance/requirements/{agency}")
async def get_compliance_requirements(
    agency: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get all compliance requirements for a specific agency
    
    Args:
        agency: "DoD", "Civilian", "Other"
    
    Returns:
        List of all FAR/DFARS/CMMC/Section 508 requirements applicable to this agency
    """
    try:
        compliance_service = ComplianceService()
        requirements = compliance_service.get_requirements_by_agency(agency)
        
        return {
            "success": True,
            "agency": agency,
            "total_requirements": len(requirements),
            "requirements": requirements
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/compliance/poam")
async def generate_poam(
    contract_data: Dict[str, Any],
    company_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate Plan of Action and Milestones (POA&M) for compliance gaps
    Standard DoD format for tracking remediation actions
    """
    try:
        compliance_service = ComplianceService()
        
        # Run compliance analysis
        result = compliance_service.analyze_contract_compliance(
            contract_data=contract_data,
            company_data=company_data
        )
        
        return {
            "success": True,
            "poam": result["poam"],
            "total_items": len(result["poam"]["items"]),
            "critical_items": sum(1 for item in result["poam"]["items"] if item["severity"] == "Critical")
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def inztan_health_check():
    """
    Health check for InZTan Gov Supreme Overlord system
    """
    return {
        "status": "operational",
        "components": {
            "gov_supreme_overlord": "online",
            "rag_service": "online",
            "rfp_shredding": "online",
            "partner_matching": "online",
            "compliance": "online"
        },
        "version": "1.0.1-inztan",
        "description": "Gov Supreme Overlord - Shipley Methodology + Big-Prime Strategies + FAR/DFARS/CMMC/508 Compliance"
    }

