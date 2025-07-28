"""
Growth analytics service for business intelligence and monitoring
"""

import json
import time
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass
import logging

from app.services.cache_service import cache_service, CachePrefixes
from app.services.usage_service import usage_service
from app.services.payment_service import payment_service

logger = logging.getLogger(__name__)

@dataclass
class GrowthMetrics:
    """Growth metrics data structure"""
    total_users: int
    active_users: int
    new_users_today: int
    new_users_week: int
    new_users_month: int
    revenue_today: float
    revenue_week: float
    revenue_month: float
    conversion_rate: float
    churn_rate: float
    arpu: float  # Average Revenue Per User
    mrr: float   # Monthly Recurring Revenue

class GrowthService:
    """Service for growth analytics and business intelligence"""
    
    def __init__(self):
        self.metrics_cache_ttl = 1800  # 30 minutes
        self.analytics_cache_ttl = 3600  # 1 hour
    
    def get_growth_metrics(self) -> Dict[str, Any]:
        """Get comprehensive growth metrics"""
        try:
            # Try to get from cache first
            cached_metrics = cache_service.get(CachePrefixes.ANALYTICS, "growth_metrics")
            if cached_metrics:
                return cached_metrics
            
            # Calculate metrics
            metrics = self._calculate_growth_metrics()
            
            # Cache the results
            cache_service.set(CachePrefixes.ANALYTICS, metrics, self.metrics_cache_ttl, "growth_metrics")
            
            return metrics
            
        except Exception as e:
            logger.error(f"Failed to get growth metrics: {e}")
            return {"error": str(e)}
    
    def _calculate_growth_metrics(self) -> Dict[str, Any]:
        """Calculate growth metrics"""
        # Mock data for demonstration
        # In a real implementation, this would query the database
        
        current_time = datetime.utcnow()
        
        metrics = {
            "timestamp": current_time.isoformat(),
            "total_users": 1250,
            "active_users": 890,
            "new_users_today": 15,
            "new_users_week": 95,
            "new_users_month": 320,
            "revenue_today": 245.50,
            "revenue_week": 1680.25,
            "revenue_month": 7250.75,
            "conversion_rate": 12.5,  # Percentage
            "churn_rate": 2.1,        # Percentage
            "arpu": 5.80,             # Average Revenue Per User
            "mrr": 7250.75,           # Monthly Recurring Revenue
            "subscription_tiers": {
                "free": 890,
                "basic": 280,
                "premium": 65,
                "unlimited": 15
            },
            "growth_rate": {
                "daily": 1.2,
                "weekly": 8.5,
                "monthly": 34.2
            }
        }
        
        return metrics
    
    def get_user_acquisition_metrics(self, days: int = 30) -> Dict[str, Any]:
        """Get user acquisition metrics"""
        try:
            cache_key = f"user_acquisition_{days}"
            cached_data = cache_service.get(CachePrefixes.ANALYTICS, cache_key)
            if cached_data:
                return cached_data
            
            # Mock user acquisition data
            acquisition_data = {
                "period_days": days,
                "total_new_users": 320,
                "daily_average": 10.7,
                "acquisition_channels": {
                    "organic": 45,
                    "social_media": 30,
                    "referral": 15,
                    "paid_ads": 10
                },
                "daily_breakdown": self._generate_daily_breakdown(days),
                "conversion_funnel": {
                    "visitors": 5000,
                    "signups": 320,
                    "active_users": 280,
                    "paying_users": 35
                }
            }
            
            cache_service.set(CachePrefixes.ANALYTICS, acquisition_data, self.analytics_cache_ttl, cache_key)
            return acquisition_data
            
        except Exception as e:
            logger.error(f"Failed to get user acquisition metrics: {e}")
            return {"error": str(e)}
    
    def get_revenue_analytics(self, days: int = 30) -> Dict[str, Any]:
        """Get revenue analytics"""
        try:
            cache_key = f"revenue_analytics_{days}"
            cached_data = cache_service.get(CachePrefixes.ANALYTICS, cache_key)
            if cached_data:
                return cached_data
            
            # Mock revenue data
            revenue_data = {
                "period_days": days,
                "total_revenue": 7250.75,
                "daily_average": 241.69,
                "revenue_by_tier": {
                    "basic": 2800.00,
                    "premium": 3250.00,
                    "unlimited": 1200.75
                },
                "revenue_growth": {
                    "daily": 2.5,
                    "weekly": 15.8,
                    "monthly": 68.2
                },
                "daily_breakdown": self._generate_revenue_breakdown(days),
                "subscription_metrics": {
                    "total_subscriptions": 360,
                    "active_subscriptions": 340,
                    "cancelled_this_month": 20,
                    "renewal_rate": 94.4
                }
            }
            
            cache_service.set(CachePrefixes.ANALYTICS, revenue_data, self.analytics_cache_ttl, cache_key)
            return revenue_data
            
        except Exception as e:
            logger.error(f"Failed to get revenue analytics: {e}")
            return {"error": str(e)}
    
    def get_usage_analytics(self, days: int = 30) -> Dict[str, Any]:
        """Get usage analytics"""
        try:
            cache_key = f"usage_analytics_{days}"
            cached_data = cache_service.get(CachePrefixes.ANALYTICS, cache_key)
            if cached_data:
                return cached_data
            
            # Mock usage data
            usage_data = {
                "period_days": days,
                "total_scans": 15420,
                "daily_average_scans": 514,
                "scans_by_tier": {
                    "free": 8900,
                    "basic": 4200,
                    "premium": 1800,
                    "unlimited": 520
                },
                "popular_features": {
                    "card_scanning": 85,
                    "collection_management": 65,
                    "price_tracking": 45,
                    "social_sharing": 25
                },
                "user_engagement": {
                    "daily_active_users": 890,
                    "weekly_active_users": 1200,
                    "monthly_active_users": 1250,
                    "average_session_duration": 12.5  # minutes
                },
                "feature_usage": {
                    "scans_per_user": 12.3,
                    "collections_per_user": 3.8,
                    "cards_per_collection": 45.2
                }
            }
            
            cache_service.set(CachePrefixes.ANALYTICS, usage_data, self.analytics_cache_ttl, cache_key)
            return usage_data
            
        except Exception as e:
            logger.error(f"Failed to get usage analytics: {e}")
            return {"error": str(e)}
    
    def get_churn_analysis(self, days: int = 30) -> Dict[str, Any]:
        """Get churn analysis"""
        try:
            cache_key = f"churn_analysis_{days}"
            cached_data = cache_service.get(CachePrefixes.ANALYTICS, cache_key)
            if cached_data:
                return cached_data
            
            # Mock churn data
            churn_data = {
                "period_days": days,
                "overall_churn_rate": 2.1,
                "churn_by_tier": {
                    "free": 0.5,
                    "basic": 1.8,
                    "premium": 3.2,
                    "unlimited": 1.0
                },
                "churn_reasons": {
                    "too_expensive": 35,
                    "not_using_enough": 25,
                    "found_alternative": 20,
                    "technical_issues": 15,
                    "other": 5
                },
                "retention_rates": {
                    "day_1": 95.2,
                    "day_7": 78.5,
                    "day_30": 65.3,
                    "day_90": 52.1
                },
                "lifetime_value": {
                    "free": 0.0,
                    "basic": 45.80,
                    "premium": 89.50,
                    "unlimited": 156.25
                }
            }
            
            cache_service.set(CachePrefixes.ANALYTICS, churn_data, self.analytics_cache_ttl, cache_key)
            return churn_data
            
        except Exception as e:
            logger.error(f"Failed to get churn analysis: {e}")
            return {"error": str(e)}
    
    def get_predictions(self) -> Dict[str, Any]:
        """Get growth predictions"""
        try:
            cache_key = "growth_predictions"
            cached_data = cache_service.get(CachePrefixes.ANALYTICS, cache_key)
            if cached_data:
                return cached_data
            
            # Mock predictions
            predictions = {
                "timestamp": datetime.utcnow().isoformat(),
                "next_month": {
                    "projected_users": 1450,
                    "projected_revenue": 8500.00,
                    "growth_rate": 16.0
                },
                "next_quarter": {
                    "projected_users": 2100,
                    "projected_revenue": 12500.00,
                    "growth_rate": 68.0
                },
                "next_year": {
                    "projected_users": 8500,
                    "projected_revenue": 45000.00,
                    "growth_rate": 520.0
                },
                "key_insights": [
                    "Premium tier shows highest retention",
                    "Free to paid conversion rate improving",
                    "Mobile usage increasing rapidly",
                    "Social features driving engagement"
                ],
                "recommendations": [
                    "Focus on premium tier marketing",
                    "Improve free tier conversion funnel",
                    "Enhance mobile experience",
                    "Expand social features"
                ]
            }
            
            cache_service.set(CachePrefixes.ANALYTICS, predictions, self.analytics_cache_ttl, cache_key)
            return predictions
            
        except Exception as e:
            logger.error(f"Failed to get predictions: {e}")
            return {"error": str(e)}
    
    def _generate_daily_breakdown(self, days: int) -> List[Dict[str, Any]]:
        """Generate daily user acquisition breakdown"""
        breakdown = []
        for i in range(days):
            date = datetime.utcnow() - timedelta(days=days - i - 1)
            breakdown.append({
                "date": date.strftime("%Y-%m-%d"),
                "new_users": max(5, int(10 + (i % 7) * 2)),  # Mock pattern
                "cumulative": 320 - (days - i - 1) * 10
            })
        return breakdown
    
    def _generate_revenue_breakdown(self, days: int) -> List[Dict[str, Any]]:
        """Generate daily revenue breakdown"""
        breakdown = []
        for i in range(days):
            date = datetime.utcnow() - timedelta(days=days - i - 1)
            breakdown.append({
                "date": date.strftime("%Y-%m-%d"),
                "revenue": max(150, int(240 + (i % 7) * 20)),  # Mock pattern
                "cumulative": 7250.75 - (days - i - 1) * 240
            })
        return breakdown
    
    def export_analytics_report(self, format: str = "json") -> str:
        """Export comprehensive analytics report"""
        try:
            report = {
                "export_timestamp": datetime.utcnow().isoformat(),
                "growth_metrics": self.get_growth_metrics(),
                "user_acquisition": self.get_user_acquisition_metrics(),
                "revenue_analytics": self.get_revenue_analytics(),
                "usage_analytics": self.get_usage_analytics(),
                "churn_analysis": self.get_churn_analysis(),
                "predictions": self.get_predictions()
            }
            
            if format == "json":
                return json.dumps(report, indent=2)
            else:
                return str(report)
                
        except Exception as e:
            logger.error(f"Failed to export analytics report: {e}")
            return f"Error: {str(e)}"

# Global growth service instance
growth_service = GrowthService()

# Convenience functions
def get_growth_metrics() -> Dict[str, Any]:
    """Get growth metrics"""
    return growth_service.get_growth_metrics()

def get_user_acquisition_metrics(days: int = 30) -> Dict[str, Any]:
    """Get user acquisition metrics"""
    return growth_service.get_user_acquisition_metrics(days)

def get_revenue_analytics(days: int = 30) -> Dict[str, Any]:
    """Get revenue analytics"""
    return growth_service.get_revenue_analytics(days)

def get_usage_analytics(days: int = 30) -> Dict[str, Any]:
    """Get usage analytics"""
    return growth_service.get_usage_analytics(days)

def get_churn_analysis(days: int = 30) -> Dict[str, Any]:
    """Get churn analysis"""
    return growth_service.get_churn_analysis(days)

def get_predictions() -> Dict[str, Any]:
    """Get growth predictions"""
    return growth_service.get_predictions()

def export_analytics_report(format: str = "json") -> str:
    """Export analytics report"""
    return growth_service.export_analytics_report(format) 