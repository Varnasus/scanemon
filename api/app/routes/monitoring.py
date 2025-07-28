"""
Monitoring routes for performance and health tracking
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import JSONResponse
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.monitoring_service import monitoring_service
from app.services.resilience_service import resilience_service

router = APIRouter()

@router.get("/performance")
async def get_performance_summary(
    hours: int = Query(24, ge=1, le=168, description="Hours to look back")
):
    """Get performance summary for the last N hours"""
    try:
        summary = monitoring_service.get_performance_summary(hours)
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get performance summary: {str(e)}")

@router.get("/health")
async def get_system_health(
    hours: int = Query(1, ge=1, le=24, description="Hours to look back")
):
    """Get system health summary"""
    try:
        health = monitoring_service.get_system_health_summary(hours)
        return health
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get system health: {str(e)}")

@router.get("/operation/{operation_name}")
async def get_operation_breakdown(
    operation_name: str,
    hours: int = Query(24, ge=1, le=168, description="Hours to look back")
):
    """Get detailed breakdown for a specific operation"""
    try:
        breakdown = monitoring_service.get_operation_breakdown(operation_name, hours)
        return breakdown
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get operation breakdown: {str(e)}")

@router.get("/alerts")
async def get_system_alerts():
    """Get current system alerts"""
    try:
        alerts = monitoring_service.get_alerts()
        return {"alerts": alerts, "count": len(alerts)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get alerts: {str(e)}")

@router.get("/status")
async def get_system_status():
    """Get comprehensive system status"""
    try:
        # Get resilience service status
        resilience_status = resilience_service.get_system_status()
        
        # Get monitoring alerts
        alerts = monitoring_service.get_alerts()
        
        # Get recent performance summary
        performance = monitoring_service.get_performance_summary(1)  # Last hour
        
        # Get system health
        health = monitoring_service.get_system_health_summary(1)  # Last hour
        
        return {
            "resilience": resilience_status,
            "alerts": alerts,
            "performance": performance,
            "health": health,
            "timestamp": monitoring_service.performance_metrics[-1].timestamp if monitoring_service.performance_metrics else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get system status: {str(e)}")

@router.post("/export")
async def export_metrics(
    filepath: str = Query("metrics_export.json", description="Export file path")
):
    """Export all metrics to JSON file"""
    try:
        monitoring_service.export_metrics(filepath)
        return {"message": f"Metrics exported to {filepath}", "filepath": filepath}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export metrics: {str(e)}")

@router.delete("/clear")
async def clear_old_metrics(
    days: int = Query(7, ge=1, le=365, description="Clear metrics older than N days")
):
    """Clear old metrics"""
    try:
        monitoring_service.clear_old_metrics(days)
        return {"message": f"Cleared metrics older than {days} days"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear metrics: {str(e)}")

@router.get("/errors")
async def get_error_summary(
    hours: int = Query(24, ge=1, le=168, description="Hours to look back")
):
    """Get error summary for the last N hours"""
    try:
        from datetime import datetime, timedelta
        
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        recent_errors = [e for e in monitoring_service.error_log if e['timestamp'] > cutoff_time]
        
        # Group errors by type
        error_types = {}
        for error in recent_errors:
            error_type = error['error_type']
            if error_type not in error_types:
                error_types[error_type] = {
                    'count': 0,
                    'examples': [],
                    'contexts': set()
                }
            
            error_types[error_type]['count'] += 1
            error_types[error_type]['examples'].append(error['error_message'])
            error_types[error_type]['contexts'].add(str(error['context']))
            
            # Keep only first 5 examples
            if len(error_types[error_type]['examples']) > 5:
                error_types[error_type]['examples'] = error_types[error_type]['examples'][:5]
        
        # Convert sets to lists for JSON serialization
        for error_type in error_types:
            error_types[error_type]['contexts'] = list(error_types[error_type]['contexts'])
        
        return {
            "total_errors": len(recent_errors),
            "error_types": error_types,
            "time_period_hours": hours
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get error summary: {str(e)}")

@router.get("/operations")
async def get_operations_list():
    """Get list of all tracked operations"""
    try:
        operations = list(monitoring_service.operation_times.keys())
        return {
            "operations": operations,
            "count": len(operations)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get operations list: {str(e)}") 