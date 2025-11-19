"""
Test configuration and fixtures
"""
import pytest
import asyncio
from unittest.mock import MagicMock, patch
import sys

# Mock sqlalchemy create_engine globally
mock_engine = MagicMock()
mock_engine.connect.return_value.__enter__.return_value = MagicMock()
with patch('sqlalchemy.create_engine', return_value=mock_engine):
    from app.main import app
    from app.core.database import get_db, Base
    from app.models.organization import Organization, User, UserRole
    from app.services.auth_service import AuthService

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
def db_session():
    """Create a test database session"""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(db_session):
    """Create a test client"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def test_organization(db_session):
    """Create a test organization"""
    org = Organization(
        name="Test Organization",
        email="test@example.com",
        subscription_tier="free"
    )
    db_session.add(org)
    db_session.commit()
    db_session.refresh(org)
    return org

@pytest.fixture
def test_user(db_session, test_organization):
    """Create a test user"""
    user = User(
        email="test@example.com",
        hashed_password=AuthService.get_password_hash("testpassword"),
        full_name="Test User",
        organization_id=test_organization.id,
        role=UserRole.ADMIN,
        is_verified=True,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def auth_headers(test_user):
    """Create authentication headers"""
    access_token = AuthService.create_access_token(
        data={"sub": test_user.id, "email": test_user.email}
    )
    return {"Authorization": f"Bearer {access_token}"}

