"""
Knowledge Base API endpoints - Document management, templates, past performance
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.organization import User
import uuid
import os
from datetime import datetime
import shutil

router = APIRouter()


class DocumentCreate(BaseModel):
    title: str
    category: str
    type: str
    description: Optional[str] = None
    tags: Optional[List[str]] = []


class DocumentResponse(BaseModel):
    id: str
    title: str
    category: str
    type: str
    description: Optional[str]
    upload_date: str
    last_modified: str
    size: str
    tags: List[str]
    author: str
    downloads: int
    views: int
    is_favorite: bool
    file_path: Optional[str]
    
    class Config:
        from_attributes = True


# Ensure upload directory exists
# Ensure upload directory exists
UPLOAD_DIR = "./uploads/knowledge"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    category: str = Form(...),
    description: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a document to knowledge base
    """
    try:
        # Validate file type
        allowed_extensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt']
        file_ext = os.path.splitext(file.filename)[1].lower()
        
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"File type {file_ext} not allowed. Allowed types: {', '.join(allowed_extensions)}"
            )
        
        # Generate unique filename
        doc_id = str(uuid.uuid4())
        safe_filename = f"{doc_id}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, safe_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Get file size
        file_size = os.path.getsize(file_path)
        size_str = format_file_size(file_size)
        
        # Determine document type from extension
        doc_type = get_document_type(file_ext)
        
        # Parse tags
        tag_list = []
        if tags:
            tag_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
        
        # Create document record (store in database - for now return mock data)
        # TODO: Create Document model and save to database
        
        document = {
            "id": doc_id,
            "title": title,
            "category": category,
            "type": doc_type,
            "description": description or "",
            "upload_date": datetime.now().isoformat(),
            "last_modified": datetime.now().isoformat(),
            "size": size_str,
            "tags": tag_list,
            "author": current_user.email,
            "downloads": 0,
            "views": 0,
            "is_favorite": False,
            "file_path": file_path
        }
        
        return {
            "message": "Document uploaded successfully",
            "document": document
        }
        
    except Exception as e:
        # Clean up file if error occurs
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/documents")
async def get_documents(
    category: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all documents from knowledge base
    """
    # TODO: Query from database
    # For now, return mock data + any uploaded files
    
    mock_documents = [
        {
            "id": "1",
            "title": "SF-424 Application Form Template",
            "category": "templates",
            "type": "Word Document",
            "description": "Standard federal grant application form template",
            "upload_date": "2025-10-15T00:00:00",
            "last_modified": "2025-11-01T00:00:00",
            "size": "245 KB",
            "tags": ["Grant", "SF-424", "Federal", "Template"],
            "author": "Admin",
            "downloads": 145,
            "views": 892,
            "is_favorite": True,
            "file_path": None
        },
        {
            "id": "2",
            "title": "Technical Approach Boilerplate",
            "category": "proposals",
            "type": "Word Document",
            "description": "Reusable technical approach content",
            "upload_date": "2025-09-20T00:00:00",
            "last_modified": "2025-10-28T00:00:00",
            "size": "1.2 MB",
            "tags": ["Technical", "IT", "Modernization"],
            "author": "Sarah Johnson",
            "downloads": 89,
            "views": 456,
            "is_favorite": True,
            "file_path": None
        }
    ]
    
    # Filter by category if provided
    if category and category != 'all':
        mock_documents = [doc for doc in mock_documents if doc['category'] == category]
    
    # Filter by search if provided
    if search:
        search_lower = search.lower()
        mock_documents = [
            doc for doc in mock_documents 
            if search_lower in doc['title'].lower() or 
               search_lower in doc['description'].lower() or
               any(search_lower in tag.lower() for tag in doc['tags'])
        ]
    
    return {"documents": mock_documents}


@router.get("/documents/{document_id}")
async def get_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific document
    """
    # TODO: Query from database
    raise HTTPException(status_code=404, detail="Document not found")


@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a document
    """
    # TODO: Delete from database and filesystem
    return {"message": "Document deleted successfully"}


@router.post("/documents/{document_id}/favorite")
async def toggle_favorite(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Toggle document favorite status
    """
    # TODO: Update in database
    return {"message": "Favorite status updated"}


@router.get("/past-performance")
async def get_past_performance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get past performance records
    """
    past_performance = [
        {
            "id": "1",
            "project_name": "DoD Enterprise Cloud Migration",
            "client": "Department of Defense",
            "contract_value": 15000000,
            "start_date": "2023-01-15",
            "end_date": "2024-12-31",
            "status": "completed",
            "rating": 5,
            "description": "Migrated 50+ legacy applications to AWS GovCloud"
        },
        {
            "id": "2",
            "project_name": "VA Healthcare IT Modernization",
            "client": "Veterans Affairs",
            "contract_value": 8500000,
            "start_date": "2023-06-01",
            "end_date": "2025-05-31",
            "status": "ongoing",
            "rating": 5,
            "description": "Modernizing healthcare IT systems across 15 VA medical centers"
        }
    ]
    
    return {"past_performance": past_performance}


@router.get("/teaming-partners")
async def get_teaming_partners(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get teaming partners
    """
    partners = [
        {
            "id": "1",
            "company_name": "AWS Government Services",
            "capabilities": ["Cloud Infrastructure", "Security", "DevOps"],
            "past_projects": 28,
            "certifications": ["FedRAMP High", "DoD IL6", "CMMC Level 5"],
            "contact_person": "Jennifer Williams",
            "last_engagement": "2025-10-15"
        },
        {
            "id": "2",
            "company_name": "Palantir Technologies",
            "capabilities": ["Data Analytics", "AI/ML", "Big Data"],
            "past_projects": 15,
            "certifications": ["DoD IL6", "CMMC Level 3", "ISO 27001"],
            "contact_person": "Robert Chen",
            "last_engagement": "2025-09-20"
        }
    ]
    
    return {"partners": partners}


# Helper functions
def format_file_size(size_bytes: int) -> str:
    """Format file size in human-readable format"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.0f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.0f} TB"


def get_document_type(file_ext: str) -> str:
    """Determine document type from file extension"""
    type_map = {
        '.pdf': 'PDF',
        '.doc': 'Word Document',
        '.docx': 'Word Document',
        '.xls': 'Excel Spreadsheet',
        '.xlsx': 'Excel Spreadsheet',
        '.ppt': 'PowerPoint',
        '.pptx': 'PowerPoint',
        '.txt': 'Text Document'
    }
    return type_map.get(file_ext.lower(), 'Other')
