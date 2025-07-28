"""
Scan Analytics Service for Scanémon
Provides comprehensive analytics for scan performance and user behavior
"""

import time
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_

from app.models.scan_analytics import ScanAnalytics, ScanSession
from app.models.user import User


class ScanAnalyticsService:
    """Service for managing scan analytics and statistics"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_scan_session(self, user_id: Optional[int] = None) -> str:
        """Create a new scan session and return session ID"""
        session_id = str(uuid.uuid4())
        
        session = ScanSession(
            session_id=session_id,
            user_id=user_id,
            status="active"
        )
        
        self.db.add(session)
        self.db.commit()
        return session_id
    
    def log_scan(
        self,
        scan_data: Dict[str, Any],
        session_id: Optional[str] = None,
        user_id: Optional[int] = None,
        processing_time_ms: Optional[int] = None,
        accepted: bool = False,
        added_to_collection: bool = False,
        user_feedback: Optional[str] = None,
        error_type: Optional[str] = None,
        error_message: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> ScanAnalytics:
        """Log a scan with comprehensive metadata"""
        
        # Create scan analytics entry
        scan_analytics = ScanAnalytics(
            user_id=user_id,
            session_id=session_id,
            scan_method=scan_data.get("scan_method", "image"),
            file_size=scan_data.get("file_size"),
            file_type=scan_data.get("file_type"),
            filename=scan_data.get("filename"),
            model_version=scan_data.get("model_version", "unknown"),
            confidence_score=scan_data.get("confidence", 0.0),
            processing_time_ms=processing_time_ms,
            card_name=scan_data.get("name"),
            card_set=scan_data.get("set"),
            card_rarity=scan_data.get("rarity"),
            card_type=scan_data.get("type"),
            card_hp=scan_data.get("hp"),
            accepted=accepted,
            added_to_collection=added_to_collection,
            user_feedback=user_feedback,
            error_type=error_type,
            error_message=error_message,
            scan_metadata=scan_data,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        self.db.add(scan_analytics)
        
        # Update scan session if provided
        if session_id:
            session = self.db.query(ScanSession).filter(ScanSession.session_id == session_id).first()
            if session:
                session.total_scans += 1
                if error_type:
                    session.failed_scans += 1
                else:
                    session.successful_scans += 1
                
                # Update average confidence
                if scan_analytics.confidence_score > 0:
                    total_confidence = session.average_confidence * (session.total_scans - 1) + scan_analytics.confidence_score
                    session.average_confidence = total_confidence / session.total_scans
                
                # Update processing time
                if processing_time_ms:
                    session.total_processing_time_ms += processing_time_ms
        
        self.db.commit()
        return scan_analytics
    
    def update_scan_acceptance(self, scan_id: int, accepted: bool, added_to_collection: bool = False) -> bool:
        """Update scan acceptance status"""
        scan = self.db.query(ScanAnalytics).filter(ScanAnalytics.id == scan_id).first()
        if not scan:
            return False
        
        scan.accepted = accepted
        scan.added_to_collection = added_to_collection
        scan.updated_at = datetime.utcnow()
        
        self.db.commit()
        return True
    
    def get_scan_stats(self, user_id: Optional[int] = None, days: int = 30) -> Dict[str, Any]:
        """Get comprehensive scan statistics"""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Base query
        query = self.db.query(ScanAnalytics)
        if user_id:
            query = query.filter(ScanAnalytics.user_id == user_id)
        query = query.filter(ScanAnalytics.created_at >= start_date)
        
        # Total scans
        total_scans = query.count()
        
        # Successful vs failed scans
        successful_scans = query.filter(ScanAnalytics.error_type.is_(None)).count()
        failed_scans = total_scans - successful_scans
        
        # Confidence statistics
        confidence_stats = query.with_entities(
            func.avg(ScanAnalytics.confidence_score).label('avg_confidence'),
            func.min(ScanAnalytics.confidence_score).label('min_confidence'),
            func.max(ScanAnalytics.confidence_score).label('max_confidence')
        ).filter(ScanAnalytics.confidence_score > 0).first()
        
        # Calculate standard deviation manually for SQLite compatibility
        std_confidence = 0.0
        if confidence_stats and confidence_stats.avg_confidence:
            # Get all confidence scores for manual std dev calculation
            confidence_scores = query.with_entities(ScanAnalytics.confidence_score).filter(
                ScanAnalytics.confidence_score > 0
            ).all()
            
            if len(confidence_scores) > 1:
                scores = [score[0] for score in confidence_scores]
                mean = sum(scores) / len(scores)
                variance = sum((x - mean) ** 2 for x in scores) / len(scores)
                std_confidence = variance ** 0.5
        
        # Most scanned cards
        card_counts = self.db.query(
            ScanAnalytics.card_name,
            func.count(ScanAnalytics.id).label('count')
        ).filter(
            ScanAnalytics.card_name.isnot(None),
            ScanAnalytics.created_at >= start_date
        )
        if user_id:
            card_counts = card_counts.filter(ScanAnalytics.user_id == user_id)
        
        card_counts = card_counts.group_by(ScanAnalytics.card_name).order_by(desc('count')).limit(10).all()
        
        # Most common sets
        set_counts = self.db.query(
            ScanAnalytics.card_set,
            func.count(ScanAnalytics.id).label('count')
        ).filter(
            ScanAnalytics.card_set.isnot(None),
            ScanAnalytics.created_at >= start_date
        )
        if user_id:
            set_counts = set_counts.filter(ScanAnalytics.user_id == user_id)
        
        set_counts = set_counts.group_by(ScanAnalytics.card_set).order_by(desc('count')).limit(5).all()
        
        # Acceptance rate
        accepted_scans = query.filter(ScanAnalytics.accepted == True).count()
        acceptance_rate = (accepted_scans / total_scans * 100) if total_scans > 0 else 0
        
        # Processing time statistics
        processing_stats = query.with_entities(
            func.avg(ScanAnalytics.processing_time_ms).label('avg_processing_time'),
            func.min(ScanAnalytics.processing_time_ms).label('min_processing_time'),
            func.max(ScanAnalytics.processing_time_ms).label('max_processing_time')
        ).filter(ScanAnalytics.processing_time_ms.isnot(None)).first()
        
        # Daily scan trends
        daily_scans = self.db.query(
            func.date(ScanAnalytics.created_at).label('date'),
            func.count(ScanAnalytics.id).label('count')
        ).filter(ScanAnalytics.created_at >= start_date)
        if user_id:
            daily_scans = daily_scans.filter(ScanAnalytics.user_id == user_id)
        
        daily_scans = daily_scans.group_by(func.date(ScanAnalytics.created_at)).order_by('date').all()
        
        return {
            "total_scans": total_scans,
            "successful_scans": successful_scans,
            "failed_scans": failed_scans,
            "success_rate": (successful_scans / total_scans * 100) if total_scans > 0 else 0,
            "acceptance_rate": round(acceptance_rate, 2),
            "confidence": {
                "average": round(confidence_stats.avg_confidence, 3) if confidence_stats.avg_confidence else 0,
                "minimum": round(confidence_stats.min_confidence, 3) if confidence_stats.min_confidence else 0,
                "maximum": round(confidence_stats.max_confidence, 3) if confidence_stats.max_confidence else 0,
                "standard_deviation": round(std_confidence, 3)
            },
            "processing_time": {
                "average_ms": round(processing_stats.avg_processing_time, 2) if processing_stats.avg_processing_time else 0,
                "minimum_ms": processing_stats.min_processing_time if processing_stats.min_processing_time else 0,
                "maximum_ms": processing_stats.max_processing_time if processing_stats.max_processing_time else 0
            },
            "most_scanned_cards": [
                {"card_name": card.card_name, "count": card.count}
                for card in card_counts
            ],
            "most_common_sets": [
                {"set_name": set_data.card_set, "count": set_data.count}
                for set_data in set_counts
            ],
            "daily_trends": [
                {"date": str(trend.date), "count": trend.count}
                for trend in daily_scans
            ],
            "period_days": days
        }
    
    def get_user_scan_history(
        self,
        user_id: int,
        limit: int = 50,
        offset: int = 0
    ) -> Tuple[List[ScanAnalytics], int]:
        """Get user's scan history with pagination"""
        total = self.db.query(ScanAnalytics).filter(ScanAnalytics.user_id == user_id).count()
        
        scans = self.db.query(ScanAnalytics).filter(
            ScanAnalytics.user_id == user_id
        ).order_by(desc(ScanAnalytics.created_at)).offset(offset).limit(limit).all()
        
        return scans, total
    
    def get_confidence_distribution(self, user_id: Optional[int] = None) -> Dict[str, int]:
        """Get confidence score distribution"""
        query = self.db.query(ScanAnalytics).filter(ScanAnalytics.confidence_score > 0)
        if user_id:
            query = query.filter(ScanAnalytics.user_id == user_id)
        
        # Define confidence ranges
        ranges = [
            (0.0, 0.2, "0-20%"),
            (0.2, 0.4, "20-40%"),
            (0.4, 0.6, "40-60%"),
            (0.6, 0.8, "60-80%"),
            (0.8, 1.0, "80-100%")
        ]
        
        distribution = {}
        for min_val, max_val, label in ranges:
            count = query.filter(
                and_(
                    ScanAnalytics.confidence_score >= min_val,
                    ScanAnalytics.confidence_score < max_val
                )
            ).count()
            distribution[label] = count
        
        return distribution
    
    def get_model_performance(self, model_version: Optional[str] = None) -> Dict[str, Any]:
        """Get model performance metrics"""
        query = self.db.query(ScanAnalytics)
        if model_version:
            query = query.filter(ScanAnalytics.model_version == model_version)
        
        total_scans = query.count()
        successful_scans = query.filter(ScanAnalytics.error_type.is_(None)).count()
        
        # Average confidence by model version
        model_stats = self.db.query(
            ScanAnalytics.model_version,
            func.count(ScanAnalytics.id).label('total_scans'),
            func.avg(ScanAnalytics.confidence_score).label('avg_confidence'),
            func.avg(ScanAnalytics.processing_time_ms).label('avg_processing_time')
        ).filter(ScanAnalytics.confidence_score > 0).group_by(ScanAnalytics.model_version).all()
        
        return {
            "total_scans": total_scans,
            "successful_scans": successful_scans,
            "success_rate": (successful_scans / total_scans * 100) if total_scans > 0 else 0,
            "model_versions": [
                {
                    "version": stat.model_version,
                    "total_scans": stat.total_scans,
                    "average_confidence": round(stat.avg_confidence, 3) if stat.avg_confidence else 0,
                    "average_processing_time_ms": round(stat.avg_processing_time, 2) if stat.avg_processing_time else 0
                }
                for stat in model_stats
            ]
        }
    
    def get_error_analysis(self, user_id: Optional[int] = None) -> Dict[str, int]:
        """Get error type analysis"""
        query = self.db.query(ScanAnalytics).filter(ScanAnalytics.error_type.isnot(None))
        if user_id:
            query = query.filter(ScanAnalytics.user_id == user_id)
        
        error_counts = query.with_entities(
            ScanAnalytics.error_type,
            func.count(ScanAnalytics.id).label('count')
        ).group_by(ScanAnalytics.error_type).all()
        
        return {error.error_type: error.count for error in error_counts} 