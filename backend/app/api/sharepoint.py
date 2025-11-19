"""
SharePoint Integration API
Handles document sync, export, and collaboration with SharePoint Online
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import os

from app.services.sharepoint_service import sharepoint_service
from app.core.auth import get_current_user
from app.core.database import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/v1/sharepoint", tags=["sharepoint"])


class SharePointSyncRequest(BaseModel):
    proposal_id: str
    folder_path: str = "Shared Documents/Proposals"
    site_url: Optional[str] = None


class SharePointUploadRequest(BaseModel):
    file_content: str  # Base64 encoded
    filename: str
    folder_path: str = "Shared Documents"
    site_url: Optional[str] = None


@router.get("/status")
async def get_sharepoint_status(
    current_user = Depends(get_current_user)
):
    """Check if SharePoint is configured and available"""
    is_configured = sharepoint_service.is_configured()
    return {
        "configured": is_configured,
        "available": is_configured and OFFICE365_AVAILABLE,
        "tenant_url": sharepoint_service.tenant_url if sharepoint_service.tenant_url else None
    }


@router.post("/sync-proposal")
async def sync_proposal_to_sharepoint(
    request: SharePointSyncRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Sync proposal document to SharePoint
    
    - Exports proposal to DOCX
    - Uploads to SharePoint
    - Creates metadata list item
    - Returns SharePoint URL
    """
    from app.models.proposal import Proposal
    
    # Get proposal data
    proposal = db.query(Proposal).filter(Proposal.id == request.proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    # Check if user has access
    if proposal.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Prepare proposal data for export
    from app.models.proposal_section import ProposalSection
    sections = db.query(ProposalSection).filter(
        ProposalSection.proposal_id == proposal.id
    ).order_by(ProposalSection.order).all()
    
    proposal_data = {
        "title": proposal.title or "Untitled Proposal",
        "rfp_number": proposal.rfp_number or "",
        "status": proposal.status.value if hasattr(proposal.status, 'value') else str(proposal.status),
        "sections": [
            {
                "number": s.section_number or "",
                "title": s.section_title or "",
                "content": s.content or ""
            }
            for s in sections
        ]
    }
    
    # Sync to SharePoint
    result = sharepoint_service.sync_proposal_to_sharepoint(
        proposal_id=request.proposal_id,
        proposal_data=proposal_data,
        folder_path=request.folder_path
    )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=500,
            detail=f"Failed to sync to SharePoint: {result.get('error', 'Unknown error')}"
        )
    
    # Store SharePoint URL in database
    if hasattr(proposal, 'sharepoint_url'):
        proposal.sharepoint_url = result.get("sharepoint_url")
    if hasattr(proposal, 'sharepoint_file_id'):
        proposal.sharepoint_file_id = result.get("file_id")
    db.commit()
    
    return {
        "message": "Proposal synced to SharePoint successfully",
        "sharepoint_url": result.get("sharepoint_url"),
        "file_id": result.get("file_id"),
        "filename": result.get("filename")
    }


@router.post("/upload")
async def upload_file_to_sharepoint(
    request: SharePointUploadRequest,
    current_user = Depends(get_current_user)
):
    """Upload any file to SharePoint"""
    import base64
    
    try:
        # Decode base64 content
        file_content = base64.b64decode(request.file_content)
        
        result = sharepoint_service.upload_document(
            file_content=file_content,
            filename=request.filename,
            folder_path=request.folder_path,
            site_url=request.site_url
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=500,
                detail=f"Failed to upload to SharePoint: {result.get('error', 'Unknown error')}"
            )
        
        return {
            "message": "File uploaded to SharePoint successfully",
            "sharepoint_url": f"{sharepoint_service.tenant_url}{result.get('file_url')}",
            "file_id": result.get("file_id"),
            "filename": result.get("filename")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/folders")
async def get_sharepoint_folders(
    folder_path: str = Query(default="Shared Documents", description="Base folder path"),
    current_user = Depends(get_current_user)
):
    """Get SharePoint folder structure"""
    folders = sharepoint_service.list_folders(folder_path=folder_path)
    
    return {
        "folder_path": folder_path,
        "folders": folders
    }


@router.post("/create-folder")
async def create_sharepoint_folder(
    folder_path: str = Query(..., description="Folder path to create"),
    current_user = Depends(get_current_user)
):
    """Create folder structure in SharePoint"""
    success = sharepoint_service.create_folder(folder_path=folder_path)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to create folder")
    
    return {
        "message": "Folder created successfully",
        "folder_path": folder_path
    }


@router.get("/versions")
async def get_document_versions(
    file_url: str = Query(..., description="SharePoint file URL"),
    current_user = Depends(get_current_user)
):
    """Get version history of a SharePoint document"""
    versions = sharepoint_service.get_document_versions(file_url=file_url)
    
    return {
        "file_url": file_url,
        "versions": versions
    }


@router.post("/setup-auto-sync")
async def setup_automatic_sync(
    proposal_id: str = Query(..., description="Proposal ID"),
    folder_path: str = Query(default="Shared Documents/Proposals", description="Folder path"),
    auto_sync: bool = Query(default=True, description="Enable automatic sync"),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Set up automatic sync for a proposal"""
    from app.models.proposal import Proposal
    
    proposal = db.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    # Check if user has access
    if proposal.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Store auto-sync configuration (add fields to proposal model if needed)
    if hasattr(proposal, 'auto_sync_sharepoint'):
        proposal.auto_sync_sharepoint = auto_sync
    if hasattr(proposal, 'sharepoint_folder_path'):
        proposal.sharepoint_folder_path = folder_path
    db.commit()
    
    return {
        "message": "Auto-sync configured successfully",
        "proposal_id": proposal_id,
        "auto_sync": auto_sync,
        "folder_path": folder_path
    }


# Import check for Office365 availability
try:
    from office365.sharepoint.client_context import ClientContext
    OFFICE365_AVAILABLE = True
except ImportError:
    OFFICE365_AVAILABLE = False

