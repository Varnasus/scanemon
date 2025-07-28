"""
Collection schemas for Scanémon API
"""

from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class CardBase(BaseModel):
    name: str
    set: str
    number: str
    rarity: str
    type: str
    hp: str
    image: str
    estimatedValue: float
    condition: Optional[str] = None
    notes: Optional[str] = None

class CardCreate(CardBase):
    """Schema for creating a new card"""
    pass

class CardUpdate(BaseModel):
    """Schema for updating a card"""
    name: Optional[str] = None
    set: Optional[str] = None
    number: Optional[str] = None
    rarity: Optional[str] = None
    type: Optional[str] = None
    hp: Optional[str] = None
    image: Optional[str] = None
    estimatedValue: Optional[float] = None
    condition: Optional[str] = None
    notes: Optional[str] = None

class CardResponse(CardBase):
    """Schema for card response"""
    id: str
    dateAdded: str
    
    class Config:
        from_attributes = True

class CollectionStats(BaseModel):
    """Schema for collection statistics"""
    total_cards: int
    unique_cards: int
    sets: int
    total_value: float 