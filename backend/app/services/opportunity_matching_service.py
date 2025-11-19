"""
Advanced AI Opportunity Matching Service
Generates Top 25 recommended opportunities based on AI matching algorithm
Now powered by the 10-Factor Enhanced PWin Algorithm
"""
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import date, timedelta
import numpy as np

from app.models.opportunity import Opportunity
from app.models.organization import Organization
from app.models.knowledge import PastPerformance
from app.services.enhanced_pwin_service import EnhancedPWinService


class OpportunityMatchingService:
    """AI-powered opportunity matching and recommendation using 10-Factor PWin"""
    
    def __init__(self, db: Session):
        self.db = db
        self.pwin_service = EnhancedPWinService(db)
    
    def get_top_recommendations(
        self,
        organization_id: str,
        limit: int = 25,
        filters: Optional[Dict] = None
    ) -> List[Dict]:
        """
        Get top recommended opportunities for an organization
        
        Args:
            organization_id: Organization ID
            limit: Number of recommendations (default 25)
            filters: Optional filters (new, expiring_soon, high_value, etc.)
            
        Returns:
            List of opportunities with AI match scores, sorted by relevance
        """
        
        org = self.db.query(Organization).filter(
            Organization.id == organization_id
        ).first()
        
        if not org:
            return []
        
        # Get active opportunities
        query = self.db.query(Opportunity).filter(
            Opportunity.status == "active"
        )
        
        # Apply filters
        if filters:
            if filters.get("new"):
                # Posted in last 7 days
                seven_days_ago = date.today() - timedelta(days=7)
                query = query.filter(Opportunity.posted_date >= seven_days_ago)
            
            if filters.get("expiring_soon"):
                # Due in next 14 days
                fourteen_days_later = date.today() + timedelta(days=14)
                query = query.filter(
                    and_(
                        Opportunity.response_deadline >= date.today(),
                        Opportunity.response_deadline <= fourteen_days_later
                    )
                )
            
            if filters.get("high_value"):
                # Value > $1M
                query = query.filter(Opportunity.estimated_value >= 1000000)
            
            if filters.get("set_aside"):
                # Filter by set-aside type
                query = query.filter(Opportunity.set_aside_type == filters["set_aside"])
        
        opportunities = query.all()
        
        # Calculate AI match score for each opportunity
        scored_opportunities = []
        for opp in opportunities:
            # Use the enhanced 10-factor PWin calculation
            pwin_result = self.pwin_service.calculate_10_factor_pwin(opp, org)
            
            # Map PWin result to the expected output format
            match_score = {
                "overall_score": pwin_result["pwin_score"],
                "scores": pwin_result["factors"],
                "grade": self._get_match_grade(pwin_result["pwin_score"]),
                "recommendation": pwin_result["recommendation"],
                "confidence": pwin_result["confidence"]
            }
            
            scored_opportunities.append({
                "opportunity": opp,
                "ai_match_score": match_score["overall_score"],
                "match_details": match_score,
                "pwin_score": match_score["overall_score"],
                "recommendation_reason": self._generate_recommendation_reason(match_score, opp, org)
            })
        
        # Sort by AI match score (descending)
        scored_opportunities.sort(key=lambda x: x["ai_match_score"], reverse=True)
        
        # Return top N
        return scored_opportunities[:limit]
    
    def calculate_ai_match_score(
        self,
        opportunity: Opportunity,
        organization: Organization
    ) -> Dict:
        """
        Calculate comprehensive AI match score (0-100) using 10-Factor PWin
        Wrapper for EnhancedPWinService to maintain backward compatibility
        """
        pwin_result = self.pwin_service.calculate_10_factor_pwin(opportunity, organization)
        
        return {
            "overall_score": pwin_result["pwin_score"],
            "scores": pwin_result["factors"],
            "grade": self._get_match_grade(pwin_result["pwin_score"]),
            "recommendation": pwin_result["recommendation"]
        }
    
    def _get_match_grade(self, score: float) -> str:
        """Convert score to letter grade"""
        if score >= 85:
            return "A+"
        elif score >= 80:
            return "A"
        elif score >= 75:
            return "B+"
        elif score >= 70:
            return "B"
        elif score >= 65:
            return "C+"
        elif score >= 60:
            return "C"
        else:
            return "D"
    
    def _generate_recommendation_reason(
        self,
        match_score: Dict,
        opp: Opportunity,
        org: Organization
    ) -> List[str]:
        """Generate human-readable reasons for recommendation based on 10 factors"""
        
        reasons = []
        factors = match_score["scores"]
        
        # Capability Match
        if factors.get("capability_match", 0) >= 80:
            reasons.append("✅ Strong capability match (NAICS & Past Perf)")
        
        # Agency Relationship
        if factors.get("agency_relationship", 0) >= 70:
            reasons.append(f"✅ Strong relationship with {opp.agency}")
        
        # Budget Alignment
        if factors.get("budget_alignment", 0) >= 90:
            reasons.append("✅ Contract value in sweet spot")
        
        # Competitive Landscape
        if factors.get("competitive_landscape", 0) >= 80:
            reasons.append("✅ Favorable competitive landscape")
        
        # Strategic Fit
        if factors.get("strategic_fit", 0) >= 80:
            reasons.append("✅ High strategic fit")
            
        # Recommendation
        if match_score.get("recommendation") == "Bid":
            reasons.append("🚀 Recommended Bid")
        
        return reasons
    
    def get_match_color(self, score: float) -> str:
        """Get color indicator for match score"""
        if score >= 80:
            return "green"  # 🟢
        elif score >= 60:
            return "yellow"  # 🟡
        else:
            return "red"  # 🔴

