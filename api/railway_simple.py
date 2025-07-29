#!/usr/bin/env python3
"""
Simplified Railway startup script - focuses on core deployment issues
"""

import os
import sys
import re
import logging

# CRITICAL: Sanitize environment IMMEDIATELY
print("🚨 CRITICAL: Sanitizing environment variables immediately...")

# Get all environment variables and sanitize them
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

# Fix database URL if needed
if 'DATABASE_URL' in os.environ:
    db_url = os.environ['DATABASE_URL']
    if db_url.startswith('postgres://'):
        os.environ['DATABASE_URL'] = db_url.replace('postgres://', 'postgresql://', 1)
        print("Fixed DATABASE_URL protocol from postgres:// to postgresql://")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    """Main startup function"""
    logger.info("🚀 Starting Railway deployment...")
    
    try:
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