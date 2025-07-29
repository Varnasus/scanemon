# 🚀 Railway Deployment Guide

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
```

### 4. Deploy
Railway will automatically:
- Build the Docker image from `api/Dockerfile`
- Deploy to port 8000
- Provide a public URL (e.g., `https://your-app.railway.app`)

### 5. Test Backend
Once deployed, test these endpoints:
- `https://your-app.railway.app/` (root)
- `https://your-app.railway.app/health` (health check)
- `https://your-app.railway.app/docs` (API docs)

### 6. Update Frontend
After getting your Railway URL, update the frontend environment:

```bash
# In your Railway project, get the URL and update:
REACT_APP_API_URL=https://your-app.railway.app
```

Then rebuild and redeploy the frontend:
```bash
npm run build
firebase deploy --only hosting
```

## Troubleshooting

### Common Issues:
1. **Build fails**: Check `api/requirements.production.txt` has all dependencies
2. **Database connection**: Ensure `DATABASE_URL` is set correctly
3. **CORS errors**: Verify `CORS_ORIGINS` includes your Firebase domain
4. **Port issues**: Railway uses port 8000 by default

### Logs:
- Check Railway logs in the project dashboard
- Look for any import errors or missing dependencies 