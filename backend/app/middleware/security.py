"""
Security middleware and hardening
"""
import time
import hashlib
import hmac
from typing import Optional, Dict, Any
from fastapi import Request, HTTPException, status
from fastapi.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware
import redis
from app.config import settings

class SecurityMiddleware(BaseHTTPMiddleware):
    """Security middleware for rate limiting, input validation, and protection"""
    
    def __init__(self, app, redis_client: Optional[redis.Redis] = None):
        super().__init__(app)
        self.redis_client = redis_client or redis.Redis(
            host=getattr(settings, 'REDIS_HOST', 'localhost'),
            port=getattr(settings, 'REDIS_PORT', 6379),
            db=0,
            decode_responses=True
        )
        
        # Rate limiting configuration
        self.rate_limits = {
            'auth': {'requests': 5, 'window': 300},  # 5 requests per 5 minutes
            'api': {'requests': 100, 'window': 60},   # 100 requests per minute
            'upload': {'requests': 10, 'window': 60}  # 10 uploads per minute
        }
    
    async def dispatch(self, request: Request, call_next):
        """Process request through security checks"""
        
        # Skip security checks for CORS preflight requests
        if request.method == "OPTIONS":
            return await call_next(request)
        
        # Get client IP
        client_ip = self._get_client_ip(request)
        
        # Rate limiting
        if not await self._check_rate_limit(request, client_ip):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded"
            )
        
        # Input sanitization
        if not self._validate_input(request):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid input detected"
            )
        
        # Security headers
        response = await call_next(request)
        self._add_security_headers(response)
        
        return response
    
    def _get_client_ip(self, request: Request) -> str:
        """Get real client IP address"""
        # Check for forwarded headers
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        return request.client.host if request.client else "unknown"
    
    async def _check_rate_limit(self, request: Request, client_ip: str) -> bool:
        """Check if request is within rate limits"""
        try:
            # Determine rate limit category
            category = self._get_rate_limit_category(request)
            limit_config = self.rate_limits.get(category, self.rate_limits['api'])
            
            # Create rate limit key
            key = f"rate_limit:{category}:{client_ip}"
            
            # Check current count
            current_count = self.redis_client.get(key)
            
            if current_count is None:
                # First request in window
                self.redis_client.setex(key, limit_config['window'], 1)
                return True
            
            current_count = int(current_count)
            
            if current_count >= limit_config['requests']:
                return False
            
            # Increment counter
            self.redis_client.incr(key)
            return True
            
        except Exception:
            # If Redis is down, allow request (fail open)
            return True
    
    def _get_rate_limit_category(self, request: Request) -> str:
        """Determine rate limit category based on request"""
        path = request.url.path
        
        if path.startswith('/api/v1/auth/'):
            return 'auth'
        elif '/upload' in path or '/export' in path:
            return 'upload'
        else:
            return 'api'
    
    def _validate_input(self, request: Request) -> bool:
        """Validate and sanitize input"""
        # Check for SQL injection patterns
        sql_patterns = [
            "union select", "drop table", "delete from", "insert into",
            "update set", "exec(", "script>", "<script"
        ]
        
        # Check URL parameters
        for param, value in request.query_params.items():
            if any(pattern in value.lower() for pattern in sql_patterns):
                return False
        
        # Check for XSS patterns
        xss_patterns = [
            "<script", "javascript:", "onload=", "onerror=", "onclick="
        ]
        
        for param, value in request.query_params.items():
            if any(pattern in value.lower() for pattern in xss_patterns):
                return False
        
        return True
    
    def _add_security_headers(self, response: Response):
        """Add security headers to response"""
        security_headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
            "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
        }
        
        for header, value in security_headers.items():
            response.headers[header] = value

class CSRFProtection:
    """CSRF protection for state-changing operations"""
    
    def __init__(self, secret_key: str):
        self.secret_key = secret_key.encode()
    
    def generate_token(self, user_id: str) -> str:
        """Generate CSRF token for user"""
        timestamp = str(int(time.time()))
        message = f"{user_id}:{timestamp}"
        token = hmac.new(
            self.secret_key,
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        return f"{token}:{timestamp}"
    
    def validate_token(self, token: str, user_id: str, max_age: int = 3600) -> bool:
        """Validate CSRF token"""
        try:
            token_part, timestamp = token.split(":", 1)
            message = f"{user_id}:{timestamp}"
            
            # Check if token is expired
            if int(time.time()) - int(timestamp) > max_age:
                return False
            
            # Verify token
            expected_token = hmac.new(
                self.secret_key,
                message.encode(),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(token_part, expected_token)
            
        except (ValueError, TypeError):
            return False

class InputSanitizer:
    """Input sanitization utilities"""
    
    @staticmethod
    def sanitize_string(value: str, max_length: int = 1000) -> str:
        """Sanitize string input"""
        if not isinstance(value, str):
            return ""
        
        # Remove null bytes and control characters
        sanitized = ''.join(char for char in value if ord(char) >= 32)
        
        # Truncate to max length
        if len(sanitized) > max_length:
            sanitized = sanitized[:max_length]
        
        return sanitized.strip()
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format"""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    @staticmethod
    def validate_password_strength(password: str) -> Dict[str, Any]:
        """Validate password strength"""
        result = {
            'valid': True,
            'score': 0,
            'issues': []
        }
        
        if len(password) < 8:
            result['issues'].append('Password must be at least 8 characters')
            result['valid'] = False
        
        if not any(c.isupper() for c in password):
            result['issues'].append('Password must contain uppercase letter')
            result['score'] += 1
        
        if not any(c.islower() for c in password):
            result['issues'].append('Password must contain lowercase letter')
            result['score'] += 1
        
        if not any(c.isdigit() for c in password):
            result['issues'].append('Password must contain number')
            result['score'] += 1
        
        if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
            result['issues'].append('Password must contain special character')
            result['score'] += 1
        
        result['score'] = min(result['score'], 4)
        
        return result
