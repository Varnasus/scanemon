"""
Scanémon API - Main Application Entry Point
"""

import os
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.database import engine, Base
from app.routes import auth, cards, scan, collection, analytics, moderation, monitoring
from app.core.logging import setup_logging

# Import models to ensure they are registered with SQLAlchemy
from app.models import User, Card, Collection, ScanAnalytics, ScanSession
from app.models.moderation import ModerationQueue, UserFeedback

# Setup logging
logger = setup_logging()

# Rate limiter
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting Scanémon API...")
    
    # Create database tables
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Scanémon API...")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application"""
    
    app = FastAPI(
        title="Scanémon API",
        description="AI-powered Pokémon card scanner and collector API",
        version="1.0.0",
        docs_url="/docs" if settings.ENABLE_SWAGGER else None,
        redoc_url="/redoc" if settings.ENABLE_SWAGGER else None,
        lifespan=lifespan
    )
    
    # Add rate limiting
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    
    # Add CORS middleware
    if settings.ENABLE_CORS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.CORS_ORIGINS,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    
    # Include routers
    app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
    app.include_router(cards.router, prefix="/api/v1/cards", tags=["Cards"])
    app.include_router(scan.router, prefix="/api/v1/scan", tags=["Scanning"])
    app.include_router(collection.router, prefix="/api/v1/collection", tags=["Collection"])
    app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
    app.include_router(moderation.router, prefix="/api/v1/moderation", tags=["Moderation"])
    app.include_router(monitoring.router, prefix="/api/v1/monitoring", tags=["Monitoring"])
    
    return app


app = create_app()


@app.get("/")
async def root() -> Dict[str, Any]:
    """Root endpoint with API information"""
    return {
        "message": "Welcome to Scanémon API! 🎴",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs" if settings.ENABLE_SWAGGER else "disabled",
        "endpoints": {
            "auth": "/api/v1/auth",
            "cards": "/api/v1/cards",
            "scan": "/api/v1/scan",
            "collection": "/api/v1/collection",
            "analytics": "/api/v1/analytics",
            "moderation": "/api/v1/moderation",
            "monitoring": "/api/v1/monitoring"
        }
    }


@app.get("/health")
async def health_check() -> Dict[str, Any]:
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": "2024-01-01T00:00:00Z"
    }


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc: Exception):
    """Handle general exceptions"""
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG,
        log_level="info"
    ) 