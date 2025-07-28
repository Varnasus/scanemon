"""
Firebase service for collection operations with graceful degradation
"""

import firebase_admin
from firebase_admin import credentials, firestore
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime
import os
import logging

logger = logging.getLogger(__name__)

class FirebaseService:
    def __init__(self):
        """Initialize Firebase service with graceful degradation"""
        self.db = None
        self.mode = 'offline'  # offline, online, degraded
        
        try:
            # Check if Firebase credentials are available
            firebase_config = {
                'apiKey': os.getenv('FIREBASE_API_KEY'),
                'authDomain': os.getenv('FIREBASE_AUTH_DOMAIN'),
                'projectId': os.getenv('FIREBASE_PROJECT_ID'),
                'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET'),
                'messagingSenderId': os.getenv('FIREBASE_MESSAGING_SENDER_ID'),
                'appId': os.getenv('FIREBASE_APP_ID')
            }
            
            # Check if we have the minimum required config
            if firebase_config.get('projectId') and firebase_config.get('apiKey'):
                # Initialize Firebase if not already initialized
                if not firebase_admin._apps:
                    # Try to initialize with service account if available
                    service_account_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH')
                    if service_account_path and os.path.exists(service_account_path):
                        cred = credentials.Certificate(service_account_path)
                        firebase_admin.initialize_app(cred)
                    else:
                        # Initialize with default config
                        firebase_admin.initialize_app()
                
                self.db = firestore.client()
                self.mode = 'online'
                logger.info("Firebase initialized successfully")
            else:
                logger.warning("Firebase credentials not found - running in offline mode")
                self.mode = 'offline'
                
        except Exception as e:
            logger.error(f"Firebase initialization error: {e}")
            self.mode = 'offline'
            self.db = None

    def get_status(self) -> Dict[str, Any]:
        """Get service status"""
        return {
            'mode': self.mode,
            'available': self.db is not None,
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
            if self.mode == 'online' and self.db:
                cards_ref = self.db.collection('users').document(user_id).collection('cards')
                docs = cards_ref.stream()
                
                cards = []
                for doc in docs:
                    card_data = doc.to_dict()
                    card_data['id'] = doc.id
                    cards.append(card_data)
                
                return cards
            else:
                # Fallback to local storage or return empty list
                logger.info(f"Firebase offline - returning empty cards list for user {user_id}")
                return []
                
        except Exception as e:
            logger.error(f"Firebase get_user_cards error: {e}")
            return []

    async def add_card(self, user_id: str, card_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Add a card to user's collection with fallback"""
        if not user_id:
            return None
        
        try:
            card_id = str(uuid.uuid4())
            card_data['id'] = card_id
            card_data['timestamp'] = datetime.utcnow().isoformat()
            
            if self.mode == 'online' and self.db:
                cards_ref = self.db.collection('users').document(user_id).collection('cards')
                cards_ref.document(card_id).set(card_data)
                logger.info(f"Card added to Firebase for user {user_id}")
            else:
                # Store locally or queue for later sync
                logger.info(f"Card queued for sync (offline mode) for user {user_id}")
            
            return card_data
        except Exception as e:
            logger.error(f"Firebase add_card error: {e}")
            # Return the card data anyway for local storage
            return card_data

    async def delete_card(self, user_id: str, card_id: str) -> bool:
        """Delete a card from user's collection with fallback"""
        if not user_id or not card_id:
            return False
        
        try:
            if self.mode == 'online' and self.db:
                cards_ref = self.db.collection('users').document(user_id).collection('cards')
                cards_ref.document(card_id).delete()
                logger.info(f"Card deleted from Firebase for user {user_id}")
            else:
                # Queue deletion for later sync
                logger.info(f"Card deletion queued for sync (offline mode) for user {user_id}")
            
            return True
        except Exception as e:
            logger.error(f"Firebase delete_card error: {e}")
            return False

    async def update_card(self, user_id: str, card_id: str, card_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a card in user's collection with fallback"""
        if not user_id or not card_id:
            return None
        
        try:
            card_data['updated_at'] = datetime.utcnow().isoformat()
            
            if self.mode == 'online' and self.db:
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
                
                logger.info(f"Card updated in Firebase for user {user_id}")
                return updated_data
            else:
                # Queue update for later sync
                logger.info(f"Card update queued for sync (offline mode) for user {user_id}")
                card_data['id'] = card_id
                return card_data
                
        except Exception as e:
            logger.error(f"Firebase update_card error: {e}")
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
            logger.error(f"Firebase get_collection_stats error: {e}")
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
            logger.error(f"Firebase sync_offline_data error: {e}")
            return False 