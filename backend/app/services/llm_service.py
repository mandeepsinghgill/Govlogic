"""
Advanced LLM Service - Production-Grade Multi-Provider AI Integration
Supports OpenAI, Anthropic, and local models with advanced features
"""
from typing import Optional, List, Dict, Any, Callable
from openai import OpenAI
import anthropic
import json
import os
import asyncio
from functools import wraps
import time


def retry_on_failure(max_retries: int = 3, delay: float = 1.0):
    """Decorator for retrying failed LLM calls"""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_retries - 1:
                        raise
                    print(f"LLM call failed (attempt {attempt + 1}/{max_retries}): {e}")
                    await asyncio.sleep(delay * (attempt + 1))
            return None
        return wrapper
    return decorator


class LLMService:
    """Advanced service for interacting with multiple LLM providers"""
    
    def __init__(self):
        # Initialize clients
        self.openai_client = None
        self.anthropic_client = None
        
        openai_key = os.getenv("OPENAI_API_KEY")
        anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        
        if openai_key:
            self.openai_client = OpenAI(api_key=openai_key)
        
        if anthropic_key:
            self.anthropic_client = anthropic.Anthropic(api_key=anthropic_key)
        
        # Model configurations
        self.models = {
            "openai": {
                "gpt-4o": {"max_tokens": 128000, "cost_per_1k": 0.005},
                "gpt-4o-mini": {"max_tokens": 128000, "cost_per_1k": 0.00015},
                "gpt-4-turbo": {"max_tokens": 128000, "cost_per_1k": 0.01},
            },
            "anthropic": {
                "claude-3-5-sonnet-20241022": {"max_tokens": 200000, "cost_per_1k": 0.003},
                "claude-3-opus-20240229": {"max_tokens": 200000, "cost_per_1k": 0.015},
                "claude-3-haiku-20240307": {"max_tokens": 200000, "cost_per_1k": 0.00025},
            }
        }
        
        # Default models
        self.default_provider = "openai"
        self.default_model = "gpt-4o"
        
        # Usage tracking
        self.usage_stats = {
            "total_calls": 0,
            "total_tokens": 0,
            "total_cost": 0.0
        }
    
    @retry_on_failure(max_retries=3, delay=2.0)
    async def generate_completion(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        provider: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        json_mode: bool = False,
        functions: Optional[List[Dict]] = None,
        stream: bool = False
    ) -> str:
        """
        Generate completion from LLM with advanced options
        
        Args:
            prompt: User prompt
            system_prompt: System prompt (optional)
            model: Model name (optional, uses default if not specified)
            provider: Provider name (openai/anthropic)
            temperature: Sampling temperature (0.0-2.0)
            max_tokens: Maximum tokens to generate
            json_mode: Force JSON output
            functions: Function definitions for function calling
            stream: Stream response (for real-time UI)
        """
        
        provider = provider or self.default_provider
        model = model or self.default_model
        
        start_time = time.time()
        
        try:
            if provider == "openai":
                result = await self._openai_completion(
                    prompt, system_prompt, model, temperature, max_tokens, json_mode, functions, stream
                )
            elif provider == "anthropic":
                result = await self._anthropic_completion(
                    prompt, system_prompt, model, temperature, max_tokens, stream
                )
            else:
                raise ValueError(f"Unsupported provider: {provider}")
            
            # Track usage
            self.usage_stats["total_calls"] += 1
            elapsed = time.time() - start_time
            
            print(f"LLM call completed in {elapsed:.2f}s ({provider}/{model})")
            
            return result
        
        except Exception as e:
            print(f"LLM error: {e}")
            raise
    
    async def _openai_completion(
        self,
        prompt: str,
        system_prompt: Optional[str],
        model: str,
        temperature: float,
        max_tokens: int,
        json_mode: bool,
        functions: Optional[List[Dict]],
        stream: bool
    ) -> str:
        """OpenAI completion with advanced features"""
        
        if not self.openai_client:
            raise ValueError("OpenAI client not initialized. Set OPENAI_API_KEY environment variable.")
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        kwargs = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": stream
        }
        
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}
        
        if functions:
            kwargs["functions"] = functions
            kwargs["function_call"] = "auto"
        
        response = self.openai_client.chat.completions.create(**kwargs)
        
        if stream:
            # Return generator for streaming
            return response
        else:
            return response.choices[0].message.content
    
    async def _anthropic_completion(
        self,
        prompt: str,
        system_prompt: Optional[str],
        model: str,
        temperature: float,
        max_tokens: int,
        stream: bool
    ) -> str:
        """Anthropic completion"""
        
        if not self.anthropic_client:
            raise ValueError("Anthropic client not initialized. Set ANTHROPIC_API_KEY environment variable.")
        
        kwargs = {
            "model": model,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": [{"role": "user", "content": prompt}],
            "stream": stream
        }
        
        if system_prompt:
            kwargs["system"] = system_prompt
        
        response = self.anthropic_client.messages.create(**kwargs)
        
        if stream:
            return response
        else:
            return response.content[0].text
    
    async def extract_requirements(self, rfp_text: str) -> List[Dict[str, Any]]:
        """
        Extract requirements from RFP text using advanced NLP
        
        Returns list of requirements with:
        - id: Unique identifier
        - text: Requirement text
        - type: mandatory/desirable/informational
        - section: Section reference
        - keywords: Extracted keywords
        - compliance_level: Critical/Important/Nice-to-have
        """
        
        system_prompt = """You are an expert at analyzing government RFPs and extracting requirements.

Extract ALL requirements marked with:
- 'shall' (mandatory)
- 'must' (mandatory)
- 'will' (mandatory)
- 'should' (desirable)
- 'may' (optional)

For each requirement, provide:
1. Unique ID (REQ-001, REQ-002, etc.)
2. Full requirement text
3. Type (mandatory/desirable/optional)
4. Section reference (e.g., "L.4.2")
5. Keywords (list of key terms)
6. Compliance level (critical/important/nice-to-have)

Be thorough - missing a requirement could lose the bid."""
        
        prompt = f"""Extract all requirements from this RFP text:

{rfp_text[:12000]}

Return as JSON array with structure:
{{
    "requirements": [
        {{
            "id": "REQ-001",
            "text": "The contractor shall...",
            "type": "mandatory",
            "section": "L.4.2",
            "keywords": ["security", "encryption"],
            "compliance_level": "critical"
        }}
    ]
}}"""
        
        response = await self.generate_completion(
            prompt=prompt,
            system_prompt=system_prompt,
            json_mode=True,
            temperature=0.2,  # Low temperature for accuracy
            max_tokens=4000
        )
        
        try:
            data = json.loads(response)
            return data.get("requirements", [])
        except json.JSONDecodeError:
            print("Failed to parse requirements JSON")
            return []
    
    async def generate_compliance_matrix(
        self,
        requirements: List[Dict[str, Any]],
        outline: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Generate compliance matrix mapping requirements to proposal sections
        
        Returns list of mappings:
        - requirement_id: REQ-001
        - requirement_text: Brief text
        - proposal_section: Section number
        - proposal_section_title: Section title
        - compliance_approach: How we'll comply
        - page_reference: TBD (filled during writing)
        """
        
        system_prompt = """You are an expert at creating proposal compliance matrices.

Map each requirement to the most appropriate proposal section.
Consider:
- Where the requirement is best addressed
- Logical flow of the proposal
- Evaluation criteria alignment
- Avoiding redundancy

Provide a clear compliance approach for each requirement."""
        
        prompt = f"""Create a compliance matrix for these requirements:

Requirements (first 50):
{json.dumps(requirements[:50], indent=2)}

Proposal Outline:
{json.dumps(outline, indent=2)}

Return JSON array with structure:
{{
    "matrix": [
        {{
            "requirement_id": "REQ-001",
            "requirement_text": "Brief text...",
            "proposal_section": "2.1",
            "proposal_section_title": "Technical Approach",
            "compliance_approach": "We will comply by...",
            "page_reference": "TBD"
        }}
    ]
}}"""
        
        response = await self.generate_completion(
            prompt=prompt,
            system_prompt=system_prompt,
            json_mode=True,
            temperature=0.3,
            max_tokens=4000
        )
        
        try:
            data = json.loads(response)
            return data.get("matrix", [])
        except json.JSONDecodeError:
            return []
    
    async def generate_proposal_section(
        self,
        section_title: str,
        requirements: List[str],
        knowledge_context: str,
        past_performance: Optional[List[Dict]] = None,
        word_limit: Optional[int] = None,
        tone: str = "professional"
    ) -> Dict[str, Any]:
        """
        Generate a proposal section using Shipley methodology
        
        Returns:
        - content: Section text
        - word_count: Actual word count
        - citations: List of citations used
        - discriminators: Highlighted competitive advantages
        - compliance_coverage: Which requirements were addressed
        """
        
        system_prompt = """You are an EXPERT government proposal writer following the Shipley method.

CRITICAL RULES:
1. Write in evaluator-first language (what evaluators want to see)
2. Use Feature-Benefit-Proof structure for every claim
3. Cite EVERY claim: [RFP:X.X] for RFP requirements, [KB:doc#page] for knowledge base
4. **Bold** all discriminators (competitive advantages)
5. Use active voice, present tense
6. Write at 12th grade reading level (Flesch-Kincaid)
7. Quantify outcomes (numbers, percentages, metrics)
8. Address "So what?" - why should evaluators care?
9. Use action graphics (described in [GRAPHIC: description])
10. NO HALLUCINATIONS - only use provided context

Structure:
- Opening: Clear statement of what you'll do
- Body: Feature-Benefit-Proof for each requirement
- Closing: Summary of value proposition"""
        
        word_limit_text = f"\nTARGET WORD COUNT: {word_limit} words (strict limit)" if word_limit else ""
        
        past_perf_text = ""
        if past_performance:
            past_perf_text = f"\n\nPast Performance References:\n{json.dumps(past_performance, indent=2)}"
        
        prompt = f"""Write a proposal section for: {section_title}

Requirements to address:
{chr(10).join(f"- {req}" for req in requirements)}

Knowledge base context:
{knowledge_context[:6000]}
{past_perf_text}
{word_limit_text}

Write the section content now (include citations):"""
        
        response = await self.generate_completion(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.7,
            max_tokens=3000
        )
        
        # Parse response to extract metadata
        word_count = len(response.split())
        citations = self._extract_citations(response)
        discriminators = self._extract_discriminators(response)
        
        return {
            "content": response,
            "word_count": word_count,
            "citations": citations,
            "discriminators": discriminators,
            "requirements_addressed": len(requirements)
        }
    
    def _extract_citations(self, text: str) -> List[str]:
        """Extract citations from text"""
        import re
        citations = re.findall(r'\[(RFP|KB):[^\]]+\]', text)
        return list(set(citations))
    
    def _extract_discriminators(self, text: str) -> List[str]:
        """Extract bolded discriminators from text"""
        import re
        discriminators = re.findall(r'\*\*([^*]+)\*\*', text)
        return discriminators
    
    async def red_team_review(
        self,
        proposal_text: str,
        requirements: List[Dict[str, Any]],
        evaluation_criteria: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Perform comprehensive red team review of proposal
        
        Returns:
        - overall_score: 0-100
        - color: Red/Yellow/Green
        - strengths: List of strengths
        - weaknesses: List of weaknesses with severity
        - risks: List of risks
        - missing_items: Critical missing content
        - recommendations: Actionable improvements
        - section_scores: Score by section
        """
        
        system_prompt = """You are a RUTHLESS Red Team reviewer for government proposals.

Your job is to find EVERY weakness, risk, and missing item.

Evaluate:
1. Compliance - Are all requirements addressed?
2. Clarity - Is it easy to understand and score?
3. Credibility - Are claims backed by evidence?
4. Competitiveness - Will this beat competitors?
5. Completeness - Is anything missing?

Be harsh but fair. Score honestly. Provide actionable feedback.

Color coding:
- Green (80-100): Strong, likely to win
- Yellow (60-79): Competitive but needs work
- Red (0-59): Weak, major issues"""
        
        eval_text = ""
        if evaluation_criteria:
            eval_text = f"\n\nEvaluation Criteria:\n{json.dumps(evaluation_criteria, indent=2)}"
        
        prompt = f"""Red Team review this proposal:

Proposal (excerpt):
{proposal_text[:8000]}

Requirements:
{json.dumps(requirements[:40], indent=2)}
{eval_text}

Provide comprehensive review with:
1. Overall score (0-100)
2. Color (Red/Yellow/Green)
3. Strengths (list, be specific)
4. Weaknesses (list with severity: Critical/Major/Minor)
5. Risks (list with probability and impact)
6. Missing items (critical content not included)
7. Recommendations (actionable, prioritized)

Return as JSON:
{{
    "overall_score": 75,
    "color": "Yellow",
    "strengths": ["..."],
    "weaknesses": [{{"issue": "...", "severity": "Major"}}],
    "risks": [{{"risk": "...", "probability": "Medium", "impact": "High"}}],
    "missing_items": ["..."],
    "recommendations": [{{"priority": 1, "action": "..."}}]
}}"""
        
        response = await self.generate_completion(
            prompt=prompt,
            system_prompt=system_prompt,
            json_mode=True,
            temperature=0.4,
            max_tokens=3000
        )
        
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {
                "overall_score": 0,
                "color": "Red",
                "error": "Failed to parse review"
            }
    
    async def calculate_pwin(
        self,
        opportunity_data: Dict[str, Any],
        company_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Calculate PWin score based on 10 factors using AI analysis
        
        10 Factors:
        1. Customer relationship (0-10)
        2. Incumbent advantage (0-10)
        3. Technical discriminators (0-10)
        4. Past performance relevance (0-10)
        5. Teaming strength (0-10)
        6. Price competitiveness (0-10)
        7. Protest risk (0-10, higher is better)
        8. Capacity (0-10)
        9. Eligibility (0-10)
        10. Strategic fit (0-10)
        
        Returns PWin percentage (0-100%)
        """
        
        system_prompt = """You are an expert at calculating probability of win (PWin) for government contracts.

Analyze the opportunity and company data to score each of the 10 factors (0-10):

1. Customer Relationship - How well do you know the customer?
2. Incumbent Advantage - Are you incumbent or is there a strong incumbent?
3. Technical Discriminators - Do you have unique technical advantages?
4. Past Performance - How relevant is your past performance?
5. Teaming Strength - Do you have strong teaming partners?
6. Price Competitiveness - Can you price competitively?
7. Protest Risk - How likely is a protest? (10 = low risk)
8. Capacity - Do you have capacity to perform?
9. Eligibility - Do you meet all eligibility requirements?
10. Strategic Fit - How well does this fit your strategy?

Calculate overall PWin as weighted average:
- Factors 1-4: 15% each (60% total)
- Factors 5-10: 6.67% each (40% total)

Provide justification for each score."""
        
        prompt = f"""Calculate PWin for this opportunity:

Opportunity:
{json.dumps(opportunity_data, indent=2)}

Company:
{json.dumps(company_data, indent=2)}

Return JSON:
{{
    "pwin_percentage": 68,
    "confidence": "Medium",
    "factors": {{
        "customer_relationship": {{"score": 7, "justification": "..."}},
        "incumbent_advantage": {{"score": 4, "justification": "..."}},
        ...
    }},
    "recommendation": "Pursue|No-Bid",
    "key_risks": ["..."],
    "key_strengths": ["..."]
}}"""
        
        response = await self.generate_completion(
            prompt=prompt,
            system_prompt=system_prompt,
            json_mode=True,
            temperature=0.3,
            max_tokens=2000
        )
        
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {"pwin_percentage": 50, "confidence": "Low", "factors": {}}
    
    async def generate_capture_plan(
        self,
        opportunity_data: Dict[str, Any],
        company_data: Dict[str, Any],
        pwin_analysis: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Generate comprehensive Shipley capture plan
        
        6 Sections:
        1. Situation Analysis (SWOT, competitive landscape)
        2. Win Strategy & Themes (3-5 win themes)
        3. Discriminators (competitive advantages)
        4. Solution Architecture (high-level technical approach)
        5. Teaming Strategy (prime/sub relationships)
        6. Pricing Strategy (price-to-win analysis)
        """
        
        system_prompt = """You are an expert capture manager following the Shipley methodology.

Generate a comprehensive 6-section capture plan that will guide the team to victory.

Each section should be:
- Specific and actionable
- Based on facts and analysis
- Aligned with customer needs
- Focused on winning

This is a strategic document - be thorough."""
        
        pwin_text = ""
        if pwin_analysis:
            pwin_text = f"\n\nPWin Analysis:\n{json.dumps(pwin_analysis, indent=2)}"
        
        prompt = f"""Generate a capture plan for:

Opportunity:
{json.dumps(opportunity_data, indent=2)}

Company:
{json.dumps(company_data, indent=2)}
{pwin_text}

Generate comprehensive capture plan with:

1. SITUATION ANALYSIS
   - Customer needs and pain points
   - Competitive landscape (who else is bidding?)
   - SWOT analysis
   - Market intelligence

2. WIN STRATEGY & THEMES
   - 3-5 win themes (why customer should choose you)
   - Ghost strategies (counter competitors)
   - Proof points for each theme

3. DISCRIMINATORS
   - Technical discriminators
   - Management discriminators
   - Past performance discriminators
   - Price discriminators

4. SOLUTION ARCHITECTURE
   - High-level technical approach
   - Key technologies
   - Innovation areas
   - Risk mitigation

5. TEAMING STRATEGY
   - Prime/sub relationships
   - Partner capabilities
   - Work split
   - Teaming agreements needed

6. PRICING STRATEGY
   - Price-to-win estimate
   - Competitive pricing intelligence
   - Cost drivers
   - Pricing approach (LPTA vs Best Value)

Return as JSON with each section."""
        
        response = await self.generate_completion(
            prompt=prompt,
            system_prompt=system_prompt,
            json_mode=True,
            temperature=0.6,
            max_tokens=4000
        )
        
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {}
    
    def generate(self, prompt: str, **kwargs) -> str:
        """Simple synchronous wrapper for basic generation"""
        import asyncio
        return asyncio.run(self.generate_completion(prompt, **kwargs))


# Singleton instance
llm_service = LLMService()

