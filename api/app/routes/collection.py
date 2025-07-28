"""
Collection routes for Scanémon API
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from app.core.database import get_db
from app.models.card import Card
from app.models.user import User
from app.schemas.collection import CardCreate, CardResponse, CardUpdate
from app.services.firebase_service import FirebaseService
from app.services.supabase_service import SupabaseService

router = APIRouter()

# Initialize Firebase and Supabase services
firebase_service = FirebaseService()
supabase_service = SupabaseService()

# In-memory storage fallback for testing
_in_memory_cards = []

@router.get("/", response_model=List[CardResponse])
async def get_collection(
    user_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all cards in the user's collection"""
    global _in_memory_cards
    try:
        # Try Supabase first, fallback to Firebase
        cards = await supabase_service.get_user_cards(user_id)
        if cards is None:
            cards = await firebase_service.get_user_cards(user_id)
        
        # If both services fail, use in-memory storage
        if cards is None:
            cards = _in_memory_cards
        
        return cards or []
    except Exception as e:
        # Fallback to in-memory storage on error
        return _in_memory_cards

@router.post("/", response_model=CardResponse)
async def add_card(
    card_data: CardCreate,
    user_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Add a card to the user's collection"""
    global _in_memory_cards
    try:
        # Add timestamp and ID
        card_data_dict = card_data.dict()
        card_data_dict["id"] = str(uuid.uuid4())
        card_data_dict["dateAdded"] = datetime.utcnow().isoformat()
        
        # Try Supabase first, fallback to Firebase
        card = await supabase_service.add_card(user_id, card_data_dict)
        if card is None:
            card = await firebase_service.add_card(user_id, card_data_dict)
        
        # If both services fail, use in-memory storage
        if card is None:
            card = card_data_dict
            _in_memory_cards.append(card)
        
        return card
    except Exception as e:
        # Fallback to in-memory storage on error
        card_data_dict = card_data.dict()
        card_data_dict["id"] = str(uuid.uuid4())
        card_data_dict["dateAdded"] = datetime.utcnow().isoformat()
        _in_memory_cards.append(card_data_dict)
        return card_data_dict

@router.delete("/{card_id}")
async def delete_card(
    card_id: str,
    user_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Delete a card from the user's collection"""
    global _in_memory_cards
    try:
        # Try Supabase first, fallback to Firebase
        success = await supabase_service.delete_card(user_id, card_id)
        if not success:
            success = await firebase_service.delete_card(user_id, card_id)
        
        # If both services fail, use in-memory storage
        if not success:
            original_length = len(_in_memory_cards)
            _in_memory_cards = [card for card in _in_memory_cards if card.get("id") != card_id]
            success = len(_in_memory_cards) < original_length
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Card not found"
            )
        
        return {"message": "Card deleted successfully"}
    except Exception as e:
        # Fallback to in-memory storage on error
        original_length = len(_in_memory_cards)
        _in_memory_cards = [card for card in _in_memory_cards if card.get("id") != card_id]
        if len(_in_memory_cards) < original_length:
            return {"message": "Card deleted successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Card not found"
            )

@router.put("/{card_id}", response_model=CardResponse)
async def update_card(
    card_id: str,
    card_data: CardUpdate,
    user_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Update a card in the user's collection"""
    global _in_memory_cards
    try:
        # Try Supabase first, fallback to Firebase
        card = await supabase_service.update_card(user_id, card_id, card_data.dict(exclude_unset=True))
        if card is None:
            card = await firebase_service.update_card(user_id, card_id, card_data.dict(exclude_unset=True))
        
        # If both services fail, use in-memory storage
        if card is None:
            for i, existing_card in enumerate(_in_memory_cards):
                if existing_card.get("id") == card_id:
                    _in_memory_cards[i].update(card_data.dict(exclude_unset=True))
                    card = _in_memory_cards[i]
                    break
        
        if card is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Card not found"
            )
        
        return card
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update card: {str(e)}"
        )

@router.get("/{card_id}", response_model=CardResponse)
async def get_card(
    card_id: str,
    user_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get a specific card from the user's collection"""
    global _in_memory_cards
    try:
        # Try Supabase first, fallback to Firebase
        card = await supabase_service.get_card(user_id, card_id)
        if card is None:
            card = await firebase_service.get_card(user_id, card_id)
        
        # If both services fail, use in-memory storage
        if card is None:
            for existing_card in _in_memory_cards:
                if existing_card.get("id") == card_id:
                    card = existing_card
                    break
        
        if card is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Card not found"
            )
        
        return card
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch card: {str(e)}"
        )

@router.get("/stats")
async def get_collection_stats(
    user_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get collection statistics"""
    try:
        # Try Supabase first, fallback to Firebase
        stats = await supabase_service.get_collection_stats(user_id)
        if stats is None:
            stats = await firebase_service.get_collection_stats(user_id)
        
        # If both services fail, calculate from in-memory storage
        if stats is None:
            total_cards = len(_in_memory_cards)
            unique_cards = len(set(card.get("name") for card in _in_memory_cards))
            sets = len(set(card.get("set") for card in _in_memory_cards if card.get("set")))
            total_value = sum(card.get("estimatedValue", 0) for card in _in_memory_cards)
            
            stats = {
                "total_cards": total_cards,
                "unique_cards": unique_cards,
                "sets": sets,
                "total_value": total_value
            }
        
        return stats
    except Exception as e:
        # Fallback to in-memory calculation on error
        total_cards = len(_in_memory_cards)
        unique_cards = len(set(card.get("name") for card in _in_memory_cards))
        sets = len(set(card.get("set") for card in _in_memory_cards if card.get("set")))
        total_value = sum(card.get("estimatedValue", 0) for card in _in_memory_cards)
        
        return {
            "total_cards": total_cards,
            "unique_cards": unique_cards,
            "sets": sets,
            "total_value": total_value
        } 