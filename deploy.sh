#!/bin/bash

# Scanémon Production Deployment Script
# This script helps you deploy your app to production

set -e

echo "🚀 Scanémon Production Deployment"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "app" ] || [ ! -d "api" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Function to deploy frontend
deploy_frontend() {
    echo ""
    echo "🎨 Deploying Frontend..."
    
    cd app
    
    # Check if Firebase CLI is installed
    if ! command -v firebase &> /dev/null; then
        print_warning "Firebase CLI not found. Installing..."
        npm install -g firebase-tools
    fi
    
    # Check if user is logged in to Firebase
    if ! firebase projects:list &> /dev/null; then
        print_warning "Please login to Firebase first:"
        firebase login
    fi
    
    # Build the app
    print_status "Building React app..."
    npm run build
    
    # Deploy to Firebase
    print_status "Deploying to Firebase..."
    firebase deploy --only hosting
    
    cd ..
    print_status "Frontend deployed successfully!"
}

# Function to deploy backend
deploy_backend() {
    echo ""
    echo "🔧 Deploying Backend..."
    
    cd api
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        print_warning "Railway CLI not found. Installing..."
        npm install -g @railway/cli
    fi
    
    # Check if user is logged in to Railway
    if ! railway whoami &> /dev/null; then
        print_warning "Please login to Railway first:"
        railway login
    fi
    
    # Deploy to Railway
    print_status "Deploying to Railway..."
    railway up
    
    cd ..
    print_status "Backend deployed successfully!"
}

# Function to deploy with Docker
deploy_docker() {
    echo ""
    echo "🐳 Deploying with Docker Compose..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Build and start services
    print_status "Building and starting services..."
    docker-compose up -d --build
    
    print_status "Docker deployment completed!"
    echo "Your app should be available at:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend: http://localhost:8000"
}

# Function to check deployment status
check_status() {
    echo ""
    echo "📊 Checking Deployment Status..."
    
    # Check if services are running
    if command -v docker-compose &> /dev/null; then
        if docker-compose ps | grep -q "Up"; then
            print_status "Docker services are running"
        else
            print_warning "Docker services are not running"
        fi
    fi
    
    # Check API health
    if curl -s http://localhost:8000/health &> /dev/null; then
        print_status "Backend API is healthy"
    else
        print_warning "Backend API is not responding"
    fi
}

# Function to show help
show_help() {
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  frontend    Deploy frontend to Firebase"
    echo "  backend     Deploy backend to Railway"
    echo "  docker      Deploy full stack with Docker"
    echo "  all         Deploy both frontend and backend"
    echo "  status      Check deployment status"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 frontend    # Deploy only frontend"
    echo "  $0 docker      # Deploy with Docker"
    echo "  $0 all         # Deploy everything"
}

# Main script logic
case "${1:-help}" in
    "frontend")
        deploy_frontend
        ;;
    "backend")
        deploy_backend
        ;;
    "docker")
        deploy_docker
        ;;
    "all")
        deploy_frontend
        deploy_backend
        ;;
    "status")
        check_status
        ;;
    "help"|*)
        show_help
        ;;
esac

echo ""
print_status "Deployment script completed!"
echo ""
echo "📚 For more information, see DEPLOYMENT_GUIDE.md"
echo "🔧 For troubleshooting, check the logs above" 