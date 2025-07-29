"""
Security middleware for Scanémon API
Provides comprehensive security headers and rate limiting
"""

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import time
import os

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

def setup_security_middleware(app: FastAPI) -> None:
    """Setup comprehensive security middleware"""
    
    # Add rate limiter
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    
    # CORS configuration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "https://scanemon-16c6c.web.app",
            "https://scanemon-16c6c.firebaseapp.com",
            "http://localhost:3000",
            "http://localhost:3001"
        ],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["X-Total-Count", "X-Rate-Limit-Remaining"]
    )
    
    # Trusted hosts (for production)
    if os.getenv("ENVIRONMENT") == "production":
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=["scanemon-16c6c.web.app", "scanemon-16c6c.firebaseapp.com"]
        )
    
    # Custom security headers middleware
    @app.middleware("http")
    async def add_security_headers(request: Request, call_next):
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
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https: blob:; "
            "connect-src 'self' https://api.railway.app https://scanemon-16c6c.firebaseapp.com; "
            "frame-src 'none'; "
            "object-src 'none'; "
            "base-uri 'self'; "
            "form-action 'self';"
        )
        response.headers["Content-Security-Policy"] = csp_policy
        
        # Additional security headers
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        
        return response
    
    # Request logging middleware
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        start_time = time.time()
        
        # Log request
        print(f"Request: {request.method} {request.url}")
        
        response = await call_next(request)
        
        # Log response time
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        
        print(f"Response: {response.status_code} - {process_time:.3f}s")
        
        return response
    
    # Error handling middleware
    @app.middleware("http")
    async def error_handling(request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except Exception as e:
            # Log error
            print(f"Error processing request: {e}")
            
            # Return generic error response
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Internal server error",
                    "message": "An unexpected error occurred"
                }
            )

def get_security_info() -> dict:
    """Get security configuration information"""
    return {
        "cors_enabled": True,
        "rate_limiting_enabled": True,
        "security_headers_enabled": True,
        "trusted_hosts_enabled": os.getenv("ENVIRONMENT") == "production",
        "csp_enabled": True,
        "hsts_enabled": True
    }

def get_rate_limit_info() -> dict:
    """Get rate limiting configuration"""
    return {
        "default_limit": "60/minute",
        "scan_limit": "10/minute",
        "auth_limit": "5/minute",
        "api_limit": "1000/hour"
    } 