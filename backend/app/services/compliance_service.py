"""
Compliance Service - FAR/DFARS/CMMC/Section 508 Compliance Management
Tracks contract compliance requirements and generates compliance reports
Ensures all proposals meet federal acquisition regulations
"""

from typing import Dict, List, Optional, Any
from datetime import datetime
from sqlalchemy.orm import Session
import json
import re


class ComplianceRequirement:
    """Single compliance requirement from FAR/DFARS/CMMC/508"""
    def __init__(
        self,
        regulation: str,  # FAR, DFARS, CMMC, 508, etc.
        clause_id: str,
        title: str,
        description: str,
        applicability: List[str],  # Contract types this applies to
        verification_method: str,
        required_artifacts: List[str],
        severity: str  # Critical, High, Medium, Low
    ):
        self.regulation = regulation
        self.clause_id = clause_id
        self.title = title
        self.description = description
        self.applicability = applicability
        self.verification_method = verification_method
        self.required_artifacts = required_artifacts
        self.severity = severity


class ComplianceCheck:
    """Result of a single compliance check"""
    def __init__(
        self,
        requirement: ComplianceRequirement,
        status: str,  # Compliant, Non-Compliant, Partial, Not Applicable
        evidence: Optional[List[str]] = None,
        gaps: Optional[List[str]] = None,
        remediation: Optional[str] = None,
        checked_at: Optional[datetime] = None
    ):
        self.requirement = requirement
        self.status = status
        self.evidence = evidence or []
        self.gaps = gaps or []
        self.remediation = remediation
        self.checked_at = checked_at or datetime.utcnow()


class ComplianceRegistry:
    """
    Registry of all FAR/DFARS/CMMC/508 clauses
    Static knowledge base of federal acquisition regulations
    """
    
    # FAR (Federal Acquisition Regulation) Clauses
    FAR_CLAUSES = [
        ComplianceRequirement(
            regulation="FAR",
            clause_id="FAR 52.204-7",
            title="System for Award Management",
            description="Contractor must be registered in SAM.gov",
            applicability=["All contracts"],
            verification_method="SAM.gov registration check",
            required_artifacts=["SAM.gov UEI", "SAM.gov expiration date"],
            severity="Critical"
        ),
        ComplianceRequirement(
            regulation="FAR",
            clause_id="FAR 52.219-8",
            title="Utilization of Small Business Concerns",
            description="Prime must report subcontracting to small businesses",
            applicability=["Contracts > $700K with subcontracting possibilities"],
            verification_method="Subcontracting plan review",
            required_artifacts=["Subcontracting plan", "Small business utilization report"],
            severity="High"
        ),
        ComplianceRequirement(
            regulation="FAR",
            clause_id="FAR 52.227-14",
            title="Rights in Data—General",
            description="Defines data rights for Government vs Contractor",
            applicability=["All contracts with data deliverables"],
            verification_method="Data rights assertion review",
            required_artifacts=["Data rights assertions", "Intellectual property documentation"],
            severity="High"
        ),
        ComplianceRequirement(
            regulation="FAR",
            clause_id="FAR 52.232-40",
            title="Providing Accelerated Payments to Small Business Subcontractors",
            description="Prime must pay small business subs within 15 days",
            applicability=["Primes with small business subcontractors"],
            verification_method="Payment records audit",
            required_artifacts=["Payment records", "Small business sub agreements"],
            severity="Medium"
        ),
    ]
    
    # DFARS (Defense FAR Supplement) Clauses
    DFARS_CLAUSES = [
        ComplianceRequirement(
            regulation="DFARS",
            clause_id="DFARS 252.204-7012",
            title="Safeguarding Covered Defense Information and Cyber Incident Reporting",
            description="Protect CUI and report cyber incidents within 72 hours",
            applicability=["DoD contracts with CUI"],
            verification_method="NIST SP 800-171 assessment, incident response plan review",
            required_artifacts=["NIST 800-171 SSP", "Incident response plan", "POAM"],
            severity="Critical"
        ),
        ComplianceRequirement(
            regulation="DFARS",
            clause_id="DFARS 252.204-7019",
            title="Notice of NIST SP 800-171 DoD Assessment Requirements",
            description="Contractor must undergo NIST 800-171 assessment",
            applicability=["DoD contracts with CUI"],
            verification_method="Assessment report review",
            required_artifacts=["Assessment report", "Score", "POAM"],
            severity="Critical"
        ),
        ComplianceRequirement(
            regulation="DFARS",
            clause_id="DFARS 252.204-7020",
            title="NIST SP 800-171 DoD Assessment Requirements",
            description="Contractor must achieve minimum NIST 800-171 score",
            applicability=["DoD contracts with CUI"],
            verification_method="Score verification in SPRS",
            required_artifacts=["SPRS score", "Assessment date", "Assessor info"],
            severity="Critical"
        ),
        ComplianceRequirement(
            regulation="DFARS",
            clause_id="DFARS 252.204-7021",
            title="Cybersecurity Maturity Model Certification Requirements",
            description="Contractor must achieve required CMMC level",
            applicability=["DoD contracts requiring CMMC (phased rollout)"],
            verification_method="CMMC certification verification",
            required_artifacts=["CMMC certificate", "Level achieved", "Expiration date"],
            severity="Critical"
        ),
    ]
    
    # CMMC (Cybersecurity Maturity Model Certification)
    CMMC_REQUIREMENTS = [
        ComplianceRequirement(
            regulation="CMMC",
            clause_id="CMMC Level 1",
            title="Basic Cyber Hygiene",
            description="17 practices mapped to FAR 52.204-21",
            applicability=["DoD contracts with FCI"],
            verification_method="Annual self-assessment",
            required_artifacts=["Self-assessment checklist"],
            severity="High"
        ),
        ComplianceRequirement(
            regulation="CMMC",
            clause_id="CMMC Level 2",
            title="Advanced Cyber Hygiene",
            description="110 practices mapped to NIST SP 800-171",
            applicability=["DoD contracts with CUI"],
            verification_method="C3PAO assessment",
            required_artifacts=["CMMC certificate", "Assessment report", "POAM"],
            severity="Critical"
        ),
        ComplianceRequirement(
            regulation="CMMC",
            clause_id="CMMC Level 3",
            title="Expert Cyber Hygiene",
            description="110+ practices with advanced/progressive requirements",
            applicability=["Critical national security programs"],
            verification_method="Government-led assessment",
            required_artifacts=["CMMC Level 3 certificate", "SSP", "Continuous monitoring plan"],
            severity="Critical"
        ),
    ]
    
    # Section 508 (Accessibility)
    SECTION_508_REQUIREMENTS = [
        ComplianceRequirement(
            regulation="Section 508",
            clause_id="508: WCAG 2.0 AA",
            title="Web Content Accessibility Guidelines 2.0 Level AA",
            description="All web content must meet WCAG 2.0 AA standards",
            applicability=["All federal contracts with web deliverables"],
            verification_method="WCAG 2.0 automated + manual testing",
            required_artifacts=["VPAT", "Accessibility test report", "Remediation plan"],
            severity="Critical"
        ),
        ComplianceRequirement(
            regulation="Section 508",
            clause_id="508: PDF Accessibility",
            title="Accessible PDF Documents",
            description="PDFs must be tagged, have alt text, and pass accessibility checks",
            applicability=["All federal contracts with PDF deliverables"],
            verification_method="PDF accessibility checker (Adobe/PAC3)",
            required_artifacts=["Accessible PDF samples", "Accessibility statement"],
            severity="High"
        ),
        ComplianceRequirement(
            regulation="Section 508",
            clause_id="508: VPAT",
            title="Voluntary Product Accessibility Template",
            description="Contractor must provide VPAT for all IT products/services",
            applicability=["All federal IT contracts"],
            verification_method="VPAT completeness and accuracy review",
            required_artifacts=["VPAT (ITI format)", "Conformance testing evidence"],
            severity="Critical"
        ),
    ]
    
    @classmethod
    def get_all_requirements(cls) -> List[ComplianceRequirement]:
        """Get all compliance requirements across all regulations"""
        return (
            cls.FAR_CLAUSES +
            cls.DFARS_CLAUSES +
            cls.CMMC_REQUIREMENTS +
            cls.SECTION_508_REQUIREMENTS
        )
    
    @classmethod
    def get_by_regulation(cls, regulation: str) -> List[ComplianceRequirement]:
        """Get all requirements for a specific regulation"""
        all_reqs = cls.get_all_requirements()
        return [req for req in all_reqs if req.regulation == regulation]
    
    @classmethod
    def get_by_clause_id(cls, clause_id: str) -> Optional[ComplianceRequirement]:
        """Get a specific requirement by clause ID"""
        all_reqs = cls.get_all_requirements()
        for req in all_reqs:
            if req.clause_id == clause_id:
                return req
        return None


class ComplianceAnalyzer:
    """
    Analyzes contracts and proposals for compliance requirements
    Identifies applicable clauses based on contract type, agency, data type
    """
    
    def __init__(self):
        self.registry = ComplianceRegistry()
    
    def identify_applicable_clauses(
        self,
        contract_data: Dict[str, Any]
    ) -> List[ComplianceRequirement]:
        """
        Identify which compliance clauses apply to a given contract
        
        Args:
            contract_data: {
                "agency": "DoD",
                "contract_type": "FFP",
                "contains_cui": true,
                "contains_fci": true,
                "has_subcontracting": true,
                "has_data_deliverables": true,
                "has_web_deliverables": true,
                "has_pdf_deliverables": true,
                "estimated_value": 5000000
            }
            
        Returns:
            List of applicable ComplianceRequirement objects
        """
        applicable = []
        all_reqs = self.registry.get_all_requirements()
        
        for req in all_reqs:
            if self._is_applicable(req, contract_data):
                applicable.append(req)
        
        return applicable
    
    def _is_applicable(
        self,
        req: ComplianceRequirement,
        contract_data: Dict[str, Any]
    ) -> bool:
        """Check if a requirement applies to this contract"""
        
        # All contracts
        if "All contracts" in req.applicability:
            return True
        
        # DoD-specific
        if contract_data.get("agency") == "DoD":
            if "DoD contracts" in str(req.applicability):
                # Check for CUI
                if "CUI" in req.clause_id and contract_data.get("contains_cui"):
                    return True
                # Check for CMMC
                if "CMMC" in req.regulation:
                    if contract_data.get("contains_cui"):
                        return True
        
        # Subcontracting
        if contract_data.get("has_subcontracting") and "subcontracting" in req.title.lower():
            if contract_data.get("estimated_value", 0) > 700000:
                return True
        
        # Data rights
        if contract_data.get("has_data_deliverables") and "data" in req.title.lower():
            return True
        
        # Section 508
        if req.regulation == "Section 508":
            if contract_data.get("has_web_deliverables") and "web" in req.title.lower():
                return True
            if contract_data.get("has_pdf_deliverables") and "PDF" in req.title:
                return True
            if contract_data.get("has_web_deliverables") or contract_data.get("has_pdf_deliverables"):
                if "VPAT" in req.clause_id:
                    return True
        
        return False
    
    def generate_compliance_matrix(
        self,
        contract_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate a compliance matrix for a contract
        Lists all applicable requirements with status placeholders
        """
        applicable = self.identify_applicable_clauses(contract_data)
        
        matrix = {
            "contract_info": contract_data,
            "total_requirements": len(applicable),
            "critical_requirements": sum(1 for r in applicable if r.severity == "Critical"),
            "requirements": []
        }
        
        for req in applicable:
            matrix["requirements"].append({
                "regulation": req.regulation,
                "clause_id": req.clause_id,
                "title": req.title,
                "description": req.description,
                "severity": req.severity,
                "verification_method": req.verification_method,
                "required_artifacts": req.required_artifacts,
                "status": "Pending",  # To be filled during compliance check
                "evidence": [],
                "gaps": []
            })
        
        return matrix


class ComplianceChecker:
    """
    Checks proposal content and company profile against compliance requirements
    Verifies evidence and identifies gaps
    """
    
    def __init__(self):
        self.registry = ComplianceRegistry()
    
    def check_compliance(
        self,
        requirements: List[ComplianceRequirement],
        company_data: Dict[str, Any],
        proposal_content: Optional[Dict[str, Any]] = None
    ) -> List[ComplianceCheck]:
        """
        Check company/proposal against list of requirements
        
        Args:
            requirements: List of ComplianceRequirement to check
            company_data: Company profile data (certs, registrations, etc.)
            proposal_content: Parsed proposal text/sections
            
        Returns:
            List of ComplianceCheck results
        """
        checks = []
        
        for req in requirements:
            check = self._check_single_requirement(req, company_data, proposal_content)
            checks.append(check)
        
        return checks
    
    def _check_single_requirement(
        self,
        req: ComplianceRequirement,
        company_data: Dict[str, Any],
        proposal_content: Optional[Dict[str, Any]]
    ) -> ComplianceCheck:
        """Check a single requirement"""
        
        status = "Non-Compliant"
        evidence = []
        gaps = []
        remediation = None
        
        # Check based on clause type
        if "SAM.gov" in req.title:
            if company_data.get("sam_registration", {}).get("status") == "Active":
                status = "Compliant"
                evidence.append(f"SAM.gov UEI: {company_data.get('sam_registration', {}).get('uei')}")
                evidence.append(f"Expiration: {company_data.get('sam_registration', {}).get('expiration')}")
            else:
                status = "Non-Compliant"
                gaps.append("No active SAM.gov registration found")
                remediation = "Register or renew SAM.gov registration at https://sam.gov"
        
        elif "NIST" in req.clause_id or "DFARS 252.204-7012" in req.clause_id:
            nist_score = company_data.get("nist_800_171_score")
            if nist_score:
                if nist_score >= 110:
                    status = "Compliant"
                    evidence.append(f"NIST SP 800-171 Score: {nist_score}/110")
                    evidence.append(f"Assessment Date: {company_data.get('nist_assessment_date')}")
                else:
                    status = "Partial"
                    evidence.append(f"NIST SP 800-171 Score: {nist_score}/110 (below required)")
                    gaps.append(f"Score deficit: {110 - nist_score} points")
                    remediation = "Complete POAM to address gaps and increase score to 110"
            else:
                status = "Non-Compliant"
                gaps.append("No NIST SP 800-171 assessment found")
                remediation = "Conduct NIST SP 800-171 assessment and submit score to SPRS"
        
        elif "CMMC" in req.regulation:
            cmmc_level = company_data.get("cmmc_level")
            required_level = int(req.clause_id.split("Level ")[1][0]) if "Level" in req.clause_id else 2
            
            if cmmc_level and cmmc_level >= required_level:
                status = "Compliant"
                evidence.append(f"CMMC Level {cmmc_level} achieved")
                evidence.append(f"Certificate expires: {company_data.get('cmmc_expiration')}")
            else:
                status = "Non-Compliant"
                gaps.append(f"CMMC Level {required_level} required, have Level {cmmc_level or 0}")
                remediation = f"Obtain CMMC Level {required_level} certification via C3PAO"
        
        elif "508" in req.regulation:
            has_vpat = company_data.get("has_vpat", False)
            has_508_plan = company_data.get("has_508_remediation_plan", False)
            
            if has_vpat and has_508_plan:
                status = "Compliant"
                evidence.append("VPAT available")
                evidence.append("Section 508 remediation plan in place")
            elif has_vpat or has_508_plan:
                status = "Partial"
                if not has_vpat:
                    gaps.append("No VPAT available")
                if not has_508_plan:
                    gaps.append("No Section 508 remediation plan")
                remediation = "Complete missing Section 508 artifacts"
            else:
                status = "Non-Compliant"
                gaps.append("No Section 508 compliance evidence")
                remediation = "Develop VPAT and accessibility remediation plan"
        
        elif "subcontracting" in req.title.lower():
            has_plan = company_data.get("has_subcontracting_plan", False)
            if has_plan:
                status = "Compliant"
                evidence.append("Small business subcontracting plan available")
            else:
                status = "Non-Compliant"
                gaps.append("No small business subcontracting plan")
                remediation = "Develop small business subcontracting plan per FAR 19.7"
        
        else:
            # Default: check if mentioned in proposal
            if proposal_content:
                mentioned = self._search_proposal_for_clause(req, proposal_content)
                if mentioned:
                    status = "Partial"
                    evidence.append("Requirement mentioned in proposal")
                    gaps.append("Full compliance evidence pending verification")
                else:
                    status = "Non-Compliant"
                    gaps.append("Requirement not addressed in proposal")
                    remediation = f"Add section addressing {req.clause_id}"
        
        return ComplianceCheck(
            requirement=req,
            status=status,
            evidence=evidence,
            gaps=gaps,
            remediation=remediation
        )
    
    def _search_proposal_for_clause(
        self,
        req: ComplianceRequirement,
        proposal_content: Dict[str, Any]
    ) -> bool:
        """Search proposal text for mentions of this clause"""
        # Simple text search (in production, use semantic search)
        search_terms = [req.clause_id, req.title.lower()]
        proposal_text = json.dumps(proposal_content).lower()
        
        for term in search_terms:
            if term.lower() in proposal_text:
                return True
        return False


class ComplianceReporter:
    """
    Generates compliance reports in various formats
    Produces audit-ready documentation
    """
    
    def generate_compliance_report(
        self,
        checks: List[ComplianceCheck],
        contract_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate comprehensive compliance report"""
        
        total = len(checks)
        compliant = sum(1 for c in checks if c.status == "Compliant")
        partial = sum(1 for c in checks if c.status == "Partial")
        non_compliant = sum(1 for c in checks if c.status == "Non-Compliant")
        
        compliance_rate = (compliant / total * 100) if total > 0 else 0
        
        report = {
            "contract_info": contract_info,
            "generated_at": datetime.utcnow().isoformat(),
            "summary": {
                "total_requirements": total,
                "compliant": compliant,
                "partial": partial,
                "non_compliant": non_compliant,
                "compliance_rate": round(compliance_rate, 2),
                "status": "PASS" if non_compliant == 0 else "FAIL"
            },
            "by_regulation": {},
            "critical_gaps": [],
            "checks": []
        }
        
        # Group by regulation
        for check in checks:
            reg = check.requirement.regulation
            if reg not in report["by_regulation"]:
                report["by_regulation"][reg] = {
                    "total": 0,
                    "compliant": 0,
                    "partial": 0,
                    "non_compliant": 0
                }
            
            report["by_regulation"][reg]["total"] += 1
            if check.status == "Compliant":
                report["by_regulation"][reg]["compliant"] += 1
            elif check.status == "Partial":
                report["by_regulation"][reg]["partial"] += 1
            else:
                report["by_regulation"][reg]["non_compliant"] += 1
        
        # Identify critical gaps
        for check in checks:
            if check.status != "Compliant" and check.requirement.severity == "Critical":
                report["critical_gaps"].append({
                    "clause_id": check.requirement.clause_id,
                    "title": check.requirement.title,
                    "gaps": check.gaps,
                    "remediation": check.remediation
                })
        
        # Add full check details
        for check in checks:
            report["checks"].append({
                "regulation": check.requirement.regulation,
                "clause_id": check.requirement.clause_id,
                "title": check.requirement.title,
                "severity": check.requirement.severity,
                "status": check.status,
                "evidence": check.evidence,
                "gaps": check.gaps,
                "remediation": check.remediation,
                "checked_at": check.checked_at.isoformat()
            })
        
        return report
    
    def generate_poam(
        self,
        checks: List[ComplianceCheck]
    ) -> Dict[str, Any]:
        """
        Generate Plan of Action and Milestones (POA&M) for non-compliant items
        Standard format for DoD compliance tracking
        """
        poam = {
            "generated_at": datetime.utcnow().isoformat(),
            "title": "Plan of Action and Milestones (POA&M)",
            "items": []
        }
        
        for idx, check in enumerate(checks):
            if check.status != "Compliant":
                poam["items"].append({
                    "control_id": check.requirement.clause_id,
                    "control_name": check.requirement.title,
                    "weakness_description": "; ".join(check.gaps),
                    "severity": check.requirement.severity,
                    "remediation_plan": check.remediation or "TBD",
                    "resources_required": "TBD",
                    "scheduled_completion": "TBD",
                    "milestones": [],
                    "status": "Open"
                })
        
        return poam


class ComplianceService:
    """
    Main service for compliance management
    Orchestrates analysis, checking, and reporting
    """
    
    def __init__(self):
        self.analyzer = ComplianceAnalyzer()
        self.checker = ComplianceChecker()
        self.reporter = ComplianceReporter()
    
    def analyze_contract_compliance(
        self,
        contract_data: Dict[str, Any],
        company_data: Dict[str, Any],
        proposal_content: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        End-to-end compliance analysis for a contract
            
        Returns:
            {
                "compliance_matrix": {...},
                "compliance_checks": [...],
                "compliance_report": {...},
                "poam": {...}
            }
        """
        # Step 1: Identify applicable requirements
        applicable_reqs = self.analyzer.identify_applicable_clauses(contract_data)
        
        # Step 2: Generate compliance matrix
        matrix = self.analyzer.generate_compliance_matrix(contract_data)
        
        # Step 3: Check compliance
        checks = self.checker.check_compliance(applicable_reqs, company_data, proposal_content)
        
        # Step 4: Generate report
        report = self.reporter.generate_compliance_report(checks, contract_data)
        
        # Step 5: Generate POA&M for gaps
        poam = self.reporter.generate_poam(checks)
        
        return {
            "compliance_matrix": matrix,
            "compliance_checks": [
                {
                    "requirement": {
                        "regulation": c.requirement.regulation,
                        "clause_id": c.requirement.clause_id,
                        "title": c.requirement.title,
                        "severity": c.requirement.severity
                    },
                    "status": c.status,
                    "evidence": c.evidence,
                    "gaps": c.gaps,
                    "remediation": c.remediation
                }
                for c in checks
            ],
            "compliance_report": report,
            "poam": poam
        }
    
    def get_requirements_by_agency(self, agency: str) -> List[Dict[str, Any]]:
        """Get all compliance requirements for a specific agency"""
        all_reqs = ComplianceRegistry.get_all_requirements()
        
        # Filter by agency-specific regulations
        if agency == "DoD":
            filtered = [r for r in all_reqs if r.regulation in ["FAR", "DFARS", "CMMC", "Section 508"]]
        elif agency in ["Civilian", "Other"]:
            filtered = [r for r in all_reqs if r.regulation in ["FAR", "Section 508"]]
        else:
            filtered = all_reqs
        
        return [
            {
                "regulation": r.regulation,
                "clause_id": r.clause_id,
                "title": r.title,
                "description": r.description,
                "severity": r.severity
            }
            for r in filtered
        ]
