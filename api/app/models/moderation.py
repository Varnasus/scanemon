"""
Moderation models for Scanémon
Tracks reports, moderation queue, and user feedback
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class ReportReason(enum.Enum):
    """Enumeration of report reasons"""
    INCORRECT_IDENTIFICATION = "incorrect_identification"
    INAPPROPRIATE_CONTENT = "inappropriate_content"
    TECHNICAL_ISSUE = "technical_issue"
    SPAM = "spam"
    OTHER = "other"


class ReportStatus(enum.Enum):
    """Enumeration of report statuses"""
    PENDING = "pending"
    REVIEWED = "reviewed"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"


class ModerationQueue(Base):
    """Moderation queue model for tracking reports and issues"""
    
    __tablename__ = "moderation_queue"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Related scan
    scan_id = Column(Integer, ForeignKey("scan_analytics.id"), nullable=False)
    
    # Reporter information
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Anonymous reports allowed
    reporter_ip = Column(String(45), nullable=True)
    reporter_user_agent = Column(Text, nullable=True)
    
    # Report details
    reason = Column(Enum(ReportReason), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(ReportStatus), default=ReportStatus.PENDING)
    
    # Moderator information
    moderator_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    moderator_notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    reviewed_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    
    # Relationships
    scan = relationship("ScanAnalytics", backref="moderation_reports")
    reporter = relationship("User", foreign_keys=[reporter_id], backref="reports_filed")
    moderator = relationship("User", foreign_keys=[moderator_id], backref="reports_moderated")
    
    def __repr__(self):
        return f"<ModerationQueue(id={self.id}, scan_id={self.scan_id}, reason='{self.reason.value}', status='{self.status.value}')>"


class UserFeedback(Base):
    """User feedback model for tracking user satisfaction and issues"""
    
    __tablename__ = "user_feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Related scan
    scan_id = Column(Integer, ForeignKey("scan_analytics.id"), nullable=False)
    
    # User information
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Anonymous feedback allowed
    user_ip = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    
    # Feedback details
    feedback_type = Column(String(50), nullable=False)  # "retry", "different_image", "report_issue", "general"
    feedback_message = Column(Text, nullable=True)
    satisfaction_score = Column(Integer, nullable=True)  # 1-5 scale
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    scan = relationship("ScanAnalytics", backref="feedback_entries")
    user = relationship("User", backref="feedback_given")
    
    def __repr__(self):
        return f"<UserFeedback(id={self.id}, scan_id={self.scan_id}, type='{self.feedback_type}')>" 