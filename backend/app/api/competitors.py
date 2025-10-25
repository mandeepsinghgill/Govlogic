"""
Competitors API endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.models.competitor import Competitor

router = APIRouter()


class CompetitorResponse(BaseModel):
    id: str
    company_name: str
    total_wins: int
    win_rate: Optional[float]
    
    class Config:
        from_attributes = True


@router.get("/", response_model=List[CompetitorResponse])
async def list_competitors(db: Session = Depends(get_db)):
    """List all competitors"""
    competitors = db.query(Competitor).all()
    return competitors

