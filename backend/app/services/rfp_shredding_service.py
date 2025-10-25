"""
RFP Shredding Service
Automatically parse RFPs to extract Section L (Instructions), Section M (Evaluation), SOW/PWS
Critical component of Gov Supreme Overlord system
"""

from typing import Dict, List, Any, Optional
import re
from datetime import datetime
from pypdf import PdfReader
import docx
from app.services.llm_service import LLMService
from sqlalchemy.orm import Session


class RFPShreddingService:
    """
    RFP "Shredding" - Automated parsing and requirement extraction
    
    Extracts:
    1. Section L - Instructions to Offerors (format, page limits, submission requirements)
    2. Section M - Evaluation Criteria (factors, weights, scoring approach)
    3. SOW/PWS - Statement of Work / Performance Work Statement (tasks, deliverables)
    4. All "shall" and "must" requirements
    5. Key dates, set-asides, contract type
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.llm_service = LLMService()
    
    async def shred_rfp(
        self,
        rfp_file_path: str,
        rfp_metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Main shredding function - extract all requirements from RFP
        
        Args:
            rfp_file_path: Path to RFP file (PDF or DOCX)
            rfp_metadata: Known metadata (solicitation #, agency, etc.)
        
        Returns:
            Comprehensive shredded RFP data structure
        """
        # Step 1: Extract raw text
        rfp_text = self._extract_text_from_file(rfp_file_path)
        
        # Step 2: Identify major sections
        sections = self._identify_sections(rfp_text)
        
        # Step 3: Extract Section L (Instructions)
        section_l = await self._extract_section_l(sections.get("L", ""))
        
        # Step 4: Extract Section M (Evaluation Criteria)
        section_m = await self._extract_section_m(sections.get("M", ""))
        
        # Step 5: Extract SOW/PWS
        sow = await self._extract_sow(sections.get("SOW", "") or sections.get("PWS", ""))
        
        # Step 6: Extract all requirements ("shall", "must", "will")
        requirements = self._extract_requirements(rfp_text)
        
        # Step 7: Extract key dates and metadata
        key_info = self._extract_key_information(rfp_text)
        
        # Step 8: Compile comprehensive shredded data
        shredded_data = {
            "rfp_metadata": rfp_metadata,
            "shredded_at": datetime.utcnow().isoformat(),
            "raw_text_length": len(rfp_text),
            "sections_identified": list(sections.keys()),
            "section_l": section_l,
            "section_m": section_m,
            "sow_pws": sow,
            "all_requirements": requirements,
            "key_information": key_info,
            "compliance_matrix_template": self._generate_compliance_matrix_template(
                section_l, section_m, sow
            )
        }
        
        return shredded_data
    
    def _extract_text_from_file(self, file_path: str) -> str:
        """
        Extract text from PDF or DOCX file
        """
        if file_path.lower().endswith('.pdf'):
            return self._extract_pdf_text(file_path)
        elif file_path.lower().endswith(('.docx', '.doc')):
            return self._extract_docx_text(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_path}")
    
    def _extract_pdf_text(self, pdf_path: str) -> str:
        """Extract text from PDF"""
        text = []
        with open(pdf_path, 'rb') as file:
            pdf_reader = PdfReader(file)
            for page_num, page in enumerate(pdf_reader.pages, start=1):
                page_text = page.extract_text()
                text.append(f"[PAGE {page_num}]\n{page_text}\n")
        
        return "\n".join(text)
    
    def _extract_docx_text(self, docx_path: str) -> str:
        """Extract text from DOCX"""
        doc = docx.Document(docx_path)
        text = []
        
        for i, para in enumerate(doc.paragraphs):
            if para.text.strip():
                text.append(para.text)
        
        return "\n".join(text)
    
    def _identify_sections(self, rfp_text: str) -> Dict[str, str]:
        """
        Identify major RFP sections (L, M, SOW, etc.)
        Uses pattern matching for common federal RFP structure
        """
        sections = {}
        
        # Common patterns for section identification
        patterns = {
            "L": [
                r"SECTION\s+L[:\s]+(.*?)(?=SECTION\s+[A-Z]|$)",
                r"L\.\s+INSTRUCTIONS\s+TO\s+OFFERORS(.*?)(?=SECTION\s+[A-Z]|$)",
                r"PART\s+IV[:\s]+PROVISIONS(.*?)(?=PART\s+[A-Z]|$)"
            ],
            "M": [
                r"SECTION\s+M[:\s]+(.*?)(?=SECTION\s+[A-Z]|$)",
                r"M\.\s+EVALUATION\s+FACTORS(.*?)(?=SECTION\s+[A-Z]|$)",
                r"EVALUATION\s+CRITERIA(.*?)(?=SECTION\s+[A-Z]|$)"
            ],
            "SOW": [
                r"STATEMENT\s+OF\s+WORK(.*?)(?=SECTION\s+[A-Z]|ATTACHMENT|$)",
                r"SOW(.*?)(?=SECTION\s+[A-Z]|ATTACHMENT|$)",
                r"SECTION\s+C[:\s]+(.*?)(?=SECTION\s+[A-Z]|$)"  # Section C is often SOW in federal format
            ],
            "PWS": [
                r"PERFORMANCE\s+WORK\s+STATEMENT(.*?)(?=SECTION\s+[A-Z]|ATTACHMENT|$)",
                r"PWS(.*?)(?=SECTION\s+[A-Z]|ATTACHMENT|$)"
            ]
        }
        
        for section_name, pattern_list in patterns.items():
            for pattern in pattern_list:
                match = re.search(pattern, rfp_text, re.IGNORECASE | re.DOTALL)
                if match:
                    sections[section_name] = match.group(0)
                    break
        
        return sections
    
    async def _extract_section_l(self, section_l_text: str) -> List[Dict[str, Any]]:
        """
        Extract structured instructions from Section L
        """
        if not section_l_text:
            return []
        
        prompt = f"""Extract all instructions from Section L of this RFP.

SECTION L TEXT:
{section_l_text[:15000]}

For each instruction, extract:
1. Clause number (e.g., L.1.1, L.2.3)
2. Instruction title
3. Full requirement text
4. Page limit (if mentioned)
5. Format requirements (if any)
6. Mandatory vs optional

OUTPUT FORMAT (JSON array):
[
  {{
    "clause": "L.1.1",
    "title": "Technical Proposal",
    "requirement": "Full instruction text...",
    "page_limit": 30,
    "format_requirements": ["12pt font", "1-inch margins"],
    "mandatory": true
  }}
]
"""
        
        response = await self.llm_service.generate_structured_output(
            prompt=prompt,
            response_format="json",
            max_tokens=8000
        )
        
        import json
        return json.loads(response)
    
    async def _extract_section_m(self, section_m_text: str) -> List[Dict[str, Any]]:
        """
        Extract evaluation criteria from Section M
        """
        if not section_m_text:
            return []
        
        prompt = f"""Extract all evaluation factors from Section M of this RFP.

SECTION M TEXT:
{section_m_text[:15000]}

For each evaluation factor, extract:
1. Factor number (e.g., M.1, M.2.1)
2. Factor title
3. Weight or relative importance
4. Subfactors (if any)
5. Evaluation approach (e.g., adjectival ratings, color ratings, etc.)

OUTPUT FORMAT (JSON array):
[
  {{
    "factor": "M.1",
    "title": "Technical Approach",
    "weight": "40%",
    "description": "The Government will evaluate...",
    "subfactors": [
      {{
        "subfactor": "M.1.1",
        "title": "Understanding of Requirements",
        "description": "..."
      }}
    ],
    "evaluation_approach": "Adjectival (Excellent, Good, Acceptable, Marginal, Unacceptable)"
  }}
]
"""
        
        response = await self.llm_service.generate_structured_output(
            prompt=prompt,
            response_format="json",
            max_tokens=8000
        )
        
        import json
        return json.loads(response)
    
    async def _extract_sow(self, sow_text: str) -> List[Dict[str, Any]]:
        """
        Extract tasks and requirements from SOW/PWS
        """
        if not sow_text:
            return []
        
        prompt = f"""Extract all tasks and requirements from this Statement of Work (SOW) or Performance Work Statement (PWS).

SOW/PWS TEXT:
{sow_text[:15000]}

For each task or requirement, extract:
1. Task number
2. Task title
3. Description
4. Specific "shall" requirements within the task
5. Deliverables
6. Performance standards (if any)

OUTPUT FORMAT (JSON array):
[
  {{
    "task_number": "1.1",
    "title": "Help Desk Support",
    "description": "Contractor shall provide...",
    "shall_requirements": [
      "Contractor shall respond to tickets within 2 hours",
      "Contractor shall maintain 99% uptime"
    ],
    "deliverables": ["Monthly status report", "Incident logs"],
    "performance_standards": ["Response time: 2 hours", "Resolution rate: 95%"]
  }}
]
"""
        
        response = await self.llm_service.generate_structured_output(
            prompt=prompt,
            response_format="json",
            max_tokens=8000
        )
        
        import json
        return json.loads(response)
    
    def _extract_requirements(self, rfp_text: str) -> List[Dict[str, Any]]:
        """
        Extract all "shall", "must", and "will" requirement statements
        """
        requirements = []
        
        # Patterns for requirements
        patterns = [
            (r"shall\s+([^.]+\.)", "SHALL"),
            (r"must\s+([^.]+\.)", "MUST"),
            (r"will\s+([^.]+\.)", "WILL"),
            (r"is\s+required\s+to\s+([^.]+\.)", "REQUIRED")
        ]
        
        for pattern, req_type in patterns:
            matches = re.finditer(pattern, rfp_text, re.IGNORECASE)
            for match in matches:
                requirement_text = match.group(0)
                
                # Extract context (surrounding text for clarity)
                start = max(0, match.start() - 200)
                end = min(len(rfp_text), match.end() + 200)
                context = rfp_text[start:end]
                
                requirements.append({
                    "type": req_type,
                    "text": requirement_text,
                    "context": context
                })
        
        return requirements
    
    def _extract_key_information(self, rfp_text: str) -> Dict[str, Any]:
        """
        Extract key information like solicitation number, due date, contract type, etc.
        """
        info = {}
        
        # Example patterns (can be expanded)
        patterns = {
            "solicitation_number": r"Solicitation\s+Number[:\s]+(\S+)",
            "due_date": r"Due\s+Date[:\s]+(\d{1,2}/\d{1,2}/\d{4})",
            "contract_type": r"Contract\s+Type[:\s]+(\S+)",
            "set_aside": r"Set-Aside[:\s]+(\S+)"
        }
        
        for key, pattern in patterns.items():
            match = re.search(pattern, rfp_text, re.IGNORECASE)
            if match:
                info[key] = match.group(1).strip()
        
        return info

    def _generate_compliance_matrix_template(
        self,
        section_l: List[Dict[str, Any]],
        section_m: List[Dict[str, Any]],
        sow: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Generate a compliance matrix template from extracted L, M, and SOW data.
        """
        matrix = []

        # 1. Section L Requirements
        for req in section_l:
            matrix.append({
                "source": "Section L (Instructions)",
                "clause": req.get("clause"),
                "requirement": req.get("requirement"),
                "response_section": "", # To be filled by user
                "compliant": False
            })

        # 2. Section M Factors
        for factor in section_m:
            matrix.append({
                "source": "Section M (Evaluation)",
                "clause": factor.get("factor"),
                "requirement": f"Address {factor.get('title')}: {factor.get('description')[:50]}...",
                "response_section": "",
                "compliant": False
            })

        # 3. SOW/PWS Requirements
        for task in sow:
            for req in task.get("shall_requirements", []):
                matrix.append({
                    "source": "SOW/PWS (Task)",
                    "clause": task.get("task_number"),
                    "requirement": req,
                    "response_section": "",
                    "compliant": False
                })

        return matrix

# Example usage (for testing)
if __name__ == "__main__":
    # This block would typically be run outside the FastAPI context
    # For testing, you would mock the database session and LLM service
    print("RFPShreddingService loaded successfully.")

