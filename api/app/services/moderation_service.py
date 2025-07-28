"""
Moderation Service for Scanémon
Handles user reports, moderation queue, and feedback management
"""

from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_

from app.models.moderation import ModerationQueue, UserFeedback, ReportReason, ReportStatus
from app.models.scan_analytics import ScanAnalytics
from app.models.user import User


class ModerationService:
    """Service for managing moderation and user feedback"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_report(
        self,
        scan_id: int,
        reason: ReportReason,
        description: Optional[str] = None,
        reporter_id: Optional[int] = None,
        reporter_ip: Optional[str] = None,
        reporter_user_agent: Optional[str] = None
    ) -> ModerationQueue:
        """Create a new report in the moderation queue"""
        
        # Verify scan exists
        scan = self.db.query(ScanAnalytics).filter(ScanAnalytics.id == scan_id).first()
        if not scan:
            raise ValueError(f"Scan with ID {scan_id} not found")
        
        # Create moderation queue entry
        report = ModerationQueue(
            scan_id=scan_id,
            reason=reason,
            description=description,
            reporter_id=reporter_id,
            reporter_ip=reporter_ip,
            reporter_user_agent=reporter_user_agent,
            status=ReportStatus.PENDING
        )
        
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        
        return report
    
    def get_pending_reports(
        self,
        limit: int = 50,
        offset: int = 0
    ) -> Tuple[List[ModerationQueue], int]:
        """Get pending reports with pagination"""
        total = self.db.query(ModerationQueue).filter(
            ModerationQueue.status == ReportStatus.PENDING
        ).count()
        
        reports = self.db.query(ModerationQueue).filter(
            ModerationQueue.status == ReportStatus.PENDING
        ).order_by(desc(ModerationQueue.created_at)).offset(offset).limit(limit).all()
        
        return reports, total
    
    def get_reports_by_scan(self, scan_id: int) -> List[ModerationQueue]:
        """Get all reports for a specific scan"""
        return self.db.query(ModerationQueue).filter(
            ModerationQueue.scan_id == scan_id
        ).order_by(desc(ModerationQueue.created_at)).all()
    
    def update_report_status(
        self,
        report_id: int,
        status: ReportStatus,
        moderator_id: Optional[int] = None,
        moderator_notes: Optional[str] = None
    ) -> bool:
        """Update report status and add moderator notes"""
        report = self.db.query(ModerationQueue).filter(ModerationQueue.id == report_id).first()
        if not report:
            return False
        
        report.status = status
        report.moderator_id = moderator_id
        report.moderator_notes = moderator_notes
        
        if status == ReportStatus.REVIEWED:
            report.reviewed_at = datetime.utcnow()
        elif status in [ReportStatus.RESOLVED, ReportStatus.DISMISSED]:
            report.resolved_at = datetime.utcnow()
        
        self.db.commit()
        return True
    
    def get_report_statistics(self, days: int = 30) -> Dict[str, Any]:
        """Get moderation statistics"""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Total reports
        total_reports = self.db.query(ModerationQueue).filter(
            ModerationQueue.created_at >= start_date
        ).count()
        
        # Reports by status
        status_counts = {}
        for status in ReportStatus:
            count = self.db.query(ModerationQueue).filter(
                and_(
                    ModerationQueue.status == status,
                    ModerationQueue.created_at >= start_date
                )
            ).count()
            status_counts[status.value] = count
        
        # Reports by reason
        reason_counts = {}
        for reason in ReportReason:
            count = self.db.query(ModerationQueue).filter(
                and_(
                    ModerationQueue.reason == reason,
                    ModerationQueue.created_at >= start_date
                )
            ).count()
            reason_counts[reason.value] = count
        
        # Average resolution time (for resolved reports)
        resolved_reports = self.db.query(ModerationQueue).filter(
            and_(
                ModerationQueue.status == ReportStatus.RESOLVED,
                ModerationQueue.created_at >= start_date,
                ModerationQueue.resolved_at.isnot(None)
            )
        ).all()
        
        avg_resolution_time = 0
        if resolved_reports:
            total_time = sum(
                (report.resolved_at - report.created_at).total_seconds()
                for report in resolved_reports
                if report.resolved_at
            )
            avg_resolution_time = total_time / len(resolved_reports)
        
        return {
            "total_reports": total_reports,
            "status_distribution": status_counts,
            "reason_distribution": reason_counts,
            "average_resolution_time_hours": round(avg_resolution_time / 3600, 2),
            "period_days": days
        }
    
    def log_user_feedback(
        self,
        scan_id: int,
        feedback_type: str,
        feedback_message: Optional[str] = None,
        satisfaction_score: Optional[int] = None,
        user_id: Optional[int] = None,
        user_ip: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> UserFeedback:
        """Log user feedback for a scan"""
        
        # Verify scan exists
        scan = self.db.query(ScanAnalytics).filter(ScanAnalytics.id == scan_id).first()
        if not scan:
            raise ValueError(f"Scan with ID {scan_id} not found")
        
        # Validate satisfaction score
        if satisfaction_score is not None and not (1 <= satisfaction_score <= 5):
            raise ValueError("Satisfaction score must be between 1 and 5")
        
        # Create feedback entry
        feedback = UserFeedback(
            scan_id=scan_id,
            feedback_type=feedback_type,
            feedback_message=feedback_message,
            satisfaction_score=satisfaction_score,
            user_id=user_id,
            user_ip=user_ip,
            user_agent=user_agent
        )
        
        self.db.add(feedback)
        self.db.commit()
        self.db.refresh(feedback)
        
        return feedback
    
    def get_feedback_statistics(self, user_id: Optional[int] = None, days: int = 30) -> Dict[str, Any]:
        """Get user feedback statistics"""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        query = self.db.query(UserFeedback).filter(UserFeedback.created_at >= start_date)
        if user_id:
            query = query.filter(UserFeedback.user_id == user_id)
        
        # Total feedback
        total_feedback = query.count()
        
        # Feedback by type
        type_counts = {}
        feedback_types = query.with_entities(UserFeedback.feedback_type).distinct().all()
        for feedback_type in feedback_types:
            count = query.filter(UserFeedback.feedback_type == feedback_type[0]).count()
            type_counts[feedback_type[0]] = count
        
        # Average satisfaction score
        satisfaction_scores = query.with_entities(UserFeedback.satisfaction_score).filter(
            UserFeedback.satisfaction_score.isnot(None)
        ).all()
        
        avg_satisfaction = 0
        if satisfaction_scores:
            scores = [score[0] for score in satisfaction_scores if score[0] is not None]
            if scores:
                avg_satisfaction = sum(scores) / len(scores)
        
        return {
            "total_feedback": total_feedback,
            "feedback_by_type": type_counts,
            "average_satisfaction_score": round(avg_satisfaction, 2),
            "period_days": days
        }
    
    def get_reports_for_moderation(
        self,
        moderator_id: int,
        limit: int = 20,
        offset: int = 0
    ) -> Tuple[List[ModerationQueue], int]:
        """Get reports assigned to a specific moderator"""
        total = self.db.query(ModerationQueue).filter(
            ModerationQueue.moderator_id == moderator_id
        ).count()
        
        reports = self.db.query(ModerationQueue).filter(
            ModerationQueue.moderator_id == moderator_id
        ).order_by(desc(ModerationQueue.created_at)).offset(offset).limit(limit).all()
        
        return reports, total 