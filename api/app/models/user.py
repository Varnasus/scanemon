"""
User model for Scanémon
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    """User model for authentication and profile management"""
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String(128), unique=True, index=True, nullable=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    display_name = Column(String(100), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    
    # Trainer profile
    trainer_level = Column(Integer, default=1)
    experience_points = Column(Integer, default=0)
    total_cards_scanned = Column(Integer, default=0)
    scan_streak = Column(Integer, default=0)
    last_scan_date = Column(DateTime, nullable=True)
    
    # Preferences
    is_public_profile = Column(Boolean, default=False)
    notifications_enabled = Column(Boolean, default=True)
    theme_preference = Column(String(20), default="light")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)
    
    # Relationships
    cards = relationship("Card", back_populates="owner")
    collections = relationship("Collection", back_populates="owner")
    scan_analytics = relationship("ScanAnalytics", back_populates="user")
    scan_sessions = relationship("ScanSession", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', level={self.trainer_level})>"
    
    @property
    def level_progress(self) -> float:
        """Calculate progress to next level (0.0 to 1.0)"""
        if self.trainer_level >= 100:  # Max level
            return 1.0
        
        # Simple XP progression: each level requires level * 100 XP
        current_level_xp = (self.trainer_level - 1) * 100
        next_level_xp = self.trainer_level * 100
        xp_in_current_level = self.experience_points - current_level_xp
        
        return min(1.0, xp_in_current_level / (next_level_xp - current_level_xp))
    
    def add_experience(self, xp: int) -> bool:
        """Add experience points and return True if level up occurred"""
        self.experience_points += xp
        self.total_cards_scanned += 1
        
        # Check for level up
        new_level = self.calculate_level()
        if new_level > self.trainer_level:
            self.trainer_level = new_level
            return True
        return False
    
    def calculate_level(self) -> int:
        """Calculate current level based on XP"""
        # Simple formula: level = sqrt(XP / 100) + 1
        # This gives a nice progression curve
        import math
        return min(100, int(math.sqrt(self.experience_points / 100)) + 1)
    
    def update_scan_streak(self) -> int:
        """Update scan streak and return new streak count"""
        now = datetime.utcnow()
        
        if self.last_scan_date:
            # Check if last scan was yesterday
            from datetime import timedelta
            yesterday = now.date() - timedelta(days=1)
            
            if self.last_scan_date.date() == yesterday:
                self.scan_streak += 1
            elif self.last_scan_date.date() < yesterday:
                self.scan_streak = 1
            # If same day, streak doesn't change
        else:
            # First scan
            self.scan_streak = 1
        
        self.last_scan_date = now
        return self.scan_streak 