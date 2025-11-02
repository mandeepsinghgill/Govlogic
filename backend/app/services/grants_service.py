"""
Grants Discovery Service
Fetches federal grant opportunities from SAM.gov and Grants.gov APIs
"""
import os
import logging
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
import requests
from app.config import settings

logger = logging.getLogger(__name__)


class GrantsService:
    """Service for discovering and managing federal grant opportunities"""
    
    def __init__(self):
        self.api_key = os.getenv("SAM_GOV_API_KEY", settings.SAM_GOV_API_KEY)
        # SAM.gov also has grants/financial assistance opportunities
        self.sam_base_url = "https://api.sam.gov/opportunities/v2/search"
        # Grants.gov API (if available - note: Grants.gov primarily uses XML feeds)
        self.grants_gov_xml_feed = "https://www.grants.gov/grantsws/rest/opportunities"
        self.cache = {}
        self.cache_ttl = 300  # 5 minutes
        
        if not self.api_key or self.api_key in ['demo_api_key_12345', 'your_sam_gov_api_key_here']:
            logger.warning("⚠️  SAM_GOV_API_KEY not configured. Using mock grant data.")
        else:
            logger.info(f"✅ Grants API key configured: {self.api_key[:8]}...")
    
    def search_grants(
        self,
        keyword: Optional[str] = None,
        agency: Optional[str] = None,
        limit: int = 20,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Search for federal grant opportunities
        
        Args:
            keyword: Search keyword
            agency: Filter by agency
            limit: Number of results
            offset: Pagination offset
            
        Returns:
            Dict with 'items', 'total', 'page'
        """
        cache_key = f"grants_search_{keyword}_{agency}_{limit}_{offset}"
        
        # Check cache
        if cache_key in self.cache:
            cached_time, cached_data = self.cache[cache_key]
            if (datetime.now() - cached_time).seconds < self.cache_ttl:
                logger.info("📦 Returning cached grant results")
                return cached_data
        
        try:
            if self.api_key and self.api_key not in ['demo_api_key_12345', 'your_sam_gov_api_key_here']:
                # Try real API
                items = self._fetch_from_sam_gov(keyword, agency, limit, offset)
            else:
                # Use mock data
                items = self._get_mock_grants(keyword, agency, limit)
            
            result = {
                'items': items,
                'total': len(items),
                'page': (offset // limit) + 1,
                'limit': limit,
                'offset': offset
            }
            
            # Cache result
            self.cache[cache_key] = (datetime.now(), result)
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Error searching grants: {str(e)}")
            # Fall back to mock data
            return {
                'items': self._get_mock_grants(keyword, agency, limit),
                'total': 4,
                'page': 1,
                'limit': limit,
                'offset': offset,
                'source': 'Mock (API unavailable)'
            }
    
    def get_grant_detail(self, grant_id: str) -> Dict[str, Any]:
        """
        Get detailed information about a specific grant
        
        Args:
            grant_id: Grant funding opportunity number or ID
            
        Returns:
            Detailed grant information
        """
        try:
            if self.api_key and self.api_key not in ['demo_api_key_12345']:
                return self._fetch_grant_detail_from_api(grant_id)
            else:
                return self._get_mock_grant_detail(grant_id)
        except Exception as e:
            logger.error(f"❌ Error fetching grant detail: {str(e)}")
            return self._get_mock_grant_detail(grant_id)
    
    def _fetch_from_sam_gov(
        self,
        keyword: Optional[str],
        agency: Optional[str],
        limit: int,
        offset: int
    ) -> List[Dict[str, Any]]:
        """Fetch grants from SAM.gov API v2"""
        
        params = {
            'api_key': self.api_key,
            'limit': limit,
            'offset': offset,
            'postedFrom': (datetime.now() - timedelta(days=90)).strftime('%m/%d/%Y'),
            'postedTo': datetime.now().strftime('%m/%d/%Y'),
            # Filter for financial assistance / grants (not contracts)
            'ptype': 'g,s',  # g=Grants, s=Special Notices
        }
        
        if keyword:
            params['q'] = keyword
        
        if agency:
            params['deptname'] = agency
        
        logger.info(f"🔄 Fetching grants from SAM.gov: {params}")
        
        try:
            response = requests.get(
                self.sam_base_url,
                params=params,
                headers={'Accept': 'application/json'},
                timeout=30
            )
            
            logger.info(f"📡 SAM.gov grants response: {response.status_code}")
            
            if response.status_code != 200:
                logger.error(f"❌ SAM.gov API error: {response.status_code}")
                return []
            
            data = response.json()
            opportunities = data.get('opportunitiesData', [])
            
            logger.info(f"✅ SAM.gov returned {len(opportunities)} grants")
            
            # Transform to our format
            return [self._transform_grant(opp) for opp in opportunities]
            
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ SAM.gov request failed: {str(e)}")
            return []
    
    def _transform_grant(self, opp: Dict[str, Any]) -> Dict[str, Any]:
        """Transform SAM.gov opportunity to grant format"""
        return {
            'id': opp.get('noticeId', ''),
            'title': opp.get('title', ''),
            'agency': opp.get('department', opp.get('subtierName', '')),
            'funding_opportunity_number': opp.get('solicitationNumber', opp.get('noticeId', '')),
            'award_ceiling': opp.get('awardCeiling'),
            'award_floor': opp.get('awardFloor'),
            'deadline': opp.get('responseDeadLine', opp.get('archiveDate')),
            'posted_date': opp.get('postedDate', ''),
            'description': opp.get('description', ''),
            'synopsis': opp.get('description', '')[:500],
            'category': opp.get('classificationCode', ''),
            'cfda_numbers': opp.get('cfdaNumbers', []),
            'estimated_funding': opp.get('awardCeiling'),
            'url': opp.get('uiLink', f"https://sam.gov/opp/{opp.get('noticeId', '')}/view"),
            'source': 'SAM.gov'
        }
    
    def _fetch_grant_detail_from_api(self, grant_id: str) -> Dict[str, Any]:
        """Fetch detailed grant information from API"""
        # Similar structure to opportunity detail fetch
        params = {
            'api_key': self.api_key,
            'noticeid': grant_id
        }
        
        try:
            response = requests.get(
                self.sam_base_url,
                params=params,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                opportunities = data.get('opportunitiesData', [])
                if opportunities:
                    grant = opportunities[0]
                    return self._transform_grant_detail(grant)
            
            return self._get_mock_grant_detail(grant_id)
            
        except Exception as e:
            logger.error(f"❌ Error fetching grant detail: {str(e)}")
            return self._get_mock_grant_detail(grant_id)
    
    def _transform_grant_detail(self, grant: Dict[str, Any]) -> Dict[str, Any]:
        """Transform detailed grant data"""
        basic_info = self._transform_grant(grant)
        
        # Add additional detail fields
        basic_info.update({
            'full_description': grant.get('description', ''),
            'eligibility': grant.get('additionalInformation', {}).get('eligibility', ''),
            'contact_info': {
                'name': grant.get('pointOfContact', {}).get('fullName', ''),
                'email': grant.get('pointOfContact', {}).get('email', ''),
                'phone': grant.get('pointOfContact', {}).get('phone', '')
            },
            'attachments': grant.get('resourceLinks', []),
            'set_aside': grant.get('typeOfSetAside', ''),
            'place_of_performance': grant.get('placeOfPerformance', {}),
            'award_date': grant.get('awardDate', ''),
            'period_of_performance': grant.get('archiveDate', '')
        })
        
        return basic_info
    
    def _get_mock_grants(
        self,
        keyword: Optional[str],
        agency: Optional[str],
        limit: int
    ) -> List[Dict[str, Any]]:
        """Return mock grant data for testing"""
        
        mock_grants = [
            {
                'id': 'NIH-2024-001',
                'title': 'Healthcare Innovation Research Grant',
                'agency': 'National Institutes of Health (NIH)',
                'funding_opportunity_number': 'NIH-2024-001',
                'award_ceiling': 2500000,
                'award_floor': 500000,
                'deadline': (datetime.now() + timedelta(days=45)).strftime('%Y-%m-%d'),
                'posted_date': (datetime.now() - timedelta(days=15)).strftime('%Y-%m-%d'),
                'description': 'Research grant for innovative healthcare solutions addressing critical public health challenges. Focus areas include digital health, personalized medicine, and health equity.',
                'synopsis': 'Research grant for innovative healthcare solutions addressing critical public health challenges.',
                'category': 'Health',
                'cfda_numbers': ['93.310'],
                'estimated_funding': 2500000,
                'url': 'https://grants.gov/view/NIH-2024-001',
                'source': 'Mock'
            },
            {
                'id': 'DOE-EERE-2024-002',
                'title': 'Clean Energy Technology Development',
                'agency': 'Department of Energy (DOE)',
                'funding_opportunity_number': 'DOE-EERE-2024-002',
                'award_ceiling': 5000000,
                'award_floor': 1000000,
                'deadline': (datetime.now() + timedelta(days=60)).strftime('%Y-%m-%d'),
                'posted_date': (datetime.now() - timedelta(days=10)).strftime('%Y-%m-%d'),
                'description': 'Funding for development of clean energy technologies including solar, wind, and energy storage systems. Priority given to solutions with commercial viability.',
                'synopsis': 'Funding for development of clean energy technologies including solar, wind, and energy storage.',
                'category': 'Energy',
                'cfda_numbers': ['81.087'],
                'estimated_funding': 5000000,
                'url': 'https://grants.gov/view/DOE-EERE-2024-002',
                'source': 'Mock'
            },
            {
                'id': 'HUD-CDBG-2024-003',
                'title': 'Community Development Block Grant',
                'agency': 'Department of Housing and Urban Development (HUD)',
                'funding_opportunity_number': 'HUD-CDBG-2024-003',
                'award_ceiling': 1000000,
                'award_floor': 250000,
                'deadline': (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d'),
                'posted_date': (datetime.now() - timedelta(days=20)).strftime('%Y-%m-%d'),
                'description': 'Community development funding for affordable housing, infrastructure improvements, and economic development in low-income communities.',
                'synopsis': 'Community development funding for affordable housing and infrastructure improvements.',
                'category': 'Community Development',
                'cfda_numbers': ['14.218'],
                'estimated_funding': 1000000,
                'url': 'https://grants.gov/view/HUD-CDBG-2024-003',
                'source': 'Mock'
            },
            {
                'id': 'NSF-EDU-2024-004',
                'title': 'STEM Education Advancement Program',
                'agency': 'National Science Foundation (NSF)',
                'funding_opportunity_number': 'NSF-EDU-2024-004',
                'award_ceiling': 750000,
                'award_floor': 150000,
                'deadline': (datetime.now() + timedelta(days=75)).strftime('%Y-%m-%d'),
                'posted_date': (datetime.now() - timedelta(days=5)).strftime('%Y-%m-%d'),
                'description': 'Grant program to advance STEM education through innovative teaching methods, curriculum development, and student engagement initiatives.',
                'synopsis': 'Grant program to advance STEM education through innovative teaching methods and curriculum development.',
                'category': 'Education',
                'cfda_numbers': ['47.076'],
                'estimated_funding': 750000,
                'url': 'https://grants.gov/view/NSF-EDU-2024-004',
                'source': 'Mock'
            }
        ]
        
        # Simple filtering (handle None values safely)
        filtered = mock_grants
        if keyword:
            keyword_lower = keyword.lower()
            filtered = [g for g in filtered if 
                       (g.get('title') and keyword_lower in g['title'].lower()) or 
                       (g.get('description') and keyword_lower in g['description'].lower())]
        if agency:
            agency_lower = agency.lower()
            filtered = [g for g in filtered if g.get('agency') and agency_lower in g['agency'].lower()]
        
        return filtered[:limit]
    
    def _get_mock_grant_detail(self, grant_id: str) -> Dict[str, Any]:
        """Return detailed mock grant data"""
        
        mock_grants = self._get_mock_grants(None, None, 10)
        
        # Find matching grant
        grant = next((g for g in mock_grants if g['id'] == grant_id or g['funding_opportunity_number'] == grant_id), None)
        
        if not grant:
            grant = mock_grants[0] if mock_grants else {}
        
        # Add detailed information
        grant.update({
            'full_description': grant.get('description', '') + '\n\nThis is a comprehensive grant opportunity with multiple funding tracks and application requirements. Applicants must demonstrate organizational capacity, technical expertise, and a clear plan for project sustainability.',
            'eligibility': 'Eligible applicants include state and local governments, educational institutions, non-profit organizations, and tribal entities. Applicants must be registered in SAM.gov and Grants.gov.',
            'contact_info': {
                'name': 'Grant Program Officer',
                'email': 'grants@agency.gov',
                'phone': '202-555-0100'
            },
            'attachments': [
                {'title': 'Full Notice of Funding Opportunity (NOFO)', 'url': f"https://grants.gov/{grant_id}/nofo.pdf"},
                {'title': 'Application Instructions', 'url': f"https://grants.gov/{grant_id}/instructions.pdf"},
                {'title': 'Budget Template', 'url': f"https://grants.gov/{grant_id}/budget.xlsx"}
            ],
            'set_aside': 'Open to all eligible entities',
            'place_of_performance': {'country': 'USA', 'state': 'Any'},
            'award_date': (datetime.now() + timedelta(days=120)).strftime('%Y-%m-%d'),
            'period_of_performance': '36 months',
            'mockGenerated': True
        })
        
        return grant


# Global instance
grants_service = GrantsService()

