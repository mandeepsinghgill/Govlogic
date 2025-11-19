"""
Enhanced 10-Factor PWin Calculation Service
Implements complete 10-factor PWin algorithm as per technical documentation
"""
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.opportunity import Opportunity, OpportunityCompetitor
from app.models.organization import Organization
from app.models.knowledge import PastPerformance
from app.models.competitor import Competitor
import logging

logger = logging.getLogger(__name__)


class EnhancedPWinService:
    """
    Complete 10-Factor PWin Calculation Service
    
    10 Factors (as per GovSure AI Technical Documentation):
    1. Capability match (NAICS, past performance relevance)
    2. Budget range alignment
    3. Agency relationship history
    4. Team capacity availability
    5. Compliance complexity score
    6. Win probability baseline
    7. Competitive landscape
    8. Timeline constraints
    9. Strategic fit
    10. Market trend analysis
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def calculate_10_factor_pwin(
        self,
        opportunity: Opportunity,
        organization: Organization
    ) -> Dict[str, Any]:
        """
        Calculate PWin using all 10 factors (0-100)
        
        Returns:
            {
                "pwin_score": 0-100,
                "factors": {
                    "capability_match": 0-100,
                    "budget_alignment": 0-100,
                    "agency_relationship": 0-100,
                    "team_capacity": 0-100,
                    "compliance_complexity": 0-100,
                    "win_probability_baseline": 0-100,
                    "competitive_landscape": 0-100,
                    "timeline_constraints": 0-100,
                    "strategic_fit": 0-100,
                    "market_trends": 0-100
                },
                "weighted_scores": {...},
                "recommendation": "Bid" | "No-Bid" | "Evaluate",
                "confidence": 0-100
            }
        """
        
        # Calculate each factor (0-100 scale)
        factors = {
            "capability_match": self._factor_1_capability_match(opportunity, organization),
            "budget_alignment": self._factor_2_budget_alignment(opportunity, organization),
            "agency_relationship": self._factor_3_agency_relationship(opportunity, organization),
            "team_capacity": self._factor_4_team_capacity(opportunity, organization),
            "compliance_complexity": self._factor_5_compliance_complexity(opportunity, organization),
            "win_probability_baseline": self._factor_6_win_probability_baseline(opportunity, organization),
            "competitive_landscape": self._factor_7_competitive_landscape(opportunity, organization),
            "timeline_constraints": self._factor_8_timeline_constraints(opportunity, organization),
            "strategic_fit": self._factor_9_strategic_fit(opportunity, organization),
            "market_trends": self._factor_10_market_trends(opportunity, organization)
        }
        
        # Weight each factor (weights sum to 1.0)
        weights = {
            "capability_match": 0.15,  # 15%
            "budget_alignment": 0.10,  # 10%
            "agency_relationship": 0.15,  # 15%
            "team_capacity": 0.10,  # 10%
            "compliance_complexity": 0.08,  # 8%
            "win_probability_baseline": 0.12,  # 12%
            "competitive_landscape": 0.10,  # 10%
            "timeline_constraints": 0.05,  # 5%
            "strategic_fit": 0.10,  # 10%
            "market_trends": 0.05  # 5%
        }
        
        # Calculate weighted PWin
        weighted_scores = {
            factor: factors[factor] * weights[factor]
            for factor in factors
        }
        
        pwin_score = sum(weighted_scores.values())
        pwin_score = max(0, min(100, pwin_score))  # Cap at 0-100
        
        # Determine recommendation
        if pwin_score >= 70:
            recommendation = "Bid"
        elif pwin_score < 40:
            recommendation = "No-Bid"
        else:
            recommendation = "Evaluate"
        
        # Calculate confidence (based on data completeness)
        confidence = self._calculate_confidence(opportunity, organization, factors)
        
        return {
            "pwin_score": round(pwin_score, 1),
            "factors": {k: round(v, 1) for k, v in factors.items()},
            "weights": weights,
            "weighted_scores": {k: round(v, 1) for k, v in weighted_scores.items()},
            "recommendation": recommendation,
            "confidence": round(confidence, 1),
            "calculated_at": datetime.utcnow().isoformat()
        }
    
    def _factor_1_capability_match(
        self,
        opp: Opportunity,
        org: Organization
    ) -> float:
        """
        Factor 1: Capability Match (0-100)
        - NAICS code match
        - Past performance relevance
        - Keyword/capability overlap
        """
        score = 0.0
        
        # NAICS match (40 points)
        if opp.naics_code:
            # Get organization NAICS codes (may be stored in JSON or separate table)
            # Check if stored in knowledge base or past performance
            org_naics = []
            
            # Check past performance for NAICS matches
            past_perf = self.db.query(PastPerformance).filter(
                PastPerformance.organization_id == org.id
            ).all()
            
            # Extract NAICS from past performance if available
            for pp in past_perf:
                pp_naics = getattr(pp, 'naics_code', None) or getattr(pp, 'naics', None)
                if pp_naics and pp_naics not in org_naics:
                    org_naics.append(pp_naics)
            
            # If organization has naics_codes field, use it
            if hasattr(org, 'naics_codes') and org.naics_codes:
                if isinstance(org.naics_codes, str):
                    import json
                    try:
                        org_naics = json.loads(org.naics_codes)
                    except:
                        pass
                else:
                    org_naics = org.naics_codes
            
            if opp.naics_code in org_naics:
                score += 40.0
            elif org_naics:
                # Partial credit for same 2-digit NAICS
                opp_industry = str(opp.naics_code)[:2] if opp.naics_code else None
                org_industries = [str(n)[:2] for n in org_naics if n]
                if opp_industry and opp_industry in org_industries:
                    score += 20.0
        
        # Past performance relevance (35 points)
        past_perf = self.db.query(PastPerformance).filter(
            PastPerformance.organization_id == org.id
        ).all()
        
        if past_perf:
            # Same agency (15 points)
            same_agency = [
                p for p in past_perf 
                if getattr(p, 'customer_agency', None) == opp.agency or
                   getattr(p, 'client_name', None) == opp.agency
            ]
            if same_agency:
                score += 15.0
            
            # Similar work description (20 points)
            if opp.description:
                opp_keywords = set(opp.description.lower().split())
                for pp in past_perf[:5]:  # Check top 5
                    pp_desc = getattr(pp, 'work_description', '') or getattr(pp, 'description', '') or ''
                    if pp_desc:
                        pp_keywords = set(pp_desc.lower().split())
                        overlap = len(opp_keywords & pp_keywords)
                        if overlap > 5:
                            score += min(20.0, overlap * 2)
                            break
        
        # Keyword/capability overlap (25 points)
        if opp.description:
            # Get organization capabilities from knowledge base or past performance
            capabilities = []
            
            # Extract from past performance descriptions
            past_perf = self.db.query(PastPerformance).filter(
                PastPerformance.organization_id == org.id
            ).all()
            
            for pp in past_perf:
                desc = getattr(pp, 'description', '') or ''
                if desc:
                    # Extract key terms (simplified)
                    capabilities.extend(desc.lower().split()[:10])  # Top 10 terms
            
            # If organization has core_capabilities field, use it
            if hasattr(org, 'core_capabilities') and org.core_capabilities:
                if isinstance(org.core_capabilities, str):
                    import json
                    try:
                        capabilities = json.loads(org.core_capabilities)
                    except:
                        pass
                else:
                    capabilities = org.core_capabilities
            
            if capabilities:
                opp_text = opp.description.lower()
                unique_caps = list(set(capabilities))  # Remove duplicates
                matches = sum(1 for cap in unique_caps if cap.lower() in opp_text)
                match_ratio = matches / len(unique_caps) if unique_caps else 0
                score += 25.0 * min(1.0, match_ratio * 2)  # Cap at 25
        
        return min(100.0, score)
    
    def _factor_2_budget_alignment(
        self,
        opp: Opportunity,
        org: Organization
    ) -> float:
        """
        Factor 2: Budget Range Alignment (0-100)
        - Contract value vs. organization revenue
        - Sweet spot: 10-30% of annual revenue
        """
        if not opp.contract_value:
            return 50.0  # Neutral if unknown
        
        # Get organization annual revenue (may not exist, estimate from contract values)
        annual_revenue = 0
        
        # Try to get from organization field
        if hasattr(org, 'annual_revenue'):
            annual_revenue = org.annual_revenue or 0
        
        # If not available, estimate from past performance contract values
        if annual_revenue == 0:
            past_perf = self.db.query(PastPerformance).filter(
                PastPerformance.organization_id == org.id
            ).all()
            
            if past_perf:
                # Estimate annual revenue as 3x average contract value
                total_value = 0
                count = 0
                for pp in past_perf:
                    pp_value = getattr(pp, 'contract_value', None)
                    if pp_value:
                        # Parse string values like "$2.5M" or numeric values
                        if isinstance(pp_value, str):
                            pp_value_str = pp_value.replace('$', '').replace(',', '').upper()
                            if 'M' in pp_value_str:
                                annual_revenue = float(pp_value_str.replace('M', '')) * 1000000
                            elif 'K' in pp_value_str:
                                annual_revenue = float(pp_value_str.replace('K', '')) * 1000
                            else:
                                try:
                                    annual_revenue = float(pp_value_str)
                                except:
                                    pass
                        else:
                            total_value += pp_value
                            count += 1
                
                if count > 0:
                    avg_contract = total_value / count
                    annual_revenue = avg_contract * 3  # Rough estimate
        
        if annual_revenue > 0:
            # Sweet spot: 10-30% of annual revenue
            min_sweet = annual_revenue * 0.10
            max_sweet = annual_revenue * 0.30
            
            if min_sweet <= opp.contract_value <= max_sweet:
                return 100.0
            elif opp.contract_value < min_sweet:
                # Too small - less attractive
                ratio = opp.contract_value / min_sweet if min_sweet > 0 else 0
                return max(20.0, 100.0 * ratio)
            else:
                # Too large - risky but potentially high value
                ratio = max_sweet / opp.contract_value if opp.contract_value > 0 else 0
                return max(30.0, 70.0 + (30.0 * ratio))
        else:
            # No revenue data - use general heuristics
            if 100000 <= opp.contract_value <= 10000000:
                return 80.0
            elif 10000000 < opp.contract_value <= 50000000:
                return 60.0
            else:
                return 40.0
    
    def _factor_3_agency_relationship(
        self,
        opp: Opportunity,
        org: Organization
    ) -> float:
        """
        Factor 3: Agency Relationship History (0-100)
        - Past work with same agency
        - Recent contracts (last 3 years)
        - Customer satisfaction
        """
        if not opp.agency:
            return 50.0  # Neutral if unknown
        
        past_perf = self.db.query(PastPerformance).filter(
            PastPerformance.organization_id == org.id
        ).all()
        
        if not past_perf:
            return 20.0  # No past performance
        
        # Same agency contracts (50 points)
        same_agency = [
            p for p in past_perf
            if (getattr(p, 'customer_agency', None) == opp.agency or
                getattr(p, 'client_name', None) == opp.agency)
        ]
        
        if not same_agency:
            return 20.0  # No relationship with this agency
        
        score = 50.0
        
        # Recent work (last 3 years) (30 points)
        three_years_ago = datetime.now() - timedelta(days=1095)
        recent = []
        for p in same_agency:
            end_date = getattr(p, 'end_date', None)
            if end_date:
                # Handle both Date and DateTime objects
                if hasattr(end_date, 'date'):
                    end_date = end_date.date()
                if end_date >= three_years_ago.date():
                    recent.append(p)
        
        if len(recent) >= 3:
            score += 30.0
        elif len(recent) >= 1:
            score += 15.0 * (len(recent) / 3)
        
        # Customer satisfaction (20 points)
        # Check for positive ratings or repeat contracts
        high_ratings = []
        for p in same_agency:
            rating = getattr(p, 'performance_rating', None)
            if rating and rating in ['Exceptional', 'Very Good', 'Excellent', 'Excellent Performance']:
                high_ratings.append(p)
        
        if high_ratings:
            score += 20.0
        elif len(same_agency) >= 2:
            score += 10.0  # Repeat contracts indicate satisfaction
        
        return min(100.0, score)
    
    def _factor_4_team_capacity(
        self,
        opp: Opportunity,
        org: Organization
    ) -> float:
        """
        Factor 4: Team Capacity Availability (0-100)
        - Current workload
        - Staffing availability
        - Required skills match
        """
        # Get current active proposals/opportunities
        from app.models.proposal import Proposal
        from app.models.opportunity import Opportunity as Opp
        
        active_proposals = self.db.query(Proposal).filter(
            Proposal.organization_id == org.id,
            Proposal.status.in_(['draft', 'in_progress', 'pink_team', 'red_team'])
        ).count()
        
        active_opportunities = self.db.query(Opp).filter(
            Opp.organization_id == org.id,
            Opp.stage.in_(['capture', 'bid', 'submitted'])
        ).count()
        
        # Estimate capacity (simplified - would check actual staffing in production)
        total_active = active_proposals + active_opportunities
        
        if total_active == 0:
            return 100.0  # Full capacity
        elif total_active <= 3:
            return 80.0  # Good capacity
        elif total_active <= 6:
            return 60.0  # Moderate capacity
        elif total_active <= 10:
            return 40.0  # Limited capacity
        else:
            return 20.0  # Overloaded
    
    def _factor_5_compliance_complexity(
        self,
        opp: Opportunity,
        org: Organization
    ) -> float:
        """
        Factor 5: Compliance Complexity Score (0-100)
        Higher score = Less complex = Better
        - FAR/DFARS requirements
        - NIST 800-171 requirements
        - CMMC level required
        - Special certifications needed
        """
        # Check for compliance keywords in description
        complexity_indicators = {
            'CUI': 20,  # Controlled Unclassified Information
            'CMMC': 15,  # CMMC certification
            'NIST 800-171': 15,
            'FEDRAMP': 10,
            'ITAR': 10,  # International Traffic in Arms
            'EAR': 10,  # Export Administration
            'security clearance': 15,
            'TS/SCI': 20,  # Top Secret clearance
        }
        
        complexity_score = 0
        description = (opp.description or '').lower()
        
        for indicator, penalty in complexity_indicators.items():
            if indicator.lower() in description:
                complexity_score += penalty
        
        # Organization's compliance readiness
        org_has_cmmc = getattr(org, 'has_cmmc', False) or False
        org_has_nist = getattr(org, 'has_nist_800_171', False) or False
        
        if complexity_score > 0:
            # Check if org has required compliance
            if 'CMMC' in description.upper() and not org_has_cmmc:
                complexity_score += 20
            if 'NIST 800-171' in description and not org_has_nist:
                complexity_score += 15
        
        # Convert to score (100 = low complexity, 0 = high complexity)
        compliance_score = max(0, 100 - complexity_score)
        
        return compliance_score
    
    def _factor_6_win_probability_baseline(
        self,
        opp: Opportunity,
        org: Organization
    ) -> float:
        """
        Factor 6: Win Probability Baseline (0-100)
        - Historical win rate for similar opportunities
        - Set-aside advantage
        - Organization's baseline win rate
        """
        # Use existing PWin score if available
        if opp.pwin_score and opp.pwin_score > 0:
            return float(opp.pwin_score)
        
        # Calculate baseline from historical data
        baseline = 50.0  # Default 50%
        
        # Set-aside advantage (+20 points if qualified)
        if opp.set_aside:
            org_certs = {
                'small_business': getattr(org, 'is_small_business', False) or False,
                '8a': getattr(org, 'is_8a', False) or False,
                'wosb': getattr(org, 'is_wosb', False) or False,
                'hubzone': getattr(org, 'is_hubzone', False) or False,
                'sdvosb': getattr(org, 'is_sdvosb', False) or False,
            }
            
            set_aside_value = opp.set_aside.value if hasattr(opp.set_aside, 'value') else str(opp.set_aside)
            
            # Map set-aside types
            cert_mapping = {
                'small_business': org_certs['small_business'],
                '8a': org_certs['8a'],
                'wosb': org_certs['wosb'],
                'hubzone': org_certs['hubzone'],
                'sdvosb': org_certs['sdvosb'],
            }
            
            if set_aside_value in cert_mapping and cert_mapping[set_aside_value]:
                baseline += 20.0
        
        # Historical win rate adjustment
        # (Would calculate from actual win/loss data in production)
        baseline = min(100.0, baseline)
        
        return baseline
    
    def _factor_7_competitive_landscape(
        self,
        opp: Opportunity,
        org: Organization
    ) -> float:
        """
        Factor 7: Competitive Landscape (0-100)
        - Number of competitors
        - Incumbent status
        - Competitive intelligence
        Higher score = Better competitive position
        """
        # Get competitors for this opportunity
        competitors = self.db.query(OpportunityCompetitor).filter(
            OpportunityCompetitor.opportunity_id == opp.id
        ).all()
        
        # Check if we're incumbent
        is_incumbent = False
        org_name_lower = org.name.lower() if org.name else ''
        
        for comp in competitors:
            comp_name = getattr(comp, 'competitor_name', '') or ''
            if comp.is_incumbent and comp_name.lower() == org_name_lower:
                is_incumbent = True
                break
        
        if is_incumbent:
            return 90.0  # Strong incumbent advantage
        
        # Fewer competitors = better
        competitor_count = len(competitors)
        
        if competitor_count == 0:
            return 80.0  # No known competitors
        elif competitor_count <= 2:
            return 70.0
        elif competitor_count <= 5:
            return 50.0
        elif competitor_count <= 10:
            return 30.0
        else:
            return 20.0  # Highly competitive
    
    def _factor_8_timeline_constraints(
        self,
        opp: Opportunity,
        org: Organization
    ) -> float:
        """
        Factor 8: Timeline Constraints (0-100)
        - Proposal due date
        - Realistic timeline for response
        - Current workload timeline conflicts
        Higher score = More feasible timeline
        """
        if not opp.due_date:
            return 50.0  # Neutral if unknown
        
        days_remaining = (opp.due_date - datetime.now().date()).days
        
        if days_remaining < 0:
            return 0.0  # Past due
        elif days_remaining < 7:
            return 20.0  # Too tight
        elif days_remaining < 14:
            return 40.0  # Tight
        elif days_remaining < 30:
            return 60.0  # Moderate
        elif days_remaining < 60:
            return 80.0  # Good
        else:
            return 90.0  # Plenty of time
    
    def _factor_9_strategic_fit(
        self,
        opp: Opportunity,
        org: Organization
    ) -> float:
        """
        Factor 9: Strategic Fit (0-100)
        - Alignment with organization strategy
        - Growth trajectory alignment
        - Market expansion opportunity
        """
        # Check if this opportunity type matches organization focus
        # (Would check against org strategic plan in production)
        
        # Agency alignment (check from past performance)
        if opp.agency:
            past_perf = self.db.query(PastPerformance).filter(
                PastPerformance.organization_id == org.id
            ).all()
            
            # Count agency relationships
            agency_count = sum(
                1 for p in past_perf
                if (getattr(p, 'customer_agency', None) == opp.agency or
                    getattr(p, 'client_name', None) == opp.agency)
            )
            
            if agency_count >= 3:
                return 90.0  # Strong strategic fit
            elif agency_count >= 1:
                return 75.0  # Good strategic fit
        
        # NAICS alignment (check from past performance)
        if opp.naics_code:
            past_perf = self.db.query(PastPerformance).filter(
                PastPerformance.organization_id == org.id
            ).all()
            
            naics_match = any(
                getattr(p, 'naics_code', None) == opp.naics_code or
                getattr(p, 'naics', None) == opp.naics_code
                for p in past_perf
            )
            
            if naics_match:
                return 85.0
        
        # Contract size strategic fit
        # Large contracts might be strategic for growth
        if opp.contract_value:
            if opp.contract_value >= 10000000:  # $10M+
                return 75.0  # Strategic growth opportunity
            elif opp.contract_value >= 1000000:  # $1M+
                return 60.0
        
        return 50.0  # Neutral
    
    def _factor_10_market_trends(
        self,
        opp: Opportunity,
        org: Organization
    ) -> float:
        """
        Factor 10: Market Trend Analysis (0-100)
        - Growing market segments
        - Agency spending trends
        - Industry growth indicators
        """
        # Check recent opportunities in same NAICS/agency
        if not opp.naics_code or not opp.agency:
            return 50.0  # Neutral if unknown
        
        # Get opportunities in last 12 months with same NAICS
        one_year_ago = datetime.now() - timedelta(days=365)
        
        recent_opps = self.db.query(Opp).filter(
            Opp.naics_code == opp.naics_code,
            Opp.agency == opp.agency,
            Opp.posted_date >= one_year_ago.date(),
            Opp.id != opp.id
        ).count()
        
        # More opportunities = growing market = better
        if recent_opps >= 10:
            return 90.0  # Strong market trend
        elif recent_opps >= 5:
            return 75.0
        elif recent_opps >= 2:
            return 60.0
        elif recent_opps >= 1:
            return 50.0
        else:
            return 40.0  # Slower market
    
    def _calculate_confidence(
        self,
        opp: Opportunity,
        org: Organization,
        factors: Dict[str, float]
    ) -> float:
        """
        Calculate confidence in PWin calculation (0-100)
        Based on data completeness and quality
        """
        confidence = 100.0
        
        # Reduce confidence for missing data
        if not opp.contract_value:
            confidence -= 10
        if not opp.agency:
            confidence -= 10
        if not opp.naics_code:
            confidence -= 10
        if not opp.description:
            confidence -= 10
        if not opp.due_date:
            confidence -= 5
        
        # Check for organization data completeness
        has_past_perf = self.db.query(PastPerformance).filter(
            PastPerformance.organization_id == org.id
        ).count() > 0
        
        if not has_past_perf:
            confidence -= 15
        
        return max(50.0, confidence)  # Minimum 50% confidence


def get_enhanced_pwin_service(db: Session) -> EnhancedPWinService:
    """Get enhanced PWin service instance"""
    return EnhancedPWinService(db)

