#!/usr/bin/env python3
"""
Railway-specific startup script with comprehensive environment sanitization
"""

import os
import sys
import re
import logging
from pathlib import Path

# CRITICAL: Sanitize environment BEFORE any other imports
def sanitize_environment_immediately():
    """Sanitize environment variables immediately before any other processing"""
    print("🚨 CRITICAL: Sanitizing environment variables immediately...")
    
    # Get all environment variables
    env_vars = dict(os.environ)
    cleaned_count = 0
    
    for key, value in env_vars.items():
        if isinstance(value, str):
            # Remove null bytes and control characters
            cleaned_value = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', value)
            
            # Remove Unicode escape sequences
            cleaned_value = re.sub(r'\\u0000', '', cleaned_value)
            
            # Remove any remaining problematic characters
            cleaned_value = cleaned_value.strip()
            
            if cleaned_value != value:
                os.environ[key] = cleaned_value
                cleaned_count += 1
                print(f"🧹 Cleaned {key}: removed problematic characters")
    
    print(f"✅ Immediately sanitized {cleaned_count} environment variables")

# Execute immediately
sanitize_environment_immediately()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def sanitize_environment():
    """Sanitize environment variables to remove null bytes and problematic characters"""
    logger.info("🧹 Sanitizing environment variables...")
    
    # List of critical environment variables to sanitize
    critical_vars = [
        'DATABASE_URL',
        'REDIS_URL',
        'SECRET_KEY',
        'FIREBASE_API_KEY',
        'FIREBASE_AUTH_DOMAIN',
        'FIREBASE_PROJECT_ID',
        'FIREBASE_STORAGE_BUCKET',
        'FIREBASE_MESSAGING_SENDER_ID',
        'FIREBASE_APP_ID',
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'STRIPE_SECRET_KEY',
        'STRIPE_WEBHOOK_SECRET'
    ]
    
    cleaned_count = 0
    for var_name in critical_vars:
        if var_name in os.environ:
            original_value = os.environ[var_name]
            
            # Remove null bytes and control characters
            sanitized_value = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', original_value)
            
            # Remove Unicode escape sequences
            sanitized_value = re.sub(r'\\u0000', '', sanitized_value)
            
            # Remove any remaining problematic characters
            sanitized_value = sanitized_value.strip()
            
            if sanitized_value != original_value:
                logger.warning(f"Sanitized {var_name}: removed problematic characters")
                os.environ[var_name] = sanitized_value
                cleaned_count += 1
    
    # Clean ALL environment variables again
    env_vars = dict(os.environ)
    for key, value in env_vars.items():
        if isinstance(value, str):
            cleaned_value = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', value)
            cleaned_value = re.sub(r'\\u0000', '', cleaned_value)
            cleaned_value = cleaned_value.strip()
            
            if cleaned_value != value:
                os.environ[key] = cleaned_value
                cleaned_count += 1
    
    logger.info(f"✅ Sanitized {cleaned_count} environment variables")


def validate_database_url():
    """Validate and fix database URL if needed"""
    if 'DATABASE_URL' in os.environ:
        db_url = os.environ['DATABASE_URL']
        
        # Check for common Railway PostgreSQL URL issues
        if db_url.startswith('postgres://'):
            # Railway sometimes provides postgres:// instead of postgresql://
            os.environ['DATABASE_URL'] = db_url.replace('postgres://', 'postgresql://', 1)
            logger.info("Fixed DATABASE_URL protocol from postgres:// to postgresql://")
        
        # Remove any null bytes or control characters
        sanitized_url = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', db_url)
        sanitized_url = re.sub(r'\\u0000', '', sanitized_url)
        if sanitized_url != db_url:
            os.environ['DATABASE_URL'] = sanitized_url
            logger.warning("Removed problematic characters from DATABASE_URL")
        
        logger.info("✅ Database URL validated and cleaned")


def setup_railway_environment():
    """Set up Railway-specific environment"""
    logger.info("⚙️ Setting up Railway environment...")
    
    # Set default values for Railway
    defaults = {
        'API_HOST': '0.0.0.0',
        'API_PORT': os.getenv('PORT', '8000'),
        'DEBUG': 'False',
        'ENVIRONMENT': 'production',
        'ENABLE_CORS': 'True',
        'SECURITY_HEADERS': 'True',
        'RATE_LIMIT_PER_MINUTE': '60',
        'CACHE_TTL': '3600',
        'CACHE_MAX_SIZE': '1000',
        'DB_POOL_SIZE': '10',
        'DB_MAX_OVERFLOW': '20',
        'DB_POOL_RECYCLE': '3600',
        'ENABLE_SWAGGER': 'False',  # Disable docs in production
        'LOG_LEVEL': 'INFO'
    }
    
    for key, value in defaults.items():
        if key not in os.environ:
            os.environ[key] = value
            logger.info(f"Set default {key}={value}")


def check_dependencies():
    """Check if all required dependencies are available"""
    logger.info("🔍 Checking dependencies...")
    
    try:
        import fastapi
        import uvicorn
        import sqlalchemy
        import psycopg2
        logger.info("✅ All core dependencies available")
    except ImportError as e:
        logger.error(f"❌ Missing dependency: {e}")
        sys.exit(1)


def main():
    """Main startup function"""
    logger.info("🚀 Starting Railway deployment...")
    
    try:
        # Check dependencies first
        check_dependencies()
        
        # Sanitize environment variables
        sanitize_environment()
        
        # Validate database URL
        validate_database_url()
        
        # Set up Railway environment
        setup_railway_environment()
        
        # Import and start the application
        from main import create_app
        import uvicorn
        
        app = create_app()
        
        # Get port from environment
        port = int(os.getenv('PORT', 8000))
        host = os.getenv('API_HOST', '0.0.0.0')
        
        logger.info(f"🌐 Starting server on {host}:{port}")
        logger.info(f"📊 Health check available at: http://{host}:{port}/health")
        
        uvicorn.run(
            app,
            host=host,
            port=port,
            log_level="info",
            access_log=True
        )
        
    except Exception as e:
        logger.error(f"❌ Failed to start application: {e}")
        import traceback
        logger.error(traceback.format_exc())
        sys.exit(1)


if __name__ == "__main__":
    main() 