# Scanémon 🎴

An AI-powered Pokémon card scanner and collector application with a modern web interface.

## 🚀 Features

- **Card Scanning**: Upload and scan Pokémon cards using AI
- **Collection Management**: Organize and track your card collection
- **Analytics**: View scanning statistics and collection insights
- **Moderation**: Community-driven content moderation system
- **Modern UI**: Beautiful, responsive interface built with React and TypeScript

## 🏗️ Architecture

This project consists of two main components:

### Backend API (`/api`)
- **FastAPI** server with Python
- **SQLAlchemy** for database management
- **AI/ML** integration for card recognition
- **Firebase/Supabase** for authentication and storage
- **Rate limiting** and security features

### Frontend App (`/app`)
- **React** with TypeScript
- **Tailwind CSS** for styling
- **Context API** for state management
- **Responsive design** for mobile and desktop

## 📁 Project Structure

```
scanemon/
├── api/                    # Backend FastAPI server
│   ├── app/
│   │   ├── core/          # Configuration, database, logging
│   │   ├── models/        # SQLAlchemy models
│   │   ├── routes/        # API endpoints
│   │   ├── schemas/       # Pydantic schemas
│   │   └── services/      # Business logic
│   ├── main.py           # FastAPI application entry point
│   └── requirements.txt  # Python dependencies
├── app/                   # Frontend React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── styles/       # CSS and styling
│   ├── package.json      # Node.js dependencies
│   └── tailwind.config.js
├── ml/                    # Machine learning models
├── shared/               # Shared TypeScript types
└── docs/                 # Documentation
```

## 🛠️ Setup Instructions

### Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **npm** or **yarn**

### Backend Setup

1. **Navigate to the API directory:**
   ```bash
   cd api
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start the backend server:**
   ```bash
   python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to the app directory:**
   ```bash
   cd app
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

The app will be available at `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `api/` directory with the following variables:

```env
# API Configuration
API_HOST=127.0.0.1
API_PORT=8000
DEBUG=true
SECRET_KEY=your-super-secret-key

# Database
DATABASE_URL=sqlite:///./scanemon.db

# CORS
ENABLE_CORS=true
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Firebase (optional)
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id

# Supabase (optional)
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key

# AI/ML Services
OPENAI_API_KEY=your-openai-api-key
POKEMON_TCG_API_KEY=your-tcg-api-key
```

## 🚀 Usage

1. **Start both servers** (backend and frontend)
2. **Open your browser** to `http://localhost:3000`
3. **Upload a Pokémon card image** to scan
4. **View your collection** and analytics

## 📚 API Documentation

Once the backend is running, you can access the interactive API documentation at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🧪 Testing

### Backend Tests
```bash
cd api
python -m pytest
```

### Frontend Tests
```bash
cd app
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Pokémon TCG API for card data
- FastAPI for the backend framework
- React and TypeScript for the frontend
- Tailwind CSS for styling

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub. 