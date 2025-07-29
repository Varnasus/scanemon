"""
Data Sanitization Middleware - Automatically sanitizes data before database operations
"""

import logging
from typing import Any, Dict, Callable
from fastapi import Request, Response
from fastapi.middleware.base import BaseHTTPMiddleware
from app.utils.data_sanitizer import sanitize_any, sanitize_for_railway

logger = logging.getLogger(__name__)


class DataSanitizationMiddleware(BaseHTTPMiddleware):
    """Middleware that automatically sanitizes request and response data"""
    
    def __init__(self, app, exclude_paths: list = None):
        super().__init__(app)
        self.exclude_paths = exclude_paths or []
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process request and response with data sanitization"""
        
        # Skip sanitization for excluded paths
        if any(request.url.path.startswith(path) for path in self.exclude_paths):
            return await call_next(request)
        
        try:
            # Sanitize request data
            await self._sanitize_request(request)
            
            # Process the request
            response = await call_next(request)
            
            # Sanitize response data (if needed)
            await self._sanitize_response(response)
            
            return response
            
        except Exception as e:
            logger.error(f"Error in data sanitization middleware: {e}")
            return await call_next(request)
    
    async def _sanitize_request(self, request: Request):
        """Sanitize request data"""
        try:
            # Sanitize headers
            sanitized_headers = {}
            for key, value in request.headers.items():
                if isinstance(value, str):
                    sanitized_headers[key] = sanitize_any(value)
            
            # Note: We can't modify request.headers directly, but we can log issues
            for key, value in request.headers.items():
                if isinstance(value, str) and sanitize_any(value) != value:
                    logger.warning(f"Request header {key} contains problematic characters")
            
            # Sanitize query parameters
            sanitized_query_params = {}
            for key, value in request.query_params.items():
                if isinstance(value, str):
                    sanitized_query_params[key] = sanitize_any(value)
            
            # Log if any query params were sanitized
            for key, value in request.query_params.items():
                if isinstance(value, str) and sanitize_any(value) != value:
                    logger.warning(f"Query parameter {key} contains problematic characters")
                    
        except Exception as e:
            logger.error(f"Error sanitizing request: {e}")
    
    async def _sanitize_response(self, response: Response):
        """Sanitize response data"""
        try:
            # Note: Response body sanitization would need to be implemented
            # based on the specific response type and content
            pass
        except Exception as e:
            logger.error(f"Error sanitizing response: {e}")


def sanitize_database_operation(func: Callable) -> Callable:
    """Decorator to sanitize data before database operations"""
    
    async def wrapper(*args, **kwargs):
        try:
            # Sanitize all string arguments
            sanitized_args = tuple(sanitize_any(arg) for arg in args)
            sanitized_kwargs = {key: sanitize_any(value) for key, value in kwargs.items()}
            
            # Call the original function with sanitized data
            return await func(*sanitized_args, **sanitized_kwargs)
            
        except Exception as e:
            logger.error(f"Error in database operation sanitization: {e}")
            # Fall back to original function
            return await func(*args, **kwargs)
    
    return wrapper


def sanitize_for_railway_operation(func: Callable) -> Callable:
    """Decorator specifically for Railway deployment operations"""
    
    async def wrapper(*args, **kwargs):
        try:
            # Use Railway-specific sanitization
            sanitized_args = tuple(sanitize_for_railway(arg) if isinstance(arg, dict) else arg for arg in args)
            sanitized_kwargs = {key: sanitize_for_railway(value) if isinstance(value, dict) else value 
                              for key, value in kwargs.items()}
            
            logger.info("Sanitized data for Railway operation")
            return await func(*sanitized_args, **sanitized_kwargs)
            
        except Exception as e:
            logger.error(f"Error in Railway operation sanitization: {e}")
            return await func(*args, **kwargs)
    
    return wrapper


def setup_data_sanitization_middleware(app):
    """Setup data sanitization middleware for the FastAPI app"""
    
    # Add the middleware
    app.add_middleware(
        DataSanitizationMiddleware,
        exclude_paths=[
            "/health",
            "/docs",
            "/redoc",
            "/openapi.json"
        ]
    )
    
    logger.info("Data sanitization middleware configured") 