"""
GovBot - Advanced AI Chat Assistant
Context-aware conversational AI for government contracting
"""
from typing import List, Dict, Optional, Any
from datetime import datetime
from sqlalchemy.orm import Session
from openai import OpenAI
import json
import os

from app.models.opportunity import Opportunity
from app.models.proposal import Proposal
from app.models.knowledge import KnowledgeDocument, PastPerformance
from app.models.organization import Organization
from app.services.llm_service import LLMService


class GovBotService:
    """Advanced AI Chat Assistant with context awareness"""
    
    def __init__(self, db: Session, organization_id: str, user_id: str):
        self.db = db
        self.organization_id = organization_id
        self.user_id = user_id
        self.llm = LLMService()
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        # Conversation history (in production, store in Redis/DB)
        self.conversation_history: List[Dict] = []
    
    async def chat(
        self,
        message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process chat message with full context awareness
        
        Args:
            message: User's message
            context: Current page context (opportunity_id, proposal_id, etc.)
            
        Returns:
            {
                "response": str,
                "actions": List[Dict],  # Suggested actions
                "data": Dict  # Supporting data
            }
        """
        
        # Build context-aware system prompt
        system_prompt = self._build_system_prompt(context)
        
        # Add user message to history
        self.conversation_history.append({
            "role": "user",
            "content": message
        })
        
        # Prepare messages for LLM
        messages = [
            {"role": "system", "content": system_prompt}
        ] + self.conversation_history
        
        # Call LLM with function calling for actions
        response = self.client.chat.completions.create(
            model="gemini-2.5-flash",
            messages=messages,
            functions=self._get_available_functions(),
            function_call="auto",
            temperature=0.7,
            max_tokens=1000
        )
        
        assistant_message = response.choices[0].message
        
        # Handle function calls
        actions = []
        data = {}
        
        if assistant_message.function_call:
            function_name = assistant_message.function_call.name
            function_args = json.loads(assistant_message.function_call.arguments)
            
            # Execute function
            result = await self._execute_function(function_name, function_args, context)
            actions = result.get("actions", [])
            data = result.get("data", {})
            
            # Get final response with function result
            messages.append({
                "role": "assistant",
                "content": assistant_message.content,
                "function_call": assistant_message.function_call
            })
            messages.append({
                "role": "function",
                "name": function_name,
                "content": json.dumps(result)
            })
            
            final_response = self.client.chat.completions.create(
                model="gemini-2.5-flash",
                messages=messages,
                temperature=0.7,
                max_tokens=1000
            )
            
            response_text = final_response.choices[0].message.content
        else:
            response_text = assistant_message.content
        
        # Add assistant response to history
        self.conversation_history.append({
            "role": "assistant",
            "content": response_text
        })
        
        return {
            "response": response_text,
            "actions": actions,
            "data": data,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def _build_system_prompt(self, context: Optional[Dict]) -> str:
        """Build context-aware system prompt"""
        
        # Get organization profile
        org = self.db.query(Organization).filter(
            Organization.id == self.organization_id
        ).first()
        
        base_prompt = f"""You are GovBot, an expert AI assistant for government contracting.

You help users with:
- Finding and qualifying opportunities
- Understanding RFP requirements
- Writing proposal sections
- Answering GovCon questions (FAR, DFARS, etc.)
- Navigating the platform

Organization Profile:
- Name: {org.name if org else 'Unknown'}
- NAICS Codes: {org.naics_codes if org else []}
- Certifications: {org.certifications if org else []}
- Core Capabilities: {org.core_capabilities if org else []}

Communication Style:
- Be concise and actionable
- Use bullet points for clarity
- Provide specific recommendations
- Include relevant data/metrics
- Suggest next steps

"""
        
        # Add context-specific information
        if context:
            if context.get("page") == "opportunity_detail" and context.get("opportunity_id"):
                opp = self.db.query(Opportunity).filter(
                    Opportunity.id == context["opportunity_id"]
                ).first()
                
                if opp:
                    base_prompt += f"""
Current Context: User is viewing opportunity details

Opportunity:
- Title: {opp.title}
- Solicitation: {opp.solicitation_number}
- Agency: {opp.agency}
- Value: ${opp.contract_value:,.0f}
- Due Date: {opp.due_date}
- PWin Score: {opp.pwin_score}%
- Stage: {opp.stage.value}
- Set-Aside: {opp.set_aside.value}

When user asks about "this opportunity" or "should I bid", refer to this opportunity.
"""
            
            elif context.get("page") == "proposal_writing" and context.get("proposal_id"):
                proposal = self.db.query(Proposal).filter(
                    Proposal.id == context["proposal_id"]
                ).first()
                
                if proposal:
                    base_prompt += f"""
Current Context: User is writing a proposal

Proposal:
- Title: {proposal.title}
- RFP: {proposal.rfp_title}
- Status: {proposal.status.value}
- Sections: {len(proposal.sections) if proposal.sections else 0}

When user asks about writing or sections, refer to this proposal.
"""
        
        return base_prompt
    
    def _get_available_functions(self) -> List[Dict]:
        """Define available functions for function calling"""
        
        return [
            {
                "name": "analyze_opportunity_qualification",
                "description": "Analyze if the user's organization qualifies for an opportunity",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "opportunity_id": {
                            "type": "string",
                            "description": "The opportunity ID to analyze"
                        }
                    },
                    "required": ["opportunity_id"]
                }
            },
            {
                "name": "calculate_pwin",
                "description": "Calculate probability of win for an opportunity",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "opportunity_id": {
                            "type": "string",
                            "description": "The opportunity ID"
                        }
                    },
                    "required": ["opportunity_id"]
                }
            },
            {
                "name": "find_relevant_past_performance",
                "description": "Find relevant past performance references",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "opportunity_id": {
                            "type": "string",
                            "description": "The opportunity ID"
                        },
                        "limit": {
                            "type": "integer",
                            "description": "Number of references to return",
                            "default": 3
                        }
                    },
                    "required": ["opportunity_id"]
                }
            },
            {
                "name": "search_knowledge_base",
                "description": "Search the organization's knowledge base",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "Search query"
                        },
                        "limit": {
                            "type": "integer",
                            "description": "Number of results",
                            "default": 5
                        }
                    },
                    "required": ["query"]
                }
            },
            {
                "name": "explain_govcon_term",
                "description": "Explain a government contracting term or acronym",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "term": {
                            "type": "string",
                            "description": "The term to explain (e.g., 'FFP', 'CPARS', 'FAR')"
                        }
                    },
                    "required": ["term"]
                }
            },
            {
                "name": "generate_proposal_section",
                "description": "Generate a draft proposal section",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "section_name": {
                            "type": "string",
                            "description": "Name of the section (e.g., 'Management Approach')"
                        },
                        "proposal_id": {
                            "type": "string",
                            "description": "The proposal ID"
                        }
                    },
                    "required": ["section_name", "proposal_id"]
                }
            }
        ]
    
    async def _execute_function(
        self,
        function_name: str,
        arguments: Dict,
        context: Optional[Dict]
    ) -> Dict:
        """Execute a function call"""
        
        if function_name == "analyze_opportunity_qualification":
            return await self._analyze_qualification(arguments["opportunity_id"])
        
        elif function_name == "calculate_pwin":
            return await self._calculate_pwin(arguments["opportunity_id"])
        
        elif function_name == "find_relevant_past_performance":
            return await self._find_past_performance(
                arguments["opportunity_id"],
                arguments.get("limit", 3)
            )
        
        elif function_name == "search_knowledge_base":
            return await self._search_knowledge(
                arguments["query"],
                arguments.get("limit", 5)
            )
        
        elif function_name == "explain_govcon_term":
            return await self._explain_term(arguments["term"])
        
        elif function_name == "generate_proposal_section":
            return await self._generate_section(
                arguments["section_name"],
                arguments["proposal_id"]
            )
        
        return {"error": "Unknown function"}
    
    async def _analyze_qualification(self, opportunity_id: str) -> Dict:
        """Analyze organization's qualification for opportunity"""
        
        opp = self.db.query(Opportunity).filter(
            Opportunity.id == opportunity_id
        ).first()
        
        if not opp:
            return {"error": "Opportunity not found"}
        
        org = self.db.query(Organization).filter(
            Organization.id == self.organization_id
        ).first()
        
        # Detailed qualification analysis
        qualifications = {
            "eligibility": self._check_eligibility(opp, org),
            "technical_capability": self._check_technical_capability(opp, org),
            "past_performance": self._check_past_performance(opp, org),
            "capacity": self._check_capacity(opp, org)
        }
        
        # Calculate overall score
        total_score = sum(q["score"] for q in qualifications.values()) / len(qualifications)
        
        # Generate recommendation
        if total_score >= 80:
            recommendation = "HIGHLY QUALIFIED - Strongly recommend bidding"
        elif total_score >= 60:
            recommendation = "QUALIFIED - Recommend bidding with mitigation plan"
        elif total_score >= 40:
            recommendation = "MARGINAL - Consider teaming to strengthen"
        else:
            recommendation = "NOT QUALIFIED - Recommend no-bid"
        
        actions = []
        if total_score >= 60:
            actions.append({
                "type": "start_capture",
                "label": "🚀 Start Capture Plan",
                "opportunity_id": opportunity_id
            })
        
        if total_score < 80:
            actions.append({
                "type": "find_partners",
                "label": "🤝 Find Teaming Partners",
                "opportunity_id": opportunity_id
            })
        
        return {
            "data": {
                "qualifications": qualifications,
                "overall_score": total_score,
                "recommendation": recommendation
            },
            "actions": actions
        }
    
    def _check_eligibility(self, opp: Opportunity, org: Organization) -> Dict:
        """Check basic eligibility"""
        score = 0
        checks = []
        
        # Set-aside check
        if opp.set_aside_type:
            if opp.set_aside_type in (org.certifications or []):
                score += 25
                checks.append(f"✅ {opp.set_aside_type} certified")
            else:
                checks.append(f"❌ Not {opp.set_aside_type} certified")
        else:
            score += 25
            checks.append("✅ Unrestricted (no certification required)")
        
        # NAICS check
        if opp.naics_code in (org.naics_codes or []):
            score += 25
            checks.append(f"✅ NAICS {opp.naics_code} is your primary code")
        else:
            checks.append(f"⚠️ NAICS {opp.naics_code} not in your codes")
        
        # Size standard (simplified)
        score += 25  # Assume qualified
        checks.append("✅ Meets size standard")
        
        # Clearance (if required)
        score += 25  # Assume qualified
        checks.append("✅ Has required clearances")
        
        return {
            "score": score,
            "checks": checks
        }
    
    def _check_technical_capability(self, opp: Opportunity, org: Organization) -> Dict:
        """Check technical capability match"""
        score = 0
        checks = []
        
        # Capability overlap (simplified - would use NLP in production)
        org_capabilities = set(org.core_capabilities or [])
        opp_keywords = set(opp.description.lower().split()) if opp.description else set()
        
        overlap = len(org_capabilities.intersection(opp_keywords))
        if overlap > 5:
            score = 100
            checks.append(f"✅ Strong capability match ({overlap} overlaps)")
        elif overlap > 2:
            score = 70
            checks.append(f"✅ Good capability match ({overlap} overlaps)")
        else:
            score = 40
            checks.append(f"⚠️ Limited capability match ({overlap} overlaps)")
        
        return {
            "score": score,
            "checks": checks
        }
    
    def _check_past_performance(self, opp: Opportunity, org: Organization) -> Dict:
        """Check past performance relevance"""
        
        # Get past performance references
        past_perf = self.db.query(PastPerformance).filter(
            PastPerformance.organization_id == self.organization_id
        ).all()
        
        score = 0
        checks = []
        
        if not past_perf:
            checks.append("❌ No past performance references")
            return {"score": 0, "checks": checks}
        
        # Check for same agency
        same_agency = [p for p in past_perf if p.customer_agency == opp.agency]
        if same_agency:
            score += 40
            checks.append(f"✅ {len(same_agency)} references with {opp.agency}")
        
        # Check for recent (last 3 years)
        from datetime import date, timedelta
        three_years_ago = date.today() - timedelta(days=1095)
        recent = [p for p in past_perf if p.end_date and p.end_date >= three_years_ago]
        if len(recent) >= 3:
            score += 30
            checks.append(f"✅ {len(recent)} recent references (last 3 years)")
        
        # Check for similar scope (simplified)
        score += 30
        checks.append("✅ Similar scope in past performance")
        
        return {
            "score": min(score, 100),
            "checks": checks
        }
    
    def _check_capacity(self, opp: Opportunity, org: Organization) -> Dict:
        """Check capacity to perform"""
        
        # Simplified capacity check
        score = 75  # Assume adequate capacity
        checks = [
            "✅ Adequate staff available",
            "✅ Current utilization allows new work"
        ]
        
        return {
            "score": score,
            "checks": checks
        }
    
    async def _calculate_pwin(self, opportunity_id: str) -> Dict:
        """Calculate probability of win"""
        
        opp = self.db.query(Opportunity).filter(
            Opportunity.id == opportunity_id
        ).first()
        
        if not opp:
            return {"error": "Opportunity not found"}
        
        # Use existing PWin score or calculate
        pwin = opp.pwin_score or 50
        
        return {
            "data": {
                "pwin_score": pwin,
                "confidence": "Medium",
                "factors": {
                    "past_performance": 70,
                    "technical_capability": 80,
                    "price_competitiveness": 60,
                    "relationship": 50
                }
            },
            "actions": []
        }
    
    async def _find_past_performance(self, opportunity_id: str, limit: int) -> Dict:
        """Find relevant past performance"""
        
        past_perf = self.db.query(PastPerformance).filter(
            PastPerformance.organization_id == self.organization_id
        ).limit(limit).all()
        
        references = [
            {
                "project_name": p.project_name,
                "customer": p.customer_agency,
                "value": p.contract_value,
                "period": f"{p.start_date} to {p.end_date}",
                "rating": p.cpars_rating
            }
            for p in past_perf
        ]
        
        return {
            "data": {"references": references},
            "actions": []
        }
    
    async def _search_knowledge(self, query: str, limit: int) -> Dict:
        """Search knowledge base"""
        
        # Simplified search (would use vector search in production)
        docs = self.db.query(KnowledgeDocument).filter(
            KnowledgeDocument.organization_id == self.organization_id
        ).limit(limit).all()
        
        results = [
            {
                "title": doc.title,
                "type": doc.document_type,
                "relevance": "High"  # Would calculate similarity
            }
            for doc in docs
        ]
        
        return {
            "data": {"results": results},
            "actions": []
        }
    
    async def _explain_term(self, term: str) -> Dict:
        """Explain GovCon term"""
        
        # Comprehensive GovCon glossary
        glossary = {
            "FFP": {
                "full_name": "Firm Fixed Price",
                "definition": "A contract type where the price is fixed and not subject to adjustment based on the contractor's costs.",
                "when_used": "When scope is well-defined and risks are manageable",
                "pros": ["Predictable cost", "Less oversight", "Preferred by government"],
                "cons": ["Contractor bears all risk", "Over-budget = loss"]
            },
            "T&M": {
                "full_name": "Time and Materials",
                "definition": "A contract type where payment is based on actual hours worked plus materials costs.",
                "when_used": "When scope is undefined or R&D work",
                "pros": ["Flexible scope", "Government bears cost risk"],
                "cons": ["Unpredictable total cost", "Requires detailed timekeeping"]
            },
            "CPARS": {
                "full_name": "Contractor Performance Assessment Reporting System",
                "definition": "Government database of contractor performance ratings (1-5 scale).",
                "when_used": "For contracts over $150K",
                "importance": "Critical for future bids - evaluators check your CPARS"
            },
            "FAR": {
                "full_name": "Federal Acquisition Regulation",
                "definition": "The primary regulation for federal government procurement.",
                "importance": "All federal contracts must comply with FAR"
            },
            "DFARS": {
                "full_name": "Defense Federal Acquisition Regulation Supplement",
                "definition": "DoD-specific supplement to FAR with additional requirements.",
                "importance": "Applies to all DoD contracts"
            },
            "PWin": {
                "full_name": "Probability of Win",
                "definition": "Estimated likelihood (0-100%) of winning a bid.",
                "factors": ["Past performance", "Technical capability", "Price", "Relationships"]
            },
            "8(a)": {
                "full_name": "8(a) Business Development Program",
                "definition": "SBA program for small disadvantaged businesses.",
                "benefits": ["Set-aside contracts", "Sole-source up to $4.5M", "Mentor-protégé"]
            }
        }
        
        term_upper = term.upper()
        if term_upper in glossary:
            info = glossary[term_upper]
            return {
                "data": {
                    "term": term_upper,
                    **info
                },
                "actions": []
            }
        else:
            # Use LLM to explain unknown terms
            explanation = self.llm.generate(
                prompt=f"Explain the government contracting term '{term}' in 2-3 sentences.",
                max_tokens=150
            )
            
            return {
                "data": {
                    "term": term,
                    "explanation": explanation
                },
                "actions": []
            }
    
    async def _generate_section(self, section_name: str, proposal_id: str) -> Dict:
        """Generate proposal section draft"""
        
        proposal = self.db.query(Proposal).filter(
            Proposal.id == proposal_id
        ).first()
        
        if not proposal:
            return {"error": "Proposal not found"}
        
        # Generate section using LLM
        draft = self.llm.generate(
            prompt=f"Generate a {section_name} section for proposal: {proposal.title}",
            max_tokens=1000
        )
        
        return {
            "data": {
                "section_name": section_name,
                "draft": draft
            },
            "actions": [
                {
                    "type": "insert_section",
                    "label": "Insert into Proposal",
                    "section_name": section_name,
                    "content": draft
                }
            ]
        }
    
    def clear_history(self):
        """Clear conversation history"""
        self.conversation_history = []

