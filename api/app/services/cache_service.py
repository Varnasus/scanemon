"""
Cache service using Redis for performance optimization
"""

import json
import hashlib
from typing import Any, Optional, Dict, List
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logger.warning("Redis not available, using in-memory cache")

class CacheService:
    """Cache service with Redis backend and in-memory fallback"""
    
    def __init__(self, redis_url: str = "redis://localhost:6379", default_ttl: int = 3600):
        self.default_ttl = default_ttl
        self.redis_client = None
        self.use_redis = False
        
        if REDIS_AVAILABLE:
            try:
                self.redis_client = redis.from_url(redis_url)
                # Test connection
                self.redis_client.ping()
                self.use_redis = True
                logger.info("Redis cache initialized successfully")
            except Exception as e:
                logger.warning(f"Redis connection failed: {e}, using in-memory cache")
                self.use_redis = False
        
        # In-memory cache fallback
        self.memory_cache: Dict[str, Dict[str, Any]] = {}
    
    def _generate_key(self, prefix: str, *args) -> str:
        """Generate cache key from prefix and arguments"""
        key_parts = [prefix] + [str(arg) for arg in args]
        key_string = ":".join(key_parts)
        return hashlib.md5(key_string.encode()).hexdigest()
    
    def get(self, prefix: str, *args) -> Optional[Any]:
        """Get value from cache"""
        key = self._generate_key(prefix, *args)
        
        try:
            if self.use_redis and self.redis_client:
                value = self.redis_client.get(key)
                if value:
                    return json.loads(value)
            else:
                # In-memory cache
                if key in self.memory_cache:
                    cache_entry = self.memory_cache[key]
                    if datetime.utcnow() < cache_entry["expires_at"]:
                        return cache_entry["value"]
                    else:
                        # Expired, remove it
                        del self.memory_cache[key]
            
            return None
            
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            return None
    
    def set(self, prefix: str, value: Any, ttl: Optional[int] = None, *args) -> bool:
        """Set value in cache"""
        key = self._generate_key(prefix, *args)
        ttl = ttl or self.default_ttl
        
        try:
            if self.use_redis and self.redis_client:
                serialized_value = json.dumps(value, default=str)
                return self.redis_client.setex(key, ttl, serialized_value)
            else:
                # In-memory cache
                expires_at = datetime.utcnow() + timedelta(seconds=ttl)
                self.memory_cache[key] = {
                    "value": value,
                    "expires_at": expires_at
                }
                return True
                
        except Exception as e:
            logger.error(f"Cache set error: {e}")
            return False
    
    def delete(self, prefix: str, *args) -> bool:
        """Delete value from cache"""
        key = self._generate_key(prefix, *args)
        
        try:
            if self.use_redis and self.redis_client:
                return bool(self.redis_client.delete(key))
            else:
                # In-memory cache
                if key in self.memory_cache:
                    del self.memory_cache[key]
                    return True
                return False
                
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
            return False
    
    def clear_pattern(self, pattern: str) -> int:
        """Clear all keys matching pattern"""
        try:
            if self.use_redis and self.redis_client:
                keys = self.redis_client.keys(pattern)
                if keys:
                    return self.redis_client.delete(*keys)
                return 0
            else:
                # In-memory cache - simple pattern matching
                deleted_count = 0
                keys_to_delete = []
                
                for key in self.memory_cache.keys():
                    if pattern.replace("*", "") in key:
                        keys_to_delete.append(key)
                
                for key in keys_to_delete:
                    del self.memory_cache[key]
                    deleted_count += 1
                
                return deleted_count
                
        except Exception as e:
            logger.error(f"Cache clear pattern error: {e}")
            return 0
    
    def get_or_set(self, prefix: str, getter_func, ttl: Optional[int] = None, *args) -> Any:
        """Get from cache or set using getter function"""
        cached_value = self.get(prefix, *args)
        
        if cached_value is not None:
            return cached_value
        
        # Get fresh value
        fresh_value = getter_func()
        
        # Cache it
        self.set(prefix, fresh_value, ttl, *args)
        
        return fresh_value
    
    def invalidate_user_cache(self, user_id: int):
        """Invalidate all cache entries for a user"""
        patterns = [
            f"user:{user_id}:*",
            f"collection:{user_id}:*",
            f"analytics:{user_id}:*"
        ]
        
        total_deleted = 0
        for pattern in patterns:
            total_deleted += self.clear_pattern(pattern)
        
        logger.info(f"Invalidated {total_deleted} cache entries for user {user_id}")
        return total_deleted

# Cache prefixes for different data types
class CachePrefixes:
    """Cache key prefixes"""
    USER = "user"
    CARD = "card"
    COLLECTION = "collection"
    ANALYTICS = "analytics"
    SCAN = "scan"
    ML_MODEL = "ml_model"
    SECURITY = "security"

# Global cache service instance
cache_service = CacheService()

# Cache decorator
def cached(prefix: str, ttl: Optional[int] = None):
    """Decorator to cache function results"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Generate cache key from function name and arguments
            args_str = str(args) + str(sorted(kwargs.items()))
            cache_key = f"{prefix}:{func.__name__}:{hash(args_str)}"
            
            # Try to get from cache
            cached_result = cache_service.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            cache_service.set(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator

# Example usage functions
@cached(CachePrefixes.CARD, ttl=3600)
def get_card_info(card_id: int) -> Dict[str, Any]:
    """Get card information (cached)"""
    # This would normally query the database
    return {
        "id": card_id,
        "name": "Pikachu",
        "set": "Base Set",
        "rarity": "Common"
    }

@cached(CachePrefixes.USER, ttl=1800)
def get_user_profile(user_id: int) -> Dict[str, Any]:
    """Get user profile (cached)"""
    # This would normally query the database
    return {
        "id": user_id,
        "username": "pokemon_master",
        "email": "master@example.com",
        "collection_size": 150
    }

def get_cache_stats() -> Dict[str, Any]:
    """Get cache statistics"""
    if cache_service.use_redis and cache_service.redis_client:
        try:
            info = cache_service.redis_client.info()
            return {
                "backend": "redis",
                "connected_clients": info.get("connected_clients", 0),
                "used_memory": info.get("used_memory_human", "0B"),
                "keyspace_hits": info.get("keyspace_hits", 0),
                "keyspace_misses": info.get("keyspace_misses", 0)
            }
        except Exception as e:
            logger.error(f"Failed to get Redis stats: {e}")
            return {"backend": "redis", "error": str(e)}
    else:
        return {
            "backend": "memory",
            "cache_size": len(cache_service.memory_cache),
            "memory_usage": "N/A"
        }

def health_check() -> bool:
    """Check cache health"""
    try:
        if cache_service.use_redis and cache_service.redis_client:
            cache_service.redis_client.ping()
            return True
        else:
            # In-memory cache is always healthy
            return True
    except Exception as e:
        logger.error(f"Cache health check failed: {e}")
        return False 