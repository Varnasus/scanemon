"""
Model Loader Service for dynamic model switching and version management
"""

import os
import json
import logging
from typing import Dict, Any, Optional, List
from pathlib import Path
from dataclasses import dataclass
import asyncio
from datetime import datetime

logger = logging.getLogger(__name__)

@dataclass
class ModelConfig:
    """Model configuration"""
    name: str
    version: str
    type: str  # "clip", "custom", "local"
    path: Optional[str] = None
    device: str = "auto"
    enabled: bool = True
    priority: int = 1  # Lower number = higher priority
    metadata: Dict[str, Any] = None

class ModelLoader:
    """Service for loading and managing ML models"""
    
    def __init__(self, config_path: str = "models/config.json"):
        self.config_path = Path(config_path)
        self.models: Dict[str, ModelConfig] = {}
        self.active_model: Optional[str] = None
        self.model_cache: Dict[str, Any] = {}
        
        # Default models
        self.default_models = {
            "clip_v1.0.0": ModelConfig(
                name="CLIP Base",
                version="v1.0.0",
                type="clip",
                device="auto",
                enabled=True,
                priority=1,
                metadata={
                    "description": "OpenAI CLIP model for card identification",
                    "model_id": "openai/clip-vit-base-patch32",
                    "supported_cards": 10,
                    "accuracy": 0.85
                }
            ),
            "custom_v1.0.0": ModelConfig(
                name="Custom Model",
                version="v1.0.0", 
                type="custom",
                path="models/custom_model.pth",
                device="auto",
                enabled=False,
                priority=2,
                metadata={
                    "description": "Custom trained model for Pokémon cards",
                    "training_data": "pokemon_cards_v1",
                    "accuracy": 0.92
                }
            )
        }
        
        self.load_config()
    
    def load_config(self):
        """Load model configuration from file"""
        try:
            if self.config_path.exists():
                with open(self.config_path, 'r') as f:
                    config_data = json.load(f)
                
                # Load models from config
                for model_id, model_data in config_data.get("models", {}).items():
                    self.models[model_id] = ModelConfig(**model_data)
                
                # Set active model
                self.active_model = config_data.get("active_model", "clip_v1.0.0")
                
            else:
                # Use default models
                self.models = self.default_models.copy()
                self.active_model = "clip_v1.0.0"
                self.save_config()
                
        except Exception as e:
            logger.error(f"Failed to load model config: {e}")
            # Fallback to defaults
            self.models = self.default_models.copy()
            self.active_model = "clip_v1.0.0"
    
    def save_config(self):
        """Save model configuration to file"""
        try:
            # Ensure directory exists
            self.config_path.parent.mkdir(parents=True, exist_ok=True)
            
            config_data = {
                "active_model": self.active_model,
                "models": {
                    model_id: {
                        "name": model.name,
                        "version": model.version,
                        "type": model.type,
                        "path": model.path,
                        "device": model.device,
                        "enabled": model.enabled,
                        "priority": model.priority,
                        "metadata": model.metadata
                    }
                    for model_id, model in self.models.items()
                }
            }
            
            with open(self.config_path, 'w') as f:
                json.dump(config_data, f, indent=2)
                
        except Exception as e:
            logger.error(f"Failed to save model config: {e}")
    
    def get_active_model(self) -> Optional[ModelConfig]:
        """Get the currently active model configuration"""
        if self.active_model and self.active_model in self.models:
            return self.models[self.active_model]
        return None
    
    def get_available_models(self) -> List[ModelConfig]:
        """Get list of available models"""
        return list(self.models.values())
    
    def get_enabled_models(self) -> List[ModelConfig]:
        """Get list of enabled models"""
        return [model for model in self.models.values() if model.enabled]
    
    async def switch_model(self, model_id: str) -> bool:
        """Switch to a different model"""
        try:
            if model_id not in self.models:
                logger.error(f"Model {model_id} not found")
                return False
            
            model_config = self.models[model_id]
            if not model_config.enabled:
                logger.error(f"Model {model_id} is disabled")
                return False
            
            # Clear cache for old model
            if self.active_model in self.model_cache:
                del self.model_cache[self.active_model]
            
            # Switch to new model
            self.active_model = model_id
            self.save_config()
            
            logger.info(f"Switched to model: {model_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to switch model: {e}")
            return False
    
    def add_model(self, model_config: ModelConfig) -> bool:
        """Add a new model configuration"""
        try:
            model_id = f"{model_config.name.lower()}_{model_config.version}"
            
            if model_id in self.models:
                logger.warning(f"Model {model_id} already exists, updating...")
            
            self.models[model_id] = model_config
            self.save_config()
            
            logger.info(f"Added model: {model_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to add model: {e}")
            return False
    
    def remove_model(self, model_id: str) -> bool:
        """Remove a model configuration"""
        try:
            if model_id not in self.models:
                logger.error(f"Model {model_id} not found")
                return False
            
            # Don't remove if it's the active model
            if model_id == self.active_model:
                logger.error(f"Cannot remove active model: {model_id}")
                return False
            
            del self.models[model_id]
            
            # Clear from cache
            if model_id in self.model_cache:
                del self.model_cache[model_id]
            
            self.save_config()
            
            logger.info(f"Removed model: {model_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to remove model: {e}")
            return False
    
    def enable_model(self, model_id: str) -> bool:
        """Enable a model"""
        try:
            if model_id not in self.models:
                logger.error(f"Model {model_id} not found")
                return False
            
            self.models[model_id].enabled = True
            self.save_config()
            
            logger.info(f"Enabled model: {model_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to enable model: {e}")
            return False
    
    def disable_model(self, model_id: str) -> bool:
        """Disable a model"""
        try:
            if model_id not in self.models:
                logger.error(f"Model {model_id} not found")
                return False
            
            # Don't disable if it's the active model
            if model_id == self.active_model:
                logger.error(f"Cannot disable active model: {model_id}")
                return False
            
            self.models[model_id].enabled = False
            self.save_config()
            
            logger.info(f"Disabled model: {model_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to disable model: {e}")
            return False
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about all models"""
        return {
            "active_model": self.active_model,
            "models": {
                model_id: {
                    "name": model.name,
                    "version": model.version,
                    "type": model.type,
                    "enabled": model.enabled,
                    "priority": model.priority,
                    "metadata": model.metadata
                }
                for model_id, model in self.models.items()
            },
            "total_models": len(self.models),
            "enabled_models": len(self.get_enabled_models()),
            "config_path": str(self.config_path)
        }
    
    async def health_check(self) -> bool:
        """Check if model loader is healthy"""
        try:
            # Check if active model exists and is enabled
            active_model = self.get_active_model()
            if not active_model:
                logger.error("No active model found")
                return False
            
            if not active_model.enabled:
                logger.error("Active model is disabled")
                return False
            
            # Check if model file exists for local models
            if active_model.type == "local" and active_model.path:
                if not Path(active_model.path).exists():
                    logger.error(f"Model file not found: {active_model.path}")
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"Model loader health check failed: {e}")
            return False

# Global model loader instance
model_loader = ModelLoader() 