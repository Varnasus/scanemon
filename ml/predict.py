from typing import Dict, Any
from fastapi import UploadFile
import random
from datetime import datetime

# Hardcoded test set of 10 Pokémon cards as specified in the plan
HARDCODED_CARDS = [
    {"name": "Pikachu", "set": "Base Set", "rarity": "Common", "type": "Electric", "hp": "40"},
    {"name": "Charizard", "set": "Base Set", "rarity": "Ultra Rare", "type": "Fire", "hp": "120"},
    {"name": "Mew", "set": "Promo", "rarity": "Rare", "type": "Psychic", "hp": "40"},
    {"name": "Mewtwo", "set": "Base Set", "rarity": "Rare", "type": "Psychic", "hp": "90"},
    {"name": "Bulbasaur", "set": "Base Set", "rarity": "Common", "type": "Grass", "hp": "40"},
    {"name": "Squirtle", "set": "Base Set", "rarity": "Common", "type": "Water", "hp": "40"},
    {"name": "Eevee", "set": "Jungle", "rarity": "Common", "type": "Colorless", "hp": "50"},
    {"name": "Umbreon", "set": "Neo Discovery", "rarity": "Rare", "type": "Darkness", "hp": "80"},
    {"name": "Ditto", "set": "Fossil", "rarity": "Common", "type": "Colorless", "hp": "50"},
    {"name": "Magikarp", "set": "Base Set", "rarity": "Common", "type": "Water", "hp": "30"}
]

def predict_card(file: UploadFile) -> Dict[str, Any]:
    """
    Fake model: always returns Pikachu with 420% confidence for now.
    Returns structured card data with all metadata for filtering.
    """
    import time
    start_time = time.time()
    
    # For MVP: Always return Pikachu with 420% confidence
    # TODO: Replace with real hosted CLIP model later
    card = {"name": "Pikachu", "set": "Base Set", "rarity": "Common", "type": "Electric", "hp": "40"}
    confidence = 4.20  # 420% confidence as specified
    
    # Calculate processing time
    processing_time_ms = int((time.time() - start_time) * 1000)
    
    # Get file metadata
    file_size = getattr(file, 'size', None)
    file_type = file.content_type.split('/')[-1] if file.content_type else None
    
    return {
        "name": card["name"],
        "set": card["set"],
        "rarity": card["rarity"],
        "type": card["type"],
        "hp": card["hp"],
        "confidence": confidence,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "model_version": "fake_v1.2.0",  # Enhanced version tracking
        "filename": file.filename if file.filename else "unknown.jpg",
        "file_size": file_size,
        "file_type": file_type,
        "scan_method": "image",
        "processing_time_ms": processing_time_ms,
        "model_metadata": {
            "model_type": "fake_classifier",
            "model_family": "pokemon_card_detector",
            "training_data_version": "v1.0",
            "last_updated": "2024-01-01T00:00:00Z"
        }
    }

def get_all_cards() -> list:
    """Get the complete list of hardcoded cards for reference"""
    return HARDCODED_CARDS.copy()

def get_card_by_name(name: str) -> Dict[str, Any]:
    """Get a specific card by name"""
    for card in HARDCODED_CARDS:
        if card["name"].lower() == name.lower():
            return card.copy()
    return None 