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
from app.core.database import engine, Base, init_db, get_database_info
from app.routes import auth, cards, scan, collection, analytics, moderation, monitoring, subscriptions, users
from app.core.logging import setup_logging
from app.middleware.security import setup_security_middleware, get_security_info
from app.services.monitoring_service import get_health_status, get_performance_summary, get_alerts
from app.services.resilience_service import get_resilience_status

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
    
    # Initialize database
    try:
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
    
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
    
    # Setup security middleware
    setup_security_middleware(app)
    
    # Add rate limiting (legacy support)
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    
    # Include routers
    app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
    app.include_router(cards.router, prefix="/api/v1/cards", tags=["Cards"])
    app.include_router(scan.router, prefix="/api/v1/scan", tags=["Scanning"])
    app.include_router(collection.router, prefix="/api/v1/collection", tags=["Collection"])
    app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
    app.include_router(moderation.router, prefix="/api/v1/moderation", tags=["Moderation"])
    app.include_router(monitoring.router, prefix="/api/v1/monitoring", tags=["Monitoring"])
    app.include_router(subscriptions.router, prefix="/api/v1", tags=["Subscriptions"])
    app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
    
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
    """Simple health check endpoint for Railway"""
    from datetime import datetime
    
    try:
        # Basic health check without external dependencies
        return {
            "status": "healthy",
            "version": "1.0.0",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "message": "Scanémon API is running"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "version": "1.0.0",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "error": str(e)
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