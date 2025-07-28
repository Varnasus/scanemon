"""
Scan Analytics model for Scanémon
Tracks scan metadata, confidence, and user behavior over time
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Float, ForeignKey
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.orm import relationship

from app.core.database import Base


class ScanAnalytics(Base):
    """Scan analytics model for tracking scan performance and user behavior"""
    
    __tablename__ = "scan_analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # User identification (optional for anonymous scans)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Scan metadata
    session_id = Column(String(100), ForeignKey("scan_sessions.session_id"), nullable=True, index=True)  # For grouping related scans
    scan_method = Column(String(20), default="image")  # image, video, manual
    file_size = Column(Integer, nullable=True)  # File size in bytes
    file_type = Column(String(20), nullable=True)  # jpg, png, webp, etc.
    filename = Column(String(255), nullable=True)
    
    # ML Model data
    model_version = Column(String(50), nullable=False, default="unknown")
    confidence_score = Column(Float, nullable=False)
    processing_time_ms = Column(Integer, nullable=True)  # Processing time in milliseconds
    
    # Card identification results
    card_name = Column(String(200), nullable=True)
    card_set = Column(String(200), nullable=True)
    card_rarity = Column(String(50), nullable=True)
    card_type = Column(String(50), nullable=True)
    card_hp = Column(String(20), nullable=True)
    
    # User interaction
    accepted = Column(Boolean, default=False)  # Whether user accepted the scan
    added_to_collection = Column(Boolean, default=False)  # Whether added to collection
    user_feedback = Column(String(20), nullable=True)  # good, bad, report
    
    # Error tracking
    error_type = Column(String(100), nullable=True)  # ml_error, validation_error, etc.
    error_message = Column(Text, nullable=True)
    
    # Additional metadata
    scan_metadata = Column(JSON, nullable=True)  # Store additional scan data
    ip_address = Column(String(45), nullable=True)  # User IP for analytics
    user_agent = Column(Text, nullable=True)  # Browser/device info
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="scan_analytics")
    session = relationship("ScanSession", back_populates="scans")
    
    def __repr__(self):
        return f"<ScanAnalytics(id={self.id}, card='{self.card_name}', confidence={self.confidence_score})>"


class ScanSession(Base):
    """Scan session model for grouping related scans"""
    
    __tablename__ = "scan_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), unique=True, index=True, nullable=False)
    
    # User identification
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Session metadata
    total_scans = Column(Integer, default=0)
    successful_scans = Column(Integer, default=0)
    failed_scans = Column(Integer, default=0)
    average_confidence = Column(Float, default=0.0)
    total_processing_time_ms = Column(Integer, default=0)
    
    # Session state
    status = Column(String(20), default="active")  # active, completed, abandoned
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="scan_sessions")
    scans = relationship("ScanAnalytics", back_populates="session")
    
    def __repr__(self):
        return f"<ScanSession(id={self.id}, session_id='{self.session_id}', status='{self.status}')>" 