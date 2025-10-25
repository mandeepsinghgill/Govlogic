"""
Go/No-Go Decision Service
Data-driven bid/no-bid analysis with competitor intelligence, price benchmarking, win probability
Critical for strategic opportunity pursuit decisions
"""

from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import httpx
from app.services.llm_service import LLMService
from app.config import settings


class GoNoGoService:
    """
    Go/No-Go Decision Support Service
    
    Features:
    1. Competitor analysis (incumbent identification via FPDS)
    2. Buyer history (CO/COR tracking)
    3. Price benchmarking (historical award data)
    4. Resource estimates
    5. Win probability scoring (ML-based)
    6. Bid/No-Bid recommendation engine
    7. Strategic alignment assessment
    """
    
    FPDS_API = "https://api.usaspending.gov/api/v2/search/spending_by_award"
    
    def __init__(self, db: Session):
        self.db = db
        self.llm_service = LLMService()
    
    async def analyze_opportunity(
        self,
        opportunity_id: int,
        opportunity_data: Dict[str, Any],
        organization_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Complete Go/No-Go analysis for an opportunity
        
        Args:
            opportunity_id: ID of opportunity
            opportunity_data: {
                'naics': '541330',
                'agency': 'Department of Defense',
                'contract_value_estimate': 5000000,
                'set_aside': 'Small Business',
                'solicitation_number': 'ABC-2025-001',
                'due_date': '2025-03-01'
            }
            organization_data: {
                'past_performance': [],
                'capabilities': [],
                'certifications': [],
                'past_win_rate': 0.45,
                'available_resources': {}
            }
        
        Returns:
            Complete Go/No-Go analysis with recommendation
        """
        
        # 1. Technical Fit Analysis
        technical_fit = await self._assess_technical_fit(opportunity_data, organization_data)
        
        # 2. Competitor Analysis
        competitor_analysis = await self._analyze_competitors(opportunity_data)
        
        # 3. Price Benchmarking
        price_benchmarks = await self._get_price_benchmarks(opportunity_data)
        
        # 4. Resource Assessment
        resource_estimates = self._assess_resource_requirements(opportunity_data, organization_data)
        
        # 5. Strategic Alignment
        strategic_alignment = self._assess_strategic_alignment(opportunity_data, organization_data)
        
        # 6. Win Probability Calculation
        win_probability = self._calculate_win_probability(
            technical_fit,
            competitor_analysis,
            resource_estimates,
            strategic_alignment,
            organization_data
        )
        
        # 7. Risk Assessment
        risks = self._identify_risks(opportunity_data, competitor_analysis, resource_estimates)
        
        # 8. Overall Scoring
        overall_score = self._calculate_overall_score(
            technical_fit['score'],
            competitor_analysis['competitive_position_score'],
            win_probability,
            resource_estimates['resource_availability_score'],
            strategic_alignment['score']
        )
        
        # 9. Decision Recommendation
        decision, rationale = self._make_recommendation(
            overall_score,
            win_probability,
            risks,
            technical_fit,
            competitor_analysis
        )
        
        # 10. Compile Full Analysis
        analysis = {
            "opportunity_id": opportunity_id,
            "analyzed_at": datetime.utcnow().isoformat(),
            "technical_fit_score": technical_fit['score'],
            "competitive_position_score": competitor_analysis['competitive_position_score'],
            "win_probability_score": int(win_probability * 100),
            "resource_availability_score": resource_estimates['resource_availability_score'],
            "strategic_alignment_score": strategic_alignment['score'],
            "overall_score": overall_score,
            "decision": decision,
            "decision_rationale": rationale,
            "technical_fit_details": technical_fit,
            "competitor_analysis": competitor_analysis,
            "price_benchmarks": price_benchmarks,
            "resource_estimates": resource_estimates,
            "strategic_alignment": strategic_alignment,
            "risks": risks,
            "next_actions": self._get_next_actions(decision, risks)
        }
        
        return analysis
    
    async def _assess_technical_fit(
        self,
        opportunity_data: Dict[str, Any],
        organization_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Assess how well organization capabilities match opportunity requirements
        """
        
        # Use AI to compare requirements with capabilities
        fit_prompt = f"""Assess technical fit between opportunity requirements and organization capabilities.

OPPORTUNITY REQUIREMENTS:
NAICS: {opportunity_data.get('naics')}
Agency: {opportunity_data.get('agency')}
Set-Aside: {opportunity_data.get('set_aside')}
Key Requirements: {opportunity_data.get('key_requirements', [])}

ORGANIZATION CAPABILITIES:
Past Performance: {len(organization_data.get('past_performance', []))} relevant projects
Capabilities: {', '.join(organization_data.get('capabilities', []))}
Certifications: {', '.join(organization_data.get('certifications', []))}

SCORE:
Rate technical fit on scale 1-100, where:
100 = Perfect match, have done identical work
75-99 = Strong fit, minor gaps
50-74 = Moderate fit, some gaps
25-49 = Weak fit, significant gaps
0-24 = Poor fit, major gaps

OUTPUT FORMAT (JSON):
{{
    "score": 85,
    "strengths": ["Have 5+ similar DoD projects", "Possess required certifications"],
    "gaps": ["Limited experience with specific tech stack X"],
    "confidence": "HIGH"
}}
"""
        
        response = await self.llm_service.generate_structured_output(
            prompt=fit_prompt,
            response_format="json",
            max_tokens=1000
        )
        
        import json
        return json.loads(response)
    
    async def _analyze_competitors(self, opportunity_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Identify incumbent and likely competitors using FPDS data
        """
        
        # Query FPDS for similar contracts
        naics = opportunity_data.get('naics')
        agency = opportunity_data.get('agency')
        
        try:
            async with httpx.AsyncClient() as client:
                # Search for recent awards in same NAICS + agency
                params = {
                    "filters": {
                        "naics_codes": [naics],
                        "awarding_agency_name": agency
                    },
                    "limit": 10,
                    "sort": "-period_of_performance_start_date"
                }
                
                response = await client.post(
                    self.FPDS_API,
                    json=params,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    awards = data.get('results', [])
                    
                    # Extract contractor names and contract values
                    competitors = {}
                    for award in awards:
                        contractor = award.get('recipient_name', 'Unknown')
                        value = award.get('Award Amount', 0)
                        
                        if contractor in competitors:
                            competitors[contractor]['total_value'] += value
                            competitors[contractor]['awards_count'] += 1
                        else:
                            competitors[contractor] = {
                                'name': contractor,
                                'total_value': value,
                                'awards_count': 1,
                                'recent_awards': []
                            }
                        
                        competitors[contractor]['recent_awards'].append({
                            'award_date': award.get('period_of_performance_start_date'),
                            'value': value,
                            'contract_number': award.get('piid')
                        })
                    
                    # Identify likely incumbent (most recent/largest)
                    sorted_competitors = sorted(
                        competitors.values(),
                        key=lambda x: (x['awards_count'], x['total_value']),
                        reverse=True
                    )
                    
                    incumbent = sorted_competitors[0] if sorted_competitors else None
                    
                    # Assess competitive position
                    competitive_position_score = self._calculate_competitive_position(
                        len(sorted_competitors),
                        incumbent
                    )
                    
                    return {
                        "incumbent": incumbent,
                        "likely_competitors": sorted_competitors[:5],
                        "total_competitors_identified": len(sorted_competitors),
                        "competitive_position_score": competitive_position_score,
                        "market_concentration": "HIGH" if len(sorted_competitors) < 3 else "MEDIUM" if len(sorted_competitors) < 7 else "LOW"
                    }
        
        except Exception as e:
            print(f"Error querying FPDS: {e}")
        
        # Fallback if FPDS query fails
        return {
            "incumbent": None,
            "likely_competitors": [],
            "total_competitors_identified": 0,
            "competitive_position_score": 50,  # Neutral
            "market_concentration": "UNKNOWN",
            "note": "Could not retrieve competitor data from FPDS"
        }
    
    def _calculate_competitive_position(self, num_competitors: int, incumbent: Optional[Dict]) -> int:
        """
        Calculate competitive position score (1-100)
        """
        base_score = 50
        
        # More competitors = harder to win
        if num_competitors > 10:
            base_score -= 20
        elif num_competitors > 5:
            base_score -= 10
        elif num_competitors < 3:
            base_score += 10
        
        # Strong incumbent makes it harder
        if incumbent and incumbent.get('awards_count', 0) > 3:
            base_score -= 15
        
        return max(0, min(100, base_score))
    
    async def _get_price_benchmarks(self, opportunity_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get price benchmarks from similar past awards
        """
        
        # Query FPDS for similar contracts to get pricing data
        naics = opportunity_data.get('naics')
        agency = opportunity_data.get('agency')
        
        try:
            async with httpx.AsyncClient() as client:
                params = {
                    "filters": {
                        "naics_codes": [naics],
                        "awarding_agency_name": agency
                    },
                    "limit": 20
                }
                
                response = await client.post(
                    self.FPDS_API,
                    json=params,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    awards = data.get('results', [])
                    
                    values = [award.get('Award Amount', 0) for award in awards if award.get('Award Amount')]
                    
                    if values:
                        import statistics
                        return {
                            "average_award_value": statistics.mean(values),
                            "median_award_value": statistics.median(values),
                            "min_award_value": min(values),
                            "max_award_value": max(values),
                            "sample_size": len(values),
                            "estimated_ceiling": opportunity_data.get('contract_value_estimate', statistics.mean(values)),
                            "pricing_confidence": "HIGH" if len(values) > 10 else "MEDIUM" if len(values) > 5 else "LOW"
                        }
        
        except Exception as e:
            print(f"Error getting price benchmarks: {e}")
        
        # Fallback
        estimate = opportunity_data.get('contract_value_estimate', 0)
        return {
            "average_award_value": estimate,
            "median_award_value": estimate,
            "min_award_value": estimate * 0.7,
            "max_award_value": estimate * 1.3,
            "sample_size": 0,
            "estimated_ceiling": estimate,
            "pricing_confidence": "LOW",
            "note": "Limited pricing data available"
        }
    
    def _assess_resource_requirements(
        self,
        opportunity_data: Dict[str, Any],
        organization_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Assess resource requirements vs availability
        """
        
        # Estimate resources needed (simplified - would use ML in production)
        contract_value = opportunity_data.get('contract_value_estimate', 1000000)
        
        # Rule of thumb estimates
        estimated_staff = max(3, contract_value // 200000)  # ~1 FTE per $200K
        estimated_proposal_hours = 200 + (contract_value // 100000) * 10  # More $ = more proposal effort
        estimated_bid_cost = 5000 + (contract_value // 1000000) * 10000  # $5K base + $10K per $1M
        
        # Check organization capacity
        available_staff = organization_data.get('available_resources', {}).get('staff', 0)
        available_budget = organization_data.get('available_resources', {}).get('bid_budget', 0)
        
        # Calculate availability score
        staff_availability = min(100, (available_staff / estimated_staff) * 100) if estimated_staff > 0 else 50
        budget_availability = min(100, (available_budget / estimated_bid_cost) * 100) if estimated_bid_cost > 0 else 50
        
        resource_availability_score = int((staff_availability + budget_availability) / 2)
        
        return {
            "estimated_staff_required": estimated_staff,
            "estimated_proposal_hours": estimated_proposal_hours,
            "estimated_bid_cost": estimated_bid_cost,
            "available_staff": available_staff,
            "available_budget": available_budget,
            "resource_availability_score": resource_availability_score,
            "resource_gaps": []
        }
    
    def _assess_strategic_alignment(
        self,
        opportunity_data: Dict[str, Any],
        organization_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Assess strategic alignment with org goals
        """
        
        score = 50  # Baseline
        reasons = []
        
        # Check if in target market
        target_naics = organization_data.get('target_naics', [])
        if opportunity_data.get('naics') in target_naics:
            score += 20
            reasons.append("Aligns with target NAICS codes")
        
        # Check if target agency
        target_agencies = organization_data.get('target_agencies', [])
        if opportunity_data.get('agency') in target_agencies:
            score += 15
            reasons.append("Aligns with target agencies")
        
        # Check contract size vs sweet spot
        sweet_spot_min = organization_data.get('sweet_spot_contract_size_min', 0)
        sweet_spot_max = organization_data.get('sweet_spot_contract_size_max', float('inf'))
        contract_value = opportunity_data.get('contract_value_estimate', 0)
        
        if sweet_spot_min <= contract_value <= sweet_spot_max:
            score += 15
            reasons.append("Contract size within sweet spot")
        elif contract_value < sweet_spot_min:
            score -= 10
            reasons.append("Contract smaller than typical")
        else:
            score -= 5
            reasons.append("Contract larger than typical")
        
        return {
            "score": max(0, min(100, score)),
            "alignment_reasons": reasons
        }
    
    def _calculate_win_probability(
        self,
        technical_fit: Dict[str, Any],
        competitor_analysis: Dict[str, Any],
        resource_estimates: Dict[str, Any],
        strategic_alignment: Dict[str, Any],
        organization_data: Dict[str, Any]
    ) -> float:
        """
        Calculate win probability (0.0 - 1.0)
        Uses weighted scoring model
        """
        
        # Weights
        TECHNICAL_FIT_WEIGHT = 0.35
        COMPETITIVE_POSITION_WEIGHT = 0.25
        RESOURCE_AVAILABILITY_WEIGHT = 0.15
        STRATEGIC_ALIGNMENT_WEIGHT = 0.10
        PAST_WIN_RATE_WEIGHT = 0.15
        
        # Normalize scores to 0-1
        technical_score = technical_fit['score'] / 100.0
        competitive_score = competitor_analysis['competitive_position_score'] / 100.0
        resource_score = resource_estimates['resource_availability_score'] / 100.0
        strategic_score = strategic_alignment['score'] / 100.0
        past_win_rate = organization_data.get('past_win_rate', 0.3)  # Default 30%
        
        # Weighted average
        win_probability = (
            technical_score * TECHNICAL_FIT_WEIGHT +
            competitive_score * COMPETITIVE_POSITION_WEIGHT +
            resource_score * RESOURCE_AVAILABILITY_WEIGHT +
            strategic_score * STRATEGIC_ALIGNMENT_WEIGHT +
            past_win_rate * PAST_WIN_RATE_WEIGHT
        )
        
        return round(win_probability, 2)
    
    def _identify_risks(
        self,
        opportunity_data: Dict[str, Any],
        competitor_analysis: Dict[str, Any],
        resource_estimates: Dict[str, Any]
    ) -> List[Dict[str, str]]:
        """
        Identify key risks
        """
        risks = []
        
        # Incumbent risk
        if competitor_analysis.get('incumbent') and competitor_analysis['incumbent'].get('awards_count', 0) > 2:
            risks.append({
                "type": "Incumbent Advantage",
                "severity": "HIGH",
                "description": f"Strong incumbent with {competitor_analysis['incumbent']['awards_count']} past awards",
                "mitigation": "Emphasize innovation and cost savings over incumbent solution"
            })
        
        # Resource constraints
        if resource_estimates.get('resource_availability_score', 100) < 60:
            risks.append({
                "type": "Resource Constraint",
                "severity": "MEDIUM",
                "description": "Limited staff or budget availability for bid",
                "mitigation": "Consider teaming or reduce scope of pursuit"
            })
        
        # Tight timeline
        days_until_due = (datetime.strptime(opportunity_data.get('due_date', '2025-12-31'), '%Y-%m-%d') - datetime.now()).days
        if days_until_due < 30:
            risks.append({
                "type": "Timeline Risk",
                "severity": "HIGH",
                "description": f"Only {days_until_due} days until proposal due",
                "mitigation": "All hands on deck; consider reusing past proposal content"
            })
        
        return risks
    
    def _calculate_overall_score(self, *scores: int) -> int:
        """
        Calculate weighted overall score
        """
        return int(sum(scores) / len(scores))
    
    def _make_recommendation(
        self,
        overall_score: int,
        win_probability: float,
        risks: List[Dict],
        technical_fit: Dict,
        competitor_analysis: Dict
    ) -> tuple:
        """
        Make final GO/NO-GO/HOLD recommendation
        
        Returns:
            (decision, rationale)
        """
        
        # Decision thresholds
        GO_THRESHOLD = 65
        HOLD_THRESHOLD = 45
        MIN_WIN_PROBABILITY = 0.20
        
        # Count high severity risks
        high_risks = len([r for r in risks if r.get('severity') == 'HIGH'])
        
        # Decision logic
        if overall_score >= GO_THRESHOLD and win_probability >= MIN_WIN_PROBABILITY and high_risks < 2:
            decision = "GO"
            rationale = f"Strong fit (score: {overall_score}/100, win probability: {int(win_probability*100)}%). Technical capabilities align well, competitive position is favorable."
        
        elif overall_score >= HOLD_THRESHOLD and win_probability >= MIN_WIN_PROBABILITY:
            decision = "HOLD"
            rationale = f"Moderate fit (score: {overall_score}/100, win probability: {int(win_probability*100)}%). Need to address {len(risks)} risks before committing. Consider if resources are available."
        
        else:
            decision = "NO-GO"
            rationale = f"Poor fit (score: {overall_score}/100, win probability: {int(win_probability*100)}%). "
            
            if technical_fit['score'] < 50:
                rationale += "Significant technical capability gaps. "
            if win_probability < MIN_WIN_PROBABILITY:
                rationale += "Win probability too low. "
            if high_risks >= 2:
                rationale += f"{high_risks} high-severity risks identified. "
            
            rationale += "Resources better spent on other opportunities."
        
        return decision, rationale
    
    def _get_next_actions(self, decision: str, risks: List[Dict]) -> List[str]:
        """
        Recommended next actions based on decision
        """
        if decision == "GO":
            return [
                "Kick off proposal team",
                "Begin RFP shredding and compliance matrix",
                "Identify teaming partners if needed",
                "Schedule Pink Team review date",
                "Assign technical writers"
            ]
        elif decision == "HOLD":
            return [
                "Address identified risks",
                "Assess resource availability",
                "Review competitive positioning",
                "Determine if teaming can fill gaps",
                "Re-evaluate in 1 week"
            ]
        else:  # NO-GO
            return [
                "Archive opportunity for future reference",
                "Document lessons learned",
                "Track for potential re-compete",
                "Focus resources on higher-probability opportunities"
            ]
    
    def store_analysis(self, analysis: Dict[str, Any], user_id: int) -> int:
        """
        Store Go/No-Go analysis in database
        """
        insert_query = """
            INSERT INTO go_no_go_analysis 
            (opportunity_id, analyzed_by, technical_fit_score, competitive_position_score, 
             win_probability_score, resource_availability_score, strategic_alignment_score, 
             overall_score, decision, decision_rationale, competitor_analysis, 
             price_benchmarks, resource_estimates, risks)
            VALUES (:opp_id, :user_id, :tech_fit, :comp_pos, :win_prob, :resource, :strategic, 
                    :overall, :decision, :rationale, :competitors, :prices, :resources, :risks)
            RETURNING id
        """
        
        result = self.db.execute(
            insert_query,
            {
                "opp_id": analysis['opportunity_id'],
                "user_id": user_id,
                "tech_fit": analysis['technical_fit_score'],
                "comp_pos": analysis['competitive_position_score'],
                "win_prob": analysis['win_probability_score'],
                "resource": analysis['resource_availability_score'],
                "strategic": analysis['strategic_alignment_score'],
                "overall": analysis['overall_score'],
                "decision": analysis['decision'],
                "rationale": analysis['decision_rationale'],
                "competitors": analysis['competitor_analysis'],
                "prices": analysis['price_benchmarks'],
                "resources": analysis['resource_estimates'],
                "risks": analysis['risks']
            }
        )
        
        analysis_id = result.scalar()
        self.db.commit()
        
        return analysis_id

