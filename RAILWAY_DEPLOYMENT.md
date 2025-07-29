# 🚀 Railway Deployment Guide - FIXED VERSION

## Quick Setup Steps

### 1. Create Railway Project
1. Go to [Railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `scanemon` repository
5. Railway will detect the `api/` folder with Dockerfile

### 2. Add PostgreSQL Database
1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically provide `DATABASE_URL`

### 3. Set Environment Variables
Add these in your Railway project settings:

```bash
# Database (Railway provides this automatically)
DATABASE_URL=postgresql://postgres:password@localhost:5432/scanemon

# FastAPI Configuration
DEBUG=False
SECRET_KEY=scanemon-super-secret-production-key-2024
API_HOST=0.0.0.0
API_PORT=8000

# CORS Configuration
ENABLE_CORS=True
CORS_ORIGINS=["https://scanemon-16c6c.web.app", "https://scanemon-16c6c.firebaseapp.com", "http://localhost:3000"]

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60

# Firebase Configuration
FIREBASE_API_KEY=AIzaSyC0ydQKuK9Y-oUhYrdE6LfzBgdq2EmQcTE
FIREBASE_AUTH_DOMAIN=scanemon-16c6c.firebaseapp.com
FIREBASE_PROJECT_ID=scanemon-16c6c
FIREBASE_STORAGE_BUCKET=scanemon-16c6c.appspot.com
FIREBASE_MESSAGING_SENDER_ID=791340223853
FIREBASE_APP_ID=1:791340223853:web:97426604a4410d377f5e64

# Security Headers
SECURITY_HEADERS=True
CSP_POLICY="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.railway.app https://scanemon-16c6c.firebaseapp.com;"

# Performance
CACHE_TTL=3600
CACHE_MAX_SIZE=1000
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
DB_POOL_RECYCLE=3600

# Production Settings
ENVIRONMENT=production
ENABLE_SWAGGER=False
LOG_LEVEL=INFO
```

### 4. Deploy
Railway will automatically:
- Build the Docker image from `api/Dockerfile.railway`
- Deploy to port 8000
- Provide a public URL (e.g., `https://your-app.railway.app`)

### 5. Test Backend
Once deployed, test these endpoints:
- `https://your-app.railway.app/` (root)
- `https://your-app.railway.app/health` (health check)
- `https://your-app.railway.app/docs` (API docs - disabled in production)

## 🔧 FIXES APPLIED

### 1. Environment Variable Sanitization
- Fixed Unicode escape sequence errors
- Removed null bytes and control characters
- Added comprehensive environment cleaning

### 2. Database URL Fixes
- Automatic conversion from `postgres://` to `postgresql://`
- Sanitization of database URLs
- Better error handling

### 3. Startup Script Improvements
- Enhanced logging with emojis for better visibility
- Dependency checking before startup
- Better error handling and stack traces
- Health check endpoint verification

### 4. Docker Configuration
- Updated to use `railway_start.py` instead of gunicorn
- Added health checks
- Non-root user for security
- Better dependency management

### 5. Requirements Optimization
- Added missing dependencies
- Updated to latest stable versions
- Added monitoring and logging packages

## 🚨 Troubleshooting

### Common Issues:

1. **Build fails**: 
   - Check Railway logs for specific error messages
   - Ensure all dependencies are in `requirements.railway.txt`
   - Verify Python 3.11 compatibility

2. **Database connection errors**:
   - Ensure `DATABASE_URL` is set correctly
   - Check for null bytes in environment variables
   - Verify PostgreSQL service is running

3. **CORS errors**:
   - Verify `CORS_ORIGINS` includes your frontend domain
   - Check `ENABLE_CORS=True` is set

4. **Port issues**:
   - Railway uses port 8000 by default
   - Ensure `API_PORT=8000` is set

5. **Environment variable issues**:
   - The startup script now automatically sanitizes all environment variables
   - Check logs for sanitization messages

### Debugging Steps:

1. **Check Railway logs**:
   ```bash
   # In Railway dashboard, check the logs tab
   # Look for startup messages and error details
   ```

2. **Test health endpoint**:
   ```bash
   curl https://your-app.railway.app/health
   ```

3. **Check environment variables**:
   ```bash
   # The startup script logs all environment variable sanitization
   # Look for "🧹 Sanitizing environment variables..." messages
   ```

4. **Verify dependencies**:
   ```bash
   # The startup script checks dependencies before starting
   # Look for "🔍 Checking dependencies..." messages
   ```

## 📊 Monitoring

The application now includes:
- Enhanced logging with structured output
- Health check endpoint at `/health`
- Performance monitoring
- Error tracking and reporting

## 🔄 Deployment Process

1. **Automatic**: Railway detects changes and redeploys
2. **Manual**: Trigger deployment from Railway dashboard
3. **Rollback**: Use Railway's rollback feature if needed

## 📝 Logs to Watch For

Successful deployment should show:
```
🚀 Starting Railway deployment...
🔍 Checking dependencies...
✅ All core dependencies available
🧹 Sanitizing environment variables...
✅ Sanitized X environment variables
✅ Database URL validated and cleaned
⚙️ Setting up Railway environment...
🌐 Starting server on 0.0.0.0:8000
📊 Health check available at: http://0.0.0.0:8000/health
```

If you see errors, the enhanced logging will provide detailed information about what went wrong. 