"""
ML Service for card identification using CLIP and other models
"""

import sys
import os
import time
import asyncio
from typing import Dict, Any, Optional, List, Tuple
from dataclasses import dataclass
import logging
from pathlib import Path

# Add ML directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../ml')))

import io
import numpy as np
from PIL import Image
import torch
import torch.nn.functional as F
from transformers import CLIPProcessor, CLIPModel
import cv2

logger = logging.getLogger(__name__)

@dataclass
class CardPrediction:
    """Structured prediction result for a card"""
    name: str
    set: str
    number: Optional[str] = None
    rarity: str = "Unknown"
    confidence: float = 0.0
    bounding_box: Optional[Tuple[int, int, int, int]] = None
    model_version: str = "unknown"
    processing_time_ms: int = 0
    metadata: Dict[str, Any] = None

class MLService:
    """Main ML service for card identification"""
    
    def __init__(self):
        self.model = None
        self.processor = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model_version = "clip_v1.0.0"
        self.is_initialized = False
        
        # Card database (will be expanded)
        self.card_database = {
            "Pikachu": {"set": "Base Set", "number": "58/102", "rarity": "Common"},
            "Charizard": {"set": "Base Set", "number": "4/102", "rarity": "Ultra Rare"},
            "Mew": {"set": "Promo", "number": "9", "rarity": "Rare"},
            "Mewtwo": {"set": "Base Set", "number": "10/102", "rarity": "Rare"},
            "Bulbasaur": {"set": "Base Set", "number": "44/102", "rarity": "Common"},
            "Squirtle": {"set": "Base Set", "number": "63/102", "rarity": "Common"},
            "Eevee": {"set": "Jungle", "number": "51/64", "rarity": "Common"},
            "Umbreon": {"set": "Neo Discovery", "number": "13/75", "rarity": "Rare"},
            "Ditto": {"set": "Fossil", "number": "3/62", "rarity": "Common"},
            "Magikarp": {"set": "Base Set", "number": "52/102", "rarity": "Common"},
        }
        
        # Text prompts for CLIP
        self.text_prompts = [
            "a pokemon card of Pikachu",
            "a pokemon card of Charizard", 
            "a pokemon card of Mew",
            "a pokemon card of Mewtwo",
            "a pokemon card of Bulbasaur",
            "a pokemon card of Squirtle",
            "a pokemon card of Eevee",
            "a pokemon card of Umbreon",
            "a pokemon card of Ditto",
            "a pokemon card of Magikarp",
        ]
        
        self.card_names = list(self.card_database.keys())
        
    async def initialize(self) -> bool:
        """Initialize the ML model asynchronously"""
        try:
            logger.info("Initializing ML service...")
            
            # Load CLIP model
            self.model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
            self.processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
            
            # Move to device
            self.model = self.model.to(self.device)
            self.model.eval()
            
            self.is_initialized = True
            logger.info(f"ML service initialized successfully on {self.device}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize ML service: {e}")
            self.is_initialized = False
            return False
    
    def preprocess_image(self, image_bytes: bytes) -> torch.Tensor:
        """Preprocess image for CLIP model"""
        try:
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            
            # Resize to 224x224 (CLIP standard)
            image = image.resize((224, 224), Image.Resampling.LANCZOS)
            
            # Convert to tensor and normalize
            image_tensor = self.processor(images=image, return_tensors="pt")
            
            return image_tensor['pixel_values'].to(self.device)
            
        except Exception as e:
            logger.error(f"Image preprocessing failed: {e}")
            raise ValueError(f"Failed to preprocess image: {e}")
    
    def get_card_embeddings(self) -> torch.Tensor:
        """Get text embeddings for all cards"""
        try:
            # Process text prompts
            text_inputs = self.processor(
                text=self.text_prompts,
                padding=True,
                truncation=True,
                return_tensors="pt"
            ).to(self.device)
            
            # Get text embeddings
            with torch.no_grad():
                text_embeddings = self.model.get_text_features(**text_inputs)
                text_embeddings = F.normalize(text_embeddings, p=2, dim=1)
            
            return text_embeddings
            
        except Exception as e:
            logger.error(f"Failed to get card embeddings: {e}")
            raise
    
    async def identify_card(self, image_bytes: bytes) -> CardPrediction:
        """Identify a card from image bytes"""
        start_time = time.time()
        
        try:
            # Ensure model is initialized
            if not self.is_initialized:
                await self.initialize()
            
            # Preprocess image
            image_tensor = self.preprocess_image(image_bytes)
            
            # Get image features
            with torch.no_grad():
                image_features = self.model.get_image_features(image_tensor)
                image_features = F.normalize(image_features, p=2, dim=1)
            
            # Get text embeddings
            text_embeddings = self.get_card_embeddings()
            
            # Calculate similarities
            similarities = torch.matmul(image_features, text_embeddings.T)
            similarities = similarities.squeeze()
            
            # Get best match
            best_idx = torch.argmax(similarities).item()
            confidence = similarities[best_idx].item()
            
            # Get card info
            card_name = self.card_names[best_idx]
            card_info = self.card_database[card_name]
            
            # Calculate processing time
            processing_time_ms = int((time.time() - start_time) * 1000)
            
            return CardPrediction(
                name=card_name,
                set=card_info["set"],
                number=card_info["number"],
                rarity=card_info["rarity"],
                confidence=confidence,
                model_version=self.model_version,
                processing_time_ms=processing_time_ms,
                metadata={
                    "model_type": "clip",
                    "device": str(self.device),
                    "similarities": similarities.cpu().numpy().tolist(),
                    "all_predictions": [
                        {
                            "name": self.card_names[i],
                            "confidence": similarities[i].item()
                        }
                        for i in range(len(self.card_names))
                    ]
                }
            )
            
        except Exception as e:
            logger.error(f"Card identification failed: {e}")
            processing_time_ms = int((time.time() - start_time) * 1000)
            
            return CardPrediction(
                name="Unknown",
                set="Unknown",
                rarity="Unknown",
                confidence=0.0,
                model_version=self.model_version,
                processing_time_ms=processing_time_ms,
                metadata={"error": str(e)}
            )
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get model information"""
        return {
            "model_version": self.model_version,
            "model_type": "clip",
            "device": str(self.device),
            "is_initialized": self.is_initialized,
            "card_database_size": len(self.card_database),
            "supported_cards": list(self.card_database.keys())
        }
    
    async def health_check(self) -> bool:
        """Check if ML service is healthy"""
        try:
            if not self.is_initialized:
                return await self.initialize()
            
            # Test with a dummy image
            dummy_image = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
            dummy_bytes = cv2.imencode('.jpg', dummy_image)[1].tobytes()
            
            result = await self.identify_card(dummy_bytes)
            return result.name != "Unknown" or result.confidence > 0
            
        except Exception as e:
            logger.error(f"ML health check failed: {e}")
            return False

# Global ML service instance
ml_service = MLService() 