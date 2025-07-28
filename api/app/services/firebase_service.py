"""
Firebase service for collection operations
"""

import firebase_admin
from firebase_admin import credentials, firestore
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime

class FirebaseService:
    def __init__(self):
        """Initialize Firebase service"""
        try:
            # Initialize Firebase if not already initialized
            if not firebase_admin._apps:
                # You'll need to set up your Firebase credentials
                # cred = credentials.Certificate("path/to/serviceAccountKey.json")
                # firebase_admin.initialize_app(cred)
                pass
            
            self.db = firestore.client()
        except Exception as e:
            print(f"Firebase initialization error: {e}")
            self.db = None

    async def get_user_cards(self, user_id: str) -> Optional[List[Dict[str, Any]]]:
        """Get all cards for a user"""
        if not self.db or not user_id:
            return None
        
        try:
            cards_ref = self.db.collection('users').document(user_id).collection('cards')
            docs = cards_ref.stream()
            
            cards = []
            for doc in docs:
                card_data = doc.to_dict()
                card_data['id'] = doc.id
                cards.append(card_data)
            
            return cards
        except Exception as e:
            print(f"Firebase get_user_cards error: {e}")
            return None

    async def add_card(self, user_id: str, card_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Add a card to user's collection"""
        if not self.db or not user_id:
            return None
        
        try:
            card_id = str(uuid.uuid4())
            card_data['id'] = card_id
            
            cards_ref = self.db.collection('users').document(user_id).collection('cards')
            cards_ref.document(card_id).set(card_data)
            
            return card_data
        except Exception as e:
            print(f"Firebase add_card error: {e}")
            return None

    async def delete_card(self, user_id: str, card_id: str) -> bool:
        """Delete a card from user's collection"""
        if not self.db or not user_id or not card_id:
            return False
        
        try:
            cards_ref = self.db.collection('users').document(user_id).collection('cards')
            cards_ref.document(card_id).delete()
            return True
        except Exception as e:
            print(f"Firebase delete_card error: {e}")
            return False

    async def update_card(self, user_id: str, card_id: str, card_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a card in user's collection"""
        if not self.db or not user_id or not card_id:
            return None
        
        try:
            cards_ref = self.db.collection('users').document(user_id).collection('cards')
            doc_ref = cards_ref.document(card_id)
            
            # Get existing card data
            doc = doc_ref.get()
            if not doc.exists:
                return None
            
            # Update with new data
            doc_ref.update(card_data)
            
            # Return updated card
            updated_doc = doc_ref.get()
            updated_data = updated_doc.to_dict()
            updated_data['id'] = card_id
            
            return updated_data
        except Exception as e:
            print(f"Firebase update_card error: {e}")
            return None

    async def get_collection_stats(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get collection statistics for a user"""
        if not self.db or not user_id:
            return None
        
        try:
            cards = await self.get_user_cards(user_id)
            if cards is None:
                return None
            
            total_cards = len(cards)
            unique_cards = len(set(card['name'] for card in cards))
            sets = len(set(card['set'] for card in cards if card.get('set')))
            total_value = sum(card.get('estimatedValue', 0) for card in cards)
            
            return {
                "total_cards": total_cards,
                "unique_cards": unique_cards,
                "sets": sets,
                "total_value": total_value
            }
        except Exception as e:
            print(f"Firebase get_collection_stats error: {e}")
            return None 