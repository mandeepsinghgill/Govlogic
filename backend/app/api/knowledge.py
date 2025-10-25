"""
Knowledge Base API endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.core.database import get_db
from app.models.knowledge import KnowledgeDocument, PastPerformance, TeamingPartner, TeamingAgreement

router = APIRouter()


class KnowledgeDocumentResponse(BaseModel):
    id: str
    title: str
    document_type: str
    
    class Config:
        from_attributes = True


@router.get("/documents", response_model=List[KnowledgeDocumentResponse])
async def list_knowledge_documents(db: Session = Depends(get_db)):
    """List all knowledge documents"""
    docs = db.query(KnowledgeDocument).filter(
        KnowledgeDocument.is_deleted == False
    ).all()
    return docs


@router.get("/past-performance")
async def list_past_performance(db: Session = Depends(get_db)):
    """List past performance records"""
    records = db.query(PastPerformance).all()
    return records


@router.get("/teaming-partners")
async def list_teaming_partners(db: Session = Depends(get_db)):
    """List teaming partners"""
    partners = db.query(TeamingPartner).all()
    return partners

