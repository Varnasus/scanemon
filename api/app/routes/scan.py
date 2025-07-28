import sys
import os
import time
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Query, Request, Depends
from fastapi.responses import JSONResponse
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from ml.predict import predict_card
from app.core.scan_logger import scan_logger
from app.core.database import get_db
from app.services.scan_analytics_service import ScanAnalyticsService
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

@router.post("/", response_class=JSONResponse)
async def scan_endpoint(
    file: UploadFile = File(...),
    request: Request = None,
    db: Session = Depends(get_db),
    retry_count: int = Query(0, ge=0, le=2, description="Number of retries attempted")
):
    """Scan a Pokémon card image and return card data with comprehensive analytics."""
    start_time = time.time()
    
    # Accept common image types (jpg, png, webp, gif, etc.)
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid file type. Please upload an image (jpg, png, webp, gif)."
        )
    
    # Simulate large file handling (limit: 10MB)
    if hasattr(file, 'size') and file.size and file.size > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, 
            detail="Image too large. Maximum size is 10MB."
        )
    
    # Get user ID if authenticated
    user_id = None
    if request:
        try:
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
                auth_service = AuthService(db)
                user_id = auth_service.verify_token(token)
        except Exception:
            pass
    
    # Use ML model for prediction with retry logic
    try:
        card_data = predict_card(file)
        error_type = None
        error_message = None
    except Exception as e:
        # Log the error and return error response
        error_type = "ml_error"
        error_message = str(e)
        
        # Add retry information to error message
        if retry_count > 0:
            error_message = f"Retry {retry_count}: {error_message}"
        
        card_data = {
            "name": "Unknown",
            "set": "Unknown",
            "rarity": "Unknown",
            "type": "Unknown",
            "hp": "Unknown",
            "confidence": 0.0,
            "model_version": "unknown",
            "filename": file.filename if file.filename else "unknown.jpg",
            "error_type": error_type,
            "error_message": error_message,
            "retry_count": retry_count,
            "suggest_retry": retry_count < 2,  # Suggest retry for first 2 attempts
            "retry_delay_seconds": 10 if retry_count == 0 else 20  # 10s first retry, 20s second
        }
    
    # Calculate processing time
    processing_time_ms = int((time.time() - start_time) * 1000)
    card_data["processing_time_ms"] = processing_time_ms
    
    # Log to legacy system (for backward compatibility)
    log_entry = scan_logger.log_scan(card_data, accepted=False)
    
    # Log to new analytics system
    analytics_service = ScanAnalyticsService(db)
    scan_analytics = analytics_service.log_scan(
        scan_data=card_data,
        user_id=user_id,
        processing_time_ms=processing_time_ms,
        accepted=False,
        error_type=error_type,
        error_message=error_message,
        ip_address=request.client.host if request else None,
        user_agent=request.headers.get("User-Agent") if request else None
    )
    
    # Add analytics ID to response for tracking
    card_data["analytics_id"] = scan_analytics.id
    card_data["log_id"] = log_entry.get("timestamp")  # Legacy compatibility
    
    # Add retry information if this is a retry
    if retry_count > 0:
        card_data["retry_count"] = retry_count
        card_data["suggest_retry"] = retry_count < 2
        card_data["retry_delay_seconds"] = 10 if retry_count == 0 else 20
    
    return card_data

@router.post("/accept/{analytics_id}")
async def accept_scan(
    analytics_id: int,
    added_to_collection: bool = False,
    user_feedback: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Accept a scan result and update analytics"""
    try:
        analytics_service = ScanAnalyticsService(db)
        
        # Update the scan analytics entry
        success = analytics_service.update_scan_acceptance(
            scan_id=analytics_id,
            accepted=True,
            added_to_collection=added_to_collection
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Scan not found"
            )
        
        # Also update legacy system for backward compatibility
        # This is a simplified approach - in production you'd want to sync properly
        history = scan_logger.get_history()
        
        return {
            "message": "Scan accepted and analytics updated",
            "analytics_id": analytics_id,
            "status": "accepted",
            "added_to_collection": added_to_collection
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to accept scan: {str(e)}"
        )

@router.get("/history")
async def get_scan_history(limit: Optional[int] = Query(None, description="Limit number of results")):
    """Get scan history"""
    history = scan_logger.get_recent_scans(limit)
    return {
        "scans": history,
        "total": len(history)
    }

@router.get("/stats")
async def get_scan_stats():
    """Get scan statistics"""
    return scan_logger.get_stats() 