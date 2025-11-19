"""
Grant Application Service
Manages the lifecycle of grant applications (Draft -> Review -> Submitted)
"""
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session
from datetime import datetime
from app.models.grant import Grant
from app.models.organization import Organization

class GrantApplicationService:
    """Service for managing grant applications"""

    def __init__(self, db: Session):
        self.db = db

    def create_application(self, grant_id: str, organization_id: str) -> Grant:
        """Create a new grant application (or get existing draft)"""
        # Check if already exists
        existing = self.db.query(Grant).filter(
            Grant.funding_opportunity_number == grant_id,
            Grant.organization_id == organization_id
        ).first()

        if existing:
            return existing

        # Create new application
        # Note: In a real app, we'd fetch details from Grants.gov/SAM.gov first
        # For now, we assume basic info is passed or we create a placeholder
        new_grant = Grant(
            title=f"Application for {grant_id}",
            funding_opportunity_number=grant_id,
            organization_id=organization_id,
            status="draft",
            open_date=datetime.now().date()
        )
        self.db.add(new_grant)
        self.db.commit()
        self.db.refresh(new_grant)
        return new_grant

    def update_status(self, application_id: str, status: str) -> Optional[Grant]:
        """Update application status"""
        grant = self.db.query(Grant).filter(Grant.id == application_id).first()
        if not grant:
            return None
        
        valid_statuses = ["draft", "in_progress", "review", "submitted", "awarded", "declined"]
        if status not in valid_statuses:
            raise ValueError(f"Invalid status: {status}")
            
        grant.status = status
        self.db.commit()
        self.db.refresh(grant)
        return grant

    def get_application_stats(self, organization_id: str) -> Dict[str, int]:
        """Get statistics for organization's grant applications"""
        grants = self.db.query(Grant).filter(Grant.organization_id == organization_id).all()
        
        stats = {
            "total": len(grants),
            "draft": 0,
            "submitted": 0,
            "awarded": 0,
            "total_value": 0.0
        }
        
        for g in grants:
            if g.status == "draft":
                stats["draft"] += 1
            elif g.status == "submitted":
                stats["submitted"] += 1
            elif g.status == "awarded":
                stats["awarded"] += 1
                if g.total_funding:
                    stats["total_value"] += g.total_funding
                    
        return stats

    def get_applications(self, organization_id: str) -> List[Grant]:
        """List all applications for an organization"""
        return self.db.query(Grant).filter(
            Grant.organization_id == organization_id
        ).order_by(Grant.created_at.desc()).all()
