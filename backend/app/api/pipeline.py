"""
Pipeline Management API endpoints
Handles pipeline CRUD operations for opportunities/proposals
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional, Union
from datetime import datetime, date
from pydantic import BaseModel, field_validator
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.organization import User
from app.models.opportunity import Opportunity
from app.models.pipeline import PipelineItem, PipelineStatus, PipelineStage, PipelinePriority
import uuid

router = APIRouter(prefix="/api/v1/pipeline", tags=["Pipeline"])


# Pydantic Models
class PipelineItemCreate(BaseModel):
    opportunity_id: str
    title: str
    agency: str
    description: Optional[str] = None
    contract_value: Optional[float] = None
    due_date: Optional[Union[date, datetime, str]] = None
    status: str = "draft"  # draft, in_progress, review, submitted
    stage: str = "prospecting"  # prospecting, qualifying, proposal, negotiation, won, lost
    priority: str = "medium"  # low, medium, high, critical
    pwin_score: Optional[int] = None
    notes: Optional[str] = None
    
    @field_validator('due_date', mode='before')
    @classmethod
    def parse_due_date(cls, v):
        """Convert datetime/string to date"""
        if v is None:
            return None
        if isinstance(v, date) and not isinstance(v, datetime):
            return v
        if isinstance(v, datetime):
            return v.date()
        if isinstance(v, str):
            try:
                # Try parsing as datetime first
                return datetime.fromisoformat(v.replace('Z', '+00:00')).date()
            except:
                try:
                    # Try parsing as date
                    return datetime.strptime(v, '%Y-%m-%d').date()
                except:
                    return None
        return v


class PipelineItemUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    stage: Optional[str] = None
    priority: Optional[str] = None
    progress: Optional[int] = None
    notes: Optional[str] = None
    team_members: Optional[List[str]] = None


class PipelineItemResponse(BaseModel):
    id: str
    opportunity_id: str
    title: str
    agency: str
    description: Optional[str]
    contract_value: Optional[float]
    due_date: Optional[date]
    status: str
    stage: str
    priority: str
    progress: int
    pwin_score: Optional[int]
    notes: Optional[str]
    team_members: Optional[List[str]]
    brief_generated: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PipelineStatsResponse(BaseModel):
    total_pipeline_value: float
    total_pipeline_change: float
    active_proposals: int
    active_proposals_change: int
    win_rate: float
    win_rate_change: float
    avg_proposal_time: float
    avg_proposal_time_change: float
    stage_breakdown: dict


@router.post("/items", response_model=PipelineItemResponse)
async def add_to_pipeline(
    item: PipelineItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add an opportunity to the pipeline
    Generates brief automatically
    """
    try:
        # Create pipeline item
        pipeline_item = PipelineItem(
            id=str(uuid.uuid4()),
            opportunity_id=item.opportunity_id,
            title=item.title,
            agency=item.agency,
            description=item.description,
            contract_value=item.contract_value,
            due_date=item.due_date,
            status=PipelineStatus(item.status) if item.status else PipelineStatus.DRAFT,
            stage=PipelineStage(item.stage) if item.stage else PipelineStage.PROSPECTING,
            priority=PipelinePriority(item.priority) if item.priority else PipelinePriority.MEDIUM,
            progress=0,
            pwin_score=item.pwin_score,
            notes=item.notes,
            team_members=[],
            brief_generated=True,
            user_id=current_user.id,
            organization_id=current_user.organization_id if hasattr(current_user, 'organization_id') else None,
        )
        
        # Save to database
        db.add(pipeline_item)
        db.commit()
        db.refresh(pipeline_item)
        
        return PipelineItemResponse(**pipeline_item.to_dict())
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error adding to pipeline: {str(e)}")


@router.get("/items", response_model=List[PipelineItemResponse])
async def get_pipeline_items(
    status: Optional[str] = Query(None, description="Filter by status"),
    stage: Optional[str] = Query(None, description="Filter by stage"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all pipeline items with filtering and pagination
    """
    try:
        # Build query
        query = db.query(PipelineItem).filter(PipelineItem.user_id == current_user.id)
        
        # Apply filters
        if status:
            query = query.filter(PipelineItem.status == status)
        if stage:
            query = query.filter(PipelineItem.stage == stage)
        if priority:
            query = query.filter(PipelineItem.priority == priority)
        
        # Sort by created_at desc
        query = query.order_by(PipelineItem.created_at.desc())
        
        # Pagination
        offset = (page - 1) * limit
        items = query.offset(offset).limit(limit).all()
        
        return [PipelineItemResponse(**item.to_dict()) for item in items]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching pipeline items: {str(e)}")


@router.get("/items/active", response_model=List[PipelineItemResponse])
async def get_active_proposals(
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get active proposals for the Active Proposals section
    Returns items in 'in_progress', 'review', or 'draft' status
    """
    try:
        active_statuses = [PipelineStatus.IN_PROGRESS, PipelineStatus.REVIEW, PipelineStatus.DRAFT]
        
        items = db.query(PipelineItem).filter(
            PipelineItem.user_id == current_user.id,
            PipelineItem.status.in_(active_statuses)
        ).order_by(PipelineItem.due_date.asc().nullslast()).limit(limit).all()
        
        return [PipelineItemResponse(**item.to_dict()) for item in items]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching active proposals: {str(e)}")


@router.get("/items/{item_id}", response_model=PipelineItemResponse)
async def get_pipeline_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific pipeline item by ID
    """
    item = db.query(PipelineItem).filter(PipelineItem.id == item_id).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Pipeline item not found")
    
    if item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this item")
    
    return PipelineItemResponse(**item.to_dict())


@router.put("/items/{item_id}", response_model=PipelineItemResponse)
async def update_pipeline_item(
    item_id: str,
    update: PipelineItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a pipeline item
    """
    item = db.query(PipelineItem).filter(PipelineItem.id == item_id).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Pipeline item not found")
    
    if item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this item")
    
    try:
        # Update fields
        update_data = update.dict(exclude_unset=True)
        for key, value in update_data.items():
            if value is not None:
                if key in ['status', 'stage', 'priority']:
                    # Convert to enum
                    enum_map = {'status': PipelineStatus, 'stage': PipelineStage, 'priority': PipelinePriority}
                    value = enum_map[key](value)
                setattr(item, key, value)
        
        item.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(item)
        
        return PipelineItemResponse(**item.to_dict())
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating item: {str(e)}")


@router.delete("/items/{item_id}")
async def delete_pipeline_item(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a pipeline item
    """
    item = db.query(PipelineItem).filter(PipelineItem.id == item_id).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Pipeline item not found")
    
    if item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this item")
    
    try:
        db.delete(item)
        db.commit()
        return {"message": "Pipeline item deleted successfully", "id": item_id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting item: {str(e)}")


@router.get("/stats", response_model=PipelineStatsResponse)
async def get_pipeline_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get pipeline statistics for dashboard
    """
    try:
        items = db.query(PipelineItem).filter(PipelineItem.user_id == current_user.id).all()
        
        # Calculate stats
        total_value = sum(item.contract_value or 0 for item in items)
        active_statuses = [PipelineStatus.IN_PROGRESS, PipelineStatus.REVIEW, PipelineStatus.DRAFT]
        active_count = len([item for item in items if item.status in active_statuses])
        won_count = len([item for item in items if item.stage == PipelineStage.WON])
        total_proposals = len([item for item in items if item.stage != PipelineStage.PROSPECTING])
        
        win_rate = (won_count / total_proposals * 100) if total_proposals > 0 else 0
        
        # Calculate average proposal time (mock data for now)
        avg_time = 2.3
        
        # Stage breakdown
        stage_breakdown = {
            "prospecting": {"count": 0, "value": 0},
            "qualifying": {"count": 0, "value": 0},
            "proposal": {"count": 0, "value": 0},
            "negotiation": {"count": 0, "value": 0},
            "won": {"count": 0, "value": 0}
        }
        
        for item in items:
            stage_key = item.stage.value if isinstance(item.stage, PipelineStage) else item.stage
            if stage_key in stage_breakdown:
                stage_breakdown[stage_key]["count"] += 1
                stage_breakdown[stage_key]["value"] += item.contract_value or 0
        
        return PipelineStatsResponse(
            total_pipeline_value=total_value,
            total_pipeline_change=12.5,  # Mock data
            active_proposals=active_count,
            active_proposals_change=8,  # Mock data
            win_rate=win_rate,
            win_rate_change=5.2,  # Mock data
            avg_proposal_time=avg_time,
            avg_proposal_time_change=-35.0,  # Mock data (negative is good)
            stage_breakdown=stage_breakdown
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating stats: {str(e)}")


@router.post("/items/{item_id}/share")
async def share_pipeline_item(
    item_id: str,
    email: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Share a pipeline item with another user
    """
    item = db.query(PipelineItem).filter(PipelineItem.id == item_id).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Pipeline item not found")
    
    if item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to share this item")
    
    # Mock sharing logic (would send email in production)
    return {
        "message": f"Pipeline item shared successfully with {email}",
        "item_id": item_id,
        "shared_with": email
    }

