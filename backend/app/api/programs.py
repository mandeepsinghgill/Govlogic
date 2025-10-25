"""
Program Management API endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.core.database import get_db
from app.models.program import Program, Milestone, RAIDItem

router = APIRouter()


class ProgramResponse(BaseModel):
    id: str
    name: str
    status: str
    health_score: int
    
    class Config:
        from_attributes = True


@router.get("/", response_model=List[ProgramResponse])
async def list_programs(db: Session = Depends(get_db)):
    """List all programs"""
    programs = db.query(Program).all()
    return programs


@router.get("/{program_id}/milestones")
async def get_program_milestones(program_id: str, db: Session = Depends(get_db)):
    """Get milestones for a program"""
    milestones = db.query(Milestone).filter(
        Milestone.program_id == program_id
    ).all()
    return milestones


@router.get("/{program_id}/raid")
async def get_program_raid(program_id: str, db: Session = Depends(get_db)):
    """Get RAID log for a program"""
    raid_items = db.query(RAIDItem).filter(
        RAIDItem.program_id == program_id
    ).all()
    return raid_items

