"""
Analytics routes for Scanémon API
Provides comprehensive scan analytics and performance metrics
"""

import time
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.scan_analytics_service import ScanAnalyticsService
from app.schemas.analytics import (
    ScanStatsResponse,
    ConfidenceDistributionResponse,
    ModelPerformanceResponse,
    ErrorAnalysisResponse,
    ScanHistoryResponse,
    ScanSessionResponse
)
from app.services.auth_service import AuthService

router = APIRouter()


def get_current_user_id(request: Request, db: Session = Depends(get_db)) -> Optional[int]:
    """Get current user ID from authentication token"""
    try:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            auth_service = AuthService(db)
            return auth_service.verify_token(token)
    except Exception:
        pass
    return None


@router.get("/stats", response_model=ScanStatsResponse)
async def get_scan_stats(
    days: int = Query(30, description="Number of days to analyze", ge=1, le=365),
    user_id: Optional[int] = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive scan statistics
    
    Returns:
    - Total scans, success rates, acceptance rates
    - Confidence score statistics
    - Processing time metrics
    - Most scanned cards and sets
    - Daily scan trends
    """
    analytics_service = ScanAnalyticsService(db)
    stats = analytics_service.get_scan_stats(user_id=user_id, days=days)
    
    return ScanStatsResponse(**stats)


@router.get("/confidence-distribution", response_model=ConfidenceDistributionResponse)
async def get_confidence_distribution(
    user_id: Optional[int] = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get confidence score distribution across different ranges
    
    Returns:
    - Distribution of confidence scores (0-20%, 20-40%, etc.)
    - Total number of scans with confidence scores
    """
    analytics_service = ScanAnalyticsService(db)
    distribution = analytics_service.get_confidence_distribution(user_id=user_id)
    
    total_scans = sum(distribution.values())
    
    return ConfidenceDistributionResponse(
        distribution=distribution,
        total_scans=total_scans
    )


@router.get("/model-performance", response_model=ModelPerformanceResponse)
async def get_model_performance(
    model_version: Optional[str] = Query(None, description="Filter by specific model version"),
    db: Session = Depends(get_db)
):
    """
    Get model performance metrics
    
    Returns:
    - Success rates by model version
    - Average confidence scores
    - Processing time statistics
    """
    analytics_service = ScanAnalyticsService(db)
    performance = analytics_service.get_model_performance(model_version=model_version)
    
    return ModelPerformanceResponse(**performance)


@router.get("/error-analysis", response_model=ErrorAnalysisResponse)
async def get_error_analysis(
    user_id: Optional[int] = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get error type analysis
    
    Returns:
    - Count of errors by type
    - Total number of errors
    """
    analytics_service = ScanAnalyticsService(db)
    error_counts = analytics_service.get_error_analysis(user_id=user_id)
    
    total_errors = sum(error_counts.values())
    
    return ErrorAnalysisResponse(
        error_counts=error_counts,
        total_errors=total_errors
    )


@router.get("/history", response_model=ScanHistoryResponse)
async def get_scan_history(
    page: int = Query(1, description="Page number", ge=1),
    limit: int = Query(50, description="Items per page", ge=1, le=100),
    user_id: Optional[int] = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get user's scan history with pagination
    
    Returns:
    - List of scan analytics with pagination
    - Total count and pagination metadata
    """
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to view scan history"
        )
    
    analytics_service = ScanAnalyticsService(db)
    offset = (page - 1) * limit
    
    scans, total = analytics_service.get_user_scan_history(
        user_id=user_id,
        limit=limit,
        offset=offset
    )
    
    has_more = (page * limit) < total
    
    return ScanHistoryResponse(
        scans=scans,
        total=total,
        page=page,
        limit=limit,
        has_more=has_more
    )


@router.get("/session/{session_id}", response_model=ScanSessionResponse)
async def get_scan_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    """
    Get scan session details
    
    Returns:
    - Session metadata and statistics
    - Scan counts and performance metrics
    """
    from app.models.scan_analytics import ScanSession
    
    session = db.query(ScanSession).filter(ScanSession.session_id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan session not found"
        )
    
    return session


@router.post("/session")
async def create_scan_session(
    user_id: Optional[int] = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Create a new scan session
    
    Returns:
    - Session ID for tracking related scans
    """
    analytics_service = ScanAnalyticsService(db)
    session_id = analytics_service.create_scan_session(user_id=user_id)
    
    return {
        "session_id": session_id,
        "message": "Scan session created successfully"
    }


@router.get("/realtime")
async def get_realtime_stats(
    db: Session = Depends(get_db)
):
    """
    Get real-time scan statistics (last 24 hours)
    
    Returns:
    - Current scan activity
    - Recent performance metrics
    """
    analytics_service = ScanAnalyticsService(db)
    
    # Get stats for last 24 hours
    stats_24h = analytics_service.get_scan_stats(days=1)
    
    # Get stats for last hour
    from datetime import datetime, timedelta
    from sqlalchemy import func
    from app.models.scan_analytics import ScanAnalytics
    
    one_hour_ago = datetime.utcnow() - timedelta(hours=1)
    recent_scans = db.query(ScanAnalytics).filter(
        ScanAnalytics.created_at >= one_hour_ago
    ).count()
    
    # Get current active sessions
    from app.models.scan_analytics import ScanSession
    active_sessions = db.query(ScanSession).filter(
        ScanSession.status == "active"
    ).count()
    
    return {
        "last_24_hours": stats_24h,
        "last_hour_scans": recent_scans,
        "active_sessions": active_sessions,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


@router.get("/leaderboard")
async def get_scan_leaderboard(
    days: int = Query(7, description="Number of days for leaderboard", ge=1, le=30),
    db: Session = Depends(get_db)
):
    """
    Get scan leaderboard (most active users)
    
    Returns:
    - Top users by scan count
    - User statistics and achievements
    """
    from datetime import datetime, timedelta
    from sqlalchemy import func
    from app.models.scan_analytics import ScanAnalytics
    from app.models.user import User
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Get top users by scan count
    top_users = db.query(
        User.username,
        User.display_name,
        func.count(ScanAnalytics.id).label('scan_count'),
        func.avg(ScanAnalytics.confidence_score).label('avg_confidence')
    ).join(ScanAnalytics, User.id == ScanAnalytics.user_id).filter(
        ScanAnalytics.created_at >= start_date
    ).group_by(User.id, User.username, User.display_name).order_by(
        func.count(ScanAnalytics.id).desc()
    ).limit(10).all()
    
    return {
        "period_days": days,
        "leaderboard": [
            {
                "username": user.username,
                "display_name": user.display_name,
                "scan_count": user.scan_count,
                "average_confidence": round(user.avg_confidence, 3) if user.avg_confidence else 0
            }
            for user in top_users
        ]
    } 