# 🚀 Scanémon Production Deployment Guide

## Overview
This guide covers multiple deployment options for your Scanémon app:
1. **Firebase Hosting** (Frontend) + **Railway/Render** (Backend) - Easiest
2. **Docker Compose** - Full stack on your server
3. **Vercel** (Frontend) + **Railway** (Backend) - Modern stack
4. **AWS/GCP** - Enterprise deployment

---

## 🎯 Option 1: Firebase + Railway (Recommended for MVP)

### Frontend Deployment (Firebase)

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase Project**
   ```bash
   cd app
   firebase init hosting
   ```
   - Select your project or create new
   - Public directory: `build`
   - Configure as SPA: `Yes`
   - Don't overwrite index.html: `No`

4. **Build and Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

### Backend Deployment (Railway)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy Backend**
   ```bash
   cd api
   railway login
   railway init
   railway up
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set DATABASE_URL=your-postgres-url
   railway variables set SECRET_KEY=your-secret-key
   railway variables set DEBUG=false
   ```

---

## 🐳 Option 2: Docker Compose (Full Stack)

### Prerequisites
- Docker and Docker Compose installed
- Domain name (optional)

### Deploy
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Environment Setup
1. Copy `env.example` to `.env`
2. Update production values
3. Set up SSL certificates (optional)

---

## ⚡ Option 3: Vercel + Railway (Modern Stack)

### Frontend (Vercel)
1. **Connect GitHub Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository

2. **Configure Build Settings**
   - Framework Preset: `Create React App`
   - Build Command: `npm run build`
   - Output Directory: `build`

3. **Set Environment Variables**
   ```
   REACT_APP_API_URL=https://your-railway-app.railway.app
   ```

### Backend (Railway)
Same as Option 1 backend setup.

---

## ☁️ Option 4: Cloud Deployment (AWS/GCP)

### AWS Deployment

#### Frontend (S3 + CloudFront)
```bash
# Install AWS CLI
aws configure

# Create S3 bucket
aws s3 mb s3://scanemon-app

# Upload build files
aws s3 sync build/ s3://scanemon-app --delete

# Create CloudFront distribution
# (Use AWS Console for easier setup)
```

#### Backend (ECS/Fargate)
```bash
# Build Docker image
docker build -t scanemon-api ./api

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
docker tag scanemon-api:latest your-account.dkr.ecr.us-east-1.amazonaws.com/scanemon-api:latest
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/scanemon-api:latest
```

### GCP Deployment

#### Frontend (Firebase Hosting)
Same as Option 1.

#### Backend (Cloud Run)
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/your-project/scanemon-api
gcloud run deploy scanemon-api --image gcr.io/your-project/scanemon-api --platform managed
```

---

## 🔧 Environment Configuration

### Frontend Environment Variables
Create `.env.production` in `app/` directory:
```env
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_ENVIRONMENT=production
REACT_APP_FIREBASE_API_KEY=your-firebase-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
```

### Backend Environment Variables
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
REDIS_URL=redis://host:6379
SECRET_KEY=your-super-secret-key
DEBUG=false
ENABLE_CORS=true
```

---

## 🔒 Security Checklist

### Frontend
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Environment variables secured
- [ ] API keys not exposed in client code

### Backend
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] SQL injection protection
- [ ] Authentication middleware

### Database
- [ ] Strong passwords
- [ ] Network access restricted
- [ ] Regular backups configured
- [ ] SSL connections enabled

---

## 📊 Monitoring & Analytics

### Frontend Monitoring
- Google Analytics
- Sentry for error tracking
- Firebase Analytics

### Backend Monitoring
- Health check endpoints
- Log aggregation
- Performance metrics
- Error tracking

---

## 🚀 Quick Start (Firebase + Railway)

1. **Deploy Frontend**
   ```bash
   cd app
   npm run build
   firebase deploy
   ```

2. **Deploy Backend**
   ```bash
   cd api
   railway up
   ```

3. **Update Frontend API URL**
   - Update `REACT_APP_API_URL` in Firebase environment
   - Redeploy frontend

4. **Test Deployment**
   - Test authentication
   - Test card scanning
   - Test database operations

---

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check backend CORS configuration
   - Verify API URL in frontend

2. **Database Connection**
   - Check DATABASE_URL format
   - Verify database is accessible

3. **Build Failures**
   - Check Node.js version
   - Clear npm cache: `npm cache clean --force`

4. **Deployment Failures**
   - Check environment variables
   - Verify file permissions
   - Check service logs

### Support
- Check logs: `docker-compose logs -f`
- Health check: `curl https://your-api.com/health`
- Database check: `curl https://your-api.com/health/db`

---

## 📈 Next Steps

1. **Set up CI/CD pipeline**
2. **Configure monitoring and alerts**
3. **Implement backup strategies**
4. **Set up staging environment**
5. **Configure SSL certificates**
6. **Set up domain and DNS**

---

## 🎉 Success!

Your Scanémon app is now live! 🚀

- **Frontend**: https://your-app.web.app
- **Backend**: https://your-api.railway.app
- **Documentation**: https://your-app.web.app/docs

Remember to:
- Monitor performance
- Set up alerts
- Regular security updates
- Backup your data 