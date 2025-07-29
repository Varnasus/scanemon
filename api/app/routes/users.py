"""
User routes for Scanémon API
Handles user statistics, achievements, and profile management
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.user import User
from app.models.card import Card
from app.models.scan_analytics import ScanSession
from app.schemas.auth import UserResponse
from app.services.auth_service import AuthService
from app.services.scan_analytics_service import ScanAnalyticsService

router = APIRouter()

def get_current_user_id(request: Request, db: Session = Depends(get_db)) -> Optional[int]:
    """Get current user ID from authentication token"""
    try:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            auth_service = AuthService(db)
            return auth_service.verify_token(token)
    except Exception:
        pass
    return None

@router.get("/stats")
async def get_user_stats(
    user_id: Optional[int] = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get comprehensive user statistics"""
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    try:
        # Get user from database
        auth_service = AuthService(db)
        user = auth_service.get_user_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get user's cards
        user_cards = db.query(Card).filter(Card.user_id == user_id).all()
        
        # Get scan sessions for the last 30 days
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_sessions = db.query(ScanSession).filter(
            ScanSession.user_id == user_id,
            ScanSession.created_at >= thirty_days_ago
        ).all()
        
        # Calculate statistics
        total_cards = len(user_cards)
        unique_cards = len(set(card.name for card in user_cards))
        sets = len(set(card.set for card in user_cards))
        total_value = sum(card.estimated_value or 0 for card in user_cards)
        
        # Calculate XP and level (simplified)
        base_xp = total_cards * 100  # 100 XP per card
        scan_bonus = len(recent_sessions) * 50  # 50 XP per recent scan
        total_xp = base_xp + scan_bonus
        level = (total_xp // 1000) + 1  # Level up every 1000 XP
        xp_to_next = 1000 - (total_xp % 1000)
        
        # Calculate streak (simplified)
        streak = 0
        if recent_sessions:
            # Count consecutive days with scans
            session_dates = [s.created_at.date() for s in recent_sessions]
            current_date = datetime.utcnow().date()
            for i in range(30):
                check_date = current_date - timedelta(days=i)
                if check_date in session_dates:
                    streak += 1
                else:
                    break
        
        return {
            "level": level,
            "xp": total_xp,
            "xpToNext": xp_to_next,
            "totalCards": total_cards,
            "uniqueCards": unique_cards,
            "sets": sets,
            "streak": streak,
            "totalValue": total_value,
            "recentScans": len(recent_sessions),
            "lastScanDate": user.last_scan_date.isoformat() if user.last_scan_date else None
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user stats: {str(e)}"
        )

@router.get("/achievements")
async def get_user_achievements(
    user_id: Optional[int] = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get user achievements"""
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    try:
        # Get user from database
        auth_service = AuthService(db)
        user = auth_service.get_user_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get user's cards and stats
        user_cards = db.query(Card).filter(Card.user_id == user_id).all()
        total_cards = len(user_cards)
        unique_cards = len(set(card.name for card in user_cards))
        sets = len(set(card.set for card in user_cards))
        
        # Define achievements
        achievements = [
            {
                "id": 1,
                "name": "First Steps",
                "description": "Scan your first card",
                "icon": "🎴",
                "unlocked": total_cards >= 1,
                "date": user.created_at.isoformat() if total_cards >= 1 else None
            },
            {
                "id": 2,
                "name": "Collector",
                "description": "Add 10 cards to your collection",
                "icon": "📚",
                "unlocked": total_cards >= 10,
                "date": user.created_at.isoformat() if total_cards >= 10 else None
            },
            {
                "id": 3,
                "name": "Dedicated",
                "description": "Add 50 cards to your collection",
                "icon": "🏆",
                "unlocked": total_cards >= 50,
                "date": user.created_at.isoformat() if total_cards >= 50 else None
            },
            {
                "id": 4,
                "name": "Set Master",
                "description": "Collect cards from 5 different sets",
                "icon": "📦",
                "unlocked": sets >= 5,
                "date": user.created_at.isoformat() if sets >= 5 else None
            },
            {
                "id": 5,
                "name": "Variety Seeker",
                "description": "Collect 25 unique cards",
                "icon": "🌟",
                "unlocked": unique_cards >= 25,
                "date": user.created_at.isoformat() if unique_cards >= 25 else None
            },
            {
                "id": 6,
                "name": "Streak Master",
                "description": "Scan cards for 7 consecutive days",
                "icon": "🔥",
                "unlocked": user.scan_streak >= 7,
                "date": user.created_at.isoformat() if user.scan_streak >= 7 else None
            },
            {
                "id": 7,
                "name": "Level Up",
                "description": "Reach level 5",
                "icon": "⭐",
                "unlocked": user.trainer_level >= 5,
                "date": user.created_at.isoformat() if user.trainer_level >= 5 else None
            },
            {
                "id": 8,
                "name": "Century Club",
                "description": "Add 100 cards to your collection",
                "icon": "💎",
                "unlocked": total_cards >= 100,
                "date": user.created_at.isoformat() if total_cards >= 100 else None
            }
        ]
        
        return achievements
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get achievements: {str(e)}"
        )

@router.get("/profile", response_model=UserResponse)
async def get_user_profile(
    user_id: Optional[int] = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get user profile information"""
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    try:
        auth_service = AuthService(db)
        user = auth_service.get_user_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
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
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user profile: {str(e)}"
        )

@router.put("/profile")
async def update_user_profile(
    profile_data: Dict[str, Any],
    user_id: Optional[int] = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Update user profile information"""
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    try:
        auth_service = AuthService(db)
        user = auth_service.get_user_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update allowed fields
        if "display_name" in profile_data:
            user.display_name = profile_data["display_name"]
        
        if "avatar_url" in profile_data:
            user.avatar_url = profile_data["avatar_url"]
        
        if "is_public_profile" in profile_data:
            user.is_public_profile = profile_data["is_public_profile"]
        
        if "notifications_enabled" in profile_data:
            user.notifications_enabled = profile_data["notifications_enabled"]
        
        db.commit()
        
        return {"message": "Profile updated successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        ) 