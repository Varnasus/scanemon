"""
Supabase service for collection operations
"""

from supabase import create_client, Client
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime
import os

class SupabaseService:
    def __init__(self):
        """Initialize Supabase service"""
        try:
            # Get Supabase credentials from environment variables
            supabase_url = os.getenv("SUPABASE_URL")
            supabase_key = os.getenv("SUPABASE_ANON_KEY")
            
            if supabase_url and supabase_key:
                self.supabase: Client = create_client(supabase_url, supabase_key)
            else:
                print("Supabase credentials not found in environment variables")
                self.supabase = None
        except Exception as e:
            print(f"Supabase initialization error: {e}")
            self.supabase = None

    async def get_user_cards(self, user_id: str) -> Optional[List[Dict[str, Any]]]:
        """Get all cards for a user"""
        if not self.supabase or not user_id:
            return None
        
        try:
            response = self.supabase.table('cards').select('*').eq('user_id', user_id).execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Supabase get_user_cards error: {e}")
            return None

    async def add_card(self, user_id: str, card_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Add a card to user's collection"""
        if not self.supabase or not user_id:
            return None
        
        try:
            card_id = str(uuid.uuid4())
            card_data['id'] = card_id
            card_data['user_id'] = user_id
            
            response = self.supabase.table('cards').insert(card_data).execute()
            
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Supabase add_card error: {e}")
            return None

    async def delete_card(self, user_id: str, card_id: str) -> bool:
        """Delete a card from user's collection"""
        if not self.supabase or not user_id or not card_id:
            return False
        
        try:
            response = self.supabase.table('cards').delete().eq('id', card_id).eq('user_id', user_id).execute()
            return len(response.data) > 0
        except Exception as e:
            print(f"Supabase delete_card error: {e}")
            return False

    async def update_card(self, user_id: str, card_id: str, card_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a card in user's collection"""
        if not self.supabase or not user_id or not card_id:
            return None
        
        try:
            response = self.supabase.table('cards').update(card_data).eq('id', card_id).eq('user_id', user_id).execute()
            
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Supabase update_card error: {e}")
            return None

    async def get_collection_stats(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get collection statistics for a user"""
        if not self.supabase or not user_id:
            return None
        
        try:
            # Get all cards for the user
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
            print(f"Supabase get_collection_stats error: {e}")
            return None 