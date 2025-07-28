"""
Analytics schemas for Scanémon API
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ScanAnalyticsResponse(BaseModel):
    """Scan analytics response schema"""
    id: int
    user_id: Optional[int] = None
    session_id: Optional[str] = None
    scan_method: str = "image"
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    filename: Optional[str] = None
    model_version: str
    confidence_score: float
    processing_time_ms: Optional[int] = None
    card_name: Optional[str] = None
    card_set: Optional[str] = None
    card_rarity: Optional[str] = None
    card_type: Optional[str] = None
    card_hp: Optional[str] = None
    accepted: bool = False
    added_to_collection: bool = False
    user_feedback: Optional[str] = None
    error_type: Optional[str] = None
    error_message: Optional[str] = None
    scan_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConfidenceStats(BaseModel):
    """Confidence statistics schema"""
    average: float = Field(..., description="Average confidence score")
    minimum: float = Field(..., description="Minimum confidence score")
    maximum: float = Field(..., description="Maximum confidence score")
    standard_deviation: float = Field(..., description="Standard deviation of confidence scores")


class ProcessingTimeStats(BaseModel):
    """Processing time statistics schema"""
    average_ms: float = Field(..., description="Average processing time in milliseconds")
    minimum_ms: int = Field(..., description="Minimum processing time in milliseconds")
    maximum_ms: int = Field(..., description="Maximum processing time in milliseconds")


class CardCount(BaseModel):
    """Card count schema"""
    card_name: str = Field(..., description="Name of the card")
    count: int = Field(..., description="Number of times scanned")


class SetCount(BaseModel):
    """Set count schema"""
    set_name: str = Field(..., description="Name of the card set")
    count: int = Field(..., description="Number of times scanned")


class DailyTrend(BaseModel):
    """Daily scan trend schema"""
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    count: int = Field(..., description="Number of scans on this date")


class ModelVersionStats(BaseModel):
    """Model version statistics schema"""
    version: str = Field(..., description="Model version identifier")
    total_scans: int = Field(..., description="Total scans with this model version")
    average_confidence: float = Field(..., description="Average confidence score")
    average_processing_time_ms: float = Field(..., description="Average processing time in milliseconds")


class ScanStatsResponse(BaseModel):
    """Comprehensive scan statistics response schema"""
    total_scans: int = Field(..., description="Total number of scans")
    successful_scans: int = Field(..., description="Number of successful scans")
    failed_scans: int = Field(..., description="Number of failed scans")
    success_rate: float = Field(..., description="Success rate percentage")
    acceptance_rate: float = Field(..., description="Acceptance rate percentage")
    confidence: ConfidenceStats = Field(..., description="Confidence score statistics")
    processing_time: ProcessingTimeStats = Field(..., description="Processing time statistics")
    most_scanned_cards: List[CardCount] = Field(..., description="Most frequently scanned cards")
    most_common_sets: List[SetCount] = Field(..., description="Most frequently scanned sets")
    daily_trends: List[DailyTrend] = Field(..., description="Daily scan trends")
    period_days: int = Field(..., description="Number of days in the analysis period")


class ConfidenceDistributionResponse(BaseModel):
    """Confidence distribution response schema"""
    distribution: Dict[str, int] = Field(..., description="Confidence score distribution by ranges")
    total_scans: int = Field(..., description="Total number of scans with confidence scores")


class ModelPerformanceResponse(BaseModel):
    """Model performance response schema"""
    total_scans: int = Field(..., description="Total number of scans")
    successful_scans: int = Field(..., description="Number of successful scans")
    success_rate: float = Field(..., description="Success rate percentage")
    model_versions: List[ModelVersionStats] = Field(..., description="Statistics by model version")


class ErrorAnalysisResponse(BaseModel):
    """Error analysis response schema"""
    error_counts: Dict[str, int] = Field(..., description="Count of errors by type")
    total_errors: int = Field(..., description="Total number of errors")


class ScanHistoryResponse(BaseModel):
    """Scan history response schema"""
    scans: List[ScanAnalyticsResponse] = Field(..., description="List of scan analytics")
    total: int = Field(..., description="Total number of scans")
    page: int = Field(..., description="Current page number")
    limit: int = Field(..., description="Number of items per page")
    has_more: bool = Field(..., description="Whether there are more pages")


class ScanSessionResponse(BaseModel):
    """Scan session response schema"""
    session_id: str = Field(..., description="Unique session identifier")
    user_id: Optional[int] = None
    total_scans: int = Field(..., description="Total scans in session")
    successful_scans: int = Field(..., description="Successful scans in session")
    failed_scans: int = Field(..., description="Failed scans in session")
    average_confidence: float = Field(..., description="Average confidence score")
    total_processing_time_ms: int = Field(..., description="Total processing time")
    status: str = Field(..., description="Session status")
    started_at: datetime = Field(..., description="Session start time")
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 