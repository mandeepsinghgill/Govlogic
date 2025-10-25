"""
Advanced RFP Section Analyzer
AI-powered analysis of RFP sections with smart summaries and requirement extraction
"""
from typing import List, Dict, Optional
from openai import OpenAI
import os
import re
from pathlib import Path

from app.services.document_service import DocumentProcessingService


class RFPAnalyzerService:
    """Analyze RFP documents section by section with AI"""
    
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.doc_service = DocumentProcessingService()
    
    def analyze_rfp(self, file_path: str) -> Dict:
        """
        Analyze entire RFP document
        
        Returns:
            {
                "sections": List[Dict],  # Section-by-section analysis
                "summary": Dict,  # Overall summary
                "requirements": List[Dict],  # Extracted requirements
                "evaluation_criteria": Dict,  # Evaluation factors
                "key_dates": List[Dict]  # Important dates
            }
        """
        
        # Extract text from PDF/DOCX
        full_text = self.doc_service.extract_text(file_path)
        
        # Identify sections
        sections = self._identify_sections(full_text)
        
        # Analyze each section
        analyzed_sections = []
        for section in sections:
            analysis = self._analyze_section(section)
            analyzed_sections.append(analysis)
        
        # Extract requirements
        requirements = self._extract_requirements(full_text, analyzed_sections)
        
        # Extract evaluation criteria
        evaluation = self._extract_evaluation_criteria(full_text, analyzed_sections)
        
        # Extract key dates
        key_dates = self._extract_key_dates(full_text)
        
        # Generate overall summary
        summary = self._generate_overall_summary(analyzed_sections, requirements, evaluation)
        
        return {
            "sections": analyzed_sections,
            "summary": summary,
            "requirements": requirements,
            "evaluation_criteria": evaluation,
            "key_dates": key_dates,
            "total_pages": self._estimate_pages(full_text),
            "read_time_minutes": self._estimate_read_time(full_text)
        }
    
    def _identify_sections(self, text: str) -> List[Dict]:
        """Identify RFP sections using pattern matching"""
        
        sections = []
        
        # Common RFP section patterns
        section_patterns = [
            (r"SECTION\s+([A-Z])[:\s\-]+(.+?)(?=\n)", "section"),
            (r"PART\s+([IVX]+)[:\s\-]+(.+?)(?=\n)", "part"),
            (r"(\d+\.\d+)\s+(.+?)(?=\n)", "numbered"),
        ]
        
        lines = text.split('\n')
        current_section = None
        current_content = []
        
        for i, line in enumerate(lines):
            # Check if this line is a section header
            is_header = False
            for pattern, section_type in section_patterns:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    # Save previous section
                    if current_section:
                        current_section["content"] = '\n'.join(current_content)
                        current_section["end_line"] = i
                        sections.append(current_section)
                    
                    # Start new section
                    current_section = {
                        "type": section_type,
                        "number": match.group(1),
                        "title": match.group(2).strip(),
                        "start_line": i,
                        "content": ""
                    }
                    current_content = []
                    is_header = True
                    break
            
            if not is_header and current_section:
                current_content.append(line)
        
        # Add last section
        if current_section:
            current_section["content"] = '\n'.join(current_content)
            current_section["end_line"] = len(lines)
            sections.append(current_section)
        
        # If no sections found, create a single section
        if not sections:
            sections.append({
                "type": "full",
                "number": "1",
                "title": "Full Document",
                "content": text,
                "start_line": 0,
                "end_line": len(lines)
            })
        
        return sections
    
    def _analyze_section(self, section: Dict) -> Dict:
        """Analyze a single section with AI"""
        
        content = section["content"][:4000]  # Limit for API
        
        prompt = f"""Analyze this RFP section and provide:
1. A concise 2-3 sentence summary
2. Key requirements (if any)
3. Important notes or warnings
4. Estimated importance (High/Medium/Low)

Section: {section['title']}

Content:
{content}

Respond in JSON format:
{{
    "summary": "...",
    "key_requirements": ["req1", "req2"],
    "notes": ["note1", "note2"],
    "importance": "High|Medium|Low",
    "action_required": true|false
}}
"""
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are an expert at analyzing government RFPs."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
                max_tokens=500
            )
            
            import json
            analysis = json.loads(response.choices[0].message.content)
            
            return {
                **section,
                "summary": analysis.get("summary", ""),
                "key_requirements": analysis.get("key_requirements", []),
                "notes": analysis.get("notes", []),
                "importance": analysis.get("importance", "Medium"),
                "action_required": analysis.get("action_required", False),
                "word_count": len(content.split()),
                "read_time_minutes": len(content.split()) // 200
            }
        
        except Exception as e:
            print(f"AI analysis error: {e}")
            return {
                **section,
                "summary": "Analysis unavailable",
                "key_requirements": [],
                "notes": [],
                "importance": "Medium",
                "action_required": False,
                "word_count": len(content.split()),
                "read_time_minutes": len(content.split()) // 200
            }
    
    def _extract_requirements(self, text: str, sections: List[Dict]) -> List[Dict]:
        """Extract all requirements from RFP"""
        
        # Look for Section L (Instructions)
        section_l = next((s for s in sections if 'L' in s.get('number', '')), None)
        
        if section_l:
            content = section_l["content"][:8000]
        else:
            content = text[:8000]
        
        prompt = f"""Extract all proposal requirements from this RFP.

For each requirement, provide:
- Requirement text
- Section reference
- Type (format, content, submission, etc.)
- Mandatory or optional

Content:
{content}

Respond in JSON format:
{{
    "requirements": [
        {{
            "text": "...",
            "section": "L.4.2",
            "type": "content",
            "mandatory": true
        }}
    ]
}}
"""
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are an expert at extracting requirements from RFPs."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.2,
                max_tokens=2000
            )
            
            import json
            result = json.loads(response.choices[0].message.content)
            return result.get("requirements", [])
        
        except Exception as e:
            print(f"Requirement extraction error: {e}")
            return []
    
    def _extract_evaluation_criteria(self, text: str, sections: List[Dict]) -> Dict:
        """Extract evaluation criteria from Section M"""
        
        # Look for Section M (Evaluation)
        section_m = next((s for s in sections if 'M' in s.get('number', '')), None)
        
        if section_m:
            content = section_m["content"][:8000]
        else:
            content = text[:8000]
        
        prompt = f"""Extract evaluation criteria from this RFP.

Provide:
- Evaluation factors
- Point values (if specified)
- Weights/importance
- Subfactors

Content:
{content}

Respond in JSON format:
{{
    "total_points": 100,
    "factors": [
        {{
            "name": "Technical Approach",
            "points": 40,
            "weight": "40%",
            "subfactors": ["Methodology", "Innovation"]
        }}
    ]
}}
"""
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are an expert at analyzing RFP evaluation criteria."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.2,
                max_tokens=1500
            )
            
            import json
            return json.loads(response.choices[0].message.content)
        
        except Exception as e:
            print(f"Evaluation extraction error: {e}")
            return {
                "total_points": 100,
                "factors": []
            }
    
    def _extract_key_dates(self, text: str) -> List[Dict]:
        """Extract important dates from RFP"""
        
        dates = []
        
        # Common date patterns
        date_patterns = [
            (r"(?:due|deadline|submit|response).*?(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})", "deadline"),
            (r"(?:questions|Q&A).*?(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})", "questions_due"),
            (r"(?:site visit|pre-proposal).*?(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})", "site_visit"),
            (r"(?:award|selection).*?(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})", "award_date"),
        ]
        
        for pattern, date_type in date_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches[:3]:  # Limit to first 3 matches
                dates.append({
                    "type": date_type,
                    "date": match,
                    "description": f"{date_type.replace('_', ' ').title()}"
                })
        
        return dates
    
    def _generate_overall_summary(
        self,
        sections: List[Dict],
        requirements: List[Dict],
        evaluation: Dict
    ) -> Dict:
        """Generate overall RFP summary"""
        
        return {
            "total_sections": len(sections),
            "total_requirements": len(requirements),
            "mandatory_requirements": len([r for r in requirements if r.get("mandatory")]),
            "evaluation_factors": len(evaluation.get("factors", [])),
            "total_points": evaluation.get("total_points", 100),
            "high_importance_sections": len([s for s in sections if s.get("importance") == "High"]),
            "estimated_complexity": self._assess_complexity(sections, requirements)
        }
    
    def _assess_complexity(self, sections: List[Dict], requirements: List[Dict]) -> str:
        """Assess overall RFP complexity"""
        
        complexity_score = 0
        
        # More sections = more complex
        complexity_score += min(len(sections) * 5, 30)
        
        # More requirements = more complex
        complexity_score += min(len(requirements) * 2, 40)
        
        # High importance sections = more complex
        high_importance = len([s for s in sections if s.get("importance") == "High"])
        complexity_score += min(high_importance * 10, 30)
        
        if complexity_score >= 70:
            return "High"
        elif complexity_score >= 40:
            return "Medium"
        else:
            return "Low"
    
    def _estimate_pages(self, text: str) -> int:
        """Estimate number of pages (250 words per page)"""
        words = len(text.split())
        return max(1, words // 250)
    
    def _estimate_read_time(self, text: str) -> int:
        """Estimate read time in minutes (200 words per minute)"""
        words = len(text.split())
        return max(1, words // 200)
    
    def search_section(self, sections: List[Dict], query: str) -> List[Dict]:
        """Search for specific content across sections"""
        
        results = []
        query_lower = query.lower()
        
        for section in sections:
            content = section.get("content", "").lower()
            if query_lower in content:
                # Find context around match
                index = content.find(query_lower)
                start = max(0, index - 100)
                end = min(len(content), index + 100)
                context = content[start:end]
                
                results.append({
                    "section": section.get("title"),
                    "section_number": section.get("number"),
                    "context": context,
                    "relevance": "high" if query_lower in section.get("title", "").lower() else "medium"
                })
        
        return results

