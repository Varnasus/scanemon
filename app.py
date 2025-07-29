#!/usr/bin/env python3
"""
Simple FastAPI app for Railway deployment
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import Dict, Any

app = FastAPI(
    title="Scanémon API",
    description="AI-powered Pokémon card scanner and collector API",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root() -> Dict[str, Any]:
    """Root endpoint"""
    return {
        "message": "Welcome to Scanémon API! 🎴",
        "version": "1.0.0",
        "status": "running",
        "health": "/health"
    }

@app.get("/health")
async def health_check() -> Dict[str, Any]:
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "message": "Scanémon API is running"
    }

@app.get("/test")
async def test() -> Dict[str, Any]:
    """Simple test endpoint"""
    return {"message": "API is working"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 