import sys
import os
import time
import asyncio
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Query, Request, Depends
from fastapi.responses import JSONResponse
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.services.ml_service import ml_service, CardPrediction
from app.services.card_detector import card_detector
from app.core.scan_logger import scan_logger
from app.core.database import get_db
from app.services.scan_analytics_service import ScanAnalyticsService
from app.services.auth_service import AuthService
from app.services.resilience_service import resilience_service

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

async def fallback_scan(file: UploadFile) -> Dict[str, Any]:
    """Fallback scan function for offline/degraded mode"""
    return {
        "name": "Unknown",
        "set": "Unknown", 
        "rarity": "Unknown",
        "type": "Unknown",
        "hp": "Unknown",
        "confidence": 0.0,
        "model_version": "offline_fallback",
        "filename": file.filename if file.filename else "unknown.jpg",
        "error_type": "offline_mode",
        "error_message": "Scanning unavailable in offline mode. Please try again when online.",
        "retry_count": 0,
        "suggest_retry": True,
        "retry_delay_seconds": 5,
        "processing_time_ms": 0,
        "mode": "offline"
    }

@resilience_service.retry_with_backoff(max_retries=2, base_delay=1.0, max_delay=5.0)
async def perform_scan_with_retry(file: UploadFile) -> Dict[str, Any]:
    """Perform scan with retry logic using new ML service"""
    try:
        # Read file bytes
        file_bytes = await file.read()
        
        # Detect cards in image (optional)
        card_detections = card_detector.detect_cards(file_bytes)
        
        # If cards detected, use the first one, otherwise use full image
        if card_detections:
            # Crop to the highest confidence detection
            best_detection = max(card_detections, key=lambda x: x.confidence)
            cropped_bytes = card_detector.crop_card(file_bytes, best_detection.bounding_box)
            image_bytes = cropped_bytes
        else:
            image_bytes = file_bytes
        
        # Identify card using ML service
        prediction = await ml_service.identify_card(image_bytes)
        
        # Convert to legacy format for compatibility
        card_data = {
            "name": prediction.name,
            "set": prediction.set,
            "number": prediction.number,
            "rarity": prediction.rarity,
            "type": "Unknown",  # Will be added later
            "hp": "Unknown",    # Will be added later
            "confidence": prediction.confidence,
            "model_version": prediction.model_version,
            "processing_time_ms": prediction.processing_time_ms,
            "filename": file.filename if file.filename else "unknown.jpg",
            "file_size": len(file_bytes),
            "file_type": file.content_type.split('/')[-1] if file.content_type else None,
            "scan_method": "image",
            "mode": "online",
            "detections": [
                {
                    "bounding_box": detection.bounding_box,
                    "confidence": detection.confidence,
                    "card_type": detection.card_type
                }
                for detection in card_detections
            ] if card_detections else [],
            "metadata": prediction.metadata
        }
        
        return card_data
        
    except Exception as e:
        # Log the error for debugging
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Scan failed: {e}")
        raise e

@router.post("/", response_class=JSONResponse)
async def scan_endpoint(
    file: UploadFile = File(...),
    request: Request = None,
    db: Session = Depends(get_db),
    retry_count: int = Query(0, ge=0, le=2, description="Number of retries attempted")
):
    """Scan a Pokémon card image and return card data with comprehensive analytics and graceful degradation."""
    start_time = time.time()
    
    # Check system status first
    system_status = resilience_service.get_system_status()
    
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
    
    # Use enhanced ML model for prediction with graceful degradation
    try:
        # Check if we should use fallback mode
        if system_status['connection_status'] == 'offline':
            card_data = await fallback_scan(file)
        else:
            # Try online scan with retry logic
            card_data = await perform_scan_with_retry(file)
            
        error_type = None
        error_message = None
        
    except Exception as e:
        # Enhanced error handling with better user feedback
        error_type = "ml_error"
        error_message = str(e)
        
        # Add retry information to error message
        if retry_count > 0:
            error_message = f"Retry {retry_count}: {error_message}"
        
        # Determine if we should suggest retry based on error type
        suggest_retry = retry_count < 2 and error_type != "offline_mode"
        
        card_data = {
            "name": "Unknown",
            "set": "Unknown",
            "rarity": "Unknown", 
            "type": "Unknown",
            "hp": "Unknown",
            "confidence": 0.0,
            "model_version": "error_fallback",
            "filename": file.filename if file.filename else "unknown.jpg",
            "error_type": error_type,
            "error_message": error_message,
            "retry_count": retry_count,
            "suggest_retry": suggest_retry,
            "retry_delay_seconds": 10 if retry_count == 0 else 20,  # 10s first retry, 20s second
            "mode": "error"
        }
    
    # Calculate processing time
    processing_time_ms = int((time.time() - start_time) * 1000)
    card_data["processing_time_ms"] = processing_time_ms
    
    # Add system status information
    card_data["system_status"] = {
        "connection_status": system_status['connection_status'],
        "offline_queue_size": system_status['offline_queue_size'],
        "suggest_offline_mode": system_status['connection_status'] == 'offline'
    }
    
    # Log to legacy system (for backward compatibility)
    log_entry = scan_logger.log_scan(card_data, accepted=False)
    
    # Log to new analytics system
    analytics_service = ScanAnalyticsService(db)
    scan_analytics = analytics_service.log_scan(
        scan_data=card_data,
        user_id=user_id,
        processing_time_ms=processing_time_ms,
        accepted=False,
        error_type=card_data.get("error_type"),
        error_message=card_data.get("error_message"),
        ip_address=request.client.host if request else None,
        user_agent=request.headers.get("User-Agent") if request else None
    )
    
    # Add analytics ID to response for tracking
    card_data["analytics_id"] = scan_analytics.id
    
    # Add log ID for backward compatibility
    card_data["log_id"] = log_entry.get("id", "unknown")
    
    # Add helpful user guidance based on the result
    if card_data.get("error_type"):
        if card_data["error_type"] == "offline_mode":
            card_data["user_guidance"] = {
                "message": "You're currently offline. Your scan will be processed when you're back online.",
                "action": "retry_when_online",
                "priority": "info"
            }
        elif card_data["error_type"] == "ml_error":
            card_data["user_guidance"] = {
                "message": "Scan failed. Try adjusting lighting or taking a clearer photo.",
                "action": "retry_with_better_image",
                "priority": "warning"
            }
    elif card_data.get("confidence", 0) < 0.7:
        card_data["user_guidance"] = {
            "message": "Low confidence scan. Consider retrying with a clearer image.",
            "action": "suggest_retry",
            "priority": "warning"
        }
    else:
        card_data["user_guidance"] = {
            "message": "Scan completed successfully!",
            "action": "add_to_collection",
            "priority": "success"
        }
    
    return card_data

@router.post("/accept/{analytics_id}")
async def accept_scan(
    analytics_id: int,
    added_to_collection: bool = False,
    user_feedback: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Mark a scan as accepted and optionally add to collection"""
    try:
        analytics_service = ScanAnalyticsService(db)
        success = analytics_service.accept_scan(
            analytics_id=analytics_id,
            added_to_collection=added_to_collection,
            user_feedback=user_feedback
        )
        
        if success:
            return {"message": "Scan accepted successfully", "analytics_id": analytics_id}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Scan not found or already accepted"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to accept scan: {str(e)}"
        )

@router.get("/history")
async def get_scan_history(limit: Optional[int] = Query(None, description="Limit number of results")):
    """Get scan history from legacy system"""
    try:
        history = scan_logger.get_recent_scans(limit=limit or 50)
        return {"scans": history}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve scan history: {str(e)}"
        )

@router.get("/stats")
async def get_scan_stats():
    """Get scan statistics"""
    try:
        stats = scan_logger.get_stats()
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve scan stats: {str(e)}"
        )

@router.get("/system-status")
async def get_system_status():
    """Get current system status and health"""
    try:
        # Perform health check
        health_status = await resilience_service.health_check()
        
        status_info = resilience_service.get_system_status()
        status_info["health_check"] = health_status
        
        return status_info
    except Exception as e:
        return {
            "connection_status": "unknown",
            "health_check": False,
            "error": str(e)
        } 