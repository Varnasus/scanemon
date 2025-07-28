#!/bin/bash

# Scanémon Setup Script
# This script sets up the complete Scanémon development environment

set -e  # Exit on any error

echo "🎴 Welcome to Scanémon Setup!"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3.9+ first."
        exit 1
    fi
    
    PYTHON_VERSION=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
    PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d'.' -f1)
    PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d'.' -f2)
    
    if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 9 ]); then
        print_error "Python 3.9+ is required. Current version: $PYTHON_VERSION"
        exit 1
    fi
    
    # Check pip
    if ! command -v pip3 &> /dev/null; then
        print_error "pip3 is not installed. Please install pip3 first."
        exit 1
    fi
    
    print_success "System requirements check passed!"
    print_status "Node.js: $(node -v)"
    print_status "Python: $(python3 --version)"
    print_status "pip: $(pip3 --version)"
}

# Setup Python virtual environment
setup_python_env() {
    print_status "Setting up Python virtual environment..."
    
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        print_success "Virtual environment created!"
    else
        print_warning "Virtual environment already exists."
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Upgrade pip
    pip install --upgrade pip
    
    # Install Python dependencies
    print_status "Installing Python dependencies..."
    pip install -r api/requirements.txt
    
    print_success "Python environment setup complete!"
}

# Setup Node.js dependencies
setup_node_env() {
    print_status "Setting up Node.js environment..."
    
    # Install frontend dependencies
    cd app
    npm install
    cd ..
    
    print_success "Node.js environment setup complete!"
}

# Setup environment files
setup_env_files() {
    print_status "Setting up environment configuration..."
    
    # Copy environment example files
    if [ ! -f ".env" ]; then
        cp env.example .env
        print_success "Created .env file from template"
    else
        print_warning ".env file already exists"
    fi
    
    if [ ! -f "app/.env" ]; then
        cp env.example app/.env
        print_success "Created app/.env file from template"
    else
        print_warning "app/.env file already exists"
    fi
    
    print_warning "Please edit .env and app/.env files with your configuration!"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Create database directory
    mkdir -p data
    
    # Initialize database (this will be done when the API starts)
    print_success "Database setup complete!"
}

# Setup ML models directory
setup_ml_models() {
    print_status "Setting up ML models directory..."
    
    mkdir -p ml/models
    mkdir -p ml/data
    mkdir -p ml/training
    mkdir -p ml/inference
    mkdir -p ml/utils
    mkdir -p ml/notebooks
    
    # Create placeholder files
    touch ml/models/.gitkeep
    touch ml/data/.gitkeep
    
    print_success "ML models directory setup complete!"
}

# Setup development tools
setup_dev_tools() {
    print_status "Setting up development tools..."
    
    # Install pre-commit hooks if available
    if command -v pre-commit &> /dev/null; then
        pre-commit install
        print_success "Pre-commit hooks installed!"
    else
        print_warning "pre-commit not found. Install it for better code quality."
    fi
    
    # Create .gitignore if it doesn't exist
    if [ ! -f ".gitignore" ]; then
        cat > .gitignore << EOF
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

# Virtual Environment
venv/
env/
ENV/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# React
build/
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

# Database
*.db
*.sqlite
*.sqlite3

# ML Models
ml/models/*.pth
ml/models/*.onnx
ml/models/*.h5
ml/data/raw/
ml/data/processed/

# Logs
logs/
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Temporary files
*.tmp
*.temp
EOF
        print_success "Created .gitignore file"
    fi
    
    print_success "Development tools setup complete!"
}

# Display next steps
show_next_steps() {
    echo ""
    echo "🎉 Setup Complete!"
    echo "=================="
    echo ""
    echo "Next steps:"
    echo ""
    echo "1. Configure your environment:"
    echo "   - Edit .env and app/.env files with your API keys and settings"
    echo ""
    echo "2. Start the development servers:"
    echo "   # Terminal 1 - Start backend"
    echo "   source venv/bin/activate"
    echo "   cd api"
    echo "   uvicorn main:app --reload --port 8000"
    echo ""
    echo "   # Terminal 2 - Start frontend"
    echo "   cd app"
    echo "   npm start"
    echo ""
    echo "3. Access the application:"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend API: http://localhost:8000"
    echo "   - API Docs: http://localhost:8000/docs"
    echo ""
    echo "4. Optional: Install Tesseract OCR for better card recognition"
    echo "   - macOS: brew install tesseract"
    echo "   - Ubuntu: sudo apt-get install tesseract-ocr"
    echo "   - Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki"
    echo ""
    echo "Happy scanning! 🎴"
}

# Main setup function
main() {
    echo "Starting Scanémon setup..."
    echo ""
    
    check_requirements
    setup_python_env
    setup_node_env
    setup_env_files
    setup_database
    setup_ml_models
    setup_dev_tools
    
    show_next_steps
}

# Run main function
main "$@" 