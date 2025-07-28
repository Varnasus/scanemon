"""
Collection model for Scanémon
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class Collection(Base):
    """Collection model for organizing cards into custom collections/binders"""
    
    __tablename__ = "collections"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    
    # Collection settings
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_public = Column(Boolean, default=False)
    is_default = Column(Boolean, default=False)
    color_theme = Column(String(20), default="blue")
    
    # Collection stats
    total_cards = Column(Integer, default=0)
    total_value = Column(Integer, default=0)  # In cents
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="collections")
    collection_cards = relationship("CollectionCard", back_populates="collection", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Collection(id={self.id}, name='{self.name}', owner_id={self.owner_id})>"
    
    def update_stats(self):
        """Update collection statistics"""
        self.total_cards = sum(cc.quantity for cc in self.collection_cards)
        # TODO: Calculate total value when pricing is implemented
        self.total_value = 0
    
    def to_dict(self) -> dict:
        """Convert collection to dictionary for API responses"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "owner_id": self.owner_id,
            "is_public": self.is_public,
            "is_default": self.is_default,
            "color_theme": self.color_theme,
            "total_cards": self.total_cards,
            "total_value": self.total_value,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }


class CollectionCard(Base):
    """Junction table for cards in collections"""
    
    __tablename__ = "collection_cards"
    
    id = Column(Integer, primary_key=True, index=True)
    collection_id = Column(Integer, ForeignKey("collections.id"), nullable=False)
    card_id = Column(Integer, ForeignKey("cards.id"), nullable=False)
    quantity = Column(Integer, default=1)
    added_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    collection = relationship("Collection", back_populates="collection_cards")
    card = relationship("Card", back_populates="collection_cards")
    
    def __repr__(self):
        return f"<CollectionCard(collection_id={self.collection_id}, card_id={self.card_id}, quantity={self.quantity})>" 