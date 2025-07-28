"""
Card model for Scanémon
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class Card(Base):
    """Card model for storing scanned Pokémon card information"""
    
    __tablename__ = "cards"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Card identification
    pokemon_tcg_id = Column(String(100), unique=True, index=True, nullable=True)
    name = Column(String(200), nullable=False, index=True)
    set_name = Column(String(200), nullable=True, index=True)
    set_code = Column(String(50), nullable=True, index=True)
    number = Column(String(20), nullable=True)
    rarity = Column(String(50), nullable=True)
    
    # Card details
    card_type = Column(String(50), nullable=True)  # Pokemon, Trainer, Energy
    hp = Column(Integer, nullable=True)
    types = Column(Text, nullable=True)  # JSON array of types
    attacks = Column(Text, nullable=True)  # JSON array of attacks
    abilities = Column(Text, nullable=True)  # JSON array of abilities
    weaknesses = Column(Text, nullable=True)  # JSON array
    resistances = Column(Text, nullable=True)  # JSON array
    retreat_cost = Column(Integer, nullable=True)
    
    # Images
    image_url = Column(String(500), nullable=True)
    image_url_hi_res = Column(String(500), nullable=True)
    local_image_path = Column(String(500), nullable=True)
    
    # User collection data
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quantity = Column(Integer, default=1)
    condition = Column(String(20), default="NM")  # NM, LP, MP, HP, DMG
    is_foil = Column(Boolean, default=False)
    is_reverse_holo = Column(Boolean, default=False)
    is_first_edition = Column(Boolean, default=False)
    
    # Scanning data
    scan_confidence = Column(Float, nullable=True)
    scan_method = Column(String(20), nullable=True)  # image, video, manual
    scan_date = Column(DateTime, default=datetime.utcnow)
    
    # User notes
    notes = Column(Text, nullable=True)
    is_wishlist = Column(Boolean, default=False)
    is_favorite = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="cards")
    collection_cards = relationship("CollectionCard", back_populates="card")
    
    def __repr__(self):
        return f"<Card(id={self.id}, name='{self.name}', set='{self.set_name}')>"
    
    @property
    def display_name(self) -> str:
        """Get display name with set info"""
        if self.set_name and self.number:
            return f"{self.name} ({self.set_name} #{self.number})"
        elif self.set_name:
            return f"{self.name} ({self.set_name})"
        return self.name
    
    @property
    def rarity_color(self) -> str:
        """Get CSS color class for rarity"""
        rarity_colors = {
            "Common": "text-gray-600",
            "Uncommon": "text-green-600", 
            "Rare": "text-blue-600",
            "Rare Holo": "text-purple-600",
            "Rare Ultra": "text-yellow-600",
            "Secret Rare": "text-red-600",
            "Legend": "text-orange-600",
            "Promo": "text-pink-600"
        }
        return rarity_colors.get(self.rarity, "text-gray-600")
    
    @property
    def condition_color(self) -> str:
        """Get CSS color class for condition"""
        condition_colors = {
            "NM": "text-green-600",  # Near Mint
            "LP": "text-blue-600",   # Lightly Played
            "MP": "text-yellow-600", # Moderately Played
            "HP": "text-orange-600", # Heavily Played
            "DMG": "text-red-600"    # Damaged
        }
        return condition_colors.get(self.condition, "text-gray-600")
    
    def to_dict(self) -> dict:
        """Convert card to dictionary for API responses"""
        return {
            "id": self.id,
            "pokemon_tcg_id": self.pokemon_tcg_id,
            "name": self.name,
            "set_name": self.set_name,
            "set_code": self.set_code,
            "number": self.number,
            "rarity": self.rarity,
            "card_type": self.card_type,
            "hp": self.hp,
            "types": self.types,
            "attacks": self.attacks,
            "abilities": self.abilities,
            "weaknesses": self.weaknesses,
            "resistances": self.resistances,
            "retreat_cost": self.retreat_cost,
            "image_url": self.image_url,
            "image_url_hi_res": self.image_url_hi_res,
            "quantity": self.quantity,
            "condition": self.condition,
            "is_foil": self.is_foil,
            "is_reverse_holo": self.is_reverse_holo,
            "is_first_edition": self.is_first_edition,
            "scan_confidence": self.scan_confidence,
            "scan_method": self.scan_method,
            "scan_date": self.scan_date.isoformat() if self.scan_date else None,
            "notes": self.notes,
            "is_wishlist": self.is_wishlist,
            "is_favorite": self.is_favorite,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "display_name": self.display_name,
            "rarity_color": self.rarity_color,
            "condition_color": self.condition_color
        } 