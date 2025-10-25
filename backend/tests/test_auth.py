"""
Authentication API tests
"""
import pytest
from fastapi.testclient import TestClient

def test_signup_success(client: TestClient):
    """Test successful user signup"""
    response = client.post("/api/v1/auth/signup", json={
        "email": "newuser@example.com",
        "password": "testpassword123",
        "full_name": "New User",
        "organization_name": "New Organization",
        "user_type": "proposal"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "newuser@example.com"
    assert data["organization"]["name"] == "New Organization"

def test_signup_duplicate_email(client: TestClient, test_user):
    """Test signup with duplicate email"""
    response = client.post("/api/v1/auth/signup", json={
        "email": test_user.email,
        "password": "testpassword123",
        "full_name": "Another User",
        "organization_name": "Another Organization"
    })
    
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]

def test_login_success(client: TestClient, test_user):
    """Test successful login"""
    response = client.post("/api/v1/auth/login", data={
        "username": test_user.email,
        "password": "testpassword"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == test_user.email

def test_login_invalid_credentials(client: TestClient):
    """Test login with invalid credentials"""
    response = client.post("/api/v1/auth/login", data={
        "username": "nonexistent@example.com",
        "password": "wrongpassword"
    })
    
    assert response.status_code == 401

def test_get_current_user(client: TestClient, auth_headers):
    """Test getting current user info"""
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "email" in data
    assert "organization" in data

def test_password_reset_request(client: TestClient, test_user):
    """Test password reset request"""
    response = client.post("/api/v1/auth/password-reset-request", json={
        "email": test_user.email
    })
    
    assert response.status_code == 200
    assert "password reset link has been sent" in response.json()["message"]

def test_social_auth_new_user(client: TestClient):
    """Test social authentication for new user"""
    response = client.post("/api/v1/auth/social-auth", json={
        "provider": "google",
        "access_token": "fake_token",
        "email": "social@example.com",
        "full_name": "Social User"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "social@example.com"

