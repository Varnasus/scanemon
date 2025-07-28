import firebase_admin
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials
from typing import Optional
from app.schemas.auth import UserRegister, UserLogin
from app.core.config import settings
from jose import jwt
from datetime import datetime, timedelta

class AuthService:
    def __init__(self):
        # Initialize Firebase if not already initialized
        if not firebase_admin._apps:
            # cred = credentials.Certificate('path/to/serviceAccountKey.json')
            # firebase_admin.initialize_app(cred)
            pass

    def get_user_by_email(self, email: str) -> Optional[dict]:
        try:
            user = firebase_auth.get_user_by_email(email)
            return user.__dict__
        except firebase_auth.UserNotFoundError:
            return None

    def create_user(self, user_data: UserRegister) -> dict:
        user = firebase_auth.create_user(
            email=user_data.email,
            password=user_data.password,
            display_name=user_data.display_name or user_data.username,
        )
        return user.__dict__

    def authenticate_user(self, email: str, password: str) -> Optional[dict]:
        # Firebase does not support password verification server-side
        # This should be handled on the client or via Firebase REST API
        # Here, we just check if the user exists
        user = self.get_user_by_email(email)
        return user

    def create_access_token(self, user_id: str, expires_delta: Optional[timedelta] = None) -> str:
        # Firebase issues its own tokens; this is a fallback for custom tokens
        to_encode = {"sub": str(user_id)}
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(hours=24)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
        return encoded_jwt 