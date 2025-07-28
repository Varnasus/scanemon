"""
Monitoring service for tracking performance, errors, and system health
"""

import time
import logging
import json
import os
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict
from collections import defaultdict, deque
import threading
import psutil
import asyncio

logger = logging.getLogger(__name__)

@dataclass
class PerformanceMetric:
    """Performance metric data structure"""
    timestamp: datetime
    operation: str
    duration_ms: float
    success: bool
    error_type: Optional[str] = None
    error_message: Optional[str] = None
    user_id: Optional[str] = None
    session_id: Optional[str] = None

@dataclass
class SystemHealth:
    """System health data structure"""
    timestamp: datetime
    cpu_percent: float
    memory_percent: float
    disk_percent: float
    active_connections: int
    error_rate: float
    response_time_avg: float

class MonitoringService:
    """Comprehensive monitoring service for Scanémon"""
    
    def __init__(self):
        self.performance_metrics: deque = deque(maxlen=10000)  # Keep last 10k metrics
        self.error_log: deque = deque(maxlen=1000)  # Keep last 1k errors
        self.system_health: deque = deque(maxlen=1000)  # Keep last 1k health checks
        self.operation_times: Dict[str, List[float]] = defaultdict(list)
        self.error_counts: Dict[str, int] = defaultdict(int)
        self.user_sessions: Dict[str, Dict[str, Any]] = {}
        
        # Start background monitoring
        self.monitoring_active = True
        self.monitoring_thread = threading.Thread(target=self._background_monitoring, daemon=True)
        self.monitoring_thread.start()
    
    def record_performance(self, operation: str, duration_ms: float, success: bool, 
                          error_type: Optional[str] = None, error_message: Optional[str] = None,
                          user_id: Optional[str] = None, session_id: Optional[str] = None):
        """Record a performance metric"""
        metric = PerformanceMetric(
            timestamp=datetime.utcnow(),
            operation=operation,
            duration_ms=duration_ms,
            success=success,
            error_type=error_type,
            error_message=error_message,
            user_id=user_id,
            session_id=session_id
        )
        
        self.performance_metrics.append(metric)
        self.operation_times[operation].append(duration_ms)
        
        # Keep only last 1000 times per operation
        if len(self.operation_times[operation]) > 1000:
            self.operation_times[operation] = self.operation_times[operation][-1000:]
        
        if not success and error_type:
            self.error_counts[error_type] += 1
    
    def record_error(self, error: Exception, context: Dict[str, Any]):
        """Record an error with context"""
        error_entry = {
            'timestamp': datetime.utcnow(),
            'error_type': type(error).__name__,
            'error_message': str(error),
            'context': context,
            'stack_trace': getattr(error, '__traceback__', None)
        }
        
        self.error_log.append(error_entry)
        self.error_counts[type(error).__name__] += 1
    
    def record_system_health(self):
        """Record current system health metrics"""
        try:
            health = SystemHealth(
                timestamp=datetime.utcnow(),
                cpu_percent=psutil.cpu_percent(interval=1),
                memory_percent=psutil.virtual_memory().percent,
                disk_percent=psutil.disk_usage('/').percent,
                active_connections=len(self.user_sessions),
                error_rate=self._calculate_error_rate(),
                response_time_avg=self._calculate_avg_response_time()
            )
            
            self.system_health.append(health)
            logger.info(f"System health recorded: CPU={health.cpu_percent}%, "
                       f"Memory={health.memory_percent}%, Error rate={health.error_rate:.2f}%")
            
        except Exception as e:
            logger.error(f"Failed to record system health: {e}")
    
    def _calculate_error_rate(self) -> float:
        """Calculate current error rate"""
        if not self.performance_metrics:
            return 0.0
        
        recent_metrics = [m for m in self.performance_metrics 
                         if m.timestamp > datetime.utcnow() - timedelta(minutes=5)]
        
        if not recent_metrics:
            return 0.0
        
        error_count = sum(1 for m in recent_metrics if not m.success)
        return (error_count / len(recent_metrics)) * 100
    
    def _calculate_avg_response_time(self) -> float:
        """Calculate average response time"""
        if not self.performance_metrics:
            return 0.0
        
        recent_metrics = [m for m in self.performance_metrics 
                         if m.timestamp > datetime.utcnow() - timedelta(minutes=5)]
        
        if not recent_metrics:
            return 0.0
        
        return sum(m.duration_ms for m in recent_metrics) / len(recent_metrics)
    
    def _background_monitoring(self):
        """Background monitoring thread"""
        while self.monitoring_active:
            try:
                self.record_system_health()
                time.sleep(60)  # Record health every minute
            except Exception as e:
                logger.error(f"Background monitoring error: {e}")
                time.sleep(60)
    
    def get_performance_summary(self, hours: int = 24) -> Dict[str, Any]:
        """Get performance summary for the last N hours"""
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        recent_metrics = [m for m in self.performance_metrics if m.timestamp > cutoff_time]
        
        if not recent_metrics:
            return {
                'total_operations': 0,
                'success_rate': 0.0,
                'avg_response_time': 0.0,
                'error_rate': 0.0,
                'top_operations': [],
                'top_errors': []
            }
        
        # Calculate basic stats
        total_operations = len(recent_metrics)
        success_count = sum(1 for m in recent_metrics if m.success)
        success_rate = (success_count / total_operations) * 100
        avg_response_time = sum(m.duration_ms for m in recent_metrics) / total_operations
        error_rate = 100 - success_rate
        
        # Top operations by count
        operation_counts = defaultdict(int)
        for metric in recent_metrics:
            operation_counts[metric.operation] += 1
        
        top_operations = sorted(operation_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        
        # Top errors
        error_counts = defaultdict(int)
        for metric in recent_metrics:
            if not metric.success and metric.error_type:
                error_counts[metric.error_type] += 1
        
        top_errors = sorted(error_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        
        return {
            'total_operations': total_operations,
            'success_rate': success_rate,
            'avg_response_time': avg_response_time,
            'error_rate': error_rate,
            'top_operations': top_operations,
            'top_errors': top_errors,
            'time_period_hours': hours
        }
    
    def get_system_health_summary(self, hours: int = 1) -> Dict[str, Any]:
        """Get system health summary for the last N hours"""
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        recent_health = [h for h in self.system_health if h.timestamp > cutoff_time]
        
        if not recent_health:
            return {
                'cpu_avg': 0.0,
                'memory_avg': 0.0,
                'disk_avg': 0.0,
                'error_rate_avg': 0.0,
                'response_time_avg': 0.0,
                'active_connections_avg': 0.0
            }
        
        return {
            'cpu_avg': sum(h.cpu_percent for h in recent_health) / len(recent_health),
            'memory_avg': sum(h.memory_percent for h in recent_health) / len(recent_health),
            'disk_avg': sum(h.disk_percent for h in recent_health) / len(recent_health),
            'error_rate_avg': sum(h.error_rate for h in recent_health) / len(recent_health),
            'response_time_avg': sum(h.response_time_avg for h in recent_health) / len(recent_health),
            'active_connections_avg': sum(h.active_connections for h in recent_health) / len(recent_health)
        }
    
    def get_operation_breakdown(self, operation: str, hours: int = 24) -> Dict[str, Any]:
        """Get detailed breakdown for a specific operation"""
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        operation_metrics = [m for m in self.performance_metrics 
                           if m.operation == operation and m.timestamp > cutoff_time]
        
        if not operation_metrics:
            return {
                'operation': operation,
                'total_calls': 0,
                'success_rate': 0.0,
                'avg_response_time': 0.0,
                'min_response_time': 0.0,
                'max_response_time': 0.0,
                'error_breakdown': {}
            }
        
        success_count = sum(1 for m in operation_metrics if m.success)
        response_times = [m.duration_ms for m in operation_metrics]
        
        # Error breakdown
        error_breakdown = defaultdict(int)
        for metric in operation_metrics:
            if not metric.success and metric.error_type:
                error_breakdown[metric.error_type] += 1
        
        return {
            'operation': operation,
            'total_calls': len(operation_metrics),
            'success_rate': (success_count / len(operation_metrics)) * 100,
            'avg_response_time': sum(response_times) / len(response_times),
            'min_response_time': min(response_times),
            'max_response_time': max(response_times),
            'error_breakdown': dict(error_breakdown)
        }
    
    def export_metrics(self, filepath: str):
        """Export metrics to JSON file"""
        try:
            data = {
                'export_timestamp': datetime.utcnow().isoformat(),
                'performance_metrics': [asdict(m) for m in self.performance_metrics],
                'error_log': self.error_log,
                'system_health': [asdict(h) for h in self.system_health],
                'operation_times': dict(self.operation_times),
                'error_counts': dict(self.error_counts)
            }
            
            with open(filepath, 'w') as f:
                json.dump(data, f, default=str, indent=2)
            
            logger.info(f"Metrics exported to {filepath}")
            
        except Exception as e:
            logger.error(f"Failed to export metrics: {e}")
    
    def clear_old_metrics(self, days: int = 7):
        """Clear metrics older than N days"""
        cutoff_time = datetime.utcnow() - timedelta(days=days)
        
        # Clear old performance metrics
        self.performance_metrics = deque(
            [m for m in self.performance_metrics if m.timestamp > cutoff_time],
            maxlen=10000
        )
        
        # Clear old error log
        self.error_log = deque(
            [e for e in self.error_log if e['timestamp'] > cutoff_time],
            maxlen=1000
        )
        
        # Clear old system health
        self.system_health = deque(
            [h for h in self.system_health if h.timestamp > cutoff_time],
            maxlen=1000
        )
        
        logger.info(f"Cleared metrics older than {days} days")
    
    def get_alerts(self) -> List[Dict[str, Any]]:
        """Get current system alerts"""
        alerts = []
        
        # Check error rate
        error_rate = self._calculate_error_rate()
        if error_rate > 5.0:  # More than 5% error rate
            alerts.append({
                'type': 'high_error_rate',
                'severity': 'warning',
                'message': f'Error rate is {error_rate:.1f}%',
                'value': error_rate,
                'threshold': 5.0
            })
        
        # Check response time
        avg_response_time = self._calculate_avg_response_time()
        if avg_response_time > 5000:  # More than 5 seconds
            alerts.append({
                'type': 'high_response_time',
                'severity': 'warning',
                'message': f'Average response time is {avg_response_time:.0f}ms',
                'value': avg_response_time,
                'threshold': 5000
            })
        
        # Check system resources
        if self.system_health:
            latest_health = self.system_health[-1]
            
            if latest_health.cpu_percent > 80:
                alerts.append({
                    'type': 'high_cpu',
                    'severity': 'warning',
                    'message': f'CPU usage is {latest_health.cpu_percent:.1f}%',
                    'value': latest_health.cpu_percent,
                    'threshold': 80
                })
            
            if latest_health.memory_percent > 85:
                alerts.append({
                    'type': 'high_memory',
                    'severity': 'warning',
                    'message': f'Memory usage is {latest_health.memory_percent:.1f}%',
                    'value': latest_health.memory_percent,
                    'threshold': 85
                })
        
        return alerts

# Global monitoring service instance
monitoring_service = MonitoringService() 