"""
Authentication schemas for Scanémon API
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserLogin(BaseModel):
    """User login request schema"""
    email: EmailStr
    password: str


class UserRegister(BaseModel):
    """User registration request schema"""
    email: EmailStr
    username: str
    password: str
    display_name: Optional[str] = None
    firebase_uid: Optional[str] = None


class FirebaseAuthRequest(BaseModel):
    """Firebase authentication request schema"""
    id_token: str


class UserResponse(BaseModel):
    """User response schema"""
    id: int
    email: str
    username: str
    display_name: Optional[str] = None
    trainer_level: int
    experience_points: int
    total_cards_scanned: int
    scan_streak: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Token response schema"""
    access_token: str
    token_type: str
    user_id: int
    username: str


class UserUpdate(BaseModel):
    """User update request schema"""
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_public_profile: Optional[bool] = None
    notifications_enabled: Optional[bool] = None
    theme_preference: Optional[str] = None 