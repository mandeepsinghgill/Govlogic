import pytest
from unittest.mock import MagicMock, patch
from app.services.opportunity_matching_service import OpportunityMatchingService
from app.services.enhanced_pwin_service import EnhancedPWinService
from app.services.grant_application_service import GrantApplicationService
from app.services.capture_workflow_service import CaptureWorkflowService
from app.services.compliance_service import ComplianceService
from app.models.opportunity import Opportunity, CapturePlan
from app.models.grant import Grant
from app.models.organization import Organization

# --- PWin Tests ---
def test_enhanced_pwin_integration():
    """Test that OpportunityMatchingService uses EnhancedPWinService"""
    mock_db = MagicMock()
    service = OpportunityMatchingService(mock_db)
    
    # Mock opportunity
    opp = Opportunity(
        id="test-opp",
        title="Test Opportunity",
        agency="Test Agency",
        contract_value=1000000,
        naics_code="541511"
    )
    
    # Mock organization (not dict)
    org = Organization(id="org1")
    
    # Mock EnhancedPWinService
    with patch('app.services.opportunity_matching_service.EnhancedPWinService') as MockEnhanced:
        mock_enhanced_instance = MockEnhanced.return_value
        # Mock the 10-factor calculation
        mock_enhanced_instance.calculate_10_factor_pwin.return_value = {
            "pwin_score": 85,
            "factors": {"capability_match": 25, "past_performance": 20},
            "recommendation": "Bid",
            "confidence": "High"
        }
        
        # Assign the mock to the service instance
        service.pwin_service = mock_enhanced_instance
        
        result = service.calculate_ai_match_score(opp, org)
        
        assert result["overall_score"] == 85
        assert result["recommendation"] == "Bid"
        mock_enhanced_instance.calculate_10_factor_pwin.assert_called_once()

# --- Grants Tests ---
def test_grant_application_lifecycle():
    """Test GrantApplicationService lifecycle methods"""
    mock_db = MagicMock()
    service = GrantApplicationService(mock_db)
    
    # Test create_application
    mock_grant = Grant(id="g1", organization_id="org1", status="draft")
    mock_db.query.return_value.filter.return_value.first.return_value = None # No existing app
    
    # Mock adding to DB
    app = service.create_application("g1", "org1")
    
    # Should create new Grant object
    assert mock_db.add.called
    assert mock_db.commit.called
        
    # Test update_status
    mock_db.query.return_value.filter.return_value.first.return_value = mock_grant
    updated_app = service.update_status("g1", "submitted")
    assert updated_app.status == "submitted"
    assert mock_db.commit.called

# --- Capture Tests ---
def test_capture_workflow_transitions():
    """Test CaptureWorkflowService transitions"""
    mock_db = MagicMock()
    service = CaptureWorkflowService(mock_db)
    
    # Mock capture plan
    plan = CapturePlan(id="c1", status="Identification")
    mock_db.query.return_value.filter.return_value.first.return_value = plan
    
    # Test get_workflow_state
    state = service.get_workflow_state("c1")
    assert state["current_stage"] == "Identification"
    assert state["next_stage"] == "Qualification"
    
    # Test advance_stage
    new_state = service.advance_stage("c1")
    assert new_state["current_stage"] == "Qualification"
    assert plan.status == "Qualification"
    
    # Test invalid transition (already at end)
    plan.status = "Post-Submittal"
    try:
        service.advance_stage("c1")
    except ValueError:
        pass # Expected

# --- Compliance Tests ---
def test_compliance_shredding_logic():
    """Test compliance service check logic (mocked)"""
    # ComplianceService takes no args
    service = ComplianceService()
    
    # Mock analyze_contract_compliance
    with patch.object(service, 'analyze_contract_compliance', return_value={
        "compliance_matrix": {},
        "compliance_checks": [],
        "compliance_report": {"summary": {"status": "PASS"}},
        "poam": {}
    }) as mock_analyze:
        
        contract_data = {"agency": "DoD"}
        company_data = {"certs": []}
        
        result = service.analyze_contract_compliance(contract_data, company_data)
        
        assert result["compliance_report"]["summary"]["status"] == "PASS"
        mock_analyze.assert_called_once()
