"""
Authentication API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import timedelta
from app.core.database import get_db
from app.core.auth import get_current_user, get_current_active_user
from app.services.auth_service import AuthService
from app.models.organization import User, UserRole
from app.config import settings
import uuid
from app.services.email_service import email_service
from app.services.token_service import TokenService

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    organization_name: str
    organization_email: Optional[EmailStr] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    user_types: List[str] = ["proposals"]  # ["proposals", "grants", "both"]
    primary_focus: Optional[str] = "proposals"  # "proposals" or "grants"


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict
    organization: dict


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class SocialAuthRequest(BaseModel):
    provider: str  # google, github, microsoft
    access_token: str
    email: EmailStr
    full_name: str
    profile_picture: Optional[str] = None


@router.post("/signup", response_model=LoginResponse)
async def signup(
    request: SignupRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Sign up a new user and organization
    """
    
    # Check if user already exists
    existing_user = AuthService.get_user_by_email(db, request.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create organization
    organization = AuthService.create_organization(
        db=db,
        name=request.organization_name,
        email=request.organization_email or request.email,
        phone=request.phone,
        website=request.website
    )
    
    # Create user as admin
    user = AuthService.create_user(
        db=db,
        email=request.email,
        password=request.password,
        full_name=request.full_name,
        organization_id=organization.id,
        role=UserRole.ADMIN
    )
    
    # Create subscription for organization
    from app.services.subscription_service import SubscriptionService
    subscription_service = SubscriptionService(db)
    
    # Start with free tier
    from app.models.subscription import SubscriptionTier
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
    
    # Send verification email in background
    verification_token = TokenService.create_verification_token(db, user.id)
    background_tasks.add_task(
        email_service.send_verification_email,
        user.email,
        verification_token,
        user.full_name
    )
    
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value,
            "is_verified": user.is_verified
        },
        organization={
            "id": organization.id,
            "name": organization.name,
            "subscription_tier": organization.subscription_tier
        }
    )


@router.post("/login", response_model=LoginResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login with email and password
    """
    
    user = AuthService.authenticate_user(db, form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    # Generate tokens
    access_token = AuthService.create_access_token(
        data={"sub": user.id, "email": user.email}
    )
    refresh_token = AuthService.create_refresh_token(
        data={"sub": user.id, "email": user.email}
    )
    
    # Get organization (user.organization is already loaded as a relationship)
    organization = user.organization
    
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value,
            "is_verified": user.is_verified
        },
        organization={
            "id": user.organization.id,
            "name": user.organization.name,
            "subscription_tier": user.organization.subscription_tier
        }
    )


@router.post("/social-auth", response_model=LoginResponse)
async def social_auth(
    request: SocialAuthRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate with social provider (Google, GitHub, Microsoft)
    """
    
    # Check if user exists
    user = AuthService.get_user_by_email(db, request.email)
    
    if not user:
        # Create new user and organization
        organization = AuthService.create_organization(
            db=db,
            name=f"{request.full_name}'s Organization",
            email=request.email
        )
        
        # Create user with random password (they'll use social login)
        import secrets
        random_password = secrets.token_urlsafe(32)
        
        user = AuthService.create_user(
            db=db,
            email=request.email,
            password=random_password,
            full_name=request.full_name,
            organization_id=organization.id,
            role=UserRole.ADMIN
        )
        
        # Auto-verify email for social auth
        AuthService.verify_email(db, user)
        
        # Create free subscription
        from app.services.subscription_service import SubscriptionService
        from app.models.subscription import SubscriptionTier
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
    
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value,
            "is_verified": user.is_verified
        },
        organization={
            "id": user.organization.id,
            "name": user.organization.name,
            "subscription_tier": user.organization.subscription_tier
        }
    )


@router.post("/refresh")
async def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token
    """
    
    try:
        payload = AuthService.decode_token(refresh_token)
        
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        user_id = payload.get("sub")
        user = AuthService.get_user_by_id(db, user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Generate new access token
        new_access_token = AuthService.create_access_token(
            data={"sub": user.id, "email": user.email}
        )
        
        return {
            "access_token": new_access_token,
            "token_type": "bearer"
        }
        
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )


@router.get("/me")
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user information
    """
    
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role.value,
        "is_verified": current_user.is_verified,
        "is_active": current_user.is_active,
        "organization": {
            "id": current_user.organization.id,
            "name": current_user.organization.name,
            "subscription_tier": current_user.organization.subscription_tier
        }
    }


@router.post("/password-reset-request")
async def request_password_reset(
    request: PasswordResetRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Request password reset email
    """
    
    user = AuthService.get_user_by_email(db, request.email)
    
    # Always return success to prevent email enumeration
    if user:
        # Create reset token and send email
        reset_token = TokenService.create_reset_token(db, user.id)
        email_service.send_password_reset_email(user.email, reset_token, user.full_name)
        # background_tasks.add_task(send_password_reset_email, user.email, reset_token)
    
    return {"message": "If the email exists, a password reset link has been sent"}


@router.post("/password-reset-confirm")
async def confirm_password_reset(
    request: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    """
    Confirm password reset with token
    """
    
    # Verify token from database
    user_id = TokenService.verify_token(db, request.token, 'reset')
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Get user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update password
    user.hashed_password = AuthService.get_password_hash(request.new_password)
    db.commit()
    
    return {"message": "Password reset successful"}


@router.post("/change-password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Change password for authenticated user
    """
    
    # Verify current password
    if not AuthService.verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update password
    AuthService.update_password(db, current_user, request.new_password)
    
    return {"message": "Password changed successfully"}


@router.post("/verify-email/{token}")
async def verify_email(
    token: str,
    db: Session = Depends(get_db)
):
    """
    Verify email with token
    """
    
    # Verify token from database
    user_id = TokenService.verify_token(db, token, 'verification')
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    # Get user and mark as verified
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    AuthService.verify_email(db, user)
    
    # Send welcome email
    email_service.send_welcome_email(user.email, user.full_name)
    
    return {"message": "Email verified successfully"}

