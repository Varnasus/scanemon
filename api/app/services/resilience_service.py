"""
Resilience service for handling graceful degradation, retry logic, and offline capabilities
"""

import asyncio
import logging
import time
from typing import Any, Callable, Dict, List, Optional, TypeVar
from functools import wraps
import json
import os
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

T = TypeVar('T')

class ResilienceService:
    """Service for handling application resilience and graceful degradation"""
    
    def __init__(self):
        self.offline_queue: List[Dict[str, Any]] = []
        self.retry_config = {
            'max_retries': 3,
            'base_delay': 1.0,
            'max_delay': 10.0,
            'backoff_factor': 2.0
        }
        self.connection_status = 'unknown'  # online, offline, degraded
        self.last_health_check = 0
        self.health_check_interval = 30  # seconds
        
    def get_connection_status(self) -> str:
        """Get current connection status"""
        return self.connection_status
    
    def update_connection_status(self, status: str):
        """Update connection status"""
        self.connection_status = status
        logger.info(f"Connection status updated to: {status}")
    
    async def health_check(self) -> bool:
        """Perform health check of external services"""
        try:
            # Check if we can reach external services
            # This is a simplified check - you might want to check specific endpoints
            current_time = time.time()
            if current_time - self.last_health_check < self.health_check_interval:
                return self.connection_status != 'offline'
            
            self.last_health_check = current_time
            
            # Simple connectivity check
            # You could add more sophisticated checks here
            self.update_connection_status('online')
            return True
            
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            self.update_connection_status('offline')
            return False
    
    def retry_with_backoff(
        self, 
        max_retries: Optional[int] = None,
        base_delay: Optional[float] = None,
        max_delay: Optional[float] = None,
        backoff_factor: Optional[float] = None
    ):
        """Decorator for retry logic with exponential backoff"""
        
        def decorator(func: Callable[..., T]) -> Callable[..., T]:
            @wraps(func)
            async def wrapper(*args, **kwargs) -> T:
                retries = max_retries or self.retry_config['max_retries']
                delay = base_delay or self.retry_config['base_delay']
                max_d = max_delay or self.retry_config['max_delay']
                factor = backoff_factor or self.retry_config['backoff_factor']
                
                last_exception = None
                
                for attempt in range(retries + 1):
                    try:
                        return await func(*args, **kwargs)
                    except Exception as e:
                        last_exception = e
                        
                        if attempt == retries:
                            logger.error(f"Function {func.__name__} failed after {retries} retries: {e}")
                            raise e
                        
                        # Calculate delay with exponential backoff
                        current_delay = min(delay * (factor ** attempt), max_d)
                        
                        logger.warning(f"Function {func.__name__} failed (attempt {attempt + 1}/{retries + 1}), retrying in {current_delay}s: {e}")
                        
                        await asyncio.sleep(current_delay)
                
                raise last_exception
            return wrapper
        return decorator
    
    def graceful_degradation(self, fallback_func: Optional[Callable] = None):
        """Decorator for graceful degradation with fallback"""
        
        def decorator(func: Callable[..., T]) -> Callable[..., T]:
            @wraps(func)
            async def wrapper(*args, **kwargs) -> T:
                try:
                    # Check connection status first
                    if self.connection_status == 'offline':
                        if fallback_func:
                            logger.info(f"Using fallback for {func.__name__} due to offline status")
                            return await fallback_func(*args, **kwargs)
                        else:
                            raise Exception("Service unavailable in offline mode")
                    
                    return await func(*args, **kwargs)
                    
                except Exception as e:
                    logger.error(f"Function {func.__name__} failed: {e}")
                    
                    if fallback_func:
                        logger.info(f"Using fallback for {func.__name__}")
                        try:
                            return await fallback_func(*args, **kwargs)
                        except Exception as fallback_error:
                            logger.error(f"Fallback for {func.__name__} also failed: {fallback_error}")
                            raise fallback_error
                    else:
                        raise e
            return wrapper
        return decorator
    
    def queue_offline_action(self, action: str, data: Dict[str, Any]) -> bool:
        """Queue an action for later execution when online"""
        try:
            offline_action = {
                'action': action,
                'data': data,
                'timestamp': datetime.utcnow().isoformat(),
                'retry_count': 0
            }
            
            self.offline_queue.append(offline_action)
            self._save_offline_queue()
            
            logger.info(f"Queued offline action: {action}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to queue offline action: {e}")
            return False
    
    def get_offline_queue(self) -> List[Dict[str, Any]]:
        """Get current offline queue"""
        return self.offline_queue.copy()
    
    async def process_offline_queue(self) -> int:
        """Process offline queue when connection is restored"""
        if not self.offline_queue:
            return 0
        
        processed_count = 0
        failed_actions = []
        
        for action in self.offline_queue:
            try:
                # Process the action based on type
                success = await self._process_offline_action(action)
                if success:
                    processed_count += 1
                else:
                    failed_actions.append(action)
                    
            except Exception as e:
                logger.error(f"Failed to process offline action {action['action']}: {e}")
                failed_actions.append(action)
        
        # Update queue with failed actions
        self.offline_queue = failed_actions
        self._save_offline_queue()
        
        logger.info(f"Processed {processed_count} offline actions, {len(failed_actions)} failed")
        return processed_count
    
    async def _process_offline_action(self, action: Dict[str, Any]) -> bool:
        """Process a single offline action"""
        try:
            action_type = action['action']
            data = action['data']
            
            # Add retry logic for offline actions
            if action['retry_count'] >= 3:
                logger.warning(f"Offline action {action_type} exceeded retry limit")
                return False
            
            # Process based on action type
            if action_type == 'add_card':
                # This would integrate with your card service
                logger.info(f"Processing offline add_card action")
                return True
            elif action_type == 'delete_card':
                logger.info(f"Processing offline delete_card action")
                return True
            elif action_type == 'update_card':
                logger.info(f"Processing offline update_card action")
                return True
            else:
                logger.warning(f"Unknown offline action type: {action_type}")
                return False
                
        except Exception as e:
            logger.error(f"Error processing offline action: {e}")
            action['retry_count'] += 1
            return False
    
    def _save_offline_queue(self):
        """Save offline queue to local storage"""
        try:
            queue_file = 'offline_queue.json'
            with open(queue_file, 'w') as f:
                json.dump(self.offline_queue, f)
        except Exception as e:
            logger.error(f"Failed to save offline queue: {e}")
    
    def _load_offline_queue(self):
        """Load offline queue from local storage"""
        try:
            queue_file = 'offline_queue.json'
            if os.path.exists(queue_file):
                with open(queue_file, 'r') as f:
                    self.offline_queue = json.load(f)
        except Exception as e:
            logger.error(f"Failed to load offline queue: {e}")
            self.offline_queue = []
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get comprehensive system status"""
        return {
            'connection_status': self.connection_status,
            'offline_queue_size': len(self.offline_queue),
            'last_health_check': self.last_health_check,
            'retry_config': self.retry_config
        }

# Global resilience service instance
resilience_service = ResilienceService() 