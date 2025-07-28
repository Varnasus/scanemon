"""
Configuration settings for Scanémon API
"""

import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import validator


class Settings(BaseSettings):
    """Application settings"""
    
    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    DEBUG: bool = True
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    
    # Database
    DATABASE_URL: str = "sqlite:///./scanemon.db"
    
    # CORS
    ENABLE_CORS: bool = True
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001"]
    
    # Swagger/OpenAPI
    ENABLE_SWAGGER: bool = True
    
    # Authentication
    FIREBASE_API_KEY: Optional[str] = None
    FIREBASE_AUTH_DOMAIN: Optional[str] = None
    FIREBASE_PROJECT_ID: Optional[str] = None
    FIREBASE_STORAGE_BUCKET: Optional[str] = None
    FIREBASE_MESSAGING_SENDER_ID: Optional[str] = None
    FIREBASE_APP_ID: Optional[str] = None
    
    # Supabase (alternative to Firebase)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    
    # AI/ML Services
    TESSERACT_CMD: str = "/usr/bin/tesseract"
    CARD_MODEL_PATH: str = "./ml/models/card_classifier.pth"
    CONFIDENCE_THRESHOLD: float = 0.8
    OPENAI_API_KEY: Optional[str] = None
    
    # External APIs
    POKEMON_TCG_API_KEY: Optional[str] = None
    TCGPLAYER_API_KEY: Optional[str] = None
    TCGPLAYER_APP_ID: Optional[str] = None
    
    # File Upload
    MAX_FILE_SIZE: int = 10485760  # 10MB
    ALLOWED_EXTENSIONS: List[str] = ["jpg", "jpeg", "png", "webp", "mp4", "mov", "avi"]
    
    # Storage
    STORAGE_BUCKET: str = "scanemon-uploads"
    STORAGE_REGION: str = "us-east-1"
    
    # AWS S3 (alternative to Firebase Storage)
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_S3_BUCKET: Optional[str] = None
    
    # Analytics
    GA_TRACKING_ID: Optional[str] = None
    SENTRY_DSN: Optional[str] = None
    
    # Testing
    TESTING: bool = False
    TEST_DATABASE_URL: str = "sqlite:///./test.db"
    
    @validator("CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v):
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    @validator("ALLOWED_EXTENSIONS", pre=True)
    def assemble_allowed_extensions(cls, v):
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings() 