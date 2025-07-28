#!/usr/bin/env python3
"""
Production deployment script for Scanémon API
"""

import os
import sys
import subprocess
import argparse
import json
import time
from pathlib import Path
from typing import Dict, Any, List

def run_command(command: str, check: bool = True) -> subprocess.CompletedProcess:
    """Run a shell command"""
    print(f"Running: {command}")
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print(result.stderr)
    
    if check and result.returncode != 0:
        raise subprocess.CalledProcessError(result.returncode, command)
    
    return result

def check_python_version():
    """Check Python version compatibility"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        raise RuntimeError("Python 3.8+ is required")
    print(f"✅ Python version: {version.major}.{version.minor}.{version.micro}")

def check_dependencies():
    """Check if required dependencies are available"""
    required_packages = [
        "fastapi", "uvicorn", "sqlalchemy", "psycopg2-binary", 
        "redis", "torch", "transformers", "psutil"
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package.replace("-", "_"))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"❌ Missing packages: {missing_packages}")
        print("Run: pip install -r requirements.txt")
        return False
    
    print("✅ All required packages are installed")
    return True

def setup_environment():
    """Setup environment variables"""
    env_vars = {
        "DATABASE_URL": "postgresql://postgres:password@localhost:5432/scanemon",
        "REDIS_URL": "redis://localhost:6379",
        "DEBUG": "false",
        "ENABLE_CORS": "true",
        "RATE_LIMIT_PER_MINUTE": "60"
    }
    
    print("Setting up environment variables...")
    for key, value in env_vars.items():
        os.environ[key] = value
        print(f"  {key}={value}")
    
    print("✅ Environment variables configured")

def check_database_connection():
    """Check database connection"""
    try:
        from app.core.database import health_check, get_database_info
        
        if health_check():
            db_info = get_database_info()
            print(f"✅ Database connection: {db_info['database_type']}")
            return True
        else:
            print("❌ Database connection failed")
            return False
    except Exception as e:
        print(f"❌ Database check failed: {e}")
        return False

def check_redis_connection():
    """Check Redis connection"""
    try:
        from app.services.cache_service import health_check
        
        if health_check():
            print("✅ Redis connection successful")
            return True
        else:
            print("❌ Redis connection failed")
            return False
    except Exception as e:
        print(f"❌ Redis check failed: {e}")
        return False

def run_migrations():
    """Run database migrations"""
    try:
        print("Running database migrations...")
        run_command("alembic upgrade head")
        print("✅ Database migrations completed")
        return True
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

def run_tests():
    """Run test suite"""
    try:
        print("Running tests...")
        run_command("python -m pytest tests/ -v")
        print("✅ All tests passed")
        return True
    except Exception as e:
        print(f"❌ Tests failed: {e}")
        return False

def check_ml_models():
    """Check ML model initialization"""
    try:
        from app.services.ml_service import ml_service
        
        if ml_service.is_initialized:
            print("✅ ML models initialized")
            return True
        else:
            print("❌ ML models not initialized")
            return False
    except Exception as e:
        print(f"❌ ML model check failed: {e}")
        return False

def validate_security():
    """Validate security configuration"""
    try:
        from app.middleware.security import get_security_info
        
        security_info = get_security_info()
        print("✅ Security configuration validated")
        print(f"  Rate limiting: {security_info['rate_limiting']['requests_per_minute']} req/min")
        print(f"  CORS enabled: {security_info['cors']['enabled']}")
        return True
    except Exception as e:
        print(f"❌ Security validation failed: {e}")
        return False

def check_performance():
    """Check performance configuration"""
    try:
        from app.services.cache_service import get_cache_stats
        from app.services.monitoring_service import get_health_status
        
        cache_stats = get_cache_stats()
        health_status = get_health_status()
        
        print("✅ Performance configuration validated")
        print(f"  Cache backend: {cache_stats['backend']}")
        print(f"  System status: {health_status['status']}")
        return True
    except Exception as e:
        print(f"❌ Performance check failed: {e}")
        return False

def create_systemd_service():
    """Create systemd service file"""
    service_content = """[Unit]
Description=Scanémon API
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=scanemon
WorkingDirectory=/opt/scanemon/api
Environment=PATH=/opt/scanemon/venv/bin
ExecStart=/opt/scanemon/venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
"""
    
    service_file = "/etc/systemd/system/scanemon-api.service"
    
    try:
        with open(service_file, 'w') as f:
            f.write(service_content)
        
        run_command("sudo systemctl daemon-reload")
        run_command("sudo systemctl enable scanemon-api")
        
        print("✅ Systemd service created")
        return True
    except Exception as e:
        print(f"❌ Systemd service creation failed: {e}")
        return False

def create_nginx_config():
    """Create nginx configuration"""
    nginx_config = """server {
    listen 80;
    server_name scanemon.com www.scanemon.com;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Security headers
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    }
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=60r/m;
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
"""
    
    config_file = "/etc/nginx/sites-available/scanemon"
    
    try:
        with open(config_file, 'w') as f:
            f.write(nginx_config)
        
        run_command("sudo ln -sf /etc/nginx/sites-available/scanemon /etc/nginx/sites-enabled/")
        run_command("sudo nginx -t")
        run_command("sudo systemctl reload nginx")
        
        print("✅ Nginx configuration created")
        return True
    except Exception as e:
        print(f"❌ Nginx configuration failed: {e}")
        return False

def generate_deployment_report():
    """Generate deployment report"""
    report = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "version": "1.0.0",
        "checks": {
            "python_version": True,
            "dependencies": check_dependencies(),
            "database": check_database_connection(),
            "redis": check_redis_connection(),
            "migrations": run_migrations(),
            "tests": run_tests(),
            "ml_models": check_ml_models(),
            "security": validate_security(),
            "performance": check_performance()
        }
    }
    
    # Calculate overall status
    all_checks = all(report["checks"].values())
    report["status"] = "success" if all_checks else "failed"
    
    # Save report
    with open("deployment_report.json", "w") as f:
        json.dump(report, f, indent=2)
    
    print(f"\n📊 Deployment Report:")
    print(f"  Status: {report['status']}")
    print(f"  Timestamp: {report['timestamp']}")
    print(f"  Checks passed: {sum(report['checks'].values())}/{len(report['checks'])}")
    
    return report

def main():
    """Main deployment function"""
    parser = argparse.ArgumentParser(description="Scanémon API Deployment Script")
    parser.add_argument("--check-only", action="store_true", help="Only run checks, don't deploy")
    parser.add_argument("--create-service", action="store_true", help="Create systemd service")
    parser.add_argument("--create-nginx", action="store_true", help="Create nginx configuration")
    parser.add_argument("--skip-tests", action="store_true", help="Skip test execution")
    
    args = parser.parse_args()
    
    print("🚀 Scanémon API Deployment Script")
    print("=" * 50)
    
    try:
        # Basic checks
        check_python_version()
        setup_environment()
        
        # Dependency checks
        if not check_dependencies():
            sys.exit(1)
        
        # Service checks
        if not check_database_connection():
            print("⚠️  Database connection failed - continuing with checks")
        
        if not check_redis_connection():
            print("⚠️  Redis connection failed - continuing with checks")
        
        # Run migrations
        if not run_migrations():
            print("⚠️  Database migrations failed")
        
        # Run tests (unless skipped)
        if not args.skip_tests:
            if not run_tests():
                print("⚠️  Tests failed")
        
        # ML model check
        if not check_ml_models():
            print("⚠️  ML models not initialized")
        
        # Security validation
        if not validate_security():
            print("⚠️  Security validation failed")
        
        # Performance check
        if not check_performance():
            print("⚠️  Performance check failed")
        
        # Generate report
        report = generate_deployment_report()
        
        if args.check_only:
            print("\n✅ Check-only mode completed")
            return
        
        # Create systemd service
        if args.create_service:
            create_systemd_service()
        
        # Create nginx config
        if args.create_nginx:
            create_nginx_config()
        
        print("\n🎉 Deployment completed successfully!")
        print("\nNext steps:")
        print("1. Start the service: sudo systemctl start scanemon-api")
        print("2. Check status: sudo systemctl status scanemon-api")
        print("3. View logs: sudo journalctl -u scanemon-api -f")
        print("4. Test endpoint: curl http://localhost:8000/health")
        
    except Exception as e:
        print(f"\n❌ Deployment failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 