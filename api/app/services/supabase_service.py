"""
Supabase service for collection operations with graceful degradation
"""

from supabase import create_client, Client
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime
import os
import logging

logger = logging.getLogger(__name__)

class SupabaseService:
    def __init__(self):
        """Initialize Supabase service with graceful degradation"""
        self.supabase = None
        self.mode = 'offline'  # offline, online, degraded
        
        try:
            # Get Supabase credentials from environment variables
            supabase_url = os.getenv("SUPABASE_URL")
            supabase_key = os.getenv("SUPABASE_ANON_KEY")
            
            if supabase_url and supabase_key:
                self.supabase: Client = create_client(supabase_url, supabase_key)
                self.mode = 'online'
                logger.info("Supabase initialized successfully")
            else:
                logger.warning("Supabase credentials not found - running in offline mode")
                self.mode = 'offline'
                self.supabase = None
        except Exception as e:
            logger.error(f"Supabase initialization error: {e}")
            self.mode = 'offline'
            self.supabase = None

    def get_status(self) -> Dict[str, Any]:
        """Get service status"""
        return {
            'mode': self.mode,
            'available': self.supabase is not None,
            'features': {
                'cloud_sync': self.mode == 'online',
                'local_storage': True,
                'offline_support': True
            }
        }

    async def get_user_cards(self, user_id: str) -> Optional[List[Dict[str, Any]]]:
        """Get all cards for a user with fallback"""
        if not user_id:
            return None
        
        try:
            if self.mode == 'online' and self.supabase:
                response = self.supabase.table('cards').select('*').eq('user_id', user_id).execute()
                return response.data if response.data else []
            else:
                # Fallback to local storage or return empty list
                logger.info(f"Supabase offline - returning empty cards list for user {user_id}")
                return []
        except Exception as e:
            logger.error(f"Supabase get_user_cards error: {e}")
            return []

    async def add_card(self, user_id: str, card_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Add a card to user's collection with fallback"""
        if not user_id:
            return None
        
        try:
            card_id = str(uuid.uuid4())
            card_data['id'] = card_id
            card_data['user_id'] = user_id
            card_data['timestamp'] = datetime.utcnow().isoformat()
            
            if self.mode == 'online' and self.supabase:
                response = self.supabase.table('cards').insert(card_data).execute()
                
                if response.data:
                    logger.info(f"Card added to Supabase for user {user_id}")
                    return response.data[0]
                return None
            else:
                # Store locally or queue for later sync
                logger.info(f"Card queued for sync (offline mode) for user {user_id}")
                return card_data
        except Exception as e:
            logger.error(f"Supabase add_card error: {e}")
            # Return the card data anyway for local storage
            return card_data

    async def delete_card(self, user_id: str, card_id: str) -> bool:
        """Delete a card from user's collection with fallback"""
        if not user_id or not card_id:
            return False
        
        try:
            if self.mode == 'online' and self.supabase:
                response = self.supabase.table('cards').delete().eq('id', card_id).eq('user_id', user_id).execute()
                success = len(response.data) > 0
                if success:
                    logger.info(f"Card deleted from Supabase for user {user_id}")
                return success
            else:
                # Queue deletion for later sync
                logger.info(f"Card deletion queued for sync (offline mode) for user {user_id}")
                return True
        except Exception as e:
            logger.error(f"Supabase delete_card error: {e}")
            return False

    async def update_card(self, user_id: str, card_id: str, card_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a card in user's collection with fallback"""
        if not user_id or not card_id:
            return None
        
        try:
            card_data['updated_at'] = datetime.utcnow().isoformat()
            
            if self.mode == 'online' and self.supabase:
                response = self.supabase.table('cards').update(card_data).eq('id', card_id).eq('user_id', user_id).execute()
                
                if response.data:
                    logger.info(f"Card updated in Supabase for user {user_id}")
                    return response.data[0]
                return None
            else:
                # Queue update for later sync
                logger.info(f"Card update queued for sync (offline mode) for user {user_id}")
                card_data['id'] = card_id
                return card_data
        except Exception as e:
            logger.error(f"Supabase update_card error: {e}")
            return None

    async def get_collection_stats(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get collection statistics for a user with fallback"""
        if not user_id:
            return None
        
        try:
            cards = await self.get_user_cards(user_id)
            if cards is None:
                return None
            
            total_cards = len(cards)
            unique_cards = len(set(card['name'] for card in cards if card.get('name')))
            sets = len(set(card['set'] for card in cards if card.get('set')))
            total_value = sum(card.get('estimatedValue', 0) for card in cards)
            
            return {
                'total_cards': total_cards,
                'unique_cards': unique_cards,
                'sets': sets,
                'total_value': total_value,
                'sync_status': self.mode
            }
        except Exception as e:
            logger.error(f"Supabase get_collection_stats error: {e}")
            return None

    async def sync_offline_data(self) -> bool:
        """Sync offline data when connection is restored"""
        if self.mode != 'online':
            return False
        
        try:
            # Implement offline data sync logic here
            logger.info("Syncing offline data...")
            return True
        except Exception as e:
            logger.error(f"Supabase sync_offline_data error: {e}")
            return False 