"""
Card Detector Service for finding card bounding boxes in images
"""

import cv2
import numpy as np
from typing import List, Tuple, Optional, Dict, Any
import logging
from dataclasses import dataclass
from PIL import Image
import io

logger = logging.getLogger(__name__)

@dataclass
class CardDetection:
    """Card detection result"""
    bounding_box: Tuple[int, int, int, int]  # x, y, width, height
    confidence: float
    card_type: str = "pokemon"  # "pokemon", "energy", "trainer"
    metadata: Dict[str, Any] = None

class CardDetector:
    """Service for detecting cards in images"""
    
    def __init__(self, method: str = "contour"):
        self.method = method  # "contour", "yolo", "template"
        self.min_card_area = 10000  # Minimum area for a card
        self.max_card_area = 500000  # Maximum area for a card
        self.aspect_ratio_range = (1.2, 1.5)  # Expected card aspect ratio
        
        # Load YOLO model if available
        self.yolo_model = None
        if method == "yolo":
            self._load_yolo_model()
    
    def _load_yolo_model(self):
        """Load YOLO model for card detection"""
        try:
            # Try to load YOLOv8 model
            from ultralytics import YOLO
            self.yolo_model = YOLO('yolov8n.pt')  # Use nano model for speed
            logger.info("YOLO model loaded successfully")
        except ImportError:
            logger.warning("YOLO not available, falling back to contour detection")
            self.method = "contour"
        except Exception as e:
            logger.error(f"Failed to load YOLO model: {e}")
            self.method = "contour"
    
    def detect_cards(self, image_bytes: bytes) -> List[CardDetection]:
        """Detect cards in image bytes"""
        try:
            # Convert bytes to numpy array
            image = self._bytes_to_numpy(image_bytes)
            
            if self.method == "yolo":
                return self._detect_with_yolo(image)
            elif self.method == "contour":
                return self._detect_with_contours(image)
            else:
                logger.error(f"Unknown detection method: {self.method}")
                return []
                
        except Exception as e:
            logger.error(f"Card detection failed: {e}")
            return []
    
    def _bytes_to_numpy(self, image_bytes: bytes) -> np.ndarray:
        """Convert image bytes to numpy array"""
        try:
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            
            # Convert to numpy array
            image_array = np.array(image)
            
            return image_array
            
        except Exception as e:
            logger.error(f"Failed to convert image bytes: {e}")
            raise
    
    def _detect_with_yolo(self, image: np.ndarray) -> List[CardDetection]:
        """Detect cards using YOLO model"""
        try:
            if not self.yolo_model:
                return []
            
            # Run YOLO detection
            results = self.yolo_model(image)
            
            detections = []
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        # Get bounding box coordinates
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        confidence = box.conf[0].cpu().numpy()
                        class_id = int(box.cls[0].cpu().numpy())
                        
                        # Convert to (x, y, width, height) format
                        x, y, width, height = int(x1), int(y1), int(x2 - x1), int(y2 - y1)
                        
                        # Filter by confidence and size
                        if confidence > 0.5 and self._is_valid_card_size(width, height):
                            detections.append(CardDetection(
                                bounding_box=(x, y, width, height),
                                confidence=float(confidence),
                                metadata={
                                    "method": "yolo",
                                    "class_id": class_id
                                }
                            ))
            
            return detections
            
        except Exception as e:
            logger.error(f"YOLO detection failed: {e}")
            return []
    
    def _detect_with_contours(self, image: np.ndarray) -> List[CardDetection]:
        """Detect cards using contour detection"""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
            
            # Apply Gaussian blur
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # Apply edge detection
            edges = cv2.Canny(blurred, 50, 150)
            
            # Find contours
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            detections = []
            for contour in contours:
                # Get bounding rectangle
                x, y, width, height = cv2.boundingRect(contour)
                
                # Filter by size and aspect ratio
                if self._is_valid_card_size(width, height):
                    # Calculate confidence based on contour properties
                    area = cv2.contourArea(contour)
                    perimeter = cv2.arcLength(contour, True)
                    
                    # Higher confidence for contours that look more like rectangles
                    if perimeter > 0:
                        circularity = 4 * np.pi * area / (perimeter * perimeter)
                        confidence = min(1.0, circularity * 2)  # Scale to 0-1
                    else:
                        confidence = 0.5
                    
                    detections.append(CardDetection(
                        bounding_box=(x, y, width, height),
                        confidence=confidence,
                        metadata={
                            "method": "contour",
                            "area": area,
                            "perimeter": perimeter,
                            "circularity": circularity if perimeter > 0 else 0
                        }
                    ))
            
            # Sort by confidence and remove overlapping detections
            detections.sort(key=lambda x: x.confidence, reverse=True)
            detections = self._remove_overlapping_detections(detections)
            
            return detections
            
        except Exception as e:
            logger.error(f"Contour detection failed: {e}")
            return []
    
    def _is_valid_card_size(self, width: int, height: int) -> bool:
        """Check if detected region has valid card dimensions"""
        area = width * height
        
        # Check area constraints
        if area < self.min_card_area or area > self.max_card_area:
            return False
        
        # Check aspect ratio
        aspect_ratio = width / height if height > 0 else 0
        if not (self.aspect_ratio_range[0] <= aspect_ratio <= self.aspect_ratio_range[1]):
            return False
        
        return True
    
    def _remove_overlapping_detections(self, detections: List[CardDetection], 
                                     overlap_threshold: float = 0.5) -> List[CardDetection]:
        """Remove overlapping detections, keeping the highest confidence ones"""
        if not detections:
            return []
        
        filtered_detections = []
        
        for detection in detections:
            is_overlapping = False
            
            for existing in filtered_detections:
                if self._calculate_overlap(detection.bounding_box, existing.bounding_box) > overlap_threshold:
                    is_overlapping = True
                    break
            
            if not is_overlapping:
                filtered_detections.append(detection)
        
        return filtered_detections
    
    def _calculate_overlap(self, box1: Tuple[int, int, int, int], 
                          box2: Tuple[int, int, int, int]) -> float:
        """Calculate overlap ratio between two bounding boxes"""
        x1, y1, w1, h1 = box1
        x2, y2, w2, h2 = box2
        
        # Calculate intersection
        x_left = max(x1, x2)
        y_top = max(y1, y2)
        x_right = min(x1 + w1, x2 + w2)
        y_bottom = min(y1 + h1, y2 + h2)
        
        if x_right < x_left or y_bottom < y_top:
            return 0.0
        
        intersection_area = (x_right - x_left) * (y_bottom - y_top)
        box1_area = w1 * h1
        box2_area = w2 * h2
        union_area = box1_area + box2_area - intersection_area
        
        return intersection_area / union_area if union_area > 0 else 0.0
    
    def crop_card(self, image_bytes: bytes, bounding_box: Tuple[int, int, int, int]) -> bytes:
        """Crop image to card bounding box"""
        try:
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            
            # Crop to bounding box
            x, y, width, height = bounding_box
            cropped_image = image.crop((x, y, x + width, y + height))
            
            # Convert back to bytes
            output = io.BytesIO()
            cropped_image.save(output, format='JPEG', quality=95)
            return output.getvalue()
            
        except Exception as e:
            logger.error(f"Failed to crop card: {e}")
            raise
    
    def get_detection_info(self) -> Dict[str, Any]:
        """Get information about the detector"""
        return {
            "method": self.method,
            "min_card_area": self.min_card_area,
            "max_card_area": self.max_card_area,
            "aspect_ratio_range": self.aspect_ratio_range,
            "yolo_available": self.yolo_model is not None
        }
    
    async def health_check(self) -> bool:
        """Check if detector is healthy"""
        try:
            # Test with a dummy image
            dummy_image = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
            dummy_bytes = cv2.imencode('.jpg', dummy_image)[1].tobytes()
            
            detections = self.detect_cards(dummy_bytes)
            return True  # If no exception, detector is healthy
            
        except Exception as e:
            logger.error(f"Detector health check failed: {e}")
            return False

# Global card detector instance
card_detector = CardDetector() 