"""
Word Add-In API
Handles AI-powered features for Microsoft Word Add-In
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

from app.core.auth import get_current_user

router = APIRouter(prefix="/api/v1/word-addin", tags=["word-addin"])


class AnalyzeRequest(BaseModel):
    content: str
    context: str = "word-addin"


class GenerateRequest(BaseModel):
    section_type: str
    context: str
    proposal_id: Optional[str] = None
    word_count: Optional[int] = None


class ComplianceCheckRequest(BaseModel):
    content: str
    standards: List[str] = ["FAR", "DFARS"]


@router.post("/analyze")
async def analyze_proposal_content(
    request: AnalyzeRequest,
    current_user = Depends(get_current_user)
):
    """
    Analyze proposal content from Word Add-In
    
    Provides:
    - Compliance scoring
    - Suggestions for improvement
    - Requirement mapping
    """
    try:
        from app.services.ai_service import ai_service
        
        analysis = await ai_service.analyze_opportunity(
            content=request.content,
            context=request.context
        )
        
        return {
            "analysis": analysis,
            "suggestions": analysis.get("suggestions", []),
            "compliance_score": analysis.get("compliance_score", 0)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/generate")
async def generate_content(
    request: GenerateRequest,
    current_user = Depends(get_current_user)
):
    """
    Generate content for Word document
    
    Uses AI to generate proposal sections based on context
    """
    try:
        from app.services.ai_service import ai_service
        
        generated = await ai_service.generate_proposal_section(
            section_type=request.section_type,
            context=request.context,
            proposal_id=request.proposal_id,
            word_count=request.word_count
        )
        
        return {
            "content": generated.get("content", ""),
            "section_type": request.section_type,
            "word_count": len(generated.get("content", "").split())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


@router.post("/compliance-check")
async def check_compliance(
    request: ComplianceCheckRequest,
    current_user = Depends(get_current_user)
):
    """
    Check compliance from Word Add-In
    
    Validates content against FAR, DFARS, and other standards
    """
    try:
        from app.services.compliance_service import compliance_service
        
        compliance = await compliance_service.check_compliance(
            content=request.content,
            standards=request.standards
        )
        
        return {
            "compliant": compliance.get("compliant", False),
            "score": compliance.get("score", 0),
            "issues": compliance.get("issues", []),
            "recommendations": compliance.get("recommendations", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Compliance check failed: {str(e)}")


@router.post("/suggest")
async def get_suggestions(
    selected_text: str,
    current_user = Depends(get_current_user)
):
    """
    Get AI suggestions for selected text in Word
    
    Provides improvement suggestions, alternative phrasing, etc.
    """
    try:
        from app.services.ai_service import ai_service
        
        suggestions = await ai_service.get_text_suggestions(
            text=selected_text
        )
        
        return {
            "suggestions": suggestions.get("suggestions", []),
            "original_text": selected_text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Suggestion failed: {str(e)}")


@router.post("/insert-citation")
async def insert_citation(
    citation_text: str,
    source: str,
    current_user = Depends(get_current_user)
):
    """
    Generate properly formatted citation for Word document
    
    Formats citations according to government proposal standards
    """
    try:
        citation = f"[{citation_text}] - {source}"
        
        return {
            "citation": citation,
            "formatted": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Citation generation failed: {str(e)}")

