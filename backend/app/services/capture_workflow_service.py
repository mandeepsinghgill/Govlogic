"""
Capture Workflow Service
Implements Shipley-style capture management workflow
Stages: Identification -> Qualification -> Capture -> Proposal -> Post-Submittal
"""
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session
from datetime import datetime
from app.models.opportunity import CapturePlan, Opportunity

class CaptureWorkflowService:
    """Service for managing capture workflow transitions"""

    STAGES = [
        "Identification",
        "Qualification",
        "Capture",
        "Proposal",
        "Post-Submittal"
    ]

    def __init__(self, db: Session):
        self.db = db

    def get_workflow_state(self, capture_id: str) -> Dict[str, Any]:
        """Get current workflow state and next steps"""
        plan = self.db.query(CapturePlan).filter(CapturePlan.id == capture_id).first()
        if not plan:
            return None

        current_stage = plan.status if plan.status in self.STAGES else "Identification"
        
        # Determine next stage
        try:
            current_idx = self.STAGES.index(current_stage)
            next_stage = self.STAGES[current_idx + 1] if current_idx + 1 < len(self.STAGES) else None
        except ValueError:
            current_stage = "Identification"
            next_stage = "Qualification"

        return {
            "current_stage": current_stage,
            "next_stage": next_stage,
            "is_complete": next_stage is None,
            "gate_reviews": self._get_gate_reviews(current_stage)
        }

    def advance_stage(self, capture_id: str) -> Dict[str, Any]:
        """Advance to next stage if requirements met"""
        plan = self.db.query(CapturePlan).filter(CapturePlan.id == capture_id).first()
        if not plan:
            raise ValueError("Capture plan not found")

        current_state = self.get_workflow_state(capture_id)
        if not current_state["next_stage"]:
            return current_state

        # In a real app, we would check for completed gate reviews here
        # For now, we just advance
        plan.status = current_state["next_stage"]
        self.db.commit()
        self.db.refresh(plan)
        
        return self.get_workflow_state(capture_id)

    def _get_gate_reviews(self, stage: str) -> List[str]:
        """Get required gate reviews for the current stage"""
        reviews = {
            "Identification": ["Interest Check", "Capability Match"],
            "Qualification": ["Blue Team Review", "Go/No-Go Decision"],
            "Capture": ["Black Hat Review", "Solutioning"],
            "Proposal": ["Pink Team", "Red Team", "Gold Team"],
            "Post-Submittal": ["Lessons Learned"]
        }
        return reviews.get(stage, [])
