"""
Opportunities API tests
"""
import pytest
from fastapi.testclient import TestClient
from app.models.opportunity import Opportunity, OpportunityType, OpportunityStage

def test_list_opportunities(client: TestClient, auth_headers):
    """Test listing opportunities"""
    response = client.get("/api/v1/opportunities/", headers=auth_headers)
    
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_opportunity(client: TestClient, auth_headers, test_organization):
    """Test creating an opportunity"""
    opportunity_data = {
        "title": "Test RFP",
        "solicitation_number": "TEST-2024-001",
        "opportunity_type": "rfp",
        "agency": "Test Agency",
        "contract_value": 1000000.0,
        "due_date": "2024-12-31",
        "description": "Test opportunity description",
        "organization_id": test_organization.id
    }
    
    response = client.post("/api/v1/opportunities/", json=opportunity_data, headers=auth_headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == opportunity_data["title"]
    assert data["solicitation_number"] == opportunity_data["solicitation_number"]

def test_get_opportunity(client: TestClient, auth_headers, test_organization, db_session):
    """Test getting a specific opportunity"""
    # Create an opportunity first
    opportunity = Opportunity(
        title="Test Opportunity",
        opportunity_type=OpportunityType.RFP,
        organization_id=test_organization.id,
        pwin_score=75
    )
    db_session.add(opportunity)
    db_session.commit()
    db_session.refresh(opportunity)
    
    response = client.get(f"/api/v1/opportunities/{opportunity.id}", headers=auth_headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == opportunity.id
    assert data["title"] == opportunity.title

def test_calculate_pwin(client: TestClient, auth_headers, test_organization, db_session):
    """Test PWin calculation"""
    # Create an opportunity
    opportunity = Opportunity(
        title="Test Opportunity for PWin",
        opportunity_type=OpportunityType.RFP,
        organization_id=test_organization.id
    )
    db_session.add(opportunity)
    db_session.commit()
    db_session.refresh(opportunity)
    
    pwin_data = {
        "capability_match": 8,
        "past_performance": 7,
        "set_aside_eligibility": 9,
        "contract_size": 6,
        "geography": 8,
        "clearance_requirement": 7
    }
    
    response = client.post(
        f"/api/v1/opportunities/{opportunity.id}/calculate-pwin",
        json=pwin_data,
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "pwin_score" in data
    assert "factors" in data
    assert "recommendation" in data

def test_qualify_opportunity(client: TestClient, auth_headers, test_organization, db_session):
    """Test opportunity qualification"""
    # Create an opportunity
    opportunity = Opportunity(
        title="Test Opportunity for Qualification",
        opportunity_type=OpportunityType.RFP,
        organization_id=test_organization.id
    )
    db_session.add(opportunity)
    db_session.commit()
    db_session.refresh(opportunity)
    
    qualification_data = {
        "qualification_score": 75,
        "recommendation": "bid",
        "reasoning": "Strong capability match and past performance"
    }
    
    response = client.post(
        f"/api/v1/opportunities/{opportunity.id}/qualify",
        json=qualification_data,
        headers=auth_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "qualified" in data
    assert data["recommendation"] == "bid"

