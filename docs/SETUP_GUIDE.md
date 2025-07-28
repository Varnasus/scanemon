# Scanémon Setup Guide 🎴

## Quick Start

Get your Scanémon app running in minutes with this step-by-step guide.

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Git

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd scanemon

# Install frontend dependencies
cd app
npm install

# Install backend dependencies
cd ../api
pip install -r requirements.txt
```

### 2. Environment Configuration

Create environment files for both frontend and backend:

#### Frontend (.env file in app/ directory)
```bash
# Firebase Configuration (Required)
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# API Configuration
REACT_APP_API_URL=http://localhost:8000
```

#### Backend (.env file in api/ directory)
```bash
# Database
DATABASE_URL=sqlite:///./scanemon.db

# Security
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ENABLE_CORS=true
CORS_ORIGINS=["http://localhost:3000"]

# API Settings
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=true
ENABLE_SWAGGER=true
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Enable Firestore Database
5. Enable Storage
6. Get your configuration from Project Settings > General > Your Apps
7. Add the configuration to your frontend .env file

### 4. Start the Development Servers

#### Terminal 1 - Backend
```bash
cd api
uvicorn main:app --reload --port 8000
```

#### Terminal 2 - Frontend
```bash
cd app
npm start
```

### 5. Access Your App

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Features Ready to Use

### ✅ Working Features
- User authentication (Firebase)
- Card scanning with AI simulation
- Collection management
- Gamified dashboard
- Responsive design
- Dark/light theme

### 🔄 API Integration Status
- **Scan Endpoint**: ✅ Connected to FastAPI
- **Card Management**: 🔄 Ready for backend implementation
- **User Stats**: 🔄 Ready for backend implementation
- **Achievements**: 🔄 Ready for backend implementation

## Next Steps

### 1. Implement Backend Endpoints

Your FastAPI scan endpoint is ready! Now implement the remaining endpoints:

```python
# api/routes/cards.py
@router.get("/api/cards")
async def get_cards():
    # Return user's card collection
    pass

@router.post("/api/cards")
async def add_card():
    # Add card to collection
    pass

# api/routes/users.py
@router.get("/api/users/stats")
async def get_user_stats():
    # Return user statistics
    pass
```

### 2. Add Real ML Models

Replace the dummy scan response with real card detection:

```python
# In api/routes/scan.py
from ml.card_detector import CardDetector

detector = CardDetector()

@router.post("/api/scan")
async def scan_card(file: UploadFile = File(...)):
    # Use real ML model
    result = detector.detect(file)
    return result
```

### 3. Database Integration

Set up your database models and migrations:

```bash
cd api
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## Troubleshooting

### Common Issues

#### Frontend won't start
```bash
# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### Backend connection errors
```bash
# Check if backend is running
curl http://localhost:8000/health

# Check CORS settings
# Ensure REACT_APP_API_URL is correct
```

#### Firebase authentication issues
- Verify Firebase configuration in .env
- Check Firebase Console for authentication settings
- Ensure email/password auth is enabled

### Development Tips

1. **Use the API Documentation**: Visit http://localhost:8000/docs to test endpoints
2. **Check Browser Console**: Look for CORS or network errors
3. **Monitor Backend Logs**: Watch for Python errors in the terminal
4. **Use React DevTools**: Debug component state and props

## Production Deployment

### Frontend (Vercel/Netlify)
```bash
cd app
npm run build
# Deploy the build folder
```

### Backend (Railway/Heroku)
```bash
cd api
# Set up production environment variables
# Deploy with your preferred platform
```

## Support

- Check the [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) for detailed architecture
- Review the [README.md](README.md) for project information
- Open an issue for bugs or feature requests

---

**Happy Collecting! 🎴✨** 