"""
Moderation routes for Scanémon API
Handles user reports, feedback, and moderation queue
"""

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))

from fastapi import APIRouter, HTTPException, status, Depends, Request, Query
from fastapi.responses import JSONResponse
from typing import Optional
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.moderation_service import ModerationService
from app.services.auth_service import AuthService
from app.schemas.moderation import (
    CreateReportRequest, UpdateReportRequest, CreateFeedbackRequest,
    ReportResponse, FeedbackResponse, ModerationStatsResponse, 
    FeedbackStatsResponse, ModerationQueueResponse, ReportsListResponse
)
from app.models.moderation import ReportReason, ReportStatus

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


@router.post("/report", response_model=ReportResponse)
async def create_report(
    report_data: CreateReportRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """Create a new report for a scan"""
    try:
        moderation_service = ModerationService(db)
        
        # Get user ID if authenticated
        user_id = get_current_user_id(request, db)
        
        # Create the report
        report = moderation_service.create_report(
            scan_id=report_data.scan_id,
            reason=ReportReason(report_data.reason.value),
            description=report_data.description,
            reporter_id=user_id,
            reporter_ip=request.client.host if request.client else None,
            reporter_user_agent=request.headers.get("User-Agent")
        )
        
        return report
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create report: {str(e)}"
        )


@router.get("/reports", response_model=ReportsListResponse)
async def get_reports(
    scan_id: Optional[int] = Query(None, description="Filter by scan ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(50, ge=1, le=100, description="Number of reports to return"),
    offset: int = Query(0, ge=0, description="Number of reports to skip"),
    db: Session = Depends(get_db)
):
    """Get reports with optional filtering"""
    try:
        moderation_service = ModerationService(db)
        
        if scan_id:
            # Get reports for specific scan
            reports = moderation_service.get_reports_by_scan(scan_id)
            total = len(reports)
        else:
            # Get pending reports (for now, only pending reports are accessible)
            reports, total = moderation_service.get_pending_reports(limit, offset)
        
        return ReportsListResponse(
            reports=reports,
            total=total
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get reports: {str(e)}"
        )


@router.put("/reports/{report_id}", response_model=ReportResponse)
async def update_report(
    report_id: int,
    update_data: UpdateReportRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """Update a report status (moderator only)"""
    try:
        # Check if user is authenticated and has moderator privileges
        user_id = get_current_user_id(request, db)
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required"
            )
        
        # TODO: Add moderator role check here
        # For now, allow any authenticated user to update reports
        
        moderation_service = ModerationService(db)
        
        success = moderation_service.update_report_status(
            report_id=report_id,
            status=ReportStatus(update_data.status.value),
            moderator_id=user_id,
            moderator_notes=update_data.moderator_notes
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found"
            )
        
        # Get updated report
        reports, _ = moderation_service.get_pending_reports(limit=1000)
        updated_report = next((r for r in reports if r.id == report_id), None)
        
        if not updated_report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Updated report not found"
            )
        
        return updated_report
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update report: {str(e)}"
        )


@router.post("/feedback", response_model=FeedbackResponse)
async def create_feedback(
    feedback_data: CreateFeedbackRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """Create user feedback for a scan"""
    try:
        moderation_service = ModerationService(db)
        
        # Get user ID if authenticated
        user_id = get_current_user_id(request, db)
        
        # Create the feedback
        feedback = moderation_service.log_user_feedback(
            scan_id=feedback_data.scan_id,
            feedback_type=feedback_data.feedback_type.value,
            feedback_message=feedback_data.feedback_message,
            satisfaction_score=feedback_data.satisfaction_score,
            user_id=user_id,
            user_ip=request.client.host if request.client else None,
            user_agent=request.headers.get("User-Agent")
        )
        
        return feedback
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create feedback: {str(e)}"
        )


@router.get("/stats", response_model=ModerationStatsResponse)
async def get_moderation_stats(
    days: int = Query(30, ge=1, le=365, description="Number of days to include in statistics"),
    db: Session = Depends(get_db)
):
    """Get moderation statistics"""
    try:
        moderation_service = ModerationService(db)
        stats = moderation_service.get_report_statistics(days)
        return ModerationStatsResponse(**stats)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get moderation stats: {str(e)}"
        )


@router.get("/feedback/stats", response_model=FeedbackStatsResponse)
async def get_feedback_stats(
    days: int = Query(30, ge=1, le=365, description="Number of days to include in statistics"),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """Get user feedback statistics"""
    try:
        moderation_service = ModerationService(db)
        
        # Get user ID if authenticated
        user_id = get_current_user_id(request, db) if request else None
        
        stats = moderation_service.get_feedback_statistics(user_id, days)
        return FeedbackStatsResponse(**stats)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get feedback stats: {str(e)}"
        )


@router.get("/queue", response_model=ModerationQueueResponse)
async def get_moderation_queue(
    limit: int = Query(20, ge=1, le=100, description="Number of reports to return"),
    offset: int = Query(0, ge=0, description="Number of reports to skip"),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """Get moderation queue (moderator only)"""
    try:
        # Check if user is authenticated
        user_id = get_current_user_id(request, db) if request else None
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required"
            )
        
        # TODO: Add moderator role check here
        # For now, allow any authenticated user to view the queue
        
        moderation_service = ModerationService(db)
        reports, total = moderation_service.get_pending_reports(limit, offset)
        
        return ModerationQueueResponse(
            reports=reports,
            total=total,
            limit=limit,
            offset=offset
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get moderation queue: {str(e)}"
        ) 