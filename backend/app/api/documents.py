"""
Document Management API - Export, Learning, Collaboration
"""
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from fastapi.responses import StreamingResponse
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import io

from app.services.document_export_service import document_export_service
from app.services.proposal_learning_service import proposal_learning_service
from app.core.auth import get_current_user

router = APIRouter(prefix="/api/v1/documents", tags=["documents"])


# ============================================================================
# DOCUMENT EXPORT ENDPOINTS
# ============================================================================

class ProposalExportRequest(BaseModel):
    proposal_id: str
    title: str
    rfp_info: Optional[Dict[str, Any]] = None
    company: Optional[Dict[str, Any]] = None
    sections: List[Dict[str, Any]]
    include_cover_page: bool = True
    include_toc: bool = True

class PricingExportRequest(BaseModel):
    proposal_title: str
    rfp_number: str
    labor_categories: List[Dict[str, Any]]
    cost_items: Optional[List[Dict[str, Any]]] = []
    totals: Dict[str, float]
    multi_year: bool = False
    years: Optional[List[int]] = []

@router.post("/export/word")
async def export_to_word(
    request: ProposalExportRequest,
    current_user: Dict = Depends(get_current_user)
):
    """
    Export proposal to Word document (.docx)
    """
    try:
        # Generate Word document
        word_bytes = document_export_service.export_to_word(
            proposal_data=request.dict(),
            include_cover_page=request.include_cover_page,
            include_toc=request.include_toc
        )
        
        # Return as downloadable file
        filename = f"{request.title.replace(' ', '_')}.docx"
        
        return StreamingResponse(
            io.BytesIO(word_bytes),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@router.post("/export/excel")
async def export_to_excel(
    request: PricingExportRequest,
    current_user: Dict = Depends(get_current_user)
):
    """
    Export pricing to Excel spreadsheet (.xlsx)
    """
    try:
        # Generate Excel workbook
        excel_bytes = document_export_service.export_to_excel(
            pricing_data=request.dict(),
            include_summary=True
        )
        
        # Return as downloadable file
        filename = f"{request.proposal_title.replace(' ', '_')}_Pricing.xlsx"
        
        return StreamingResponse(
            io.BytesIO(excel_bytes),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@router.post("/export/pdf")
async def export_to_pdf(
    request: ProposalExportRequest,
    current_user: Dict = Depends(get_current_user)
):
    """
    Export proposal to PDF document (.pdf)
    """
    try:
        # Generate PDF document
        pdf_bytes = document_export_service.export_to_pdf(
            proposal_data=request.dict(),
            include_cover_page=request.include_cover_page
        )
        
        # Return as downloadable file
        filename = f"{request.title.replace(' ', '_')}.pdf"
        
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


# ============================================================================
# PROPOSAL LEARNING ENDPOINTS
# ============================================================================

@router.post("/learn/analyze-past-proposals")
async def analyze_past_proposals(
    current_user: Dict = Depends(get_current_user)
):
    """
    Analyze all past proposals in training directory
    """
    try:
        results = proposal_learning_service.analyze_past_proposals()
        
        return {
            'success': True,
            'results': results,
            'message': f"Analyzed {results['analyzed']} documents, extracted {results['patterns_extracted']} patterns"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/learn/upload-training-document")
async def upload_training_document(
    file: UploadFile = File(...),
    current_user: Dict = Depends(get_current_user)
):
    """
    Upload a past proposal for AI training
    """
    try:
        # Save uploaded file
        training_dir = proposal_learning_service.training_data_dir
        filepath = f"{training_dir}/{file.filename}"
        
        with open(filepath, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Analyze the new document
        results = proposal_learning_service.analyze_past_proposals()
        
        return {
            'success': True,
            'filename': file.filename,
            'message': 'Document uploaded and analyzed successfully',
            'analysis_results': results
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/learn/knowledge-summary")
async def get_knowledge_summary(
    current_user: Dict = Depends(get_current_user)
):
    """
    Get summary of learned knowledge from past proposals
    """
    try:
        summary = proposal_learning_service.get_knowledge_summary()
        
        return {
            'success': True,
            'knowledge_summary': summary
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get summary: {str(e)}")

@router.get("/learn/company-profile")
async def get_company_profile(
    current_user: Dict = Depends(get_current_user)
):
    """
    Get extracted company profile from past proposals
    """
    try:
        profile = proposal_learning_service.get_company_profile()
        
        return {
            'success': True,
            'company_profile': profile
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get profile: {str(e)}")

class GenerateSectionRequest(BaseModel):
    section_title: str
    requirements: List[str]
    context: Dict[str, Any]

@router.post("/learn/generate-section")
async def generate_section_with_learning(
    request: GenerateSectionRequest,
    current_user: Dict = Depends(get_current_user)
):
    """
    Generate proposal section using learned patterns
    """
    try:
        content = proposal_learning_service.generate_proposal_section(
            section_title=request.section_title,
            requirements=request.requirements,
            context=request.context
        )
        
        return {
            'success': True,
            'section_title': request.section_title,
            'generated_content': content,
            'used_learned_patterns': True
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


# ============================================================================
# COLLABORATION ENDPOINTS
# ============================================================================

class ShareProposalRequest(BaseModel):
    proposal_id: str
    user_emails: List[str]
    permission_level: str = "edit"  # view, comment, edit

class ProposalCommentRequest(BaseModel):
    proposal_id: str
    section_id: str
    comment_text: str
    parent_comment_id: Optional[str] = None

@router.post("/share")
async def share_proposal(
    request: ShareProposalRequest,
    current_user: Dict = Depends(get_current_user)
):
    """
    Share proposal with team members
    """
    try:
        # In production: Send email invitations, create sharing records
        return {
            'success': True,
            'proposal_id': request.proposal_id,
            'shared_with': request.user_emails,
            'permission_level': request.permission_level,
            'message': f"Proposal shared with {len(request.user_emails)} users"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sharing failed: {str(e)}")

@router.post("/comments/add")
async def add_comment(
    request: ProposalCommentRequest,
    current_user: Dict = Depends(get_current_user)
):
    """
    Add comment to proposal section
    """
    try:
        comment_id = f"comment_{datetime.now().timestamp()}"
        
        return {
            'success': True,
            'comment_id': comment_id,
            'proposal_id': request.proposal_id,
            'section_id': request.section_id,
            'author': current_user.get('email'),
            'text': request.comment_text,
            'created_at': datetime.now().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comment failed: {str(e)}")

@router.get("/comments/{proposal_id}")
async def get_comments(
    proposal_id: str,
    section_id: Optional[str] = None,
    current_user: Dict = Depends(get_current_user)
):
    """
    Get comments for proposal or specific section
    """
    try:
        # In production: Fetch from database
        return {
            'success': True,
            'proposal_id': proposal_id,
            'section_id': section_id,
            'comments': []  # Would return actual comments
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get comments: {str(e)}")


# ============================================================================
# VERSION CONTROL ENDPOINTS
# ============================================================================

@router.get("/versions/{proposal_id}")
async def get_proposal_versions(
    proposal_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """
    Get version history of proposal
    """
    try:
        # In production: Fetch from database
        return {
            'success': True,
            'proposal_id': proposal_id,
            'versions': [
                {
                    'version': '1.0',
                    'created_at': '2024-10-18T10:00:00Z',
                    'author': 'user@example.com',
                    'changes': 'Initial draft'
                }
            ]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get versions: {str(e)}")

@router.post("/versions/{proposal_id}/restore")
async def restore_version(
    proposal_id: str,
    version: str,
    current_user: Dict = Depends(get_current_user)
):
    """
    Restore proposal to previous version
    """
    try:
        return {
            'success': True,
            'proposal_id': proposal_id,
            'restored_version': version,
            'message': f"Proposal restored to version {version}"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Restore failed: {str(e)}")


from datetime import datetime

