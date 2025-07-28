"""
Security middleware for FastAPI
"""

import time
import hashlib
from typing import Dict, List, Optional
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import logging

logger = logging.getLogger(__name__)

class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.requests: Dict[str, List[float]] = {}
    
    def is_allowed(self, client_id: str) -> bool:
        """Check if request is allowed"""
        now = time.time()
        
        if client_id not in self.requests:
            self.requests[client_id] = []
        
        # Remove old requests (older than 1 minute)
        self.requests[client_id] = [
            req_time for req_time in self.requests[client_id]
            if now - req_time < 60
        ]
        
        # Check if under limit
        if len(self.requests[client_id]) >= self.requests_per_minute:
            return False
        
        # Add current request
        self.requests[client_id].append(now)
        return True
    
    def get_remaining(self, client_id: str) -> int:
        """Get remaining requests for client"""
        now = time.time()
        
        if client_id not in self.requests:
            return self.requests_per_minute
        
        # Count recent requests
        recent_requests = len([
            req_time for req_time in self.requests[client_id]
            if now - req_time < 60
        ])
        
        return max(0, self.requests_per_minute - recent_requests)

# Global rate limiter instance
rate_limiter = RateLimiter()

def get_client_id(request: Request) -> str:
    """Get client identifier for rate limiting"""
    # Use IP address as primary identifier
    client_ip = request.client.host
    
    # Add user agent hash for additional uniqueness
    user_agent = request.headers.get("User-Agent", "")
    user_agent_hash = hashlib.md5(user_agent.encode()).hexdigest()[:8]
    
    return f"{client_ip}:{user_agent_hash}"

async def rate_limit_middleware(request: Request, call_next):
    """Rate limiting middleware"""
    client_id = get_client_id(request)
    
    if not rate_limiter.is_allowed(client_id):
        remaining = rate_limiter.get_remaining(client_id)
        
        logger.warning(f"Rate limit exceeded for {client_id}")
        
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={
                "error": "Rate limit exceeded",
                "message": "Too many requests. Please try again later.",
                "retry_after": 60,
                "remaining_requests": remaining
            },
            headers={
                "Retry-After": "60",
                "X-RateLimit-Remaining": str(remaining),
                "X-RateLimit-Limit": str(rate_limiter.requests_per_minute)
            }
        )
    
    # Add rate limit headers to response
    response = await call_next(request)
    remaining = rate_limiter.get_remaining(client_id)
    
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    response.headers["X-RateLimit-Limit"] = str(rate_limiter.requests_per_minute)
    
    return response

async def security_headers_middleware(request: Request, call_next):
    """Add security headers to responses"""
    response = await call_next(request)
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    
    # Content Security Policy
    csp_policy = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self' data:; "
        "connect-src 'self' https:; "
        "frame-ancestors 'none';"
    )
    response.headers["Content-Security-Policy"] = csp_policy
    
    return response

async def request_logging_middleware(request: Request, call_next):
    """Log all requests for security monitoring"""
    start_time = time.time()
    
    # Log request
    logger.info(
        f"Request: {request.method} {request.url.path} "
        f"from {request.client.host} "
        f"User-Agent: {request.headers.get('User-Agent', 'Unknown')}"
    )
    
    try:
        response = await call_next(request)
        
        # Log response
        process_time = time.time() - start_time
        logger.info(
            f"Response: {response.status_code} "
            f"took {process_time:.3f}s"
        )
        
        return response
        
    except Exception as e:
        # Log errors
        process_time = time.time() - start_time
        logger.error(
            f"Error: {str(e)} "
            f"took {process_time:.3f}s"
        )
        raise

def setup_security_middleware(app):
    """Setup all security middleware"""
    
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",  # React dev server
            "http://localhost:3001",
            "https://scanemon.com",    # Production domain
            "https://www.scanemon.com"
        ],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )
    
    # Trusted host middleware
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=[
            "localhost",
            "127.0.0.1",
            "scanemon.com",
            "www.scanemon.com"
        ]
    )
    
    # Custom middleware (order matters)
    app.middleware("http")(request_logging_middleware)
    app.middleware("http")(rate_limit_middleware)
    app.middleware("http")(security_headers_middleware)

class InputValidator:
    """Input validation utilities"""
    
    @staticmethod
    def validate_file_size(file_size: int, max_size_mb: int = 10) -> bool:
        """Validate file size"""
        max_size_bytes = max_size_mb * 1024 * 1024
        return file_size <= max_size_bytes
    
    @staticmethod
    def validate_image_type(content_type: str) -> bool:
        """Validate image content type"""
        allowed_types = [
            "image/jpeg",
            "image/png", 
            "image/webp",
            "image/gif"
        ]
        return content_type in allowed_types
    
    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """Sanitize filename for security"""
        import re
        
        # Remove dangerous characters
        sanitized = re.sub(r'[^\w\-_\.]', '', filename)
        
        # Limit length
        if len(sanitized) > 100:
            sanitized = sanitized[:100]
        
        return sanitized
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format"""
        import re
        
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    @staticmethod
    def validate_username(username: str) -> bool:
        """Validate username format"""
        import re
        
        # Username rules: 3-20 chars, alphanumeric and underscore only
        pattern = r'^[a-zA-Z0-9_]{3,20}$'
        return bool(re.match(pattern, username))

# Global input validator instance
input_validator = InputValidator()

def validate_scan_request(request: Request) -> Dict[str, any]:
    """Validate scan request parameters"""
    errors = []
    
    # Check content type
    content_type = request.headers.get("content-type", "")
    if not content_type.startswith("multipart/form-data"):
        errors.append("Invalid content type. Expected multipart/form-data")
    
    # Check file size (if available)
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            file_size = int(content_length)
            if not input_validator.validate_file_size(file_size):
                errors.append("File too large. Maximum size is 10MB")
        except ValueError:
            errors.append("Invalid content length")
    
    # Check user agent
    user_agent = request.headers.get("user-agent", "")
    if not user_agent or len(user_agent) > 500:
        errors.append("Invalid user agent")
    
    return {
        "valid": len(errors) == 0,
        "errors": errors
    }

def get_security_info() -> Dict[str, any]:
    """Get security configuration information"""
    return {
        "rate_limiting": {
            "requests_per_minute": rate_limiter.requests_per_minute,
            "active_clients": len(rate_limiter.requests)
        },
        "cors": {
            "enabled": True,
            "allowed_origins": [
                "http://localhost:3000",
                "https://scanemon.com"
            ]
        },
        "security_headers": {
            "x_content_type_options": "nosniff",
            "x_frame_options": "DENY",
            "x_xss_protection": "1; mode=block",
            "content_security_policy": "enabled"
        },
        "input_validation": {
            "max_file_size_mb": 10,
            "allowed_image_types": [
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/gif"
            ]
        }
    } 