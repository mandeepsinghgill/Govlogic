"""
Advanced AI Opportunity Matching Service
Generates Top 25 recommended opportunities based on AI matching algorithm
"""
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import date, timedelta
import numpy as np

from app.models.opportunity import Opportunity
from app.models.organization import Organization
from app.models.knowledge import PastPerformance


class OpportunityMatchingService:
    """AI-powered opportunity matching and recommendation"""
    
    def __init__(self, db: Session):
        self.db = db
    
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
            match_score = self.calculate_ai_match_score(opp, org)
            
            scored_opportunities.append({
                "opportunity": opp,
                "ai_match_score": match_score["overall_score"],
                "match_details": match_score,
                "pwin_score": opp.pwin_score or 50,
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
        Calculate comprehensive AI match score (0-100)
        
        Factors:
        1. Capability Match (30 points)
        2. Past Performance Relevance (25 points)
        3. Set-Aside Eligibility (20 points)
        4. Contract Size Match (15 points)
        5. Geographic Match (10 points)
        6. Clearance Match (10 points) - Bonus
        
        Total: 100+ points (capped at 100)
        """
        
        scores = {}
        
        # 1. Capability Match (30 points)
        scores["capability"] = self._score_capability_match(opportunity, organization)
        
        # 2. Past Performance Relevance (25 points)
        scores["past_performance"] = self._score_past_performance(opportunity, organization)
        
        # 3. Set-Aside Eligibility (20 points)
        scores["set_aside"] = self._score_set_aside(opportunity, organization)
        
        # 4. Contract Size Match (15 points)
        scores["size"] = self._score_contract_size(opportunity, organization)
        
        # 5. Geographic Match (10 points)
        scores["geography"] = self._score_geography(opportunity, organization)
        
        # 6. Clearance Match (10 points bonus)
        scores["clearance"] = self._score_clearance(opportunity, organization)
        
        # Calculate overall score
        overall_score = sum(scores.values())
        overall_score = min(overall_score, 100)  # Cap at 100
        
        return {
            "overall_score": round(overall_score, 1),
            "scores": scores,
            "grade": self._get_match_grade(overall_score)
        }
    
    def _score_capability_match(self, opp: Opportunity, org: Organization) -> float:
        """Score capability match (0-30 points)"""
        
        score = 0.0
        
        # NAICS code match (15 points)
        if opp.naics_code in (org.naics_codes or []):
            score += 15.0
        elif org.naics_codes:
            # Partial credit for same 2-digit NAICS (industry)
            opp_industry = str(opp.naics_code)[:2] if opp.naics_code else None
            org_industries = [str(n)[:2] for n in org.naics_codes]
            if opp_industry in org_industries:
                score += 7.5
        
        # Keyword/capability overlap (15 points)
        if opp.description and org.core_capabilities:
            opp_text = opp.description.lower()
            
            # Count capability matches
            matches = 0
            total_capabilities = len(org.core_capabilities)
            
            for capability in org.core_capabilities:
                if capability.lower() in opp_text:
                    matches += 1
            
            if total_capabilities > 0:
                match_ratio = matches / total_capabilities
                score += 15.0 * match_ratio
        
        return round(score, 2)
    
    def _score_past_performance(self, opp: Opportunity, org: Organization) -> float:
        """Score past performance relevance (0-25 points)"""
        
        score = 0.0
        
        # Get past performance references
        past_perf = self.db.query(PastPerformance).filter(
            PastPerformance.organization_id == org.id
        ).all()
        
        if not past_perf:
            return 0.0
        
        # Same agency (10 points)
        same_agency = [p for p in past_perf if p.customer_agency == opp.agency]
        if same_agency:
            score += 10.0
        
        # Recent performance (last 3 years) (10 points)
        three_years_ago = date.today() - timedelta(days=1095)
        recent = [
            p for p in past_perf
            if p.end_date and p.end_date >= three_years_ago
        ]
        
        if len(recent) >= 3:
            score += 10.0
        elif len(recent) >= 1:
            score += 5.0 * (len(recent) / 3)
        
        # Similar contract value (5 points)
        if opp.estimated_value:
            similar_value = [
                p for p in past_perf
                if p.contract_value and
                0.5 * opp.estimated_value <= p.contract_value <= 2.0 * opp.estimated_value
            ]
            if similar_value:
                score += 5.0
        
        return round(score, 2)
    
    def _score_set_aside(self, opp: Opportunity, org: Organization) -> float:
        """Score set-aside eligibility (0-20 points)"""
        
        if not opp.set_aside_type:
            # Unrestricted - everyone qualifies
            return 20.0
        
        if opp.set_aside_type in (org.certifications or []):
            # Qualified for set-aside
            return 20.0
        else:
            # Not qualified - cannot bid as prime
            return 0.0
    
    def _score_contract_size(self, opp: Opportunity, org: Organization) -> float:
        """Score contract size match (0-15 points)"""
        
        if not opp.estimated_value:
            return 7.5  # Neutral score if unknown
        
        # Define sweet spot based on org revenue
        if org.annual_revenue:
            # Sweet spot: 10-30% of annual revenue
            min_sweet = org.annual_revenue * 0.10
            max_sweet = org.annual_revenue * 0.30
            
            if min_sweet <= opp.estimated_value <= max_sweet:
                return 15.0
            elif opp.estimated_value < min_sweet:
                # Too small - less attractive
                ratio = opp.estimated_value / min_sweet
                return 15.0 * ratio
            else:
                # Too large - risky
                ratio = max_sweet / opp.estimated_value
                return 15.0 * ratio
        else:
            # No revenue data - use general heuristics
            if 100000 <= opp.estimated_value <= 10000000:
                return 15.0
            else:
                return 7.5
    
    def _score_geography(self, opp: Opportunity, org: Organization) -> float:
        """Score geographic match (0-10 points)"""
        
        if not opp.place_of_performance:
            return 10.0  # Unknown location - assume OK
        
        if opp.remote_work_allowed:
            return 10.0  # Remote allowed - perfect match
        
        if org.headquarters_location:
            # Check if same state/region
            if opp.place_of_performance.upper() in org.headquarters_location.upper():
                return 10.0
            elif any(region in org.headquarters_location.upper() for region in ["DC", "MD", "VA"]) and \
                 any(region in opp.place_of_performance.upper() for region in ["DC", "MD", "VA"]):
                # DMV area - close enough
                return 10.0
            else:
                # Different location - partial credit
                return 5.0
        
        return 5.0  # Neutral
    
    def _score_clearance(self, opp: Opportunity, org: Organization) -> float:
        """Score clearance match (0-10 bonus points)"""
        
        if not opp.clearance_required:
            return 0.0  # No clearance needed - no bonus
        
        if opp.clearance_required in (org.clearances or []):
            return 10.0  # Have required clearance - bonus!
        else:
            return 0.0  # Don't have clearance - no bonus
    
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
        """Generate human-readable reasons for recommendation"""
        
        reasons = []
        scores = match_score["scores"]
        
        # Capability match
        if scores["capability"] >= 25:
            reasons.append("✅ Perfect capability match")
        elif scores["capability"] >= 20:
            reasons.append("✅ Strong capability match")
        elif scores["capability"] >= 15:
            reasons.append("✅ Good capability match")
        
        # Past performance
        if scores["past_performance"] >= 20:
            reasons.append(f"✅ You have {opp.agency} past performance")
        elif scores["past_performance"] >= 15:
            reasons.append("✅ Relevant past performance")
        elif scores["past_performance"] < 10:
            reasons.append(f"⚠️ No {opp.agency} past performance")
        
        # Set-aside
        if scores["set_aside"] == 20:
            if opp.set_aside_type:
                reasons.append(f"✅ {opp.set_aside_type} set-aside (you qualify)")
            else:
                reasons.append("✅ Unrestricted (open competition)")
        else:
            reasons.append(f"❌ {opp.set_aside_type} set-aside (you don't qualify)")
        
        # Contract size
        if scores["size"] >= 12:
            reasons.append("✅ Contract size in your sweet spot")
        elif scores["size"] >= 8:
            reasons.append("✅ Reasonable contract size")
        
        # Geography
        if scores["geography"] == 10:
            reasons.append("✅ Local or remote work")
        
        # Clearance bonus
        if scores["clearance"] == 10:
            reasons.append(f"✅ You have {opp.clearance_required} clearance")
        elif opp.clearance_required and scores["clearance"] == 0:
            reasons.append(f"⚠️ Requires {opp.clearance_required} clearance (you don't have)")
        
        # PWin
        if opp.pwin_score:
            if opp.pwin_score >= 70:
                reasons.append(f"✅ High PWin: {opp.pwin_score}%")
            elif opp.pwin_score >= 50:
                reasons.append(f"✅ Moderate PWin: {opp.pwin_score}%")
        
        return reasons
    
    def get_match_color(self, score: float) -> str:
        """Get color indicator for match score"""
        if score >= 80:
            return "green"  # 🟢
        elif score >= 60:
            return "yellow"  # 🟡
        else:
            return "red"  # 🔴

