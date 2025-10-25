"""
API endpoints for rich text editor service
"""
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from typing import Dict, Any, Optional, List
from pydantic import BaseModel

from app.services.rich_editor_service import rich_editor_service
from app.api.auth import get_current_user


router = APIRouter(prefix="/api/v1/editor", tags=["Rich Editor"])


class CreateDocumentRequest(BaseModel):
    """Create document request"""
    document_id: str
    title: str
    content: str
    document_type: str = 'proposal'


class AutoSaveRequest(BaseModel):
    """Auto-save request"""
    document_id: str
    content: str
    save_as_draft: bool = True


class SaveVersionRequest(BaseModel):
    """Save version request"""
    document_id: str
    content: str
    version_note: Optional[str] = None


class RollbackRequest(BaseModel):
    """Rollback request"""
    document_id: str
    version_id: str


class ShareDocumentRequest(BaseModel):
    """Share document request"""
    document_id: str
    invitee_email: str
    permission_level: str
    message: Optional[str] = None


class UpdatePermissionRequest(BaseModel):
    """Update permission request"""
    document_id: str
    target_user_id: str
    new_permission: str


@router.post("/documents")
async def create_document(
    request: CreateDocumentRequest,
    current_user: Dict = Depends(get_current_user)
):
    """
    Create a new document
    """
    try:
        result = await rich_editor_service.create_document(
            document_id=request.document_id,
            title=request.title,
            content=request.content,
            owner_id=current_user['user_id'],
            owner_name=current_user.get('name', 'User'),
            document_type=request.document_type
        )
        
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create document: {str(e)}"
        )


@router.post("/auto-save")
async def auto_save(
    request: AutoSaveRequest,
    current_user: Dict = Depends(get_current_user)
):
    """
    Auto-save document content
    
    Automatically saves document content as draft or to main document.
    Called periodically by the frontend editor.
    """
    try:
        result = await rich_editor_service.auto_save(
            document_id=request.document_id,
            user_id=current_user['user_id'],
            user_name=current_user.get('name', 'User'),
            content=request.content,
            save_as_draft=request.save_as_draft
        )
        
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Auto-save failed: {str(e)}"
        )


@router.post("/save-version")
async def save_version(
    request: SaveVersionRequest,
    current_user: Dict = Depends(get_current_user)
):
    """
    Save a new version of the document
    
    Creates a new version in the version history.
    """
    try:
        result = await rich_editor_service.save_version(
            document_id=request.document_id,
            user_id=current_user['user_id'],
            user_name=current_user.get('name', 'User'),
            content=request.content,
            version_note=request.version_note
        )
        
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save version: {str(e)}"
        )


@router.get("/documents/{document_id}/versions")
async def get_version_history(
    document_id: str,
    limit: int = 50,
    current_user: Dict = Depends(get_current_user)
):
    """
    Get version history for a document
    
    Returns list of all versions with metadata.
    """
    try:
        result = await rich_editor_service.get_version_history(
            document_id=document_id,
            user_id=current_user['user_id'],
            limit=limit
        )
        
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get version history: {str(e)}"
        )


@router.post("/rollback")
async def rollback_to_version(
    request: RollbackRequest,
    current_user: Dict = Depends(get_current_user)
):
    """
    Rollback document to a specific version
    
    Restores the document to a previous version.
    """
    try:
        result = await rich_editor_service.rollback_to_version(
            document_id=request.document_id,
            version_id=request.version_id,
            user_id=current_user['user_id'],
            user_name=current_user.get('name', 'User')
        )
        
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to rollback: {str(e)}"
        )


@router.post("/share")
async def share_document(
    request: ShareDocumentRequest,
    current_user: Dict = Depends(get_current_user)
):
    """
    Share document via email invitation
    
    Sends an email invitation to collaborate on the document.
    """
    try:
        result = await rich_editor_service.share_document(
            document_id=request.document_id,
            inviter_id=current_user['user_id'],
            invitee_email=request.invitee_email,
            permission_level=request.permission_level,
            message=request.message
        )
        
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to share document: {str(e)}"
        )


@router.post("/accept-invite/{document_id}")
async def accept_invitation(
    document_id: str,
    permission_level: str,
    current_user: Dict = Depends(get_current_user)
):
    """
    Accept document invitation
    
    Accepts an invitation to collaborate on a document.
    """
    try:
        result = await rich_editor_service.accept_invitation(
            document_id=document_id,
            user_id=current_user['user_id'],
            permission_level=permission_level
        )
        
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to accept invitation: {str(e)}"
        )


@router.post("/permissions")
async def update_permission(
    request: UpdatePermissionRequest,
    current_user: Dict = Depends(get_current_user)
):
    """
    Update user permission for a document
    
    Changes a user's permission level. Requires admin permission.
    """
    try:
        result = await rich_editor_service.update_permission(
            document_id=request.document_id,
            admin_id=current_user['user_id'],
            target_user_id=request.target_user_id,
            new_permission=request.new_permission
        )
        
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update permission: {str(e)}"
        )


@router.get("/documents/{document_id}/permissions")
async def get_document_permissions(
    document_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """
    Get document permissions
    
    Returns all permissions for a document.
    """
    try:
        result = await rich_editor_service.get_document_permissions(
            document_id=document_id,
            user_id=current_user['user_id']
        )
        
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get permissions: {str(e)}"
        )


@router.get("/documents/{document_id}/active-editors")
async def get_active_editors(
    document_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """
    Get list of active editors
    
    Returns users currently editing the document.
    """
    try:
        active_editors = await rich_editor_service.get_active_editors(document_id)
        
        return {
            "status": "success",
            "document_id": document_id,
            "active_editors": active_editors
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get active editors: {str(e)}"
        )


@router.websocket("/ws/{document_id}")
async def editor_websocket(
    websocket: WebSocket,
    document_id: str
):
    """
    WebSocket endpoint for real-time editing
    
    Handles real-time collaboration features like cursor tracking,
    live edits, and presence indicators.
    """
    await websocket.accept()
    
    try:
        # Get user info from query params or auth
        user_id = websocket.query_params.get('user_id', 'anonymous')
        user_name = websocket.query_params.get('user_name', 'Anonymous')
        
        # Track active editor
        await rich_editor_service.track_active_editor(document_id, user_id, True)
        
        # Send initial state
        await websocket.send_json({
            "type": "connected",
            "document_id": document_id,
            "user_id": user_id
        })
        
        # Listen for messages
        while True:
            data = await websocket.receive_json()
            
            # Handle different message types
            if data.get('type') == 'cursor_move':
                # Broadcast cursor position to other users
                pass
            
            elif data.get('type') == 'content_change':
                # Handle content changes
                pass
            
            elif data.get('type') == 'selection_change':
                # Handle selection changes
                pass
    
    except WebSocketDisconnect:
        # User disconnected
        await rich_editor_service.track_active_editor(document_id, user_id, False)
    
    except Exception as e:
        print(f"WebSocket error: {str(e)}")
        await websocket.close()

