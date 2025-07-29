@echo off
echo 🚀 Railway Deployment Helper
echo ============================

echo.
echo 📋 Checking Railway configuration...
if not exist "railway.toml" (
    echo ❌ railway.toml not found!
    echo Please ensure you're in the project root directory.
    pause
    exit /b 1
)

if not exist "api\railway_start.py" (
    echo ❌ api\railway_start.py not found!
    echo Please ensure the API directory structure is correct.
    pause
    exit /b 1
)

if not exist "api\Dockerfile.railway" (
    echo ❌ api\Dockerfile.railway not found!
    echo Please ensure the Railway Dockerfile exists.
    pause
    exit /b 1
)

echo ✅ Railway configuration files found!

echo.
echo 🔧 Checking environment variables...
echo Please ensure these environment variables are set in Railway:
echo.
echo Required:
echo - DATABASE_URL (Railway provides this automatically)
echo - SECRET_KEY
echo - FIREBASE_API_KEY
echo - FIREBASE_AUTH_DOMAIN
echo - FIREBASE_PROJECT_ID
echo - FIREBASE_STORAGE_BUCKET
echo - FIREBASE_MESSAGING_SENDER_ID
echo - FIREBASE_APP_ID
echo.
echo Optional (with defaults):
echo - DEBUG=False
echo - API_HOST=0.0.0.0
echo - API_PORT=8000
echo - ENABLE_CORS=True
echo - RATE_LIMIT_PER_MINUTE=60

echo.
echo 📝 Next steps:
echo 1. Push your changes to GitHub
echo 2. Go to Railway.app and create a new project
echo 3. Connect your GitHub repository
echo 4. Add a PostgreSQL database
echo 5. Set the environment variables listed above
echo 6. Deploy!

echo.
echo 🎯 The application will be available at:
echo - Root: https://your-app.railway.app/
echo - Health: https://your-app.railway.app/health
echo - Docs: https://your-app.railway.app/docs (disabled in production)

echo.
echo 📊 Monitor deployment in Railway dashboard
echo Look for these success messages in logs:
echo - 🚀 Starting Railway deployment...
echo - ✅ All core dependencies available
echo - ✅ Sanitized X environment variables
echo - 🌐 Starting server on 0.0.0.0:8000

echo.
pause 