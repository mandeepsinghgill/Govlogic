"""
Grants API endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.core.database import get_db
from app.models.grant import Grant

router = APIRouter()


class GrantCreate(BaseModel):
    title: str
    funding_opportunity_number: str
    organization_id: str


class GrantResponse(BaseModel):
    id: str
    title: str
    funding_opportunity_number: str
    status: str
    
    class Config:
        from_attributes = True


@router.get("/", response_model=List[GrantResponse])
async def list_grants(db: Session = Depends(get_db)):
    """List all grants"""
    grants = db.query(Grant).filter(Grant.is_deleted == False).all()
    return grants


@router.post("/", response_model=GrantResponse)
async def create_grant(grant: GrantCreate, db: Session = Depends(get_db)):
    """Create a new grant application"""
    db_grant = Grant(**grant.dict())
    db.add(db_grant)
    db.commit()
    db.refresh(db_grant)
    return db_grant

