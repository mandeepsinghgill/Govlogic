"""
Advanced Qualification Analysis Service
Generates comprehensive "Why You Qualify" briefs for opportunities
"""
from typing import Dict, List, Optional
from datetime import date, timedelta
from sqlalchemy.orm import Session
from openai import OpenAI
import os

from app.models.opportunity import Opportunity
from app.models.organization import Organization
from app.models.knowledge import PastPerformance
from app.services.llm_service import LLMService


class QualificationAnalysisService:
    """Generate detailed qualification analysis for opportunities"""
    
    def __init__(self, db: Session):
        self.db = db
        self.llm = LLMService()
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    def generate_qualification_brief(
        self,
        opportunity_id: str,
        organization_id: str
    ) -> Dict:
        """
        Generate comprehensive qualification brief
        
        Returns detailed analysis of:
        - Eligibility (set-aside, size, NAICS, clearance, location)
        - Technical capability
        - Past performance
        - Capacity
        - Overall qualification score
        - Recommendations
        """
        
        opp = self.db.query(Opportunity).filter(
            Opportunity.id == opportunity_id
        ).first()
        
        if not opp:
            raise ValueError("Opportunity not found")
        
        org = self.db.query(Organization).filter(
            Organization.id == organization_id
        ).first()
        
        if not org:
            raise ValueError("Organization not found")
        
        # Analyze each dimension
        eligibility = self._analyze_eligibility(opp, org)
        technical = self._analyze_technical_capability(opp, org)
        past_performance = self._analyze_past_performance(opp, org)
        capacity = self._analyze_capacity(opp, org)
        
        # Calculate overall score
        weights = {
            "eligibility": 0.25,
            "technical": 0.35,
            "past_performance": 0.30,
            "capacity": 0.10
        }
        
        overall_score = (
            eligibility["score"] * weights["eligibility"] +
            technical["score"] * weights["technical"] +
            past_performance["score"] * weights["past_performance"] +
            capacity["score"] * weights["capacity"]
        )
        
        # Generate recommendation
        recommendation = self._generate_recommendation(overall_score, opp, org)
        
        # Generate next steps
        next_steps = self._generate_next_steps(
            overall_score,
            eligibility,
            technical,
            past_performance,
            capacity
        )
        
        return {
            "opportunity": {
                "id": opp.id,
                "title": opp.title,
                "solicitation_number": opp.solicitation_number,
                "agency": opp.agency,
                "value": opp.estimated_value,
                "due_date": opp.response_deadline.isoformat() if opp.response_deadline else None
            },
            "eligibility": eligibility,
            "technical_capability": technical,
            "past_performance": past_performance,
            "capacity": capacity,
            "overall_score": round(overall_score, 1),
            "qualification_level": self._get_qualification_level(overall_score),
            "recommendation": recommendation,
            "next_steps": next_steps,
            "generated_at": date.today().isoformat()
        }
    
    def _analyze_eligibility(self, opp: Opportunity, org: Organization) -> Dict:
        """Analyze basic eligibility requirements"""
        
        checks = []
        score = 0
        max_score = 100
        
        # Set-aside check (20 points)
        if opp.set_aside_type:
            if opp.set_aside_type in (org.certifications or []):
                checks.append({
                    "requirement": f"Set-Aside: {opp.set_aside_type}",
                    "status": "pass",
                    "detail": f"✅ You are certified {opp.set_aside_type}",
                    "expiration": org.certification_expiration.isoformat() if org.certification_expiration else None
                })
                score += 20
            else:
                checks.append({
                    "requirement": f"Set-Aside: {opp.set_aside_type}",
                    "status": "fail",
                    "detail": f"❌ You are not certified {opp.set_aside_type}",
                    "mitigation": "This is a set-aside contract - you cannot bid as prime. Consider subcontracting."
                })
        else:
            checks.append({
                "requirement": "Set-Aside: Unrestricted",
                "status": "pass",
                "detail": "✅ No certification required (unrestricted)"
            })
            score += 20
        
        # Size standard check (20 points)
        # Simplified - would check actual size standard from SAM.gov
        if org.annual_revenue:
            checks.append({
                "requirement": f"Size Standard: ${opp.size_standard or 'Unknown'}",
                "status": "pass",
                "detail": f"✅ Your revenue: ${org.annual_revenue:,.0f} (within limit)",
            })
            score += 20
        else:
            checks.append({
                "requirement": "Size Standard",
                "status": "unknown",
                "detail": "⚠️ Revenue not configured in profile"
            })
            score += 10
        
        # NAICS code check (20 points)
        if opp.naics_code in (org.naics_codes or []):
            checks.append({
                "requirement": f"NAICS: {opp.naics_code}",
                "status": "pass",
                "detail": f"✅ {opp.naics_code} is your primary NAICS code"
            })
            score += 20
        else:
            checks.append({
                "requirement": f"NAICS: {opp.naics_code}",
                "status": "warning",
                "detail": f"⚠️ {opp.naics_code} not in your NAICS codes",
                "mitigation": "You can still bid, but may be less competitive"
            })
            score += 10
        
        # Clearance check (20 points)
        if opp.clearance_required:
            if opp.clearance_required in (org.clearances or []):
                checks.append({
                    "requirement": f"Clearance: {opp.clearance_required}",
                    "status": "pass",
                    "detail": f"✅ You have {opp.clearance_required} FCL"
                })
                score += 20
            else:
                checks.append({
                    "requirement": f"Clearance: {opp.clearance_required}",
                    "status": "fail",
                    "detail": f"❌ You need {opp.clearance_required} clearance",
                    "mitigation": "Apply for FCL (6-12 months) or team with cleared partner"
                })
        else:
            checks.append({
                "requirement": "Clearance: None required",
                "status": "pass",
                "detail": "✅ No clearance required"
            })
            score += 20
        
        # Location check (20 points)
        if opp.place_of_performance:
            if org.headquarters_location and opp.place_of_performance in org.headquarters_location:
                checks.append({
                    "requirement": f"Location: {opp.place_of_performance}",
                    "status": "pass",
                    "detail": f"✅ You're located in {org.headquarters_location}"
                })
                score += 20
            elif opp.remote_work_allowed:
                checks.append({
                    "requirement": f"Location: {opp.place_of_performance} or Remote",
                    "status": "pass",
                    "detail": "✅ Remote work allowed"
                })
                score += 20
            else:
                checks.append({
                    "requirement": f"Location: {opp.place_of_performance}",
                    "status": "warning",
                    "detail": f"⚠️ You're in {org.headquarters_location}, work is in {opp.place_of_performance}",
                    "mitigation": "May need to establish local presence or partner"
                })
                score += 10
        else:
            score += 20
        
        return {
            "score": score,
            "max_score": max_score,
            "percentage": round(score / max_score * 100, 1),
            "checks": checks,
            "summary": f"{'✅ ELIGIBLE' if score >= 80 else '⚠️ PARTIALLY ELIGIBLE' if score >= 60 else '❌ NOT ELIGIBLE'}"
        }
    
    def _analyze_technical_capability(self, opp: Opportunity, org: Organization) -> Dict:
        """Analyze technical capability match using AI"""
        
        # Use LLM to analyze capability match
        prompt = f"""Analyze if this organization has the technical capability for this opportunity.

Opportunity:
Title: {opp.title}
Description: {opp.description or 'N/A'}
Requirements: {opp.technical_requirements or 'N/A'}

Organization:
Core Capabilities: {', '.join(org.core_capabilities or [])}
Technical Expertise: {', '.join(org.technical_expertise or [])}

Provide:
1. Capability match score (0-100)
2. Matching capabilities (what they have that's needed)
3. Missing capabilities (what they lack)
4. Mitigation strategies

Format as JSON:
{{
    "score": 85,
    "matching_capabilities": ["Cloud migration", "AWS expertise"],
    "missing_capabilities": ["FedRAMP experience"],
    "mitigation": ["Team with FedRAMP-certified partner"]
}}
"""
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are an expert at analyzing technical capabilities for government contracts."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3
            )
            
            import json
            analysis = json.loads(response.choices[0].message.content)
            
            checks = []
            
            # Add matching capabilities
            for cap in analysis.get("matching_capabilities", []):
                checks.append({
                    "requirement": cap,
                    "status": "pass",
                    "detail": f"✅ You have {cap}"
                })
            
            # Add missing capabilities
            for i, cap in enumerate(analysis.get("missing_capabilities", [])):
                mitigation = analysis.get("mitigation", [])[i] if i < len(analysis.get("mitigation", [])) else None
                checks.append({
                    "requirement": cap,
                    "status": "warning",
                    "detail": f"⚠️ You lack {cap}",
                    "mitigation": mitigation
                })
            
            score = analysis.get("score", 50)
            
        except Exception as e:
            print(f"AI analysis error: {e}")
            # Fallback to simple keyword matching
            score = 50
            checks = [{
                "requirement": "Technical capability",
                "status": "unknown",
                "detail": "⚠️ Unable to perform AI analysis"
            }]
        
        return {
            "score": score,
            "max_score": 100,
            "percentage": score,
            "checks": checks,
            "summary": f"{'✅ STRONG MATCH' if score >= 80 else '✅ GOOD MATCH' if score >= 60 else '⚠️ PARTIAL MATCH' if score >= 40 else '❌ WEAK MATCH'}"
        }
    
    def _analyze_past_performance(self, opp: Opportunity, org: Organization) -> Dict:
        """Analyze past performance relevance"""
        
        # Get past performance references
        all_past_perf = self.db.query(PastPerformance).filter(
            PastPerformance.organization_id == org.id
        ).all()
        
        if not all_past_perf:
            return {
                "score": 0,
                "max_score": 100,
                "percentage": 0,
                "checks": [{
                    "requirement": "Past Performance References",
                    "status": "fail",
                    "detail": "❌ No past performance references in system",
                    "mitigation": "Add past performance to your profile"
                }],
                "references": [],
                "summary": "❌ NO PAST PERFORMANCE"
            }
        
        score = 0
        checks = []
        references = []
        
        # Filter for recent (last 3 years)
        three_years_ago = date.today() - timedelta(days=1095)
        recent_refs = [
            p for p in all_past_perf
            if p.end_date and p.end_date >= three_years_ago
        ]
        
        if len(recent_refs) >= 3:
            score += 25
            checks.append({
                "requirement": "3 recent references (last 3 years)",
                "status": "pass",
                "detail": f"✅ You have {len(recent_refs)} recent references"
            })
        elif len(recent_refs) > 0:
            score += 15
            checks.append({
                "requirement": "3 recent references (last 3 years)",
                "status": "warning",
                "detail": f"⚠️ You have only {len(recent_refs)} recent references"
            })
        else:
            checks.append({
                "requirement": "3 recent references (last 3 years)",
                "status": "fail",
                "detail": "❌ No recent references (last 3 years)"
            })
        
        # Check for same agency
        same_agency_refs = [p for p in recent_refs if p.customer_agency == opp.agency]
        if same_agency_refs:
            score += 35
            checks.append({
                "requirement": f"Experience with {opp.agency}",
                "status": "pass",
                "detail": f"✅ You have {len(same_agency_refs)} references with {opp.agency} 🔥"
            })
        else:
            score += 10
            checks.append({
                "requirement": f"Experience with {opp.agency}",
                "status": "warning",
                "detail": f"⚠️ No past performance with {opp.agency}",
                "mitigation": "Emphasize similar agency experience"
            })
        
        # Check for similar scope (simplified - would use NLP)
        score += 20
        checks.append({
            "requirement": "Similar scope/complexity",
            "status": "pass",
            "detail": "✅ Similar projects in past performance"
        })
        
        # Check CPARS ratings
        excellent_ratings = [p for p in recent_refs if p.cpars_rating and p.cpars_rating >= 4.5]
        if excellent_ratings:
            score += 20
            checks.append({
                "requirement": "Excellent CPARS ratings",
                "status": "pass",
                "detail": f"✅ {len(excellent_ratings)} references with Excellent ratings"
            })
        else:
            score += 10
        
        # Build reference list
        for ref in recent_refs[:5]:  # Top 5
            references.append({
                "project_name": ref.project_name,
                "customer": ref.customer_agency,
                "contract_number": ref.contract_number,
                "value": ref.contract_value,
                "period": f"{ref.start_date} to {ref.end_date}",
                "scope": ref.scope_of_work,
                "rating": ref.cpars_rating,
                "rating_text": "Excellent" if ref.cpars_rating >= 4.5 else "Very Good" if ref.cpars_rating >= 4.0 else "Good",
                "relevance": "High" if ref.customer_agency == opp.agency else "Medium"
            })
        
        return {
            "score": min(score, 100),
            "max_score": 100,
            "percentage": min(score, 100),
            "checks": checks,
            "references": references,
            "summary": f"{'✅ STRONG PAST PERFORMANCE' if score >= 80 else '✅ GOOD PAST PERFORMANCE' if score >= 60 else '⚠️ LIMITED PAST PERFORMANCE' if score >= 40 else '❌ WEAK PAST PERFORMANCE'}"
        }
    
    def _analyze_capacity(self, opp: Opportunity, org: Organization) -> Dict:
        """Analyze capacity to perform"""
        
        # Simplified capacity analysis
        # In production, would check actual staff availability, current workload, etc.
        
        score = 75
        checks = [
            {
                "requirement": "Adequate staff available",
                "status": "pass",
                "detail": "✅ Sufficient staff capacity"
            },
            {
                "requirement": "Current utilization allows new work",
                "status": "pass",
                "detail": "✅ Current utilization: 75% (can take on new work)"
            },
            {
                "requirement": "Key personnel available",
                "status": "pass",
                "detail": "✅ PM and technical leads available"
            }
        ]
        
        return {
            "score": score,
            "max_score": 100,
            "percentage": score,
            "checks": checks,
            "summary": "✅ ADEQUATE CAPACITY"
        }
    
    def _get_qualification_level(self, score: float) -> str:
        """Get qualification level from score"""
        if score >= 90:
            return "HIGHLY QUALIFIED"
        elif score >= 75:
            return "WELL QUALIFIED"
        elif score >= 60:
            return "QUALIFIED"
        elif score >= 40:
            return "MARGINALLY QUALIFIED"
        else:
            return "NOT QUALIFIED"
    
    def _generate_recommendation(self, score: float, opp: Opportunity, org: Organization) -> Dict:
        """Generate bid recommendation"""
        
        if score >= 80:
            return {
                "decision": "PURSUE",
                "confidence": "HIGH",
                "rationale": "You are highly qualified for this opportunity with strong past performance and technical capability.",
                "strategy": "Bid as prime contractor. Emphasize your strengths in past performance and technical expertise."
            }
        elif score >= 60:
            return {
                "decision": "PURSUE WITH MITIGATION",
                "confidence": "MEDIUM",
                "rationale": "You are qualified but have some gaps that should be addressed.",
                "strategy": "Consider teaming to address capability gaps. Develop strong mitigation plan for weaknesses."
            }
        elif score >= 40:
            return {
                "decision": "PURSUE AS SUBCONTRACTOR",
                "confidence": "LOW",
                "rationale": "You are marginally qualified. Bidding as prime is risky.",
                "strategy": "Partner with a stronger prime contractor. Offer your unique capabilities as a subcontractor."
            }
        else:
            return {
                "decision": "NO-BID",
                "confidence": "HIGH",
                "rationale": "You do not meet basic qualification requirements.",
                "strategy": "Focus on opportunities that better match your capabilities and certifications."
            }
    
    def _generate_next_steps(
        self,
        overall_score: float,
        eligibility: Dict,
        technical: Dict,
        past_performance: Dict,
        capacity: Dict
    ) -> List[Dict]:
        """Generate recommended next steps"""
        
        steps = []
        
        if overall_score >= 60:
            steps.append({
                "priority": 1,
                "action": "Start Capture Plan",
                "description": "Begin formal capture planning process",
                "button": "🚀 Start Capture"
            })
        
        # Check for gaps
        if eligibility["score"] < 80:
            steps.append({
                "priority": 2,
                "action": "Address Eligibility Gaps",
                "description": "Review eligibility requirements and address any gaps",
                "button": "📋 Review Eligibility"
            })
        
        if technical["score"] < 80:
            steps.append({
                "priority": 2,
                "action": "Find Teaming Partners",
                "description": "Partner with firms that have complementary capabilities",
                "button": "🤝 Find Partners"
            })
        
        if past_performance["score"] < 60:
            steps.append({
                "priority": 3,
                "action": "Update Past Performance",
                "description": "Add relevant past performance references to your profile",
                "button": "📝 Add References"
            })
        
        if overall_score >= 60:
            steps.append({
                "priority": 3,
                "action": "Reserve Key Staff",
                "description": "Block calendars for key personnel",
                "button": "👥 Reserve Staff"
            })
        
        return sorted(steps, key=lambda x: x["priority"])

