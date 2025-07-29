@echo off
setlocal enabledelayedexpansion

echo 🚀 Scanémon Production Deployment
echo ==================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Please run this script from the project root directory
    exit /b 1
)

if not exist "app" (
    echo ❌ App directory not found
    exit /b 1
)

if not exist "api" (
    echo ❌ API directory not found
    exit /b 1
)

REM Function to deploy frontend
:deploy_frontend
echo.
echo 🎨 Deploying Frontend...
cd app

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Firebase CLI not found. Installing...
    npm install -g firebase-tools
)

REM Check if user is logged in to Firebase
firebase projects:list >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Please login to Firebase first:
    firebase login
)

REM Build the app
echo ✅ Building React app...
call npm run build

REM Deploy to Firebase
echo ✅ Deploying to Firebase...
firebase deploy --only hosting

cd ..
echo ✅ Frontend deployed successfully!
goto :eof

REM Function to deploy backend
:deploy_backend
echo.
echo 🔧 Deploying Backend...
cd api

REM Check if Railway CLI is installed
railway --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Railway CLI not found. Installing...
    npm install -g @railway/cli
)

REM Check if user is logged in to Railway
railway whoami >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Please login to Railway first:
    railway login
)

REM Deploy to Railway
echo ✅ Deploying to Railway...
railway up

cd ..
echo ✅ Backend deployed successfully!
goto :eof

REM Function to deploy with Docker
:deploy_docker
echo.
echo 🐳 Deploying with Docker Compose...

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker first.
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

REM Build and start services
echo ✅ Building and starting services...
docker-compose up -d --build

echo ✅ Docker deployment completed!
echo Your app should be available at:
echo   Frontend: http://localhost:3000
echo   Backend: http://localhost:8000
goto :eof

REM Function to check deployment status
:check_status
echo.
echo 📊 Checking Deployment Status...

REM Check if services are running
docker-compose ps | findstr "Up" >nul 2>&1
if not errorlevel 1 (
    echo ✅ Docker services are running
) else (
    echo ⚠️  Docker services are not running
)

REM Check API health
curl -s http://localhost:8000/health >nul 2>&1
if not errorlevel 1 (
    echo ✅ Backend API is healthy
) else (
    echo ⚠️  Backend API is not responding
)
goto :eof

REM Function to show help
:show_help
echo.
echo Usage: %0 [OPTION]
echo.
echo Options:
echo   frontend    Deploy frontend to Firebase
echo   backend     Deploy backend to Railway
echo   docker      Deploy full stack with Docker
echo   all         Deploy both frontend and backend
echo   status      Check deployment status
echo   help        Show this help message
echo.
echo Examples:
echo   %0 frontend    # Deploy only frontend
echo   %0 docker      # Deploy with Docker
echo   %0 all         # Deploy everything
goto :eof

REM Main script logic
if "%1"=="frontend" goto deploy_frontend
if "%1"=="backend" goto deploy_backend
if "%1"=="docker" goto deploy_docker
if "%1"=="all" (
    call :deploy_frontend
    call :deploy_backend
    goto :end
)
if "%1"=="status" goto check_status
if "%1"=="help" goto show_help
if "%1"=="" goto show_help

echo ❌ Unknown option: %1
goto show_help

:end
echo.
echo ✅ Deployment script completed!
echo.
echo 📚 For more information, see DEPLOYMENT_GUIDE.md
echo 🔧 For troubleshooting, check the logs above 