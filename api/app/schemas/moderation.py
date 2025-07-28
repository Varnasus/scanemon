"""
Moderation schemas for Scanémon API
Pydantic models for request/response validation
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from enum import Enum


class ReportReasonEnum(str, Enum):
    """Report reason enumeration"""
    INCORRECT_IDENTIFICATION = "incorrect_identification"
    INAPPROPRIATE_CONTENT = "inappropriate_content"
    TECHNICAL_ISSUE = "technical_issue"
    SPAM = "spam"
    OTHER = "other"


class ReportStatusEnum(str, Enum):
    """Report status enumeration"""
    PENDING = "pending"
    REVIEWED = "reviewed"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"


class FeedbackTypeEnum(str, Enum):
    """Feedback type enumeration"""
    RETRY = "retry"
    DIFFERENT_IMAGE = "different_image"
    REPORT_ISSUE = "report_issue"
    GENERAL = "general"


# Request Models
class CreateReportRequest(BaseModel):
    """Request model for creating a report"""
    scan_id: int = Field(..., description="ID of the scan being reported")
    reason: ReportReasonEnum = Field(..., description="Reason for the report")
    description: Optional[str] = Field(None, description="Additional description of the issue")


class UpdateReportRequest(BaseModel):
    """Request model for updating a report status"""
    status: ReportStatusEnum = Field(..., description="New status for the report")
    moderator_notes: Optional[str] = Field(None, description="Notes from the moderator")


class CreateFeedbackRequest(BaseModel):
    """Request model for creating user feedback"""
    scan_id: int = Field(..., description="ID of the scan for feedback")
    feedback_type: FeedbackTypeEnum = Field(..., description="Type of feedback")
    feedback_message: Optional[str] = Field(None, description="Additional feedback message")
    satisfaction_score: Optional[int] = Field(None, ge=1, le=5, description="Satisfaction score (1-5)")


# Response Models
class ReportResponse(BaseModel):
    """Response model for a report"""
    id: int
    scan_id: int
    reason: ReportReasonEnum
    description: Optional[str]
    status: ReportStatusEnum
    reporter_id: Optional[int]
    moderator_id: Optional[int]
    moderator_notes: Optional[str]
    created_at: datetime
    reviewed_at: Optional[datetime]
    resolved_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class FeedbackResponse(BaseModel):
    """Response model for user feedback"""
    id: int
    scan_id: int
    feedback_type: str
    feedback_message: Optional[str]
    satisfaction_score: Optional[int]
    user_id: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True


class ModerationStatsResponse(BaseModel):
    """Response model for moderation statistics"""
    total_reports: int
    status_distribution: dict
    reason_distribution: dict
    average_resolution_time_hours: float
    period_days: int


class FeedbackStatsResponse(BaseModel):
    """Response model for feedback statistics"""
    total_feedback: int
    feedback_by_type: dict
    average_satisfaction_score: float
    period_days: int


class ModerationQueueResponse(BaseModel):
    """Response model for moderation queue with pagination"""
    reports: List[ReportResponse]
    total: int
    limit: int
    offset: int


# List Response Models
class ReportsListResponse(BaseModel):
    """Response model for list of reports"""
    reports: List[ReportResponse]
    total: int


class FeedbackListResponse(BaseModel):
    """Response model for list of feedback"""
    feedback: List[FeedbackResponse]
    total: int 