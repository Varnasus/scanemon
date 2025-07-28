"""
Authentication routes for Scanémon API
"""

from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.models.user import User
from app.schemas.auth import (
    UserLogin, 
    UserRegister, 
    UserResponse, 
    TokenResponse,
    FirebaseAuthRequest
)
from app.services.auth_service import AuthService
from app.services.firebase_service import FirebaseService

router = APIRouter()
security = HTTPBearer()


@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    auth_service = AuthService(db)
    
    # Check if user already exists
    if auth_service.get_user_by_email(user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    if auth_service.get_user_by_username(user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user
    user = auth_service.create_user(user_data)
    
    return UserResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        display_name=user.display_name,
        trainer_level=user.trainer_level,
        experience_points=user.experience_points,
        total_cards_scanned=user.total_cards_scanned,
        scan_streak=user.scan_streak,
        created_at=user.created_at
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):
    """Login user and return access token"""
    auth_service = AuthService(db)
    
    # Authenticate user
    user = auth_service.authenticate_user(user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Update last login
    user.last_login_at = datetime.utcnow()
    db.commit()
    
    # Generate access token
    access_token = auth_service.create_access_token(user.id)
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        username=user.username
    )


@router.post("/firebase", response_model=TokenResponse)
async def firebase_auth(
    auth_data: FirebaseAuthRequest,
    db: Session = Depends(get_db)
):
    """Authenticate user with Firebase token"""
    firebase_service = FirebaseService()
    auth_service = AuthService(db)
    
    try:
        # Verify Firebase token
        firebase_user = firebase_service.verify_token(auth_data.id_token)
        
        # Get or create user
        user = auth_service.get_user_by_firebase_uid(firebase_user.uid)
        
        if not user:
            # Create new user from Firebase data
            user_data = UserRegister(
                email=firebase_user.email,
                username=firebase_user.email.split('@')[0],  # Use email prefix as username
                display_name=firebase_user.display_name or firebase_user.email.split('@')[0],
                firebase_uid=firebase_user.uid
            )
            user = auth_service.create_user_from_firebase(user_data)
        
        # Update last login
        user.last_login_at = datetime.utcnow()
        db.commit()
        
        # Generate access token
        access_token = auth_service.create_access_token(user.id)
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user_id=user.id,
            username=user.username
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Firebase token: {str(e)}"
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current authenticated user"""
    auth_service = AuthService(db)
    
    try:
        user_id = auth_service.verify_token(credentials.credentials)
        user = auth_service.get_user_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        return UserResponse(
            id=user.id,
            email=user.email,
            username=user.username,
            display_name=user.display_name,
            trainer_level=user.trainer_level,
            experience_points=user.experience_points,
            total_cards_scanned=user.total_cards_scanned,
            scan_streak=user.scan_streak,
            created_at=user.created_at
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )


@router.post("/refresh")
async def refresh_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Refresh access token"""
    auth_service = AuthService(db)
    
    try:
        user_id = auth_service.verify_token(credentials.credentials)
        user = auth_service.get_user_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        # Generate new access token
        new_token = auth_service.create_access_token(user.id)
        
        return TokenResponse(
            access_token=new_token,
            token_type="bearer",
            user_id=user.id,
            username=user.username
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )


@router.post("/logout")
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Logout user (invalidate token)"""
    # In a real implementation, you might want to blacklist the token
    # For now, we'll just return a success message
    return {"message": "Successfully logged out"} 