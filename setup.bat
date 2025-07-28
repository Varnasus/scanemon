@echo off
setlocal enabledelayedexpansion

echo 🎴 Welcome to Scanémon Setup!
echo ================================
echo.

:: Check if Node.js is installed
echo [INFO] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

:: Check Node.js version
for /f "tokens=1,2,3 delims=." %%a in ('node --version') do (
    set NODE_VERSION=%%a
    set NODE_VERSION=!NODE_VERSION:~1!
)
if !NODE_VERSION! LSS 18 (
    echo [ERROR] Node.js version 18+ is required. Current version: 
    node --version
    pause
    exit /b 1
)

:: Check if Python is installed
echo [INFO] Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed. Please install Python 3.9+ first.
    pause
    exit /b 1
)

:: Check Python version
for /f "tokens=2 delims= " %%a in ('python --version 2^>^&1') do (
    set PYTHON_VERSION=%%a
)
for /f "tokens=1,2 delims=." %%a in ("!PYTHON_VERSION!") do (
    set PYTHON_MAJOR=%%a
    set PYTHON_MINOR=%%b
)
if !PYTHON_MAJOR! LSS 3 (
    echo [ERROR] Python 3.9+ is required. Current version: !PYTHON_VERSION!
    pause
    exit /b 1
)
if !PYTHON_MAJOR! EQU 3 (
    if !PYTHON_MINOR! LSS 9 (
        echo [ERROR] Python 3.9+ is required. Current version: !PYTHON_VERSION!
        pause
        exit /b 1
    )
)

echo [SUCCESS] System requirements check passed!
echo [INFO] Node.js: 
node --version
echo [INFO] Python: 
python --version
echo.

:: Setup Python virtual environment
echo [INFO] Setting up Python virtual environment...
if not exist "venv" (
    python -m venv venv
    echo [SUCCESS] Virtual environment created!
) else (
    echo [WARNING] Virtual environment already exists.
)

:: Activate virtual environment and install dependencies
echo [INFO] Installing Python dependencies...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r api\requirements.txt
echo [SUCCESS] Python environment setup complete!
echo.

:: Setup Node.js dependencies
echo [INFO] Setting up Node.js environment...
cd app
npm install
cd ..
echo [SUCCESS] Node.js environment setup complete!
echo.

:: Setup environment files
echo [INFO] Setting up environment configuration...
if not exist ".env" (
    copy env.example .env
    echo [SUCCESS] Created .env file from template
) else (
    echo [WARNING] .env file already exists
)

if not exist "app\.env" (
    copy env.example app\.env
    echo [SUCCESS] Created app\.env file from template
) else (
    echo [WARNING] app\.env file already exists
)

echo [WARNING] Please edit .env and app\.env files with your configuration!
echo.

:: Setup directories
echo [INFO] Setting up project directories...
if not exist "data" mkdir data
if not exist "ml\models" mkdir ml\models
if not exist "ml\data" mkdir ml\data
if not exist "ml\training" mkdir ml\training
if not exist "ml\inference" mkdir ml\inference
if not exist "ml\utils" mkdir ml\utils
if not exist "ml\notebooks" mkdir ml\notebooks

echo [SUCCESS] Project directories setup complete!
echo.

:: Create .gitignore if it doesn't exist
if not exist ".gitignore" (
    echo [INFO] Creating .gitignore file...
    (
        echo # Python
        echo __pycache__/
        echo *.py[cod]
        echo *$py.class
        echo *.so
        echo .Python
        echo build/
        echo develop-eggs/
        echo dist/
        echo downloads/
        echo eggs/
        echo .eggs/
        echo lib/
        echo lib64/
        echo parts/
        echo sdist/
        echo var/
        echo wheels/
        echo *.egg-info/
        echo .installed.cfg
        echo *.egg
        echo MANIFEST
        echo.
        echo # Virtual Environment
        echo venv/
        echo env/
        echo ENV/
        echo.
        echo # Environment variables
        echo .env
        echo .env.local
        echo .env.development.local
        echo .env.test.local
        echo .env.production.local
        echo.
        echo # Node.js
        echo node_modules/
        echo npm-debug.log*
        echo yarn-debug.log*
        echo yarn-error.log*
        echo.
        echo # React
        echo build/
        echo .DS_Store
        echo .env.local
        echo .env.development.local
        echo .env.test.local
        echo .env.production.local
        echo.
        echo # Database
        echo *.db
        echo *.sqlite
        echo *.sqlite3
        echo.
        echo # ML Models
        echo ml/models/*.pth
        echo ml/models/*.onnx
        echo ml/models/*.h5
        echo ml/data/raw/
        echo ml/data/processed/
        echo.
        echo # Logs
        echo logs/
        echo *.log
        echo.
        echo # IDE
        echo .vscode/
        echo .idea/
        echo *.swp
        echo *.swo
        echo.
        echo # OS
        echo .DS_Store
        echo Thumbs.db
        echo.
        echo # Temporary files
        echo *.tmp
        echo *.temp
    ) > .gitignore
    echo [SUCCESS] Created .gitignore file
)

echo.
echo 🎉 Setup Complete!
echo ==================
echo.
echo Next steps:
echo.
echo 1. Configure your environment:
echo    - Edit .env and app\.env files with your API keys and settings
echo.
echo 2. Start the development servers:
echo    # Command Prompt 1 - Start backend
echo    venv\Scripts\activate.bat
echo    cd api
echo    uvicorn main:app --reload --port 8000
echo.
echo    # Command Prompt 2 - Start frontend
echo    cd app
echo    npm start
echo.
echo 3. Access the application:
echo    - Frontend: http://localhost:3000
echo    - Backend API: http://localhost:8000
echo    - API Docs: http://localhost:8000/docs
echo.
echo 4. Optional: Install Tesseract OCR for better card recognition
echo    - Download from https://github.com/UB-Mannheim/tesseract/wiki
echo    - Add to PATH environment variable
echo.
echo Happy scanning! 🎴
echo.
pause 