"""
API endpoints for continuous learning service
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, Optional
from pydantic import BaseModel

from app.services.continuous_learning_service import continuous_learning_service
from app.api.auth import get_current_user


router = APIRouter(prefix="/api/v1/learning", tags=["Continuous Learning"])


class FeedbackRequest(BaseModel):
    """Feedback submission request"""
    content_type: str
    original_content: str
    edited_content: str
    feedback_score: Optional[float] = None
    context: Optional[Dict[str, Any]] = None


class ContentImprovementRequest(BaseModel):
    """Content improvement request"""
    content_type: str
    generated_content: str
    context: Optional[Dict[str, Any]] = None


@router.post("/feedback")
async def submit_feedback(
    request: FeedbackRequest,
    current_user: Dict = Depends(get_current_user)
):
    """
    Submit feedback on AI-generated content
    
    This endpoint allows users to provide feedback by showing the difference
    between AI-generated content and their edited version. The system learns
    from these edits to improve future generations.
    """
    try:
        result = await continuous_learning_service.process_user_feedback(
            user_id=current_user['user_id'],
            content_type=request.content_type,
            original_content=request.original_content,
            edited_content=request.edited_content,
            feedback_score=request.feedback_score,
            context=request.context
        )
        
        return {
            "status": "success",
            "message": "Feedback processed and learned",
            "learning_result": result
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process feedback: {str(e)}"
        )


@router.post("/improve")
async def improve_content(
    request: ContentImprovementRequest,
    current_user: Dict = Depends(get_current_user)
):
    """
    Apply learned patterns to improve generated content
    
    This endpoint takes newly generated content and applies learned patterns
    from past user feedback to improve it before showing to the user.
    """
    try:
        improved_content = await continuous_learning_service.apply_learned_patterns(
            user_id=current_user['user_id'],
            content_type=request.content_type,
            generated_content=request.generated_content,
            context=request.context
        )
        
        return {
            "status": "success",
            "original_content": request.generated_content,
            "improved_content": improved_content
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to improve content: {str(e)}"
        )


@router.get("/metrics")
async def get_learning_metrics(
    current_user: Dict = Depends(get_current_user)
):
    """
    Get learning metrics and statistics
    
    Returns metrics about the learning system's performance and improvements.
    """
    try:
        metrics = continuous_learning_service.get_learning_metrics()
        
        return {
            "status": "success",
            "metrics": metrics
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get metrics: {str(e)}"
        )


@router.get("/export")
async def export_learned_knowledge(
    current_user: Dict = Depends(get_current_user)
):
    """
    Export learned knowledge
    
    Exports the learned patterns and knowledge for backup or transfer.
    Requires admin privileges.
    """
    # Check if user is admin
    if current_user.get('role') != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    
    try:
        knowledge = await continuous_learning_service.export_learned_knowledge()
        
        return {
            "status": "success",
            "knowledge": knowledge
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export knowledge: {str(e)}"
        )


@router.post("/import")
async def import_learned_knowledge(
    knowledge_data: Dict[str, Any],
    current_user: Dict = Depends(get_current_user)
):
    """
    Import learned knowledge
    
    Imports previously learned patterns and knowledge.
    Requires admin privileges.
    """
    # Check if user is admin
    if current_user.get('role') != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    
    try:
        await continuous_learning_service.import_learned_knowledge(knowledge_data)
        
        return {
            "status": "success",
            "message": "Knowledge imported successfully"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to import knowledge: {str(e)}"
        )

