"""
Token Service - Manage verification and reset tokens
"""
from typing import Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import Column, String, DateTime, Boolean
from app.core.database import Base
import secrets
import hashlib


class Token(Base):
    """
    Token model for email verification and password reset
    """
    __tablename__ = "tokens"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True)
    token_hash = Column(String, unique=True, index=True)
    token_type = Column(String)  # 'verification' or 'reset'
    expires_at = Column(DateTime)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class TokenService:
    """
    Manage verification and reset tokens
    """
    
    @staticmethod
    def generate_token() -> str:
        """
        Generate a secure random token
        """
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def hash_token(token: str) -> str:
        """
        Hash a token for secure storage
        """
        return hashlib.sha256(token.encode()).hexdigest()
    
    @staticmethod
    def create_verification_token(db: Session, user_id: str) -> str:
        """
        Create an email verification token
        
        Args:
            db: Database session
            user_id: User ID
        
        Returns:
            str: Verification token (unhashed)
        """
        # Generate token
        token = TokenService.generate_token()
        token_hash = TokenService.hash_token(token)
        
        # Store in database
        db_token = Token(
            id=f"verify_{secrets.token_urlsafe(8)}",
            user_id=user_id,
            token_hash=token_hash,
            token_type="verification",
            expires_at=datetime.utcnow() + timedelta(hours=24)
        )
        db.add(db_token)
        db.commit()
        
        return token
    
    @staticmethod
    def create_reset_token(db: Session, user_id: str) -> str:
        """
        Create a password reset token
        
        Args:
            db: Database session
            user_id: User ID
        
        Returns:
            str: Reset token (unhashed)
        """
        # Generate token
        token = TokenService.generate_token()
        token_hash = TokenService.hash_token(token)
        
        # Store in database
        db_token = Token(
            id=f"reset_{secrets.token_urlsafe(8)}",
            user_id=user_id,
            token_hash=token_hash,
            token_type="reset",
            expires_at=datetime.utcnow() + timedelta(hours=1)
        )
        db.add(db_token)
        db.commit()
        
        return token
    
    @staticmethod
    def verify_token(db: Session, token: str, token_type: str) -> Optional[str]:
        """
        Verify a token and return user_id if valid
        
        Args:
            db: Database session
            token: Token to verify
            token_type: 'verification' or 'reset'
        
        Returns:
            Optional[str]: User ID if valid, None otherwise
        """
        token_hash = TokenService.hash_token(token)
        
        # Find token in database
        db_token = db.query(Token).filter(
            Token.token_hash == token_hash,
            Token.token_type == token_type,
            Token.used == False
        ).first()
        
        if not db_token:
            return None
        
        # Check if expired
        if datetime.utcnow() > db_token.expires_at:
            return None
        
        # Mark as used
        db_token.used = True
        db.commit()
        
        return db_token.user_id
    
    @staticmethod
    def invalidate_user_tokens(db: Session, user_id: str, token_type: Optional[str] = None):
        """
        Invalidate all tokens for a user
        
        Args:
            db: Database session
            user_id: User ID
            token_type: Optional token type to invalidate (None = all)
        """
        query = db.query(Token).filter(Token.user_id == user_id)
        
        if token_type:
            query = query.filter(Token.token_type == token_type)
        
        query.update({"used": True})
        db.commit()


# Create table if it doesn't exist
def init_token_table():
    """
    Initialize token table
    """
    from app.core.database import engine
    Base.metadata.create_all(bind=engine, tables=[Token.__table__])

