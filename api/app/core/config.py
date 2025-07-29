"""
Configuration management with environment variable sanitization
"""

import os
import re
from typing import Optional, List
from pydantic_settings import BaseSettings


def sanitize_env_var(value: str) -> str:
    """Remove null bytes and other problematic characters from environment variables"""
    if not value:
        return value
    
    # Remove null bytes and other control characters
    sanitized = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', value)
    
    # Remove Unicode escape sequences that might cause issues
    sanitized = re.sub(r'\\u0000', '', sanitized)
    
    return sanitized.strip()


class Settings(BaseSettings):
    """Application settings with sanitization"""
    
    # Database
    DATABASE_URL: str = "sqlite:///./scanemon.db"
    
    # Redis
    REDIS_URL: Optional[str] = None
    
    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    DEBUG: bool = False
    SECRET_KEY: str = "scanemon-super-secret-key-2024"
    
    # CORS
    ENABLE_CORS: bool = True
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # Firebase
    FIREBASE_API_KEY: Optional[str] = None
    FIREBASE_AUTH_DOMAIN: Optional[str] = None
    FIREBASE_PROJECT_ID: Optional[str] = None
    FIREBASE_STORAGE_BUCKET: Optional[str] = None
    FIREBASE_MESSAGING_SENDER_ID: Optional[str] = None
    FIREBASE_APP_ID: Optional[str] = None
    
    # Security
    SECURITY_HEADERS: bool = True
    CSP_POLICY: Optional[str] = None
    
    # Performance
    CACHE_TTL: int = 3600
    CACHE_MAX_SIZE: int = 1000
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_RECYCLE: int = 3600
    
    # Environment
    ENVIRONMENT: str = "development"
    
    class Config:
        env_file = ".env"
        
    def __init__(self, **kwargs):
        # Sanitize all environment variables
        sanitized_kwargs = {}
        for key, value in kwargs.items():
            if isinstance(value, str):
                sanitized_kwargs[key] = sanitize_env_var(value)
            else:
                sanitized_kwargs[key] = value
        
        super().__init__(**sanitized_kwargs)
    
    @property
    def database_url(self) -> str:
        """Get sanitized database URL"""
        return sanitize_env_var(self.DATABASE_URL)
    
    @property
    def redis_url(self) -> Optional[str]:
        """Get sanitized Redis URL"""
        if self.REDIS_URL:
            return sanitize_env_var(self.REDIS_URL)
        return None


# Create settings instance
settings = Settings() 