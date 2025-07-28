#!/usr/bin/env python3
"""
Setup script for Scanémon project
"""

import os
import sys
import subprocess
import platform

def run_command(command, cwd=None):
    """Run a command and return the result"""
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            cwd=cwd, 
            capture_output=True, 
            text=True, 
            check=True
        )
        print(f"✅ {command}")
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"❌ {command}")
        print(f"Error: {e.stderr}")
        return None

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ is required")
        sys.exit(1)
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor}")

def check_node_version():
    """Check if Node.js is installed"""
    result = subprocess.run("node --version", shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print("❌ Node.js is not installed")
        print("Please install Node.js from https://nodejs.org/")
        sys.exit(1)
    print(f"✅ Node.js {result.stdout.strip()}")

def setup_backend():
    """Setup the backend API"""
    print("\n🔧 Setting up backend...")
    
    # Install Python dependencies
    if not run_command("pip install -r requirements.txt", cwd="api"):
        print("Failed to install Python dependencies")
        return False
    
    # Create .env file if it doesn't exist
    env_file = os.path.join("api", ".env")
    if not os.path.exists(env_file):
        example_env = os.path.join("api", "env.example")
        if os.path.exists(example_env):
            run_command(f"copy {example_env} {env_file}")
            print("✅ Created .env file from template")
    
    return True

def setup_frontend():
    """Setup the frontend app"""
    print("\n🔧 Setting up frontend...")
    
    # Install Node.js dependencies
    if not run_command("npm install", cwd="app"):
        print("Failed to install Node.js dependencies")
        return False
    
    return True

def main():
    """Main setup function"""
    print("🚀 Setting up Scanémon project...")
    
    # Check prerequisites
    check_python_version()
    check_node_version()
    
    # Setup backend
    if not setup_backend():
        print("❌ Backend setup failed")
        sys.exit(1)
    
    # Setup frontend
    if not setup_frontend():
        print("❌ Frontend setup failed")
        sys.exit(1)
    
    print("\n✅ Setup complete!")
    print("\nTo start the development servers:")
    print("  npm run dev")
    print("\nOr start them separately:")
    print("  npm run dev:backend  # Backend on http://localhost:8000")
    print("  npm run dev:frontend # Frontend on http://localhost:3000")

if __name__ == "__main__":
    main() 