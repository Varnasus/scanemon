#!/usr/bin/env python3
"""
Railway Deployment Fix - Comprehensive solution for Unicode escape sequence errors
"""

import os
import sys
import re
import json
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def clean_environment_variables():
    """Clean all environment variables of null bytes and problematic characters"""
    logger.info("🧹 Cleaning environment variables...")
    
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
                logger.warning(f"Cleaned {key}: removed problematic characters")
    
    logger.info(f"✅ Cleaned {cleaned_count} environment variables")
    return cleaned_count


def fix_database_url():
    """Fix common Railway database URL issues"""
    if 'DATABASE_URL' in os.environ:
        db_url = os.environ['DATABASE_URL']
        
        # Fix protocol issues
        if db_url.startswith('postgres://'):
            os.environ['DATABASE_URL'] = db_url.replace('postgres://', 'postgresql://', 1)
            logger.info("Fixed DATABASE_URL protocol from postgres:// to postgresql://")
        
        # Remove any null bytes or control characters
        cleaned_url = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', db_url)
        cleaned_url = re.sub(r'\\u0000', '', cleaned_url)
        
        if cleaned_url != db_url:
            os.environ['DATABASE_URL'] = cleaned_url
            logger.warning("Removed problematic characters from DATABASE_URL")
        
        logger.info("✅ Database URL cleaned and validated")


def create_railway_env_file():
    """Create a clean .env file for Railway"""
    logger.info("📝 Creating clean Railway environment file...")
    
    # Critical environment variables for Railway
    railway_env = {
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
        'DB_POOL_RECYCLE': '3600'
    }
    
    # Add cleaned environment variables
    for key, value in os.environ.items():
        if key.startswith(('DATABASE_URL', 'REDIS_URL', 'SECRET_KEY', 'FIREBASE_', 'SUPABASE_', 'STRIPE_')):
            railway_env[key] = value
    
    # Write to .env file
    env_content = '\n'.join([f'{key}={value}' for key, value in railway_env.items()])
    
    with open('.env.railway', 'w', encoding='utf-8') as f:
        f.write(env_content)
    
    logger.info("✅ Created .env.railway file with clean environment variables")


def create_railway_startup_script():
    """Create a Railway-specific startup script"""
    logger.info("📝 Creating Railway startup script...")
    
    startup_script = '''#!/usr/bin/env python3
"""
Railway Startup Script - Clean and sanitized
"""

import os
import sys
import re
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def clean_env():
    """Clean environment variables"""
    logger.info("Cleaning environment variables...")
    
    for key, value in os.environ.items():
        if isinstance(value, str):
            # Remove null bytes and control characters
            cleaned = re.sub(r'[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]', '', value)
            cleaned = re.sub(r'\\\\u0000', '', cleaned)
            cleaned = cleaned.strip()
            
            if cleaned != value:
                os.environ[key] = cleaned
                logger.warning(f"Cleaned {key}")
    
    logger.info("Environment cleaning completed")

def main():
    """Main startup function"""
    try:
        # Clean environment first
        clean_env()
        
        # Import and start application
        from main import create_app
        import uvicorn
        
        app = create_app()
        
        # Get configuration
        port = int(os.getenv('PORT', 8000))
        host = os.getenv('API_HOST', '0.0.0.0')
        
        logger.info(f"Starting server on {host}:{port}")
        uvicorn.run(app, host=host, port=port, log_level="info")
        
    except Exception as e:
        logger.error(f"Failed to start application: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
'''
    
    with open('railway_start_clean.py', 'w', encoding='utf-8') as f:
        f.write(startup_script)
    
    logger.info("✅ Created railway_start_clean.py")


def update_railway_config():
    """Update Railway configuration to use clean startup"""
    logger.info("📝 Updating Railway configuration...")
    
    railway_config = '''[deploy]
startCommand = "python railway_start_clean.py"
healthcheckPath = "/health"
buildCommand = "pip install -r requirements.railway.txt"
'''
    
    with open('railway.toml', 'w', encoding='utf-8') as f:
        f.write(railway_config)
    
    logger.info("✅ Updated railway.toml")


def create_railway_requirements():
    """Create clean Railway requirements"""
    logger.info("📝 Creating Railway requirements...")
    
    requirements = '''# Railway Production Dependencies (Clean)
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
redis==5.0.1
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-dotenv==1.0.0
pydantic==2.5.0
pydantic-settings==2.1.0
httpx==0.25.2
pillow==10.1.0
slowapi==0.1.9
firebase-admin==6.2.0
supabase==2.0.2
stripe==7.6.0
gunicorn==21.2.0
regex==2023.10.3
'''
    
    with open('requirements.railway.txt', 'w', encoding='utf-8') as f:
        f.write(requirements)
    
    logger.info("✅ Updated requirements.railway.txt")


def main():
    """Main Railway deployment fix"""
    logger.info("🚀 Railway Deployment Fix")
    logger.info("=" * 40)
    
    try:
        # Step 1: Clean environment variables
        cleaned_count = clean_environment_variables()
        
        # Step 2: Fix database URL
        fix_database_url()
        
        # Step 3: Create clean environment file
        create_railway_env_file()
        
        # Step 4: Create clean startup script
        create_railway_startup_script()
        
        # Step 5: Update Railway configuration
        update_railway_config()
        
        # Step 6: Create clean requirements
        create_railway_requirements()
        
        logger.info("✅ Railway deployment fix completed!")
        logger.info("")
        logger.info("Next steps:")
        logger.info("1. Commit and push changes")
        logger.info("2. Monitor Railway deployment logs")
        logger.info("3. Check for 'Cleaning environment variables...' message")
        
    except Exception as e:
        logger.error(f"❌ Railway deployment fix failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main() 