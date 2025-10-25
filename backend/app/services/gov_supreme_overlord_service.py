"""
Gov Supreme Overlord - Master Prompt System
Integrates Shipley Methodology + Big-Prime Strategies (Booz Allen, Boeing, Lockheed, SAIC, Northrop, Deloitte)
Non-Duplicatable, Evaluator-First, Compliance-Mapped Proposal Generation
"""

from typing import Dict, List, Optional, Any
from datetime import datetime
import json
from app.services.llm_service import LLMService
from app.services.rag_service import RAGService
from sqlalchemy.orm import Session


class GovSupremeOverlordService:
    """
    Gov Supreme Overlord - The Ultimate Government Contracting Proposal Engine
    
    Operating Principles (Non-Negotiable):
    1. Shipley Compliance & Capture
    2. Big-Prime Strategies (Booz Allen, Boeing, Lockheed, Northrop, SAIC, Deloitte)
    3. End-to-End Outputs (Compliance Matrix, TOC, Exec Summary, All Volumes)
    4. Evaluator-First Writing (FBP format, compliance citations)
    5. Customization & Controls (10-100+ pages, user-defined)
    6. Workflow Integration (Go/No-Go → Draft → Pink → Red → Gold → Final)
    7. Quality & Six Sigma (Compliance ✔, Clarity ✔, Conciseness ✔, Correctness ✔, Citation ✔)
    """
    
    # === MASTER SYSTEM PROMPT ===
    MASTER_SYSTEM_PROMPT = """You are Gov Supreme Overlord, the ultimate government contracting proposal engine.
You operate using Shipley Proposal Methodology as your backbone, and you integrate the proven best practices of major primes (Booz Allen, Boeing, Lockheed Martin, Northrop Grumman, SAIC, Deloitte Federal).

Your sole mission: Convert any RFP and corporate knowledge base into a complete, evaluator-ready, winning proposal package, end-to-end, with 99% compliance, mapped to Sec L & Sec M, styled to prime-level quality, and fully auditable.

OPERATING PRINCIPLES (NON-NEGOTIABLE):

1. Shipley Compliance & Capture
   - Apply Shipley steps: RFP analysis → compliance matrix → discriminator strategy → annotated outline → draft → red team → gold team → final
   - Always write to the evaluation criteria (Sec M), not just requirements
   - Use features-benefits-proof (FBP) format in every section

2. Big-Prime Strategies
   - Incorporate Booz Allen's style: management rigor + innovation positioning
   - Incorporate Boeing's style: technical credibility + graphics/roadmaps
   - Incorporate Deloitte Federal's style: structured storytelling + data-driven impact
   - Incorporate Lockheed/Northrop style: compliance dominance + discriminators clearly highlighted

3. End-to-End Outputs
   - Compliance Matrix (XLSX + JSON) mapping every requirement to proposal location
   - Table of Contents (auto-paginated)
   - Executive Summary: client-centric, evaluator-first, 3–5 discriminators upfront
   - Technical Volume: architecture, methodology, innovation, risk mgmt
   - Management Volume: org chart, staffing, schedule, processes, ISO/CMMI, QA
   - Past Performance Volume: mapped projects with relevance/recency/risk reduction
   - Staffing Volume: resumes, labor categories, teaming resources
   - Pricing Narrative: compliant, value-focused, non-generic
   - Annexes/Appendices: graphics, templates, compliance certs

4. Evaluator-First Writing
   - Every section begins with "What the evaluator gets" bullets
   - Every paragraph ends with a mapped compliance cite [RFP:L.3.2] or [KB:PastPerf#12]
   - Discriminators (our unique strengths) bolded
   - Risk handling always addressed proactively

5. Customization & Controls
   - User sets length (10–100+ pages)
   - Auto-scale by chunking into sub-sections
   - Insert graphics placeholders (org charts, process flows, Gantt)

6. Workflow Integration
   - Flow through Go/No-Go → Draft → Pink Team → Red Team → Gold Team → Final
   - Track reviewer comments inline
   - Version control + audit log

7. Quality & Six Sigma
   - Every draft runs through a QA gate: Compliance ✔, Clarity ✔, Conciseness ✔, Correctness ✔, Citation ✔
   - Auto red-team: generates evaluator questions + fixes
   - Deliver 508-compliant PDF with alt-text, styles, and bookmarks"""

    # === SHIPLEY METHODOLOGY PHASES ===
    SHIPLEY_PHASES = {
        "Phase 1": "RFP Analysis & Shredding",
        "Phase 2": "Compliance Matrix Generation",
        "Phase 3": "Discriminator Strategy Development",
        "Phase 4": "Annotated Outline Creation",
        "Phase 5": "Proposal Drafting (Color Teams)",
        "Phase 6": "Pink Team Review",
        "Phase 7": "Red Team Review",
        "Phase 8": "Gold Team Polish",
        "Phase 9": "Final Production & Submission"
    }
    
    # === BIG-PRIME BEST PRACTICES ===
    BIG_PRIME_STRATEGIES = {
        "booz_allen": {
            "focus": "Management rigor + Innovation positioning",
            "style": "Structured, process-driven, emphasizes governance and proven methodologies",
            "key_elements": [
                "Clear management approach with RACI charts",
                "Innovation as differentiator (AI, analytics, automation)",
                "Emphasis on cybersecurity and risk mitigation",
                "Data-driven decision making"
            ]
        },
        "boeing": {
            "focus": "Technical credibility + Graphics/Roadmaps",
            "style": "Engineering excellence, visual aids, technical depth",
            "key_elements": [
                "Technical architecture diagrams",
                "Gantt charts and project schedules",
                "Systems engineering approach",
                "Quality assurance and testing protocols"
            ]
        },
        "lockheed_northrop": {
            "focus": "Compliance dominance + Discriminator highlighting",
            "style": "Meticulous compliance, every requirement addressed, win themes bold",
            "key_elements": [
                "100% compliance with explicit mapping",
                "Discriminators highlighted in every section",
                "Past performance emphasis on similar contracts",
                "Security clearance and facility credentials"
            ]
        },
        "saic": {
            "focus": "Customer intimacy + Mission understanding",
            "style": "Demonstrates deep understanding of customer mission and challenges",
            "key_elements": [
                "Mission alignment statements",
                "Customer pain point identification and solutions",
                "Relationship building emphasis",
                "Flexible, adaptive approaches"
            ]
        },
        "deloitte": {
            "focus": "Structured storytelling + Data-driven impact",
            "style": "Consulting-grade narratives with metrics and outcomes",
            "key_elements": [
                "Clear problem-solution-outcome structure",
                "Quantified benefits and ROI",
                "Change management and adoption strategies",
                "Executive-level communication"
            ]
        }
    }
    
    def __init__(self, db: Session):
        self.db = db
        self.llm_service = LLMService()
        self.rag_service = RAGService(db)
    
    async def analyze_rfp(
        self,
        rfp_id: int,
        rfp_text: str,
        company_kb: Dict[str, Any],
        analysis_depth: str = "comprehensive"
    ) -> Dict[str, Any]:
        """
        Phase 1: RFP Analysis & Shredding
        Extract Section L (Instructions), Section M (Evaluation Criteria), SOW/PWS
        """
        
        analysis_prompt = f"""{self.MASTER_SYSTEM_PROMPT}

TASK: Analyze the uploaded RFP and extract compliance items.

RFP TEXT:
{rfp_text[:50000]}  # Limit to prevent token overflow

INSTRUCTIONS:
1. Identify and extract Section L (Instructions to Offerors)
2. Identify and extract Section M (Evaluation Criteria with weights/scoring)
3. Identify and extract SOW/PWS (Statement of Work / Performance Work Statement)
4. List all "shall" and "must" requirements
5. Identify page limits, format requirements, and submission instructions
6. Extract key dates (proposal due date, questions deadline, etc.)
7. Identify set-aside type (small business, 8(a), SDVOSB, etc.)
8. Determine contract type (FFP, T&M, Cost-Plus, IDIQ, etc.)

OUTPUT FORMAT (JSON):
{{
    "opportunity_name": "string",
    "solicitation_number": "string",
    "agency": "string",
    "due_date": "YYYY-MM-DD",
    "contract_type": "string",
    "set_aside": "string",
    "page_limits": {{}},
    "section_l": [
        {{"clause": "L.1.1", "requirement": "Detailed requirement text", "page_limit": 5}}
    ],
    "section_m": [
        {{"factor": "M.1", "title": "Technical Approach", "weight": "40%", "sub_criteria": []}}
    ],
    "sow_requirements": [
        {{"task": "Task 1", "description": "...", "requirements": []}}
    ],
    "key_dates": {{}},
    "discriminators_identified": ["Unique capability 1", "Unique capability 2"]
}}
"""
        
        response = await self.llm_service.generate_structured_output(
            prompt=analysis_prompt,
            response_format="json",
            max_tokens=8000
        )
        
        return json.loads(response)
    
    async def generate_compliance_matrix(
        self,
        rfp_analysis: Dict[str, Any],
        company_kb: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Phase 2: Compliance Matrix Generation
        Map every RFP requirement to proposal response location
        """
        
        matrix_prompt = f"""{self.MASTER_SYSTEM_PROMPT}

TASK: Generate a compliance matrix mapping every requirement to proposal sections.

RFP ANALYSIS:
{json.dumps(rfp_analysis, indent=2)}

COMPANY CAPABILITIES:
{json.dumps(company_kb, indent=2)[:10000]}

INSTRUCTIONS:
1. Create a row for each Section L instruction
2. Create a row for each Section M evaluation criterion
3. Create a row for each SOW "shall" requirement
4. Map each to a proposal volume/section/page
5. Assess company alignment: "Full", "Partial", "Gap" for each
6. Identify any missing capabilities

OUTPUT FORMAT (JSON):
{{
    "compliance_matrix": [
        {{
            "id": "L.1.1",
            "category": "Section L - Instructions",
            "requirement": "Submit technical approach not to exceed 30 pages",
            "proposal_location": "Volume I, Section 2, Pages 10-35",
            "compliance_status": "Full",
            "company_capability": "We have completed 15+ similar projects with proven approach",
            "evidence": ["Past Performance Ref #5", "Case Study #3"],
            "gaps": []
        }}
    ],
    "compliance_summary": {{
        "total_requirements": 0,
        "full_compliance": 0,
        "partial_compliance": 0,
        "gaps": 0,
        "compliance_percentage": 0.0
    }},
    "critical_gaps": [],
    "discriminators": []
}}
"""
        
        response = await self.llm_service.generate_structured_output(
            prompt=matrix_prompt,
            response_format="json",
            max_tokens=12000
        )
        
        return json.loads(response)
    
    async def develop_discriminator_strategy(
        self,
        rfp_analysis: Dict[str, Any],
        compliance_matrix: Dict[str, Any],
        company_kb: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Phase 3: Discriminator Strategy Development
        Identify unique strengths that differentiate from competitors
        """
        
        discriminator_prompt = f"""{self.MASTER_SYSTEM_PROMPT}

TASK: Develop discriminator strategy - our unique strengths vs competitors.

RFP ANALYSIS:
{json.dumps(rfp_analysis, indent=2)[:5000]}

COMPLIANCE MATRIX SUMMARY:
{json.dumps(compliance_matrix['compliance_summary'], indent=2)}

COMPANY KNOWLEDGE BASE:
{json.dumps(company_kb, indent=2)[:10000]}

INSTRUCTIONS:
1. Identify 5-7 key discriminators (unique strengths)
2. Map each discriminator to evaluation factors
3. Provide evidence for each (past performance, certifications, innovation)
4. Assess likely competitors and our advantages
5. Develop win themes and key messages

OUTPUT FORMAT (JSON):
{{
    "discriminators": [
        {{
            "title": "AI-Powered Automation",
            "description": "Proprietary AI tools reduce processing time by 60%",
            "evaluation_factors": ["M.1 Technical Approach", "M.3 Innovation"],
            "evidence": ["Patent #123", "Case Study showing 60% improvement"],
            "competitive_advantage": "No other vendor has this capability",
            "messaging": "Proven Innovation That Delivers Measurable Results"
        }}
    ],
    "win_themes": [
        "Proven Performance with Similar Agencies",
        "Innovation That Reduces Cost and Risk",
        "Local Presence with National Reach"
    ],
    "competitor_analysis": {{
        "likely_incumbents": [],
        "our_advantages": [],
        "their_advantages": [],
        "how_we_win": "string"
    }}
}}
"""
        
        response = await self.llm_service.generate_structured_output(
            prompt=discriminator_prompt,
            response_format="json",
            max_tokens=8000
        )
        
        return json.loads(response)
    
    async def create_annotated_outline(
        self,
        rfp_analysis: Dict[str, Any],
        compliance_matrix: Dict[str, Any],
        discriminators: Dict[str, Any],
        page_budget: Dict[str, int]
    ) -> Dict[str, Any]:
        """
        Phase 4: Annotated Outline Creation
        Structure proposal with section goals, page limits, and key messages
        """
        
        outline_prompt = f"""{self.MASTER_SYSTEM_PROMPT}

TASK: Create annotated outline with section structure, page allocations, and guidance.

RFP ANALYSIS:
{json.dumps(rfp_analysis, indent=2)[:3000]}

DISCRIMINATORS:
{json.dumps(discriminators, indent=2)}

PAGE BUDGET:
{json.dumps(page_budget, indent=2)}

INSTRUCTIONS:
1. Structure proposal per Section L requirements
2. Allocate pages to each section based on evaluation weights
3. Provide writing guidance for each section
4. Map discriminators to appropriate sections
5. Include graphics/table callouts

OUTPUT FORMAT (JSON):
{{
    "proposal_structure": [
        {{
            "volume": "Volume I - Technical Proposal",
            "sections": [
                {{
                    "id": "1.0",
                    "title": "Executive Summary",
                    "page_allocation": 2,
                    "evaluation_factor": "Overall",
                    "key_messages": ["Win theme 1", "Win theme 2"],
                    "discriminators_to_highlight": ["Discriminator 1"],
                    "writing_guidance": "Client-centric, evaluator-first, 3-5 key points",
                    "required_graphics": ["Solution overview diagram"],
                    "compliance_citations": ["L.4.1", "M.1"]
                }}
            ]
        }}
    ],
    "total_page_count": 0,
    "graphics_list": [],
    "appendices": []
}}
"""
        
        response = await self.llm_service.generate_structured_output(
            prompt=outline_prompt,
            response_format="json",
            max_tokens=10000
        )
        
        return json.loads(response)
    
    async def draft_proposal_section(
        self,
        section_id: str,
        section_spec: Dict[str, Any],
        rfp_context: Dict[str, Any],
        company_kb: Dict[str, Any],
        style_guide: str = "booz_allen"
    ) -> str:
        """
        Phase 5: Proposal Drafting with Big-Prime Strategies
        Generate evaluator-first, compliance-mapped content
        """
        
        # Get relevant content from knowledge base via RAG
        relevant_content = await self.rag_service.search_similar_content(
            query=section_spec['title'],
            top_k=5
        )
        
        # Apply Big-Prime style
        prime_style = self.BIG_PRIME_STRATEGIES.get(style_guide, self.BIG_PRIME_STRATEGIES['booz_allen'])
        
        drafting_prompt = f"""{self.MASTER_SYSTEM_PROMPT}

TASK: Draft proposal section with evaluator-first, FBP format.

SECTION SPECIFICATION:
{json.dumps(section_spec, indent=2)}

RFP CONTEXT:
{json.dumps(rfp_context, indent=2)[:3000]}

RELEVANT PAST CONTENT (from company KB):
{relevant_content[:5000]}

BIG-PRIME STYLE GUIDE ({style_guide.upper()}):
Focus: {prime_style['focus']}
Style: {prime_style['style']}
Key Elements: {', '.join(prime_style['key_elements'])}

WRITING REQUIREMENTS:
1. Start with "What the Evaluator Gets" 3-5 bullet summary
2. Use Features-Benefits-Proof (FBP) format:
   - Feature: What we will do
   - Benefit: How it helps the agency
   - Proof: Evidence (past performance, metrics, certifications)
3. End each paragraph with compliance citation [RFP:X.X] or [KB:Doc#Page]
4. Bold discriminators (unique strengths)
5. Address risk proactively with mitigation strategies
6. Maximum {section_spec['page_allocation']} pages (approximately {section_spec['page_allocation'] * 500} words)
7. Include callouts for graphics where appropriate: [GRAPHIC: Description]

OUTPUT FORMAT:
# {section_spec['title']}

## What the Evaluator Gets
- [Benefit bullet 1]
- [Benefit bullet 2]
- [Benefit bullet 3]

## [Subsection Title]
[Content with FBP format and compliance citations]

[GRAPHIC: Process flow diagram showing our approach]

## Risk Mitigation
[How we proactively address potential risks]

---
**Compliance Map:** [RFP:L.X.X, M.X.X]
**Discriminators Highlighted:** [List]
**Word Count:** [Estimate]
"""
        
        response = await self.llm_service.generate_completion(
            prompt=drafting_prompt,
            max_tokens=section_spec['page_allocation'] * 600,  # ~500-600 words per page
            temperature=0.7
        )
        
        return response
    
    async def run_red_team_review(
        self,
        proposal_draft: str,
        rfp_analysis: Dict[str, Any],
        compliance_matrix: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Phase 7: Red Team Review
        Simulate evaluator perspective, identify weaknesses
        """
        
        red_team_prompt = f"""{self.MASTER_SYSTEM_PROMPT}

TASK: Act as a critical Red Team evaluator. Find weaknesses, risks, and gaps.

PROPOSAL DRAFT:
{proposal_draft[:30000]}

RFP REQUIREMENTS:
{json.dumps(rfp_analysis, indent=2)[:3000]}

COMPLIANCE MATRIX:
{json.dumps(compliance_matrix, indent=2)[:3000]}

RED TEAM EVALUATION CRITERIA:
1. Compliance: Are all requirements addressed?
2. Clarity: Is content easy to understand?
3. Conciseness: Any redundancy or verbosity?
4. Correctness: Any factual errors or inconsistencies?
5. Citations: Are all claims backed by [RFP:X] or [KB:X]?
6. Discriminators: Are unique strengths clear and bold?
7. Risk: Are risks identified and mitigated?
8. Evaluator Questions: What questions would evaluators ask?

OUTPUT FORMAT (JSON):
{{
    "overall_score": 85,
    "compliance_score": 95,
    "clarity_score": 80,
    "conciseness_score": 75,
    "correctness_score": 90,
    "citation_score": 85,
    "strengths": ["Strong technical approach", "Clear discriminators"],
    "weaknesses": ["Section 3.2 lacks past performance evidence", "Too many acronyms"],
    "critical_gaps": ["Requirement L.4.5 not addressed"],
    "evaluator_questions": [
        "How will you handle staff turnover?",
        "What is your cybersecurity approach?"
    ],
    "recommended_fixes": [
        {{
            "section": "3.2",
            "issue": "Lacks past performance evidence",
            "fix": "Add case study from Project X showing similar work"
        }}
    ],
    "go_no_go_recommendation": "GO - Address 3 critical items before submission"
}}
"""
        
        response = await self.llm_service.generate_structured_output(
            prompt=red_team_prompt,
            response_format="json",
            max_tokens=8000
        )
        
        return json.loads(response)
    
    async def generate_full_proposal(
        self,
        rfp_id: int,
        rfp_text: str,
        company_kb: Dict[str, Any],
        user_preferences: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        MASTER ORCHESTRATOR: End-to-End Proposal Generation
        Runs all Shipley phases from RFP analysis to final package
        """
        
        if user_preferences is None:
            user_preferences = {
                "page_limits": {"technical": 30, "management": 20, "past_performance": 15},
                "style_guide": "booz_allen",
                "include_color_teams": True
            }
        
        # Phase 1: Analyze RFP
        print(f"🔍 Phase 1: Analyzing RFP #{rfp_id}...")
        rfp_analysis = await self.analyze_rfp(rfp_id, rfp_text, company_kb)
        
        # Phase 2: Generate Compliance Matrix
        print("📋 Phase 2: Generating Compliance Matrix...")
        compliance_matrix = await self.generate_compliance_matrix(rfp_analysis, company_kb)
        
        # Phase 3: Develop Discriminators
        print("🎯 Phase 3: Developing Discriminator Strategy...")
        discriminators = await self.develop_discriminator_strategy(
            rfp_analysis, compliance_matrix, company_kb
        )
        
        # Phase 4: Create Annotated Outline
        print("📝 Phase 4: Creating Annotated Outline...")
        outline = await self.create_annotated_outline(
            rfp_analysis, compliance_matrix, discriminators, user_preferences['page_limits']
        )
        
        # Phase 5: Draft All Sections
        print("✍️ Phase 5: Drafting Proposal Sections...")
        proposal_sections = {}
        for volume in outline['proposal_structure']:
            for section in volume['sections']:
                print(f"  - Drafting {section['id']} {section['title']}...")
                draft = await self.draft_proposal_section(
                    section['id'],
                    section,
                    rfp_analysis,
                    company_kb,
                    user_preferences['style_guide']
                )
                proposal_sections[section['id']] = draft
        
        # Phase 7: Red Team Review (skip Pink/Gold for now)
        if user_preferences.get('include_color_teams', True):
            print("🔴 Phase 7: Running Red Team Review...")
            full_draft = "\n\n".join(proposal_sections.values())
            red_team = await self.run_red_team_review(full_draft, rfp_analysis, compliance_matrix)
        else:
            red_team = {"overall_score": 0, "message": "Red Team review skipped"}
        
        # Compile Final Package
        print("📦 Phase 9: Compiling Final Package...")
        final_package = {
            "rfp_id": rfp_id,
            "generated_at": datetime.utcnow().isoformat(),
            "rfp_analysis": rfp_analysis,
            "compliance_matrix": compliance_matrix,
            "discriminators": discriminators,
            "outline": outline,
            "proposal_sections": proposal_sections,
            "red_team_review": red_team,
            "status": "DRAFT_COMPLETE",
            "next_steps": [
                "Address Red Team findings",
                "Insert graphics and tables",
                "Format for submission",
                "Executive approval",
                "Submit"
            ]
        }
        
        return final_package
    
    def get_shipley_phase_status(self, proposal_id: int) -> Dict[str, str]:
        """
        Track proposal progress through Shipley phases
        """
        # Query database for proposal status
        # Return phase completion status
        return {
            "proposal_id": proposal_id,
            "current_phase": "Phase 5 - Drafting",
            "phases": self.SHIPLEY_PHASES,
            "completed": ["Phase 1", "Phase 2", "Phase 3", "Phase 4"],
            "in_progress": ["Phase 5"],
            "pending": ["Phase 6", "Phase 7", "Phase 8", "Phase 9"]
        }

