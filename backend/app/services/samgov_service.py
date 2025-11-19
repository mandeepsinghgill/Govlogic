"""
SAM.gov API Integration Service
Fetches opportunities from SAM.gov API with caching and error handling
"""
import os
import json
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
from app.config import settings
import logging

import requests
import json

logger = logging.getLogger(__name__)


class SAMGovService:
    """Service for interacting with SAM.gov API"""
    
    def __init__(self):
        self.api_key = os.getenv("SAM_GOV_API_KEY", settings.SAM_GOV_API_KEY)
        print(f"SAM_GOV_API_KEY: {self.api_key}")
        # SAM.gov Opportunities API v2 (Updated endpoint as per user requirement)
        # Use GET with query params; API key provided via 'api_key' parameter
        self.base_url = "https://api.sam.gov/opportunities/v2/search"
        self.base_url_v1 = "https://api.sam.gov/prod/opp/v1/opportunities/search"  # Fallback
        self.cache = {}
        self.cache_ttl = 300  # 5 minutes cache for search results

        if not self.api_key or self.api_key in ['demo_api_key_12345', 'your_sam_gov_api_key_here', '3wLjNRkUoBtpPEymw0LphKvRmAayb3Lk8byG0b4J']:
            logger.warning("⚠️  SAM_GOV_API_KEY not configured or using demo key. API calls will fail.")
            logger.warning("📝 Get a real API key from: https://open.gsa.gov/api/opportunities-api/")
        else:
            logger.info(f"✅ SAM.gov API key configured: {self.api_key[:8]}...")
    
    def get_top_opportunities(
        self,
        limit: int = 10,
        min_pwin: Optional[int] = 60,
        use_cache: bool = True
    ) -> Dict[str, Any]:
        """
        Fetch top opportunities from SAM.gov
        
        Args:
            limit: Number of opportunities to return
            min_pwin: Minimum PWin score filter
            use_cache: Whether to use cached results
            
        Returns:
            Dict with 'items', 'total', and 'page'
        """
        cache_key = f"top_opportunities_{limit}_{min_pwin}"
        
        # Check cache
        if use_cache and cache_key in self.cache:
            cached_data, cached_time = self.cache[cache_key]
            if datetime.now() - cached_time < timedelta(seconds=self.cache_ttl):
                logger.info("📦 Returning cached SAM.gov opportunities")
                return cached_data
        
        # Fetch from API
        try:
            opportunities = self._fetch_from_api(limit=limit)

            # Transform and score opportunities
            items = []
            for opp in opportunities:
                transformed = self._transform_opportunity(opp)
                # Simple scoring based on contract value and set-aside type
                transformed['pwin_score'] = self._calculate_simple_pwin(opp)

                if min_pwin is None or transformed['pwin_score'] >= min_pwin:
                    items.append(transformed)
            
            result = {
                'items': items[:limit],
                'total': len(items),
                'page': 1,
                'source': 'SAM.gov'
            }
            
            # Cache the result
            self.cache[cache_key] = (result, datetime.now())
            logger.info(f"✅ Retrieved {len(items)} opportunities from SAM.gov")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ SAM.gov API error: {str(e)}")
            # Return mock data as fallback
            return self._get_fallback_opportunities(limit)
    
    def search_opportunities(
        self,
        page: int = 1,
        limit: int = 20,
        naics_code: Optional[str] = None,
        keyword: Optional[str] = None,
        posted_from: Optional[str] = None,
        posted_to: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Search opportunities with filters and pagination
        
        Returns:
            Dict with paginated results
        """
        try:
            offset = (page - 1) * limit
            opportunities = self._fetch_from_api(
                limit=limit,
                offset=offset,
                naics_code=naics_code,
                keyword=keyword,
                posted_from=posted_from,
                posted_to=posted_to
            )

            items = [self._transform_opportunity(opp) for opp in opportunities]
            
            return {
                'items': items,
                'total': len(items),  # SAM.gov doesn't always provide total
                'page': page,
                'limit': limit,
                'source': 'SAM.gov'
            }
            
        except Exception as e:
            logger.error(f"❌ SAM.gov search error: {str(e)}")
            # Only return mock data if API key is not configured
            if not self.api_key:
                logger.warning("⚠️  No SAM.gov API key configured, returning mock data")
                return self._get_fallback_opportunities(limit)
            else:
                # API key is configured but call failed - raise error
                logger.error(f"❌ SAM.gov API call failed despite having API key: {str(e)}")
                raise e
    
    def get_opportunity_by_id(self, notice_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch a single opportunity with FULL details by notice ID
        Includes description, attachments, clauses, and all contract sections
        """
        if not self.api_key:
            logger.warning("No SAM.gov API key, returning mock data")
            return self._get_mock_opportunity_detail(notice_id)
            
        try:
            # Use the opportunities search endpoint with noticeId filter
            url = self.base_url
            logger.info(f"🔄 Fetching full opportunity details for {notice_id}")

            # Use POST with JSON, and provide API key via header 'apikey'
            response = requests.post(
                url,
                json={
                    'noticeId': notice_id,
                    'limit': 1
                },
                headers={
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'apikey': self.api_key
                },
                timeout=30
            )
            response.raise_for_status()
            data = response.json()

            if data.get('opportunitiesData') and len(data['opportunitiesData']) > 0:
                opp_data = data['opportunitiesData'][0]

                # Transform with full details
                transformed = self._transform_opportunity_detail(opp_data)

                logger.info(f"✅ Retrieved full details for opportunity {notice_id}")
                return transformed

            logger.warning(f"No opportunity found with ID {notice_id}")
            return None
                
        except Exception as e:
            logger.error(f"❌ Error fetching opportunity {notice_id}: {str(e)}")
            # Return mock data as fallback
            return self._get_mock_opportunity_detail(notice_id)
    
    def _transform_opportunity_detail(self, opp: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transform SAM.gov opportunity to detailed format with all sections
        """
        base_transform = self._transform_opportunity(opp)
        
        # Extract additional detailed fields
        base_transform.update({
            'fullDescription': opp.get('description', ''),
            'attachments': opp.get('links', []),
            'resourceLinks': opp.get('resourceLinks', []),
            'additionalInfoLink': opp.get('additionalInfoLink', ''),
            'organizationType': opp.get('organizationType', ''),
            'classificationCode': opp.get('classificationCode', ''),
            'placeOfPerformance': opp.get('placeOfPerformance', {}),
            'pointOfContact': opp.get('pointOfContact', []),
            
            # Contract sections from description
            'sections': self._extract_contract_sections(opp.get('description', '')),
            
            # Metadata
            'archiveDate': opp.get('archiveDate', ''),
            'archiveType': opp.get('archiveType', ''),
            'typeOfSetAside': opp.get('typeOfSetAside', ''),
            'typeOfSetAsideDescription': opp.get('typeOfSetAsideDescription', ''),
        })
        
        return base_transform
    
    def _extract_contract_sections(self, description: str) -> List[Dict[str, Any]]:
        """
        Extract contract sections (H, I, J, K, L) from RFP description
        SAM.gov descriptions often contain structured sections
        """
        sections = []
        
        # Common section markers in government RFPs
        section_patterns = {
            'H': 'Special Contract Requirements',
            'I': 'Contract Clauses',
            'J': 'List of Attachments',
            'K': 'Representations and Certifications',
            'L': 'Instructions, Conditions, and Notices',
            'M': 'Evaluation Factors'
        }
        
        # Try to parse sections from description
        for letter, title in section_patterns.items():
            # Look for section markers like "Section H:", "H.", etc.
            import re
            pattern = rf"(?:Section\s+{letter}|{letter}\.|\b{letter}\b)[\s:]+(.*?)(?=(?:Section\s+[A-Z]|[A-Z]\.|$))"
            matches = re.findall(pattern, description, re.IGNORECASE | re.DOTALL)
            
            if matches:
                content = matches[0].strip()[:500]  # First 500 chars
            else:
                # Generic content if section not found
                content = f"Full details available in the solicitation document. Please review all {title.lower()} carefully."
            
            sections.append({
                'letter': letter,
                'title': title,
                'summary': content if content else f"See solicitation document for {title.lower()}."
            })
        
        return sections
    
    def _get_mock_opportunity_detail(self, notice_id: str) -> Dict[str, Any]:
        """
        Return detailed mock opportunity data for testing
        """
        return {
            'id': notice_id or 'mock-detail-001',
            'title': 'IT Modernization and Cloud Migration Services (MOCK DATA)',
            'synopsis': 'The Department of Defense seeks experienced contractors for enterprise IT modernization.',
            'fullDescription': '''
SOLICITATION NUMBER: FA8771-24-R-0001

The Department of Defense, Air Force is seeking qualified contractors to provide comprehensive IT modernization and cloud migration services.

BACKGROUND:
The Air Force currently operates legacy IT systems across multiple installations. This procurement seeks to modernize these systems through cloud migration, infrastructure upgrades, and implementation of modern DevSecOps practices.

SCOPE OF WORK:
- Assessment of current IT infrastructure (150+ servers, 200TB data)
- Cloud architecture design (AWS/Azure multi-cloud)
- Migration of applications and data
- Security implementation (NIST 800-53, FedRAMP compliance)
- Training and knowledge transfer

DELIVERABLES:
- Migration plan and architecture documentation
- Cloud infrastructure (IaaS/PaaS)
- Security assessment and authorization package
- Operations and maintenance support for 12 months
- Training materials and knowledge transfer sessions

PERIOD OF PERFORMANCE: 24 months (base period 12 months + 1 option year)

ESTIMATED CONTRACT VALUE: $15,000,000

SECTION H - SPECIAL CONTRACT REQUIREMENTS:
All work must comply with DoD security requirements and NIST standards. Cloud environments must achieve FedRAMP Moderate authorization. Contractor personnel must obtain Secret clearances. All data must remain within US boundaries. Buy American Act compliance required for all hardware.

SECTION I - CONTRACT CLAUSES:
This contract incorporates by reference FAR clauses 52.212-4 (Contract Terms and Conditions) and 52.212-5 (Contract Terms and Conditions Required to Implement Statutes). Additional DFARS clauses apply including 252.204-7012 (Cybersecurity for Unclassified Systems).

SECTION J - LIST OF ATTACHMENTS:
1. Statement of Work (SOW)
2. Wage Determination (WD)
3. Past Performance Questionnaire (PPQ)
4. Technical Requirements Matrix
5. Security Requirements Specification
6. Deliverables Schedule
7. Quality Assurance Surveillance Plan (QASP)

SECTION K - REPRESENTATIONS AND CERTIFICATIONS:
Offerors must be registered in SAM.gov and maintain active registration throughout contract performance. Small business status certification required. CMMC Level 2 compliance required. Representations regarding telecommunications equipment (DFARS 252.204-7016) required.

SECTION L - INSTRUCTIONS, CONDITIONS, AND NOTICES:
Proposals due no later than 3:00 PM EST on the date indicated. Late proposals will not be considered. Submit proposals electronically through SAM.gov. Site visit scheduled for 10 days before proposal due date (mandatory for prime contractors). Questions must be submitted in writing no later than 10 days before proposal deadline.

SECTION M - EVALUATION FACTORS:
Proposals will be evaluated based on: (1) Technical Approach (40%), (2) Past Performance (30%), (3) Management Plan (20%), (4) Price (10%). Award will be made to the responsible offeror whose proposal represents the best value to the Government.
            ''',
            'solicitationNumber': 'FA8771-24-R-0001',
            'postedDate': datetime.now().isoformat(),
            'responseDeadline': (datetime.now() + timedelta(days=45)).isoformat(),
            'dueDate': (datetime.now() + timedelta(days=45)).isoformat(),
            'agency': 'Department of Defense',
            'office': 'Air Force',
            'value': 15000000,
            'naicsCode': '541512',
            'setAside': 'Small Business Set-Aside',
            'type': 'Solicitation',
            'url': 'https://sam.gov/opp/mock-detail-001/view',
            'samGovUrl': 'https://sam.gov/opp/mock-detail-001/view',
            'active': True,
            'placeOfPerformance': {
                'city': 'San Antonio',
                'state': 'TX',
                'zip': '78234'
            },
            'pointOfContact': [
                {
                    'type': 'primary',
                    'fullName': 'John Smith',
                    'email': 'john.smith@us.af.mil',
                    'phone': '210-555-0100'
                }
            ],
            'attachments': [
                {'name': 'Statement of Work', 'url': '#'},
                {'name': 'Wage Determination', 'url': '#'},
                {'name': 'Past Performance Questionnaire', 'url': '#'}
            ],
            'sections': [
                {
                    'letter': 'H',
                    'title': 'Special Contract Requirements',
                    'summary': 'All work must comply with DoD security requirements and NIST standards. Cloud environments must achieve FedRAMP Moderate authorization. Contractor personnel must obtain Secret clearances. All data must remain within US boundaries. Buy American Act compliance required for all hardware.'
                },
                {
                    'letter': 'I',
                    'title': 'Contract Clauses',
                    'summary': 'This contract incorporates by reference FAR clauses 52.212-4 (Contract Terms and Conditions) and 52.212-5 (Contract Terms and Conditions Required to Implement Statutes). Additional DFARS clauses apply including 252.204-7012 (Cybersecurity for Unclassified Systems).'
                },
                {
                    'letter': 'J',
                    'title': 'List of Attachments',
                    'summary': '1. Statement of Work (SOW)\n2. Wage Determination (WD)\n3. Past Performance Questionnaire (PPQ)\n4. Technical Requirements Matrix\n5. Security Requirements Specification\n6. Deliverables Schedule\n7. Quality Assurance Surveillance Plan (QASP)'
                },
                {
                    'letter': 'K',
                    'title': 'Representations and Certifications',
                    'summary': 'Offerors must be registered in SAM.gov and maintain active registration throughout contract performance. Small business status certification required. CMMC Level 2 compliance required. Representations regarding telecommunications equipment (DFARS 252.204-7016) required.'
                },
                {
                    'letter': 'L',
                    'title': 'Instructions, Conditions, and Notices',
                    'summary': 'Proposals due no later than 3:00 PM EST on the date indicated. Late proposals will not be considered. Submit proposals electronically through SAM.gov. Site visit scheduled for 10 days before proposal due date (mandatory for prime contractors). Questions must be submitted in writing no later than 10 days before proposal deadline.'
                },
                {
                    'letter': 'M',
                    'title': 'Evaluation Factors',
                    'summary': 'Proposals will be evaluated based on: (1) Technical Approach (40%), (2) Past Performance (30%), (3) Management Plan (20%), (4) Price (10%). Award will be made to the responsible offeror whose proposal represents the best value to the Government.'
                }
            ],
            'mockGenerated': True,
            'note': 'This is mock data. Configure SAM_GOV_API_KEY for real opportunity details.'
        }
    
    def _fetch_from_api(
        self,
        limit: int = 20,
        offset: int = 0,
        naics_code: Optional[str] = None,
        keyword: Optional[str] = None,
        posted_from: Optional[str] = None,
        posted_to: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Internal method to fetch from SAM.gov API v2
        Now uses GET with query parameters instead of POST
        """
        if not self.api_key:
            raise ValueError("SAM_GOV_API_KEY is required")
        
        # Build query parameters for SAM.gov API v2 (uses GET)
        params = {
            'api_key': self.api_key,
            'limit': limit,
            'offset': offset,
            'postedFrom': posted_from or (datetime.now() - timedelta(days=30)).strftime('%m/%d/%Y'),
            'postedTo': posted_to or datetime.now().strftime('%m/%d/%Y'),
            'ptype': 'o',  # Opportunities only
        }

        if naics_code:
            params['ncode'] = naics_code

        if keyword:
            params['q'] = keyword

        logger.info(f"🔄 Fetching from SAM.gov v2: {params}")

        try:
            # v2 API uses GET with query parameters (not POST)
            response = requests.get(
                self.base_url,
                params=params,
                headers={
                    'Accept': 'application/json'
                },
                timeout=30
            )

            # Log the response status for debugging
            logger.info(f"📡 SAM.gov API v2 response status: {response.status_code}")

            if response.status_code == 401 or response.status_code == 403:
                logger.error("❌ SAM.gov API key is invalid or unauthorized")
                logger.error("📝 Get a new API key from: https://open.gsa.gov/api/opportunities-api/")
                raise ValueError("SAM.gov API key is invalid. Please check your API key.")

            response.raise_for_status()
            data = response.json()

            # SAM.gov API v2 returns opportunitiesData array
            opportunities = data.get('opportunitiesData', [])
            logger.info(f"✅ SAM.gov v2 returned {len(opportunities)} opportunities")

            # Transform opportunities to our format
            return [self._transform_opportunity(opp) for opp in opportunities]

        except requests.exceptions.RequestException as e:
            logger.error(f"❌ HTTP request failed: {str(e)}")
            raise e
    
    def _transform_opportunity(self, opp: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transform SAM.gov opportunity to our internal format
        """
        return {
            'id': opp.get('noticeId', ''),
            'title': opp.get('title', ''),
            'synopsis': opp.get('description', '')[:500],  # Truncate
            'description': opp.get('description', ''),
            'solicitationNumber': opp.get('solicitationNumber', ''),
            'postedDate': opp.get('postedDate', ''),
            'responseDeadline': opp.get('responseDeadLine', ''),
            'dueDate': opp.get('responseDeadLine', ''),
            'agency': opp.get('department', ''),
            'office': opp.get('subTier', ''),
            'value': self._extract_value(opp),
            'naicsCode': opp.get('naicsCode', ''),
            'setAside': opp.get('typeOfSetAsideDescription', ''),
            'type': opp.get('type', ''),
            'url': opp.get('uiLink', ''),
            'samGovUrl': opp.get('uiLink', f"https://sam.gov/opp/{opp.get('noticeId', '')}/view"),
            'active': opp.get('active', True),
            'pointOfContact': opp.get('pointOfContact', []),
            'placeOfPerformance': opp.get('placeOfPerformance', {}),
            'pwin_score': self._calculate_simple_pwin(opp),  # Add PWin calculation
        }
    
    def _extract_value(self, opp: Dict[str, Any]) -> Optional[float]:
        """
        Extract or estimate contract value from opportunity
        """
        # Check if award info available
        if 'award' in opp and opp['award'] and 'amount' in opp['award']:
            try:
                amount_str = opp['award']['amount'].replace('$', '').replace(',', '')
                return float(amount_str)
            except (ValueError, AttributeError):
                pass
        
        # Estimate based on NAICS and type
        naics = opp.get('naicsCode', '')
        if naics.startswith('54'):  # Professional services
            return 5000000  # $5M estimate
        elif naics.startswith('33'):  # Manufacturing
            return 10000000  # $10M estimate
        
        return None
    
    def _calculate_simple_pwin(self, opp: Dict[str, Any]) -> int:
        """
        Calculate a simple PWin score (0-100) based on opportunity characteristics
        """
        score = 50  # Base score
        
        # Set-aside increases chances (handle None values)
        set_aside = opp.get('typeOfSetAsideDescription') or ''
        set_aside_lower = set_aside.lower() if set_aside else ''
        if 'small business' in set_aside_lower:
            score += 20
        elif 'woman' in set_aside_lower or 'veteran' in set_aside_lower:
            score += 15
        
        # Recent postings are better
        posted_date = opp.get('postedDate', '')
        if posted_date:
            try:
                posted = datetime.strptime(posted_date[:10], '%Y-%m-%d')
                days_old = (datetime.now() - posted).days
                if days_old < 7:
                    score += 10
                elif days_old < 14:
                    score += 5
            except:
                pass
        
        # Cap at 100
        return min(score, 100)
    
    def _get_fallback_opportunities(self, limit: int = 10) -> Dict[str, Any]:
        """
        Return high-quality mock data when SAM.gov is unavailable
        """
        logger.warning("⚠️  Using fallback mock opportunities data")
        
        mock_opportunities = [
            {
                'id': 'mock-001',
                'title': 'IT Modernization and Cloud Migration Services',
                'synopsis': 'The Department of Defense seeks experienced contractors for enterprise-level IT modernization and cloud migration services.',
                'solicitationNumber': 'FA8771-24-R-0001',
                'postedDate': (datetime.now() - timedelta(days=3)).isoformat(),
                'dueDate': (datetime.now() + timedelta(days=45)).isoformat(),
                'agency': 'Department of Defense',
                'office': 'Air Force',
                'value': 15000000,
                'naicsCode': '541512',
                'setAside': 'Small Business Set-Aside',
                'type': 'Solicitation',
                'url': 'https://sam.gov/opp/mock-001/view',
                'samGovUrl': 'https://sam.gov/opp/mock-001/view',
                'pwin_score': 75,
                'active': True
            },
            {
                'id': 'mock-002',
                'title': 'Cybersecurity Infrastructure Enhancement',
                'synopsis': 'Department of Homeland Security requires comprehensive cybersecurity assessment and infrastructure enhancement services.',
                'solicitationNumber': 'HSHQDC-24-R-00015',
                'postedDate': (datetime.now() - timedelta(days=5)).isoformat(),
                'dueDate': (datetime.now() + timedelta(days=38)).isoformat(),
                'agency': 'Department of Homeland Security',
                'office': 'CISA',
                'value': 8500000,
                'naicsCode': '541512',
                'setAside': 'Small Business Set-Aside',
                'type': 'Solicitation',
                'url': 'https://sam.gov/opp/mock-002/view',
                'samGovUrl': 'https://sam.gov/opp/mock-002/view',
                'pwin_score': 80,
                'active': True
            },
            {
                'id': 'mock-003',
                'title': 'Enterprise Software Development and Maintenance',
                'synopsis': 'GSA seeks qualified vendors for full-stack enterprise software development, maintenance, and DevOps services.',
                'solicitationNumber': 'GSA-024-Q-0042',
                'postedDate': (datetime.now() - timedelta(days=7)).isoformat(),
                'dueDate': (datetime.now() + timedelta(days=30)).isoformat(),
                'agency': 'General Services Administration',
                'office': 'Technology Transformation Services',
                'value': 12000000,
                'naicsCode': '541511',
                'setAside': '8(a) Set-Aside',
                'type': 'Solicitation',
                'url': 'https://sam.gov/opp/mock-003/view',
                'samGovUrl': 'https://sam.gov/opp/mock-003/view',
                'pwin_score': 70,
                'active': True
            },
            {
                'id': 'mock-004',
                'title': 'Data Analytics and Business Intelligence Platform',
                'synopsis': 'Department of Veterans Affairs requires implementation of advanced data analytics and BI platform.',
                'solicitationNumber': 'VA-24-00R-5523',
                'postedDate': (datetime.now() - timedelta(days=2)).isoformat(),
                'dueDate': (datetime.now() + timedelta(days=50)).isoformat(),
                'agency': 'Department of Veterans Affairs',
                'office': 'Office of Information Technology',
                'value': 6500000,
                'naicsCode': '541512',
                'setAside': 'Service-Disabled Veteran-Owned Small Business Set-Aside',
                'type': 'Solicitation',
                'url': 'https://sam.gov/opp/mock-004/view',
                'samGovUrl': 'https://sam.gov/opp/mock-004/view',
                'pwin_score': 85,
                'active': True
            },
            {
                'id': 'mock-005',
                'title': 'Network Infrastructure Upgrade and Support',
                'synopsis': 'NASA seeks contractors for comprehensive network infrastructure upgrade across multiple facilities.',
                'solicitationNumber': 'NASA-24-001-RFP',
                'postedDate': (datetime.now() - timedelta(days=4)).isoformat(),
                'dueDate': (datetime.now() + timedelta(days=42)).isoformat(),
                'agency': 'National Aeronautics and Space Administration',
                'office': 'NASA Headquarters',
                'value': 9200000,
                'naicsCode': '541512',
                'setAside': 'Small Business Set-Aside',
                'type': 'Solicitation',
                'url': 'https://sam.gov/opp/mock-005/view',
                'samGovUrl': 'https://sam.gov/opp/mock-005/view',
                'pwin_score': 72,
                'active': True
            }
        ]
        
        return {
            'items': mock_opportunities[:limit],
            'total': len(mock_opportunities),
            'page': 1,
            'source': 'Mock (SAM.gov unavailable)',
            'mockGenerated': True
        }


# Singleton instance
samgov_service = SAMGovService()

