"""
Partner Matching & Teaming Service
Search 800K+ SAM.gov contractors, recommend partners, manage teaming agreements
Critical for proposal collaboration and subcontractor management
"""

from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
import httpx
from datetime import datetime, timedelta
from app.config import settings


class PartnerMatchingService:
    """
    Partner Matching & Contractor Database Service
    
    Features:
    1. Search SAM.gov registered contractors (800K+ database)
    2. Filter by NAICS, set-aside status, location, capabilities
    3. Recommend partners based on opportunity requirements
    4. Track teaming agreements & NDAs
    5. Past partner performance tracking
    6. Mentor-protégé relationship management
    """
    
    SAM_GOV_API = "https://api.sam.gov/entity-information/v3/entities"
    
    def __init__(self, db: Session):
        self.db = db
        self.sam_api_key = settings.SAM_GOV_API_KEY if hasattr(settings, 'SAM_GOV_API_KEY') else None
    
    # Simple in-memory cache for SAM.gov results
    _cache = {}
    _cache_ttl = 3600  # 1 hour

    async def search_contractors(
        self,
        query: Dict[str, Any],
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        """
        Search contractors from SAM.gov Entity Management API
        
        Args:
            query: {
                'naics_codes': ['541330', '541512'],
                'set_aside': ['Small Business', '8(a)'],
                'state': 'VA',
                'capabilities': 'cybersecurity',
                'min_past_awards': 5
            }
        
        Returns:
            Paginated contractor results with scores
        """
        import logging
        import json
        logger = logging.getLogger(__name__)
        
        # Create cache key
        cache_key = f"partners_{json.dumps(query, sort_keys=True)}_{page}_{page_size}"
        
        # Check cache
        if cache_key in self._cache:
            cached_data, cached_time = self._cache[cache_key]
            if (datetime.now() - cached_time).total_seconds() < self._cache_ttl:
                logger.info("📦 Returning cached partner search results")
                return cached_data
        
        # Try SAM.gov API first
        if self.sam_api_key:
            try:
                result = await self._search_sam_gov_api(query, page, page_size)
                # Cache the result
                self._cache[cache_key] = (result, datetime.now())
                return result
            except Exception as e:
                logger.warning(f"⚠️  SAM.gov API failed: {str(e)}, using mock data")
        
        # Fallback to mock data
        logger.info("Using mock partner data (SAM_GOV_API_KEY not configured or API failed)")
        result = self._get_mock_contractors(query, page, page_size)
        # Cache mock data too
        self._cache[cache_key] = (result, datetime.now())
        return result
    
    async def _search_sam_gov_api(
        self,
        query: Dict[str, Any],
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        """
        Search SAM.gov Entity Management API v3
        """
        import logging
        logger = logging.getLogger(__name__)
        
        # Build SAM.gov API params
        params = {
            'api_key': self.sam_api_key,
            'includeSections': 'entityRegistration,coreData',
            'format': 'json',
            'page': str(page - 1),  # SAM.gov uses 0-based indexing
            'size': str(min(page_size, 100))  # Max 100 per page
        }
        
        # Add filters
        if query.get('naics_codes') and len(query['naics_codes']) > 0:
            # SAM.gov accepts comma-separated NAICS codes
            params['primaryNaics'] = ','.join(query['naics_codes'][:5])  # Limit to 5
        
        if query.get('state'):
            params['physicalAddressStateOrProvinceCode'] = query['state']
        
        # Map set-aside types to SAM.gov business types
        if query.get('set_aside'):
            business_types = []
            for sa in query['set_aside']:
                if 'Small Business' in sa or 'SB' in sa:
                    business_types.append('2X')  # Small Business
                if '8(a)' in sa or '8a' in sa.lower():
                    business_types.append('A8')  # 8(a)
                if 'HUBZone' in sa:
                    business_types.append('XX')  # HUBZone
                if 'SDVOSB' in sa:
                    business_types.append('QF')  # Service-Disabled Veteran-Owned
                if 'WOSB' in sa:
                    business_types.append('A2')  # Woman-Owned Small Business
            if business_types:
                params['businessTypeCode'] = ','.join(business_types[:3])
        
        # Add keyword search
        if query.get('capabilities'):
            params['q'] = query['capabilities']
        
        logger.info(f"🔄 Searching SAM.gov entities: page={page}, filters={query}")
        
        url = "https://api.sam.gov/entity-information/v3/entities"
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            entities = data.get('entityData', [])
            total_records = data.get('totalRecords', 0)
            
            logger.info(f"✅ SAM.gov returned {len(entities)} entities ({total_records} total)")
            
            # Transform to our format
            contractors = []
            for entity in entities:
                try:
                    core_data = entity.get('coreData', {})
                    entity_reg = entity.get('entityRegistration', {})
                    
                    contractor = {
                        'id': len(contractors) + 1,
                        'uei': core_data.get('ueiSAM', ''),
                        'legal_name': core_data.get('legalBusinessName', ''),
                        'dba': core_data.get('dbaName', ''),
                        'naics': [core_data.get('primaryNaics', '')],
                        'set_aside': self._extract_set_aside(entity_reg),
                        'capabilities': core_data.get('congressionalDistrict', ''),
                        'location': {
                            'city': core_data.get('physicalAddress', {}).get('city', ''),
                            'state': core_data.get('physicalAddress', {}).get('stateOrProvinceCode', ''),
                            'zip': core_data.get('physicalAddress', {}).get('zipCode', ''),
                            'country': core_data.get('physicalAddress', {}).get('countryCode', 'USA')
                        },
                        'contact': {
                            'email': core_data.get('entityContactEmail', ''),
                            'phone': core_data.get('entityContactPhone', '')
                        },
                        'past_awards': {
                            'count': 0,  # Would need FPDS-NG API for this
                            'total_value': 0
                        },
                        'relevance_score': self._calculate_relevance(entity, query)
                    }
                    contractors.append(contractor)
                except Exception as e:
                    logger.warning(f"Error parsing entity: {str(e)}")
                    continue
            
            return {
                'contractors': contractors,
                'pagination': {
                    'page': page,
                    'page_size': page_size,
                    'total': total_records,
                    'total_pages': (total_records + page_size - 1) // page_size
                },
                'source': 'SAM.gov',
                'cached': False
            }
    
    def _extract_set_aside(self, entity_reg: Dict) -> List[str]:
        """Extract set-aside certifications from entity registration"""
        set_asides = []
        
        if entity_reg.get('businessTypes'):
            biz_types = entity_reg.get('businessTypes', {})
            if biz_types.get('isSmallBusiness'):
                set_asides.append('Small Business')
            if biz_types.get('is8AProgram'):
                set_asides.append('8(a)')
            if biz_types.get('isHUBZone'):
                set_asides.append('HUBZone')
            if biz_types.get('isSDVOSB'):
                set_asides.append('SDVOSB')
            if biz_types.get('isWOSB'):
                set_asides.append('WOSB')
        
        return set_asides if set_asides else ['Large Business']
    
    def _calculate_relevance(self, entity: Dict, query: Dict) -> int:
        """Calculate relevance score 0-100"""
        score = 50  # Base score
        
        core_data = entity.get('coreData', {})
        entity_reg = entity.get('entityRegistration', {})
        
        # NAICS match
        if query.get('naics_codes'):
            primary_naics = core_data.get('primaryNaics', '')
            if any(naics in primary_naics for naics in query['naics_codes']):
                score += 30
        
        # Set-aside match
        if query.get('set_aside'):
            entity_set_asides = self._extract_set_aside(entity_reg)
            if any(sa in entity_set_asides for sa in query['set_aside']):
                score += 20
        
        return min(score, 100)
    
    def _get_mock_contractors(
        self,
        query: Dict[str, Any],
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        """
        Return mock contractor data for development/demo
        """
        # Generate realistic mock data
        mock_contractors = [
            {
                'id': 1,
                'uei': 'JD3K9L2M4N6P',
                'legal_name': 'Tech Solutions Inc.',
                'dba': 'TechSol',
                'naics': ['541330', '541512'],
                'set_aside': ['Small Business', 'SDVOSB'],
                'capabilities': 'Software Development, Cloud Computing, Cybersecurity',
                'location': {'city': 'Arlington', 'state': 'VA', 'zip': '22201', 'country': 'USA'},
                'contact': {'email': 'contact@techsol.com', 'phone': '703-555-0100'},
                'past_awards': {'count': 15, 'total_value': 25000000},
                'relevance_score': 95
            },
            {
                'id': 2,
                'uei': 'Q8R2T4V6W8X0',
                'legal_name': 'Cyber Defense Systems LLC',
                'dba': 'CyberDef',
                'naics': ['541330', '541519'],
                'set_aside': ['Small Business', 'WOSB'],
                'capabilities': 'Cybersecurity, Network Security, Threat Intelligence',
                'location': {'city': 'San Diego', 'state': 'CA', 'zip': '92101', 'country': 'USA'},
                'contact': {'email': 'info@cyberdef.com', 'phone': '619-555-0200'},
                'past_awards': {'count': 8, 'total_value': 12000000},
                'relevance_score': 88
            },
            {
                'id': 3,
                'uei': 'Z1A3B5C7D9E1',
                'legal_name': 'Cloud Native Partners',
                'dba': 'CloudNative',
                'naics': ['518210', '541512'],
                'set_aside': ['8(a)', 'Small Business'],
                'capabilities': 'Cloud Migration, AWS, Azure, DevOps',
                'location': {'city': 'Austin', 'state': 'TX', 'zip': '73301', 'country': 'USA'},
                'contact': {'email': 'hello@cloudnative.com', 'phone': '512-555-0300'},
                'past_awards': {'count': 22, 'total_value': 38000000},
                'relevance_score': 92
            },
            {
                'id': 4,
                'uei': 'F2G4H6J8K0L2',
                'legal_name': 'Federal IT Services Corp',
                'dba': 'FedIT',
                'naics': ['541512', '541519'],
                'set_aside': ['HUBZone', 'Small Business'],
                'capabilities': 'IT Modernization, Data Analytics, System Integration',
                'location': {'city': 'Baltimore', 'state': 'MD', 'zip': '21201', 'country': 'USA'},
                'contact': {'email': 'contracts@fedit.com', 'phone': '410-555-0400'},
                'past_awards': {'count': 18, 'total_value': 30000000},
                'relevance_score': 85
            },
            {
                'id': 5,
                'uei': 'M3N5P7Q9R1S3',
                'legal_name': 'Secure Solutions Group',
                'dba': 'SecureGrp',
                'naics': ['541330', '541690'],
                'set_aside': ['SDVOSB', 'Small Business'],
                'capabilities': 'Information Assurance, Compliance, Risk Management',
                'location': {'city': 'Huntsville', 'state': 'AL', 'zip': '35801', 'country': 'USA'},
                'contact': {'email': 'info@securegrp.com', 'phone': '256-555-0500'},
                'past_awards': {'count': 12, 'total_value': 18000000},
                'relevance_score': 80
            }
        ]
        
        # Filter based on query
        filtered = []
        for contractor in mock_contractors:
            score = 0
            
            # NAICS match
            if query.get('naics_codes'):
                if any(naics in contractor['naics'] for naics in query['naics_codes']):
                    score += 30
            else:
                score += 10
            
            # Set-aside match
            if query.get('set_aside'):
                if any(sa in contractor['set_aside'] for sa in query['set_aside']):
                    score += 20
            else:
                score += 10
            
            # State match
            if query.get('state'):
                if contractor['location']['state'] == query['state']:
                    score += 15
            else:
                score += 5
            
            # Capabilities match
            if query.get('capabilities'):
                if query['capabilities'].lower() in contractor['capabilities'].lower():
                    score += 25
            else:
                score += 5
            
            contractor['relevance_score'] = min(score, 100)
            filtered.append(contractor)
        
        # Sort by relevance
        filtered.sort(key=lambda x: x['relevance_score'], reverse=True)
        
        # Paginate
        start = (page - 1) * page_size
        end = start + page_size
        paginated = filtered[start:end]
        
        return {
            'contractors': paginated,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total': len(filtered),
                'total_pages': (len(filtered) + page_size - 1) // page_size
            },
            'source': 'Mock Data',
            'cached': False,
            'note': 'Using mock data. Configure SAM_GOV_API_KEY for real data.'
        }
    
    async def recommend_partners(
        self,
        opportunity_id: int,
        opportunity_data: Dict[str, Any],
        organization_capabilities: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Recommend partners for a specific opportunity
        Uses AI to match opportunity gaps with contractor capabilities
        
        Args:
            opportunity_id: ID of opportunity
            opportunity_data: {naics, set_aside, sow_requirements, etc.}
            organization_capabilities: Company's own capabilities
        
        Returns:
            List of recommended contractors with match scores
        """
        # Identify capability gaps
        gaps = self._identify_capability_gaps(opportunity_data, organization_capabilities)
        
        # Search for contractors that fill gaps
        recommendations = []
        
        for gap in gaps:
            search_query = {
                'naics_codes': [opportunity_data.get('naics')],
                'capabilities': gap['capability_needed'],
                'min_past_awards': 3
            }
            
            if gap.get('requires_set_aside'):
                search_query['set_aside'] = [gap['requires_set_aside']]
            
            results = await self.search_contractors(search_query, page=1, page_size=5)
            
            for contractor in results['contractors']:
                contractor['fills_gap'] = gap['gap_name']
                contractor['match_score'] = contractor['relevance_score']
                recommendations.append(contractor)
        
        # Deduplicate and sort by match score
        unique_recommendations = {}
        for rec in recommendations:
            if rec['id'] not in unique_recommendations or rec['match_score'] > unique_recommendations[rec['id']]['match_score']:
                unique_recommendations[rec['id']] = rec
        
        sorted_recommendations = sorted(
            unique_recommendations.values(),
            key=lambda x: x['match_score'],
            reverse=True
        )[:10]
        
        return sorted_recommendations
    
    def _identify_capability_gaps(
        self,
        opportunity_data: Dict[str, Any],
        organization_capabilities: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Identify gaps between opportunity requirements and org capabilities
        """
        gaps = []
        
        # Check NAICS alignment
        opportunity_naics = opportunity_data.get('naics', '')
        org_naics = organization_capabilities.get('primary_naics', [])
        
        if opportunity_naics not in org_naics:
            gaps.append({
                'gap_name': 'NAICS Coverage',
                'capability_needed': f"NAICS {opportunity_naics}",
                'priority': 'HIGH'
            })
        
        # Check set-aside requirements
        if opportunity_data.get('set_aside') and opportunity_data['set_aside'] != organization_capabilities.get('set_aside_status'):
            gaps.append({
                'gap_name': 'Set-Aside Requirement',
                'capability_needed': opportunity_data['set_aside'],
                'requires_set_aside': opportunity_data['set_aside'],
                'priority': 'CRITICAL'
            })
        
        # Check technical capabilities (simplified - would use NLP/LLM in production)
        required_capabilities = opportunity_data.get('required_capabilities', [])
        org_caps = set(organization_capabilities.get('capabilities', []))
        
        for cap in required_capabilities:
            if cap.lower() not in [c.lower() for c in org_caps]:
                gaps.append({
                    'gap_name': 'Technical Capability',
                    'capability_needed': cap,
                    'priority': 'MEDIUM'
                })
        
        return gaps
    
    async def sync_sam_gov_data(
        self,
        batch_size: int = 1000,
        incremental: bool = True
    ) -> Dict[str, Any]:
        """
        Sync contractor data from SAM.gov API
        Populates/updates contractors table
        
        Args:
            batch_size: Number of records per API call
            incremental: Only fetch new/updated records since last sync
        
        Returns:
            Sync statistics
        """
        if not self.sam_api_key:
            return {"error": "SAM.gov API key not configured"}
        
        stats = {
            "new_contractors": 0,
            "updated_contractors": 0,
            "errors": 0,
            "sync_started": datetime.utcnow().isoformat()
        }
        
        # Determine last sync date if incremental
        last_sync = None
        if incremental:
            last_sync_query = "SELECT MAX(last_updated) FROM contractors"
            last_sync = self.db.execute(last_sync_query).scalar()
        
        # Build SAM.gov API params
        params = {
            "api_key": self.sam_api_key,
            "samRegistered": "Yes",
            "includeSections": "entityRegistration,coreData",
            "format": "JSON",
            "limit": batch_size
        }
        
        if last_sync:
            # Format date for SAM.gov API (MM/DD/YYYY)
            params["registrationDate"] = last_sync.strftime("%m/%d/%Y")
        
        try:
            async with httpx.AsyncClient() as client:
                page = 0
                while True:
                    params["offset"] = page * batch_size
                    
                    response = await client.get(self.SAM_GOV_API, params=params, timeout=30.0)
                    response.raise_for_status()
                    
                    data = response.json()
                    entities = data.get("entityData", [])
                    
                    if not entities:
                        break
                    
                    # Process batch
                    for entity in entities:
                        try:
                            contractor_data = self._parse_sam_entity(entity)
                            
                            # Check if exists
                            existing = self.db.execute(
                                "SELECT id FROM contractors WHERE uei = :uei",
                                {"uei": contractor_data['uei']}
                            ).scalar()
                            
                            if existing:
                                # Update
                                self.db.execute(
                                    """UPDATE contractors SET 
                                       legal_business_name = :legal_name,
                                       naics_codes = :naics,
                                       set_aside_status = :set_aside,
                                       location = :location,
                                       last_updated = NOW()
                                       WHERE uei = :uei""",
                                    contractor_data
                                )
                                stats['updated_contractors'] += 1
                            else:
                                # Insert
                                self.db.execute(
                                    """INSERT INTO contractors 
                                       (uei, duns, legal_business_name, naics_codes, set_aside_status, location, last_updated)
                                       VALUES (:uei, :duns, :legal_name, :naics, :set_aside, :location, NOW())""",
                                    contractor_data
                                )
                                stats['new_contractors'] += 1
                        
                        except Exception as e:
                            stats['errors'] += 1
                            print(f"Error processing entity: {e}")
                    
                    self.db.commit()
                    page += 1
                    
                    # Check if more pages
                    if len(entities) < batch_size:
                        break
        
        except Exception as e:
            stats['error_message'] = str(e)
            return stats
        
        stats['sync_completed'] = datetime.utcnow().isoformat()
        return stats
    
    def _parse_sam_entity(self, entity: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse SAM.gov entity data into our contractor format
        """
        core_data = entity.get("coreData", {})
        entity_reg = entity.get("entityRegistration", {})
        
        return {
            "uei": core_data.get("ueiSAM"),
            "duns": core_data.get("duns Number"),
            "legal_name": core_data.get("legalBusinessName"),
            "naics": entity_reg.get("naicsCodes", []),
            "set_aside": self._extract_set_aside(entity_reg),
            "location": {
                "address": core_data.get("physicalAddress", {}),
                "city": core_data.get("physicalAddress", {}).get("city"),
                "state": core_data.get("physicalAddress", {}).get("stateOrProvinceCode"),
                "zip": core_data.get("physicalAddress", {}).get("zipCode")
            }
        }
    
    async def create_teaming_agreement(
        self,
        opportunity_id: int,
        prime_org_id: int,
        partner_contractor_id: int,
        agreement_details: Dict[str, Any]
    ) -> int:
        """
        Create teaming agreement record
        
        Args:
            opportunity_id: Opportunity being teamed on
            prime_org_id: Prime contractor organization ID
            partner_contractor_id: Subcontractor ID
            agreement_details: {role, agreement_type, notes}
        
        Returns:
            Teaming agreement ID
        """
        insert_query = """
            INSERT INTO teaming_agreements 
            (opportunity_id, prime_org_id, partner_contractor_id, role, agreement_type, status, notes, created_at)
            VALUES (:opp_id, :prime_id, :partner_id, :role, :agreement_type, 'Draft', :notes, NOW())
            RETURNING id
        """
        
        result = self.db.execute(
            insert_query,
            {
                "opp_id": opportunity_id,
                "prime_id": prime_org_id,
                "partner_id": partner_contractor_id,
                "role": agreement_details.get("role", "Subcontractor"),
                "agreement_type": agreement_details.get("agreement_type", "Teaming Agreement"),
                "notes": agreement_details.get("notes", "")
            }
        )
        
        teaming_id = result.scalar()
        self.db.commit()
        
        return teaming_id
    
    def get_teaming_agreements(
        self,
        opportunity_id: Optional[int] = None,
        organization_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieve teaming agreements
        """
        filters = []
        params = {}
        
        if opportunity_id:
            filters.append("opportunity_id = :opp_id")
            params["opp_id"] = opportunity_id
        
        if organization_id:
            filters.append("prime_org_id = :org_id")
            params["org_id"] = organization_id
        
        where_clause = " AND ".join(filters) if filters else "1=1"
        
        query = f"""
            SELECT 
                ta.*,
                c.legal_business_name as partner_name,
                c.uei as partner_uei
            FROM teaming_agreements ta
            JOIN contractors c ON ta.partner_contractor_id = c.id
            WHERE {where_clause}
            ORDER BY ta.created_at DESC
        """
        
        results = self.db.execute(query, params).fetchall()
        
        return [dict(row) for row in results]
    
    def track_partner_performance(
        self,
        teaming_agreement_id: int,
        performance_data: Dict[str, Any]
    ) -> bool:
        """
        Track partner performance on a proposal or project
        
        Args:
            teaming_agreement_id: ID of teaming agreement
            performance_data: {
                'quality_score': 1-10,
                'timeliness_score': 1-10,
                'collaboration_score': 1-10,
                'would_partner_again': bool,
                'notes': 'string'
            }
        """
        update_query = """
            UPDATE teaming_agreements
            SET performance_rating = :rating,
                performance_notes = :notes,
                updated_at = NOW()
            WHERE id = :teaming_id
        """
        
        overall_score = (
            performance_data.get('quality_score', 0) +
            performance_data.get('timeliness_score', 0) +
            performance_data.get('collaboration_score', 0)
        ) / 3.0
        
        self.db.execute(
            update_query,
            {
                "teaming_id": teaming_agreement_id,
                "rating": overall_score,
                "notes": performance_data.get('notes', '')
            }
        )
        
        self.db.commit()
        return True

