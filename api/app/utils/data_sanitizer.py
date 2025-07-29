"""
Data Sanitization Utility - Prevents null byte and Unicode escape sequence issues
"""

import re
import logging
from typing import Any, Dict, List, Union, Optional

logger = logging.getLogger(__name__)


def sanitize_string(value: str) -> str:
    """
    Sanitize a string by removing null bytes and problematic characters
    
    Args:
        value: The string to sanitize
        
    Returns:
        Sanitized string with null bytes and control characters removed
    """
    if not isinstance(value, str):
        return value
    
    # Remove null bytes and control characters
    sanitized = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', value)
    
    # Remove Unicode escape sequences
    sanitized = re.sub(r'\\u0000', '', sanitized)
    sanitized = re.sub(r'\\u[0-9a-fA-F]{4}', '', sanitized)  # Remove all Unicode escapes
    
    # Remove any remaining problematic characters
    sanitized = sanitized.strip()
    
    if sanitized != value:
        logger.warning(f"Sanitized string: removed problematic characters (length: {len(value)} -> {len(sanitized)})")
    
    return sanitized


def sanitize_dict(obj: Dict[str, Any]) -> Dict[str, Any]:
    """
    Recursively sanitize all string values in a dictionary
    
    Args:
        obj: Dictionary to sanitize
        
    Returns:
        Dictionary with all string values sanitized
    """
    if not isinstance(obj, dict):
        return obj
    
    sanitized = {}
    for key, value in obj.items():
        if isinstance(value, str):
            sanitized[key] = sanitize_string(value)
        elif isinstance(value, dict):
            sanitized[key] = sanitize_dict(value)
        elif isinstance(value, list):
            sanitized[key] = sanitize_list(value)
        else:
            sanitized[key] = value
    
    return sanitized


def sanitize_list(obj: List[Any]) -> List[Any]:
    """
    Recursively sanitize all string values in a list
    
    Args:
        obj: List to sanitize
        
    Returns:
        List with all string values sanitized
    """
    if not isinstance(obj, list):
        return obj
    
    sanitized = []
    for item in obj:
        if isinstance(item, str):
            sanitized.append(sanitize_string(item))
        elif isinstance(item, dict):
            sanitized.append(sanitize_dict(item))
        elif isinstance(item, list):
            sanitized.append(sanitize_list(item))
        else:
            sanitized.append(item)
    
    return sanitized


def sanitize_any(obj: Any) -> Any:
    """
    Recursively sanitize any data structure
    
    Args:
        obj: Any data structure to sanitize
        
    Returns:
        Sanitized data structure
    """
    if isinstance(obj, str):
        return sanitize_string(obj)
    elif isinstance(obj, dict):
        return sanitize_dict(obj)
    elif isinstance(obj, list):
        return sanitize_list(obj)
    else:
        return obj


def sanitize_database_url(url: str) -> str:
    """
    Specifically sanitize database URLs
    
    Args:
        url: Database URL to sanitize
        
    Returns:
        Sanitized database URL
    """
    if not url:
        return url
    
    # Fix protocol issues
    if url.startswith('postgres://'):
        url = url.replace('postgres://', 'postgresql://', 1)
        logger.info("Fixed DATABASE_URL protocol from postgres:// to postgresql://")
    
    # Sanitize the URL
    sanitized = sanitize_string(url)
    
    if sanitized != url:
        logger.warning("Sanitized DATABASE_URL: removed problematic characters")
    
    return sanitized


def sanitize_environment_variables() -> int:
    """
    Sanitize all environment variables
    
    Returns:
        Number of environment variables that were sanitized
    """
    import os
    
    cleaned_count = 0
    env_vars = dict(os.environ)
    
    for key, value in env_vars.items():
        if isinstance(value, str):
            sanitized_value = sanitize_string(value)
            if sanitized_value != value:
                os.environ[key] = sanitized_value
                cleaned_count += 1
                logger.warning(f"Sanitized environment variable {key}: removed problematic characters")
    
    logger.info(f"Sanitized {cleaned_count} environment variables")
    return cleaned_count


def sanitize_before_database_save(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sanitize data before saving to database to prevent Prisma errors
    
    Args:
        data: Data to sanitize before database save
        
    Returns:
        Sanitized data safe for database storage
    """
    logger.debug("Sanitizing data before database save")
    return sanitize_dict(data)


def sanitize_log_message(message: str) -> str:
    """
    Sanitize log messages to prevent logging issues
    
    Args:
        message: Log message to sanitize
        
    Returns:
        Sanitized log message
    """
    return sanitize_string(message)


def sanitize_user_input(input_data: Any) -> Any:
    """
    Sanitize user input to prevent injection and corruption issues
    
    Args:
        input_data: User input to sanitize
        
    Returns:
        Sanitized user input
    """
    logger.debug("Sanitizing user input")
    return sanitize_any(input_data)


def sanitize_api_response(response_data: Any) -> Any:
    """
    Sanitize API response data before sending to client
    
    Args:
        response_data: API response data to sanitize
        
    Returns:
        Sanitized API response data
    """
    logger.debug("Sanitizing API response data")
    return sanitize_any(response_data)


# Convenience functions for common use cases
def sanitize_for_prisma(data: Dict[str, Any]) -> Dict[str, Any]:
    """Alias for sanitize_before_database_save for Prisma operations"""
    return sanitize_before_database_save(data)


def sanitize_for_postgres(data: Dict[str, Any]) -> Dict[str, Any]:
    """Alias for sanitize_before_database_save for PostgreSQL operations"""
    return sanitize_before_database_save(data)


def sanitize_for_railway(data: Dict[str, Any]) -> Dict[str, Any]:
    """Specifically for Railway deployment events"""
    logger.info("Sanitizing data for Railway deployment events")
    return sanitize_before_database_save(data) 