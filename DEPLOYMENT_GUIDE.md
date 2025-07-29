# 🚀 Scanémon Deployment Guide

## Overview
This guide covers deploying Scanémon to production using **Firebase Hosting** for the frontend and **Railway** for the backend.

## 📋 Prerequisites

### Required Accounts
- [Firebase Console](https://console.firebase.google.com/) - Free tier
- [Railway](https://railway.app/) - Free tier available
- [GitHub](https://github.com/) - For code repository

### Required Tools
- Node.js 18+ and npm
- Python 3.9+
- Git
- Firebase CLI: `npm install -g firebase-tools`

## 🔧 Phase 1: Environment Setup

### 1.1 Firebase Project Setup

1. **Create Firebase Project**
   ```bash
   # Go to Firebase Console
   # Create new project: "scanemon"
   # Enable Google Analytics (optional)
   ```

2. **Enable Authentication**
   - Go to Authentication > Sign-in method
   - Enable Google provider
   - Add authorized domains

3. **Enable Hosting**
   ```bash
   firebase login
   firebase init hosting
   # Select your project
   # Public directory: app/build
   # Single-page app: Yes
   ```

4. **Get Firebase Config**
   - Go to Project Settings > General
   - Copy the config object
   - Update `app/src/services/firebase.ts`

### 1.2 Railway Project Setup

1. **Create Railway Account**
   - Sign up at railway.app
   - Connect your GitHub repository

2. **Create New Service**
   - Click "New Service" > "GitHub Repo"
   - Select your scanemon repository
   - Choose "Python" as the runtime

3. **Configure Environment Variables**
   ```bash
   # In Railway dashboard, add these variables:
   DATABASE_URL=postgresql://... # Railway will provide
   REDIS_URL=redis://... # Railway will provide
   SECRET_KEY=your-super-secret-production-key
   FIREBASE_ADMIN_CREDENTIALS={"type":"service_account",...}
   ENVIRONMENT=production
   ```

## 🏗️ Phase 2: Backend Deployment (Railway)

### 2.1 Database Setup

1. **Add PostgreSQL Service**
   - In Railway dashboard: "New Service" > "Database" > "PostgreSQL"
   - Railway will automatically link it to your API service

2. **Add Redis Service**
   - In Railway dashboard: "New Service" > "Database" > "Redis"
   - Railway will automatically link it to your API service

### 2.2 API Deployment

1. **Configure Railway Service**
   ```bash
   # Railway will auto-detect Python
   # Set build command:
   pip install -r requirements.txt
   
   # Set start command:
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

2. **Environment Variables**
   ```bash
   # Add to Railway environment:
   API_HOST=0.0.0.0
   API_PORT=$PORT
   DEBUG=False
   ENVIRONMENT=production
   ```

3. **Deploy**
   - Railway will auto-deploy on git push
   - Monitor logs in Railway dashboard

### 2.3 Verify Backend

1. **Health Check**
   ```bash
   curl https://your-railway-app.railway.app/health
   ```

2. **API Documentation**
   ```bash
   # Visit: https://your-railway-app.railway.app/docs
   ```

## 🎨 Phase 3: Frontend Deployment (Firebase)

### 3.1 Build Frontend

1. **Update API URL**
   ```bash
   # In app/.env.production:
   REACT_APP_API_URL=https://your-railway-app.railway.app
   ```

2. **Build for Production**
   ```bash
   cd app
   npm run build
   ```

### 3.2 Deploy to Firebase

1. **Initialize Firebase (if not done)**
   ```bash
   firebase init hosting
   ```

2. **Deploy**
   ```bash
   firebase deploy --only hosting
   ```

3. **Verify Deployment**
   - Visit your Firebase hosting URL
   - Test all functionality

## 🔐 Phase 4: Security & SSL

### 4.1 SSL Certificates
- **Railway**: Automatic SSL
- **Firebase**: Automatic SSL

### 4.2 Domain Setup (Optional)
1. **Custom Domain on Firebase**
   - Go to Hosting > Custom domains
   - Add your domain
   - Update DNS records

2. **Custom Domain on Railway**
   - Go to your service > Settings > Domains
   - Add custom domain

## 📊 Phase 5: Monitoring & Analytics

### 5.1 Firebase Analytics
```bash
# Already configured in firebase.ts
# View analytics in Firebase Console
```

### 5.2 Railway Monitoring
- View logs in Railway dashboard
- Set up alerts for errors
- Monitor resource usage

### 5.3 Error Tracking (Optional)
```bash
# Add Sentry for error tracking
npm install @sentry/react @sentry/tracing
```

## 🚀 Phase 6: CI/CD Setup

### 6.1 GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd app && npm install
      - run: cd app && npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: scanemon-16c6c
          channelId: live

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      - run: cd api && pip install -r requirements.txt
      - run: cd api && python -m pytest
```

### 6.2 Secrets Setup
```bash
# In GitHub repository settings:
# Add secrets:
# - FIREBASE_SERVICE_ACCOUNT (JSON from Firebase)
# - RAILWAY_TOKEN (from Railway dashboard)
```

## 🔧 Phase 7: Post-Deployment

### 7.1 Database Migration
```bash
# Railway will auto-run migrations
# Or manually:
railway run alembic upgrade head
```

### 7.2 Verify Everything
- [ ] Frontend loads correctly
- [ ] Authentication works
- [ ] Card scanning works
- [ ] Collection management works
- [ ] Analytics work
- [ ] Mobile responsiveness works

### 7.3 Performance Optimization
```bash
# Monitor bundle size
npm run build -- --analyze

# Optimize images
npm install -g imagemin-cli
```

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**
   ```bash
   # Check CORS configuration in security.py
   # Ensure Railway URL is in allowed origins
   ```

2. **Database Connection**
   ```bash
   # Verify DATABASE_URL in Railway
   # Check PostgreSQL service is running
   ```

3. **Firebase Auth Issues**
   ```bash
   # Verify Firebase config
   # Check authorized domains
   # Test with different browsers
   ```

4. **Build Failures**
   ```bash
   # Check Node.js version
   # Clear npm cache: npm cache clean --force
   # Delete node_modules and reinstall
   ```

## 📈 Performance Tips

1. **Frontend Optimization**
   - Lazy loading implemented
   - Image compression added
   - Bundle splitting enabled

2. **Backend Optimization**
   - Rate limiting configured
   - Caching enabled
   - Security headers set

3. **Database Optimization**
   - Connection pooling
   - Indexes on frequently queried columns
   - Regular backups

## 🎯 Next Steps

1. **Set up monitoring alerts**
2. **Implement A/B testing**
3. **Add user analytics**
4. **Optimize for Core Web Vitals**
5. **Plan for scaling**

---

**🎉 Congratulations! Your Scanémon app is now live in production!**

For support, check the logs in Railway dashboard and Firebase console. 