"""
Scan Logging System for Scanémon
Tracks scan history and maintains last 15 accepted scans
"""

import json
import os
from datetime import datetime
from typing import Dict, Any, List, Optional
from pathlib import Path

class ScanLogger:
    """Manages scan logging and history tracking"""
    
    def __init__(self, log_file: str = "scan_history.json", max_history: int = 15):
        self.log_file = Path(log_file)
        self.max_history = max_history
        self._ensure_log_file()
    
    def _ensure_log_file(self):
        """Ensure the log file exists with proper structure"""
        if not self.log_file.exists():
            self.log_file.parent.mkdir(parents=True, exist_ok=True)
            self._save_history([])
    
    def _load_history(self) -> List[Dict[str, Any]]:
        """Load scan history from JSON file"""
        try:
            with open(self.log_file, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return []
    
    def _save_history(self, history: List[Dict[str, Any]]):
        """Save scan history to JSON file"""
        with open(self.log_file, 'w') as f:
            json.dump(history, f, indent=2)
    
    def log_scan(self, scan_data: Dict[str, Any], accepted: bool = True) -> Dict[str, Any]:
        """
        Log a scan with metadata
        
        Args:
            scan_data: The scan result data from ML model
            accepted: Whether the user accepted the scan result
            
        Returns:
            The complete log entry
        """
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "filename": scan_data.get("filename", "unknown.jpg"),
            "card_name": scan_data.get("name", "Unknown"),
            "confidence": scan_data.get("confidence", 0.0),
            "accepted": accepted,
            "type": scan_data.get("type", "Unknown"),
            "set": scan_data.get("set", "Unknown"),
            "rarity": scan_data.get("rarity", "Unknown"),
            "hp": scan_data.get("hp", "Unknown"),
            "model_version": scan_data.get("model_version", "unknown"),
            "full_metadata": scan_data
        }
        
        # Only store accepted scans in history
        if accepted:
            history = self._load_history()
            history.append(log_entry)
            
            # Keep only the last max_history scans
            if len(history) > self.max_history:
                history = history[-self.max_history:]
            
            self._save_history(history)
        
        return log_entry
    
    def get_history(self) -> List[Dict[str, Any]]:
        """Get the complete scan history"""
        return self._load_history()
    
    def get_recent_scans(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get recent scans, optionally limited"""
        history = self._load_history()
        if limit:
            return history[-limit:]
        return history
    
    def get_stats(self) -> Dict[str, Any]:
        """Get scan statistics"""
        history = self._load_history()
        
        if not history:
            return {
                "total_scans": 0,
                "average_confidence": 0.0,
                "most_scanned_card": None,
                "most_common_set": None
            }
        
        # Calculate statistics
        total_scans = len(history)
        avg_confidence = sum(scan["confidence"] for scan in history) / total_scans
        
        # Most scanned card
        card_counts = {}
        for scan in history:
            card_name = scan["card_name"]
            card_counts[card_name] = card_counts.get(card_name, 0) + 1
        
        most_scanned_card = max(card_counts.items(), key=lambda x: x[1])[0] if card_counts else None
        
        # Most common set
        set_counts = {}
        for scan in history:
            set_name = scan["set"]
            set_counts[set_name] = set_counts.get(set_name, 0) + 1
        
        most_common_set = max(set_counts.items(), key=lambda x: x[1])[0] if set_counts else None
        
        return {
            "total_scans": total_scans,
            "average_confidence": round(avg_confidence, 2),
            "most_scanned_card": most_scanned_card,
            "most_common_set": most_common_set,
            "last_scan": history[-1]["timestamp"] if history else None
        }

# Global scan logger instance
scan_logger = ScanLogger() 