#!/usr/bin/env python3
"""
Railway Environment Fix - Pre-sanitization script
This script runs before the main application to clean environment variables
that Railway's internal Prisma system might encounter.
"""

import os
import sys
import re
import subprocess

def sanitize_all_environment():
    """Sanitize ALL environment variables to prevent Prisma errors"""
    print("🚨 RAILWAY ENVIRONMENT FIX: Sanitizing all environment variables...")
    
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
    
    print(f"✅ Sanitized {cleaned_count} environment variables")
    return cleaned_count

def fix_database_url():
    """Fix common Railway database URL issues"""
    if 'DATABASE_URL' in os.environ:
        db_url = os.environ['DATABASE_URL']
        
        # Fix protocol issues
        if db_url.startswith('postgres://'):
            os.environ['DATABASE_URL'] = db_url.replace('postgres://', 'postgresql://', 1)
            print("Fixed DATABASE_URL protocol from postgres:// to postgresql://")
        
        # Remove any null bytes or control characters
        cleaned_url = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', db_url)
        cleaned_url = re.sub(r'\\u0000', '', cleaned_url)
        
        if cleaned_url != db_url:
            os.environ['DATABASE_URL'] = cleaned_url
            print("Removed problematic characters from DATABASE_URL")
        
        print("✅ Database URL cleaned and validated")

def main():
    """Main function to sanitize environment and start the application"""
    try:
        # Sanitize environment variables
        cleaned_count = sanitize_all_environment()
        
        # Fix database URL
        fix_database_url()
        
        if cleaned_count > 0:
            print(f"⚠️  WARNING: {cleaned_count} environment variables contained problematic characters")
            print("This may have been causing Railway's internal Prisma errors")
        
        # Start the main application
        print("🚀 Starting main application...")
        subprocess.run([sys.executable, "railway_start.py"], check=True)
        
    except Exception as e:
        print(f"❌ Error in environment fix: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 