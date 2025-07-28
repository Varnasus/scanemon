"""
Usage tracking and freemium limits service
"""

import time
import json
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from dataclasses import dataclass
import logging

from app.services.cache_service import cache_service, CachePrefixes
from app.core.database import get_db
from app.models.user import User

logger = logging.getLogger(__name__)

@dataclass
class UsageLimits:
    """Usage limits for different subscription tiers"""
    free: Dict[str, int] = None
    basic: Dict[str, int] = None
    premium: Dict[str, int] = None
    unlimited: Dict[str, int] = None
    
    def __post_init__(self):
        if self.free is None:
            self.free = {
                "scans_per_day": 10,
                "collections_max": 100,
                "api_calls_per_day": 100,
                "storage_mb": 50,
                "concurrent_scans": 1
            }
        
        if self.basic is None:
            self.basic = {
                "scans_per_day": 100,
                "collections_max": 1000,
                "api_calls_per_day": 1000,
                "storage_mb": 500,
                "concurrent_scans": 3
            }
        
        if self.premium is None:
            self.premium = {
                "scans_per_day": 1000,
                "collections_max": 10000,
                "api_calls_per_day": 10000,
                "storage_mb": 5000,
                "concurrent_scans": 10
            }
        
        if self.unlimited is None:
            self.unlimited = {
                "scans_per_day": -1,  # Unlimited
                "collections_max": -1,
                "api_calls_per_day": -1,
                "storage_mb": -1,
                "concurrent_scans": -1
            }

class UsageService:
    """Service for tracking usage and enforcing limits"""
    
    def __init__(self):
        self.limits = UsageLimits()
        self.usage_cache_ttl = 3600  # 1 hour
    
    def get_user_tier(self, user_id: int) -> str:
        """Get user's subscription tier"""
        try:
            # In a real implementation, this would check the database
            # For now, return 'free' as default
            return "free"
        except Exception as e:
            logger.error(f"Failed to get user tier: {e}")
            return "free"
    
    def get_limits_for_tier(self, tier: str) -> Dict[str, int]:
        """Get usage limits for a specific tier"""
        return getattr(self.limits, tier, self.limits.free)
    
    def track_usage(self, user_id: int, action: str, count: int = 1) -> bool:
        """Track user usage for a specific action"""
        try:
            current_time = datetime.utcnow()
            date_key = current_time.strftime("%Y-%m-%d")
            
            # Get current usage from cache
            cache_key = f"usage:{user_id}:{action}:{date_key}"
            current_usage = cache_service.get(CachePrefixes.USER, cache_key) or 0
            
            # Update usage
            new_usage = current_usage + count
            cache_service.set(CachePrefixes.USER, new_usage, self.usage_cache_ttl, cache_key)
            
            # Log usage
            logger.info(f"Usage tracked: user={user_id}, action={action}, count={count}, total={new_usage}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to track usage: {e}")
            return False
    
    def check_usage_limit(self, user_id: int, action: str, required_count: int = 1) -> Dict[str, Any]:
        """Check if user can perform an action within their limits"""
        try:
            tier = self.get_user_tier(user_id)
            limits = self.get_limits_for_tier(tier)
            
            # Check if action has a limit
            limit_key = self._get_limit_key_for_action(action)
            if limit_key not in limits:
                return {"allowed": True, "remaining": -1, "limit": -1}
            
            limit = limits[limit_key]
            
            # Unlimited tier
            if limit == -1:
                return {"allowed": True, "remaining": -1, "limit": -1}
            
            # Get current usage
            current_time = datetime.utcnow()
            date_key = current_time.strftime("%Y-%m-%d")
            cache_key = f"usage:{user_id}:{action}:{date_key}"
            current_usage = cache_service.get(CachePrefixes.USER, cache_key) or 0
            
            # Check if within limit
            remaining = limit - current_usage
            allowed = remaining >= required_count
            
            return {
                "allowed": allowed,
                "remaining": max(0, remaining),
                "limit": limit,
                "current_usage": current_usage,
                "tier": tier
            }
            
        except Exception as e:
            logger.error(f"Failed to check usage limit: {e}")
            return {"allowed": False, "remaining": 0, "limit": 0, "error": str(e)}
    
    def _get_limit_key_for_action(self, action: str) -> str:
        """Map action to limit key"""
        action_mapping = {
            "scan": "scans_per_day",
            "api_call": "api_calls_per_day",
            "collection_add": "collections_max",
            "storage_upload": "storage_mb",
            "concurrent_scan": "concurrent_scans"
        }
        return action_mapping.get(action, "api_calls_per_day")
    
    def get_user_usage_summary(self, user_id: int) -> Dict[str, Any]:
        """Get comprehensive usage summary for a user"""
        try:
            tier = self.get_user_tier(user_id)
            limits = self.get_limits_for_tier(tier)
            current_time = datetime.utcnow()
            date_key = current_time.strftime("%Y-%m-%d")
            
            usage_summary = {
                "user_id": user_id,
                "tier": tier,
                "date": date_key,
                "limits": limits,
                "usage": {},
                "remaining": {},
                "percentage_used": {}
            }
            
            # Get usage for each tracked action
            actions = ["scan", "api_call", "collection_add", "storage_upload"]
            
            for action in actions:
                limit_key = self._get_limit_key_for_action(action)
                if limit_key in limits:
                    cache_key = f"usage:{user_id}:{action}:{date_key}"
                    current_usage = cache_service.get(CachePrefixes.USER, cache_key) or 0
                    limit = limits[limit_key]
                    
                    usage_summary["usage"][action] = current_usage
                    usage_summary["remaining"][action] = max(0, limit - current_usage) if limit != -1 else -1
                    
                    if limit != -1 and limit > 0:
                        usage_summary["percentage_used"][action] = (current_usage / limit) * 100
                    else:
                        usage_summary["percentage_used"][action] = 0
            
            return usage_summary
            
        except Exception as e:
            logger.error(f"Failed to get usage summary: {e}")
            return {"error": str(e)}
    
    def reset_daily_usage(self, user_id: int) -> bool:
        """Reset daily usage counters (called by scheduled task)"""
        try:
            current_time = datetime.utcnow()
            date_key = current_time.strftime("%Y-%m-%d")
            
            actions = ["scan", "api_call", "collection_add", "storage_upload"]
            
            for action in actions:
                cache_key = f"usage:{user_id}:{action}:{date_key}"
                cache_service.delete(CachePrefixes.USER, cache_key)
            
            logger.info(f"Reset daily usage for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to reset daily usage: {e}")
            return False
    
    def upgrade_user_tier(self, user_id: int, new_tier: str) -> bool:
        """Upgrade user to a new tier"""
        try:
            # In a real implementation, this would update the database
            # For now, just log the upgrade
            logger.info(f"User {user_id} upgraded to tier: {new_tier}")
            
            # Clear usage cache to refresh limits
            self._clear_user_usage_cache(user_id)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to upgrade user tier: {e}")
            return False
    
    def _clear_user_usage_cache(self, user_id: int):
        """Clear user's usage cache"""
        try:
            # Clear all usage-related cache entries for the user
            cache_service.invalidate_user_cache(user_id)
        except Exception as e:
            logger.error(f"Failed to clear user usage cache: {e}")
    
    def get_tier_comparison(self) -> Dict[str, Any]:
        """Get comparison of all subscription tiers"""
        return {
            "tiers": {
                "free": {
                    "name": "Free",
                    "price": "$0/month",
                    "limits": self.limits.free,
                    "features": [
                        "10 scans per day",
                        "100 cards max",
                        "Basic card recognition",
                        "Community support"
                    ]
                },
                "basic": {
                    "name": "Basic",
                    "price": "$9.99/month",
                    "limits": self.limits.basic,
                    "features": [
                        "100 scans per day",
                        "1,000 cards max",
                        "Advanced card recognition",
                        "Collection analytics",
                        "Email support"
                    ]
                },
                "premium": {
                    "name": "Premium",
                    "price": "$19.99/month",
                    "limits": self.limits.premium,
                    "features": [
                        "1,000 scans per day",
                        "10,000 cards max",
                        "Premium card recognition",
                        "Advanced analytics",
                        "Price tracking",
                        "Priority support"
                    ]
                },
                "unlimited": {
                    "name": "Unlimited",
                    "price": "$49.99/month",
                    "limits": self.limits.unlimited,
                    "features": [
                        "Unlimited scans",
                        "Unlimited cards",
                        "All features",
                        "API access",
                        "Dedicated support"
                    ]
                }
            }
        }

# Global usage service instance
usage_service = UsageService()

# Convenience functions
def check_scan_limit(user_id: int) -> Dict[str, Any]:
    """Check if user can perform a scan"""
    return usage_service.check_usage_limit(user_id, "scan", 1)

def track_scan_usage(user_id: int) -> bool:
    """Track a scan usage"""
    return usage_service.track_usage(user_id, "scan", 1)

def get_user_usage(user_id: int) -> Dict[str, Any]:
    """Get user's current usage"""
    return usage_service.get_user_usage_summary(user_id)

def get_tier_comparison() -> Dict[str, Any]:
    """Get subscription tier comparison"""
    return usage_service.get_tier_comparison() 