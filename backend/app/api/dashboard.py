"""
Dashboard API endpoints
Provides aggregated stats and data for the dashboard
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.organization import User
from app.models.opportunity import Opportunity
from app.models.proposal import Proposal, ProposalStatus
from app.services.samgov_service import samgov_service

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive dashboard statistics
    Combines data from opportunities, proposals, and SAM.gov
    """
    
    # Opportunities stats
    total_opportunities = db.query(Opportunity).filter(
        Opportunity.is_deleted == False,
        Opportunity.active == True
    ).count()
    
    avg_opportunity_value = db.query(func.avg(Opportunity.contract_value)).filter(
        Opportunity.is_deleted == False,
        Opportunity.contract_value.isnot(None)
    ).scalar() or 0
    
    recent_opportunities = db.query(Opportunity).filter(
        Opportunity.is_deleted == False,
        Opportunity.created_at >= datetime.now() - timedelta(days=7)
    ).count()
    
    # Proposals stats (user-scoped)
    total_proposals = db.query(Proposal).filter(
        Proposal.is_deleted == False,
        Proposal.created_by == current_user.id
    ).count()
    
    active_proposals = db.query(Proposal).filter(
        Proposal.is_deleted == False,
        Proposal.created_by == current_user.id,
        Proposal.status.in_([ProposalStatus.DRAFT, ProposalStatus.IN_PROGRESS])
    ).count()
    
    submitted_proposals = db.query(Proposal).filter(
        Proposal.is_deleted == False,
        Proposal.created_by == current_user.id,
        Proposal.status == ProposalStatus.SUBMITTED
    ).count()
    
    # Pipeline value
    total_pipeline_value = db.query(func.sum(Opportunity.contract_value)).filter(
        Opportunity.is_deleted == False,
        Opportunity.contract_value.isnot(None)
    ).scalar() or 0
    
    return {
        "totalActiveContracts": total_opportunities,
        "totalContracts": total_opportunities,
        "averageValue": float(avg_opportunity_value),
        "avgBidValue": float(avg_opportunity_value),
        "recentOpportunitiesCount": recent_opportunities,
        "proposalsCount": total_proposals,
        "activeProposalsCount": active_proposals,
        "submittedProposalsCount": submitted_proposals,
        "totalPipelineValue": float(total_pipeline_value),
        "user": {
            "name": current_user.full_name,
            "email": current_user.email,
            "role": current_user.role.value
        }
    }


@router.get("/recent-activity")
async def get_recent_activity(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get recent activity for dashboard feed
    """
    
    # Recent proposals
    recent_proposals = db.query(Proposal).filter(
        Proposal.is_deleted == False,
        Proposal.created_by == current_user.id
    ).order_by(Proposal.created_at.desc()).limit(limit).all()
    
    activities = []
    for proposal in recent_proposals:
        activities.append({
            "id": proposal.id,
            "type": "proposal",
            "action": "created" if proposal.status == ProposalStatus.DRAFT else "updated",
            "title": proposal.title,
            "timestamp": proposal.created_at.isoformat() if proposal.created_at else None,
            "status": proposal.status.value
        })
    
    return {
        "activities": activities,
        "total": len(activities)
    }


@router.get("/pipeline-overview")
async def get_pipeline_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get pipeline overview with stage breakdown
    """
    
    from app.models.opportunity import OpportunityStage
    
    pipeline = {}
    for stage in OpportunityStage:
        count = db.query(Opportunity).filter(
            Opportunity.is_deleted == False,
            Opportunity.stage == stage
        ).count()
        
        value = db.query(func.sum(Opportunity.contract_value)).filter(
            Opportunity.is_deleted == False,
            Opportunity.stage == stage,
            Opportunity.contract_value.isnot(None)
        ).scalar() or 0
        
        pipeline[stage.value] = {
            "count": count,
            "value": float(value)
        }
    
    return {
        "pipeline": pipeline,
        "totalStages": len(OpportunityStage)
    }

