"""
Comprehensive monitoring service for production readiness
"""

import time
import psutil
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass
import asyncio
import json

from app.services.cache_service import cache_service, get_cache_stats
from app.core.database import health_check as db_health_check, get_database_info
from app.services.ml_service import ml_service
from app.services.card_detector import card_detector

logger = logging.getLogger(__name__)

@dataclass
class SystemMetrics:
    """System performance metrics"""
    cpu_percent: float
    memory_percent: float
    disk_usage_percent: float
    network_io: Dict[str, float]
    timestamp: datetime

@dataclass
class ApplicationMetrics:
    """Application-specific metrics"""
    active_connections: int
    request_count: int
    error_count: int
    avg_response_time: float
    cache_hit_rate: float
    ml_model_status: str
    database_status: str
    timestamp: datetime

class MonitoringService:
    """Comprehensive monitoring service"""
    
    def __init__(self):
        self.metrics_history: List[SystemMetrics] = []
        self.app_metrics_history: List[ApplicationMetrics] = []
        self.max_history_size = 1000
        self.start_time = datetime.utcnow()
        
        # Performance tracking
        self.request_times: List[float] = []
        self.error_counts = {
            "4xx": 0,
            "5xx": 0,
            "timeout": 0,
            "database": 0,
            "ml": 0
        }
        
        # Health check intervals
        self.last_health_check = datetime.utcnow()
        self.health_check_interval = 300  # 5 minutes
    
    def get_system_metrics(self) -> SystemMetrics:
        """Get current system metrics"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            network = psutil.net_io_counters()
            
            return SystemMetrics(
                cpu_percent=cpu_percent,
                memory_percent=memory.percent,
                disk_usage_percent=disk.percent,
                network_io={
                    "bytes_sent": network.bytes_sent,
                    "bytes_recv": network.bytes_recv,
                    "packets_sent": network.packets_sent,
                    "packets_recv": network.packets_recv
                },
                timestamp=datetime.utcnow()
            )
        except Exception as e:
            logger.error(f"Failed to get system metrics: {e}")
            return SystemMetrics(0, 0, 0, {}, datetime.utcnow())
    
    def get_application_metrics(self) -> ApplicationMetrics:
        """Get current application metrics"""
        try:
            # Calculate average response time
            avg_response_time = sum(self.request_times) / len(self.request_times) if self.request_times else 0
            
            # Get cache stats
            cache_stats = get_cache_stats()
            cache_hit_rate = 0.0
            if cache_stats.get("backend") == "redis":
                hits = cache_stats.get("keyspace_hits", 0)
                misses = cache_stats.get("keyspace_misses", 0)
                total = hits + misses
                cache_hit_rate = (hits / total * 100) if total > 0 else 0.0
            
            # Check ML model status
            ml_status = "healthy" if ml_service.is_initialized else "uninitialized"
            
            # Check database status
            db_status = "healthy" if db_health_check() else "unhealthy"
            
            return ApplicationMetrics(
                active_connections=len(self.request_times),
                request_count=len(self.request_times),
                error_count=sum(self.error_counts.values()),
                avg_response_time=avg_response_time,
                cache_hit_rate=cache_hit_rate,
                ml_model_status=ml_status,
                database_status=db_status,
                timestamp=datetime.utcnow()
            )
        except Exception as e:
            logger.error(f"Failed to get application metrics: {e}")
            return ApplicationMetrics(0, 0, 0, 0.0, 0.0, "error", "error", datetime.utcnow())
    
    def record_request_time(self, response_time: float):
        """Record request response time"""
        self.request_times.append(response_time)
        
        # Keep only last 1000 requests
        if len(self.request_times) > 1000:
            self.request_times = self.request_times[-1000:]
    
    def record_error(self, error_type: str):
        """Record an error occurrence"""
        if error_type in self.error_counts:
            self.error_counts[error_type] += 1
    
    def get_uptime(self) -> Dict[str, Any]:
        """Get application uptime information"""
        uptime = datetime.utcnow() - self.start_time
        
        return {
            "start_time": self.start_time.isoformat(),
            "uptime_seconds": int(uptime.total_seconds()),
            "uptime_formatted": str(uptime).split('.')[0],  # Remove microseconds
            "days": uptime.days,
            "hours": uptime.seconds // 3600,
            "minutes": (uptime.seconds % 3600) // 60
        }
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """Get comprehensive performance summary"""
        if not self.request_times:
            return {"message": "No performance data available"}
        
        sorted_times = sorted(self.request_times)
        
        return {
            "total_requests": len(self.request_times),
            "avg_response_time": sum(self.request_times) / len(self.request_times),
            "min_response_time": min(self.request_times),
            "max_response_time": max(self.request_times),
            "median_response_time": sorted_times[len(sorted_times) // 2],
            "p95_response_time": sorted_times[int(len(sorted_times) * 0.95)],
            "p99_response_time": sorted_times[int(len(sorted_times) * 0.99)],
            "error_rate": (sum(self.error_counts.values()) / len(self.request_times) * 100) if self.request_times else 0,
            "error_breakdown": self.error_counts
        }
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get comprehensive health status"""
        current_time = datetime.utcnow()
        
        # Get current metrics
        system_metrics = self.get_system_metrics()
        app_metrics = self.get_application_metrics()
        
        # Store metrics in history
        self.metrics_history.append(system_metrics)
        self.app_metrics_history.append(app_metrics)
        
        # Trim history
        if len(self.metrics_history) > self.max_history_size:
            self.metrics_history = self.metrics_history[-self.max_history_size:]
        if len(self.app_metrics_history) > self.max_history_size:
            self.app_metrics_history = self.app_metrics_history[-self.max_history_size:]
        
        # Determine overall health
        health_checks = {
            "database": db_health_check(),
            "cache": cache_service.health_check() if hasattr(cache_service, 'health_check') else True,
            "ml_model": ml_service.is_initialized,
            "system_resources": (
                system_metrics.cpu_percent < 80 and
                system_metrics.memory_percent < 85 and
                system_metrics.disk_usage_percent < 90
            )
        }
        
        overall_health = all(health_checks.values())
        
        return {
            "status": "healthy" if overall_health else "degraded",
            "timestamp": current_time.isoformat(),
            "uptime": self.get_uptime(),
            "health_checks": health_checks,
            "system_metrics": {
                "cpu_percent": system_metrics.cpu_percent,
                "memory_percent": system_metrics.memory_percent,
                "disk_usage_percent": system_metrics.disk_usage_percent
            },
            "application_metrics": {
                "active_connections": app_metrics.active_connections,
                "avg_response_time": app_metrics.avg_response_time,
                "cache_hit_rate": app_metrics.cache_hit_rate,
                "error_count": app_metrics.error_count
            },
            "performance_summary": self.get_performance_summary()
        }
    
    def get_metrics_history(self, hours: int = 24) -> Dict[str, Any]:
        """Get metrics history for the specified time period"""
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        
        system_history = [
            {
                "timestamp": m.timestamp.isoformat(),
                "cpu_percent": m.cpu_percent,
                "memory_percent": m.memory_percent,
                "disk_usage_percent": m.disk_usage_percent
            }
            for m in self.metrics_history
            if m.timestamp > cutoff_time
        ]
        
        app_history = [
            {
                "timestamp": m.timestamp.isoformat(),
                "request_count": m.request_count,
                "avg_response_time": m.avg_response_time,
                "cache_hit_rate": m.cache_hit_rate,
                "error_count": m.error_count
            }
            for m in self.app_metrics_history
            if m.timestamp > cutoff_time
        ]
        
        return {
            "system_metrics": system_history,
            "application_metrics": app_history,
            "time_range_hours": hours
        }
    
    def get_alerts(self) -> List[Dict[str, Any]]:
        """Get current system alerts"""
        alerts = []
        current_time = datetime.utcnow()
        
        # System resource alerts
        system_metrics = self.get_system_metrics()
        if system_metrics.cpu_percent > 80:
            alerts.append({
                "type": "warning",
                "message": f"High CPU usage: {system_metrics.cpu_percent}%",
                "timestamp": current_time.isoformat(),
                "severity": "medium"
            })
        
        if system_metrics.memory_percent > 85:
            alerts.append({
                "type": "warning",
                "message": f"High memory usage: {system_metrics.memory_percent}%",
                "timestamp": current_time.isoformat(),
                "severity": "high"
            })
        
        if system_metrics.disk_usage_percent > 90:
            alerts.append({
                "type": "critical",
                "message": f"High disk usage: {system_metrics.disk_usage_percent}%",
                "timestamp": current_time.isoformat(),
                "severity": "critical"
            })
        
        # Application alerts
        app_metrics = self.get_application_metrics()
        if app_metrics.avg_response_time > 1000:  # 1 second
            alerts.append({
                "type": "warning",
                "message": f"Slow response time: {app_metrics.avg_response_time:.2f}ms",
                "timestamp": current_time.isoformat(),
                "severity": "medium"
            })
        
        if app_metrics.error_count > 10:
            alerts.append({
                "type": "error",
                "message": f"High error count: {app_metrics.error_count}",
                "timestamp": current_time.isoformat(),
                "severity": "high"
            })
        
        # Service health alerts
        if not db_health_check():
            alerts.append({
                "type": "critical",
                "message": "Database connection failed",
                "timestamp": current_time.isoformat(),
                "severity": "critical"
            })
        
        if not ml_service.is_initialized:
            alerts.append({
                "type": "warning",
                "message": "ML model not initialized",
                "timestamp": current_time.isoformat(),
                "severity": "medium"
            })
        
        return alerts
    
    def export_metrics(self, format: str = "json") -> str:
        """Export metrics in specified format"""
        data = {
            "export_timestamp": datetime.utcnow().isoformat(),
            "uptime": self.get_uptime(),
            "health_status": self.get_health_status(),
            "performance_summary": self.get_performance_summary(),
            "metrics_history": self.get_metrics_history(24),
            "alerts": self.get_alerts()
        }
        
        if format == "json":
            return json.dumps(data, indent=2)
        else:
            # Could add CSV or other formats here
            return str(data)

# Global monitoring service instance
monitoring_service = MonitoringService()

# Convenience functions
def get_health_status() -> Dict[str, Any]:
    """Get current health status"""
    return monitoring_service.get_health_status()

def get_performance_summary() -> Dict[str, Any]:
    """Get performance summary"""
    return monitoring_service.get_performance_summary()

def get_alerts() -> List[Dict[str, Any]]:
    """Get current alerts"""
    return monitoring_service.get_alerts()

def record_request_time(response_time: float):
    """Record request response time"""
    monitoring_service.record_request_time(response_time)

def record_error(error_type: str):
    """Record an error"""
    monitoring_service.record_error(error_type) 