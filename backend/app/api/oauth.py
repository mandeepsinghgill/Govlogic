"""
OAuth API endpoints for social authentication
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
import secrets

from app.core.database import get_db
from app.services.oauth_service import oauth_service
from app.services.auth_service import AuthService
from app.models.organization import User, UserRole
from app.models.subscription import SubscriptionTier

router = APIRouter(prefix="/api/v1/oauth", tags=["oauth"])


# In-memory state storage (in production, use Redis)
oauth_states = {}


class OAuthCallbackRequest(BaseModel):
    code: str
    state: str
    provider: str


@router.get("/google/authorize")
async def google_authorize():
    """
    Initiate Google OAuth flow
    """
    try:
        # Generate CSRF state token
        state = secrets.token_urlsafe(32)
        oauth_states[state] = {'provider': 'google', 'created_at': secrets.token_urlsafe(16)}
        
        # Get authorization URL
        auth_url = oauth_service.get_google_auth_url(state)
        
        return {'authorization_url': auth_url, 'state': state}
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )


@router.get("/github/authorize")
async def github_authorize():
    """
    Initiate GitHub OAuth flow
    """
    try:
        state = secrets.token_urlsafe(32)
        oauth_states[state] = {'provider': 'github', 'created_at': secrets.token_urlsafe(16)}
        
        auth_url = oauth_service.get_github_auth_url(state)
        
        return {'authorization_url': auth_url, 'state': state}
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )


@router.get("/microsoft/authorize")
async def microsoft_authorize():
    """
    Initiate Microsoft OAuth flow
    """
    try:
        state = secrets.token_urlsafe(32)
        oauth_states[state] = {'provider': 'microsoft', 'created_at': secrets.token_urlsafe(16)}
        
        auth_url = oauth_service.get_microsoft_auth_url(state)
        
        return {'authorization_url': auth_url, 'state': state}
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )


@router.post("/callback")
async def oauth_callback(
    request: OAuthCallbackRequest,
    db: Session = Depends(get_db)
):
    """
    Handle OAuth callback from any provider
    """
    # Verify state (CSRF protection)
    if request.state not in oauth_states:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid state parameter"
        )
    
    # Remove used state
    oauth_states.pop(request.state)
    
    # Exchange code for user info
    user_info = None
    if request.provider == 'google':
        user_info = oauth_service.exchange_google_code(request.code)
    elif request.provider == 'github':
        user_info = oauth_service.exchange_github_code(request.code)
    elif request.provider == 'microsoft':
        user_info = oauth_service.exchange_microsoft_code(request.code)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid provider"
        )
    
    if not user_info or not user_info.get('email'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to get user information from provider"
        )
    
    # Check if user exists
    user = AuthService.get_user_by_email(db, user_info['email'])
    
    if not user:
        # Create new user and organization
        organization = AuthService.create_organization(
            db=db,
            name=f"{user_info['name']}'s Organization",
            email=user_info['email']
        )
        
        # Create user with random password (they'll use social login)
        random_password = secrets.token_urlsafe(32)
        
        user = AuthService.create_user(
            db=db,
            email=user_info['email'],
            password=random_password,
            full_name=user_info['name'],
            organization_id=organization.id,
            role=UserRole.ADMIN
        )
        
        # Auto-verify email for OAuth users
        AuthService.verify_email(db, user)
        
        # Create free subscription
        from app.services.subscription_service import SubscriptionService
        subscription_service = SubscriptionService(db)
        subscription_service.create_subscription(
            organization_id=organization.id,
            tier=SubscriptionTier.FREE,
            billing_interval="monthly"
        )
    
    # Generate tokens
    access_token = AuthService.create_access_token(
        data={"sub": user.id, "email": user.email}
    )
    refresh_token = AuthService.create_refresh_token(
        data={"sub": user.id, "email": user.email}
    )
    
    return {
        'access_token': access_token,
        'refresh_token': refresh_token,
        'token_type': 'bearer',
        'user': {
            'id': user.id,
            'email': user.email,
            'full_name': user.full_name,
            'role': user.role.value,
            'is_verified': user.is_verified
        },
        'organization': {
            'id': user.organization.id,
            'name': user.organization.name,
            'subscription_tier': user.organization.subscription_tier
        }
    }


@router.get("/status")
async def oauth_status():
    """
    Check which OAuth providers are configured
    """
    return {
        'google': bool(oauth_service.google_client_id),
        'github': bool(oauth_service.github_client_id),
        'microsoft': bool(oauth_service.microsoft_client_id)
    }

