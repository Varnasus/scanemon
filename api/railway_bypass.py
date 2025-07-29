#!/usr/bin/env python3
"""
Railway Bypass Script - Attempts to bypass Railway's internal Prisma system
"""

import os
import sys
import re
import subprocess
import time

def sanitize_environment_aggressively():
    """Aggressively sanitize all environment variables"""
    print("🚨 AGGRESSIVE ENVIRONMENT SANITIZATION...")
    
    # Get all environment variables
    env_vars = dict(os.environ)
    cleaned_count = 0
    
    for key, value in env_vars.items():
        if isinstance(value, str):
            # Remove ALL problematic characters
            cleaned_value = re.sub(r'[\x00-\x1F\x7F]', '', value)
            cleaned_value = re.sub(r'\\u0000', '', cleaned_value)
            cleaned_value = re.sub(r'\\u[0-9a-fA-F]{4}', '', cleaned_value)  # Remove all Unicode escapes
            cleaned_value = cleaned_value.strip()
            
            if cleaned_value != value:
                os.environ[key] = cleaned_value
                cleaned_count += 1
                print(f"🧹 Cleaned {key}: removed problematic characters")
    
    print(f"✅ Aggressively sanitized {cleaned_count} environment variables")
    return cleaned_count

def fix_database_url():
    """Fix database URL issues"""
    if 'DATABASE_URL' in os.environ:
        db_url = os.environ['DATABASE_URL']
        
        # Fix protocol
        if db_url.startswith('postgres://'):
            os.environ['DATABASE_URL'] = db_url.replace('postgres://', 'postgresql://', 1)
            print("Fixed DATABASE_URL protocol")
        
        # Clean URL
        cleaned_url = re.sub(r'[\x00-\x1F\x7F]', '', db_url)
        cleaned_url = re.sub(r'\\u0000', '', cleaned_url)
        os.environ['DATABASE_URL'] = cleaned_url.strip()
        print("Cleaned DATABASE_URL")

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
    """Main function with aggressive environment cleaning"""
    print("🚀 RAILWAY BYPASS: Starting deployment...")
    
    try:
        # Step 1: Aggressively sanitize environment
        cleaned_count = sanitize_environment_aggressively()
        
        # Step 2: Fix database URL
        fix_database_url()
        
        # Step 3: Set up clean environment
        setup_clean_environment()
        
        if cleaned_count > 0:
            print(f"⚠️  WARNING: {cleaned_count} environment variables contained problematic characters")
            print("This should prevent Railway's internal Prisma errors")
        
        # Step 4: Wait a moment for Railway's systems to settle
        print("⏳ Waiting for Railway's internal systems to settle...")
        time.sleep(2)
        
        # Step 5: Start the application
        print("🚀 Starting main application...")
        
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