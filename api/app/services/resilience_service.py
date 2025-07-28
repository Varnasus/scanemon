"""
Resilience service for circuit breakers, retries, and graceful degradation
"""

import asyncio
import time
import logging
from typing import Any, Callable, Optional, Dict, List
from dataclasses import dataclass
from enum import Enum
from datetime import datetime, timedelta
import functools

logger = logging.getLogger(__name__)

class CircuitState(Enum):
    """Circuit breaker states"""
    CLOSED = "closed"      # Normal operation
    OPEN = "open"          # Failing, reject requests
    HALF_OPEN = "half_open"  # Testing if service recovered

@dataclass
class CircuitBreakerConfig:
    """Circuit breaker configuration"""
    failure_threshold: int = 5
    recovery_timeout: int = 60  # seconds
    expected_exception: type = Exception
    name: str = "default"

class CircuitBreaker:
    """Circuit breaker pattern implementation"""
    
    def __init__(self, config: CircuitBreakerConfig):
        self.config = config
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.last_failure_time = None
        self.success_count = 0
        
    def can_execute(self) -> bool:
        """Check if operation can be executed"""
        if self.state == CircuitState.CLOSED:
            return True
        
        if self.state == CircuitState.OPEN:
            # Check if recovery timeout has passed
            if (self.last_failure_time and 
                datetime.utcnow() - self.last_failure_time > timedelta(seconds=self.config.recovery_timeout)):
                self.state = CircuitState.HALF_OPEN
                return True
            return False
        
        if self.state == CircuitState.HALF_OPEN:
            return True
        
        return False
    
    def on_success(self):
        """Handle successful operation"""
        self.failure_count = 0
        self.success_count += 1
        
        if self.state == CircuitState.HALF_OPEN:
            if self.success_count >= self.config.failure_threshold:
                self.state = CircuitState.CLOSED
                self.success_count = 0
                logger.info(f"Circuit breaker '{self.config.name}' closed")
    
    def on_failure(self):
        """Handle failed operation"""
        self.failure_count += 1
        self.last_failure_time = datetime.utcnow()
        self.success_count = 0
        
        if self.failure_count >= self.config.failure_threshold:
            self.state = CircuitState.OPEN
            logger.warning(f"Circuit breaker '{self.config.name}' opened")
    
    def get_status(self) -> Dict[str, Any]:
        """Get circuit breaker status"""
        return {
            "name": self.config.name,
            "state": self.state.value,
            "failure_count": self.failure_count,
            "success_count": self.success_count,
            "last_failure_time": self.last_failure_time.isoformat() if self.last_failure_time else None,
            "can_execute": self.can_execute()
        }

class RetryConfig:
    """Retry configuration"""
    def __init__(self, max_attempts: int = 3, base_delay: float = 1.0, 
                 max_delay: float = 60.0, backoff_factor: float = 2.0,
                 exceptions: tuple = (Exception,)):
        self.max_attempts = max_attempts
        self.base_delay = base_delay
        self.max_delay = max_delay
        self.backoff_factor = backoff_factor
        self.exceptions = exceptions

class ResilienceService:
    """Comprehensive resilience service"""
    
    def __init__(self):
        self.circuit_breakers: Dict[str, CircuitBreaker] = {}
        self.retry_configs: Dict[str, RetryConfig] = {}
        self.fallback_handlers: Dict[str, Callable] = {}
        
    def get_or_create_circuit_breaker(self, name: str, config: Optional[CircuitBreakerConfig] = None) -> CircuitBreaker:
        """Get or create a circuit breaker"""
        if name not in self.circuit_breakers:
            config = config or CircuitBreakerConfig(name=name)
            self.circuit_breakers[name] = CircuitBreaker(config)
        
        return self.circuit_breakers[name]
    
    def set_retry_config(self, name: str, config: RetryConfig):
        """Set retry configuration for a service"""
        self.retry_configs[name] = config
    
    def set_fallback_handler(self, name: str, handler: Callable):
        """Set fallback handler for a service"""
        self.fallback_handlers[name] = handler
    
    async def execute_with_resilience(self, name: str, operation: Callable, 
                                    *args, **kwargs) -> Any:
        """Execute operation with circuit breaker, retries, and fallback"""
        
        # Get circuit breaker
        circuit_breaker = self.get_or_create_circuit_breaker(name)
        
        # Check if circuit breaker allows execution
        if not circuit_breaker.can_execute():
            logger.warning(f"Circuit breaker '{name}' is open, using fallback")
            return await self._execute_fallback(name, *args, **kwargs)
        
        # Get retry config
        retry_config = self.retry_configs.get(name, RetryConfig())
        
        # Execute with retries
        for attempt in range(retry_config.max_attempts):
            try:
                result = await operation(*args, **kwargs)
                circuit_breaker.on_success()
                return result
                
            except retry_config.exceptions as e:
                circuit_breaker.on_failure()
                
                if attempt == retry_config.max_attempts - 1:
                    # Last attempt failed, try fallback
                    logger.error(f"Operation '{name}' failed after {retry_config.max_attempts} attempts: {e}")
                    return await self._execute_fallback(name, *args, **kwargs)
                
                # Calculate delay with exponential backoff
                delay = min(
                    retry_config.base_delay * (retry_config.backoff_factor ** attempt),
                    retry_config.max_delay
                )
                
                logger.warning(f"Operation '{name}' failed (attempt {attempt + 1}/{retry_config.max_attempts}), "
                             f"retrying in {delay:.2f}s: {e}")
                
                await asyncio.sleep(delay)
    
    async def _execute_fallback(self, name: str, *args, **kwargs) -> Any:
        """Execute fallback handler"""
        if name in self.fallback_handlers:
            try:
                return await self.fallback_handlers[name](*args, **kwargs)
            except Exception as e:
                logger.error(f"Fallback handler for '{name}' failed: {e}")
        
        # Default fallback behavior
        return self._get_default_fallback(name)
    
    def _get_default_fallback(self, name: str) -> Any:
        """Get default fallback behavior"""
        if "ml" in name.lower():
            return {
                "name": "Unknown Card",
                "confidence": 0.0,
                "error": "ML service unavailable"
            }
        elif "database" in name.lower():
            return {"error": "Database service unavailable"}
        elif "cache" in name.lower():
            return {"error": "Cache service unavailable"}
        else:
            return {"error": f"Service '{name}' unavailable"}
    
    def get_status(self) -> Dict[str, Any]:
        """Get resilience service status"""
        return {
            "circuit_breakers": {
                name: cb.get_status() for name, cb in self.circuit_breakers.items()
            },
            "retry_configs": {
                name: {
                    "max_attempts": config.max_attempts,
                    "base_delay": config.base_delay,
                    "max_delay": config.max_delay,
                    "backoff_factor": config.backoff_factor
                }
                for name, config in self.retry_configs.items()
            },
            "fallback_handlers": list(self.fallback_handlers.keys())
        }

# Global resilience service
resilience_service = ResilienceService()

# Decorator for resilient operations
def resilient(service_name: str, retry_config: Optional[RetryConfig] = None):
    """Decorator to make functions resilient"""
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            if retry_config:
                resilience_service.set_retry_config(service_name, retry_config)
            
            return await resilience_service.execute_with_resilience(
                service_name, func, *args, **kwargs
            )
        return wrapper
    return decorator

# Pre-configured resilience patterns
def setup_default_resilience():
    """Setup default resilience patterns"""
    
    # ML service resilience
    ml_retry_config = RetryConfig(
        max_attempts=3,
        base_delay=1.0,
        max_delay=10.0,
        backoff_factor=2.0,
        exceptions=(Exception,)
    )
    resilience_service.set_retry_config("ml_service", ml_retry_config)
    
    # Database resilience
    db_retry_config = RetryConfig(
        max_attempts=5,
        base_delay=0.5,
        max_delay=30.0,
        backoff_factor=1.5,
        exceptions=(Exception,)
    )
    resilience_service.set_retry_config("database", db_retry_config)
    
    # Cache resilience
    cache_retry_config = RetryConfig(
        max_attempts=2,
        base_delay=0.1,
        max_delay=5.0,
        backoff_factor=2.0,
        exceptions=(Exception,)
    )
    resilience_service.set_retry_config("cache", cache_retry_config)
    
    # Setup fallback handlers
    async def ml_fallback(*args, **kwargs):
        return {
            "name": "Unknown Card",
            "confidence": 0.0,
            "error": "ML service unavailable - using fallback"
        }
    
    async def database_fallback(*args, **kwargs):
        return {
            "error": "Database service unavailable - using cached data",
            "cached": True
        }
    
    async def cache_fallback(*args, **kwargs):
        return {
            "error": "Cache service unavailable - using direct access",
            "cached": False
        }
    
    resilience_service.set_fallback_handler("ml_service", ml_fallback)
    resilience_service.set_fallback_handler("database", database_fallback)
    resilience_service.set_fallback_handler("cache", cache_fallback)
    
    logger.info("Default resilience patterns configured")

# Initialize default resilience patterns
setup_default_resilience()

# Convenience functions
def get_resilience_status() -> Dict[str, Any]:
    """Get resilience service status"""
    return resilience_service.get_status()

def get_circuit_breaker_status(name: str) -> Optional[Dict[str, Any]]:
    """Get specific circuit breaker status"""
    if name in resilience_service.circuit_breakers:
        return resilience_service.circuit_breakers[name].get_status()
    return None

def reset_circuit_breaker(name: str):
    """Reset a circuit breaker"""
    if name in resilience_service.circuit_breakers:
        cb = resilience_service.circuit_breakers[name]
        cb.state = CircuitState.CLOSED
        cb.failure_count = 0
        cb.success_count = 0
        cb.last_failure_time = None
        logger.info(f"Circuit breaker '{name}' reset") 