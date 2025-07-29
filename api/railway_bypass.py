#!/usr/bin/env python3
"""
Railway Bypass Script - Attempts to bypass Railway's internal Prisma system
"""

import os
import sys
import re
import subprocess
import time

# Import our comprehensive data sanitization utility
from app.utils.data_sanitizer import (
    sanitize_environment_variables,
    sanitize_database_url,
    sanitize_for_railway
)

def setup_clean_environment():
    """Set up a clean environment for Railway"""
    print("⚙️ Setting up clean Railway environment...")
    
    # Set clean defaults
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
        'ENABLE_SWAGGER': 'False',
        'LOG_LEVEL': 'INFO'
    }
    
    for key, value in defaults.items():
        if key not in os.environ:
            os.environ[key] = value
            print(f"Set default {key}={value}")

def main():
    """Main function with comprehensive data sanitization"""
    print("🚀 RAILWAY BYPASS: Starting deployment with comprehensive sanitization...")
    
    try:
        # Step 1: Comprehensive environment sanitization
        print("🧹 Step 1: Sanitizing environment variables...")
        cleaned_count = sanitize_environment_variables()
        
        # Step 2: Fix database URL specifically
        print("🔧 Step 2: Fixing database URL...")
        if 'DATABASE_URL' in os.environ:
            os.environ['DATABASE_URL'] = sanitize_database_url(os.environ['DATABASE_URL'])
        
        # Step 3: Set up clean environment
        print("⚙️ Step 3: Setting up clean environment...")
        setup_clean_environment()
        
        if cleaned_count > 0:
            print(f"⚠️  WARNING: {cleaned_count} environment variables contained problematic characters")
            print("This should prevent Railway's internal Prisma errors")
        
        # Step 4: Wait a moment for Railway's systems to settle
        print("⏳ Step 4: Waiting for Railway's internal systems to settle...")
        time.sleep(2)
        
        # Step 5: Start the application
        print("🚀 Step 5: Starting main application...")
        
        # Import and start the application
        from main import create_app
        import uvicorn
        
        app = create_app()
        
        # Get port from environment
        port = int(os.getenv('PORT', 8000))
        host = os.getenv('API_HOST', '0.0.0.0')
        
        print(f"🌐 Starting server on {host}:{port}")
        print(f"📊 Health check available at: http://{host}:{port}/health")
        
        uvicorn.run(
            app,
            host=host,
            port=port,
            log_level="info",
            access_log=True
        )
        
    except Exception as e:
        print(f"❌ Failed to start application: {e}")
        import traceback
        print(traceback.format_exc())
        sys.exit(1)

if __name__ == "__main__":
    main() 