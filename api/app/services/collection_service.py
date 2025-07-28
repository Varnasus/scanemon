"""
Enhanced Collection Service with smart folders and filtering
"""

from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from datetime import datetime
import logging

from app.models.collection import Collection
from app.models.card import Card
from app.models.user import User
from app.services.cache_service import cache_service, CachePrefixes, cached

logger = logging.getLogger(__name__)

class CollectionService:
    """Enhanced collection management service"""
    
    def __init__(self, db: Session):
        self.db = db
    
    @cached(CachePrefixes.COLLECTION, ttl=1800)
    def get_user_collection(self, user_id: int, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Get user's collection with optional filters"""
        try:
            query = self.db.query(Collection).filter(Collection.user_id == user_id)
            
            if filters:
                query = self._apply_filters(query, filters)
            
            collections = query.all()
            
            # Convert to dict format
            result = []
            for collection in collections:
                result.append({
                    "id": collection.id,
                    "card_id": collection.card_id,
                    "quantity": collection.quantity,
                    "condition": collection.condition,
                    "is_holo": collection.is_holo,
                    "notes": collection.notes,
                    "added_at": collection.added_at.isoformat() if collection.added_at else None,
                    "card_info": {
                        "name": collection.card.name if collection.card else None,
                        "set": collection.card.set_name if collection.card else None,
                        "rarity": collection.card.rarity if collection.card else None,
                        "number": collection.card.number if collection.card else None
                    }
                })
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to get user collection: {e}")
            return []
    
    def _apply_filters(self, query, filters: Dict[str, Any]):
        """Apply filters to collection query"""
        if filters.get("set"):
            query = query.join(Card).filter(Card.set_name == filters["set"])
        
        if filters.get("rarity"):
            query = query.join(Card).filter(Card.rarity == filters["rarity"])
        
        if filters.get("condition"):
            query = query.filter(Collection.condition == filters["condition"])
        
        if filters.get("is_holo") is not None:
            query = query.filter(Collection.is_holo == filters["is_holo"])
        
        if filters.get("search"):
            search_term = f"%{filters['search']}%"
            query = query.join(Card).filter(
                or_(
                    Card.name.ilike(search_term),
                    Card.set_name.ilike(search_term)
                )
            )
        
        return query
    
    def add_card_to_collection(self, user_id: int, card_id: int, quantity: int = 1, 
                              condition: str = "Near Mint", is_holo: bool = False, 
                              notes: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Add card to user's collection"""
        try:
            # Check if card already exists in collection
            existing = self.db.query(Collection).filter(
                and_(Collection.user_id == user_id, Collection.card_id == card_id)
            ).first()
            
            if existing:
                # Update existing entry
                existing.quantity += quantity
                existing.condition = condition
                existing.is_holo = is_holo
                if notes:
                    existing.notes = notes
                existing.updated_at = datetime.utcnow()
            else:
                # Create new entry
                collection = Collection(
                    user_id=user_id,
                    card_id=card_id,
                    quantity=quantity,
                    condition=condition,
                    is_holo=is_holo,
                    notes=notes,
                    added_at=datetime.utcnow()
                )
                self.db.add(collection)
            
            self.db.commit()
            
            # Invalidate cache
            cache_service.invalidate_user_cache(user_id)
            
            return self.get_collection_entry(user_id, card_id)
            
        except Exception as e:
            logger.error(f"Failed to add card to collection: {e}")
            self.db.rollback()
            return None
    
    def remove_card_from_collection(self, user_id: int, card_id: int, quantity: int = 1) -> bool:
        """Remove card from user's collection"""
        try:
            collection = self.db.query(Collection).filter(
                and_(Collection.user_id == user_id, Collection.card_id == card_id)
            ).first()
            
            if not collection:
                return False
            
            if collection.quantity <= quantity:
                # Remove entire entry
                self.db.delete(collection)
            else:
                # Reduce quantity
                collection.quantity -= quantity
                collection.updated_at = datetime.utcnow()
            
            self.db.commit()
            
            # Invalidate cache
            cache_service.invalidate_user_cache(user_id)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to remove card from collection: {e}")
            self.db.rollback()
            return False
    
    def get_collection_entry(self, user_id: int, card_id: int) -> Optional[Dict[str, Any]]:
        """Get specific collection entry"""
        try:
            collection = self.db.query(Collection).filter(
                and_(Collection.user_id == user_id, Collection.card_id == card_id)
            ).first()
            
            if not collection:
                return None
            
            return {
                "id": collection.id,
                "card_id": collection.card_id,
                "quantity": collection.quantity,
                "condition": collection.condition,
                "is_holo": collection.is_holo,
                "notes": collection.notes,
                "added_at": collection.added_at.isoformat() if collection.added_at else None,
                "updated_at": collection.updated_at.isoformat() if collection.updated_at else None
            }
            
        except Exception as e:
            logger.error(f"Failed to get collection entry: {e}")
            return None
    
    def get_collection_stats(self, user_id: int) -> Dict[str, Any]:
        """Get collection statistics"""
        try:
            # Total cards
            total_cards = self.db.query(func.sum(Collection.quantity)).filter(
                Collection.user_id == user_id
            ).scalar() or 0
            
            # Unique cards
            unique_cards = self.db.query(Collection).filter(
                Collection.user_id == user_id
            ).count()
            
            # Cards by set
            sets_query = self.db.query(
                Card.set_name,
                func.sum(Collection.quantity).label('total')
            ).join(Collection).filter(
                Collection.user_id == user_id
            ).group_by(Card.set_name).all()
            
            cards_by_set = {set_name: total for set_name, total in sets_query}
            
            # Cards by rarity
            rarity_query = self.db.query(
                Card.rarity,
                func.sum(Collection.quantity).label('total')
            ).join(Collection).filter(
                Collection.user_id == user_id
            ).group_by(Card.rarity).all()
            
            cards_by_rarity = {rarity: total for rarity, total in rarity_query}
            
            # Holo cards
            holo_cards = self.db.query(func.sum(Collection.quantity)).filter(
                and_(Collection.user_id == user_id, Collection.is_holo == True)
            ).scalar() or 0
            
            return {
                "total_cards": total_cards,
                "unique_cards": unique_cards,
                "cards_by_set": cards_by_set,
                "cards_by_rarity": cards_by_rarity,
                "holo_cards": holo_cards,
                "collection_value": self._estimate_collection_value(user_id)
            }
            
        except Exception as e:
            logger.error(f"Failed to get collection stats: {e}")
            return {}
    
    def _estimate_collection_value(self, user_id: int) -> float:
        """Estimate collection value (placeholder)"""
        # This would integrate with price APIs
        return 0.0
    
    def create_smart_folder(self, user_id: int, name: str, filters: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a smart folder with filters"""
        try:
            # Get cards matching filters
            query = self.db.query(Collection).filter(Collection.user_id == user_id)
            query = self._apply_filters(query, filters)
            
            matching_cards = query.all()
            
            folder = {
                "name": name,
                "filters": filters,
                "card_count": len(matching_cards),
                "total_quantity": sum(card.quantity for card in matching_cards),
                "created_at": datetime.utcnow().isoformat()
            }
            
            # In a real implementation, you'd save this to a folders table
            logger.info(f"Created smart folder '{name}' with {len(matching_cards)} cards")
            
            return folder
            
        except Exception as e:
            logger.error(f"Failed to create smart folder: {e}")
            return None
    
    def get_smart_folders(self, user_id: int) -> List[Dict[str, Any]]:
        """Get user's smart folders"""
        # Placeholder - in real implementation, this would query a folders table
        return [
            {
                "name": "Rare Cards",
                "filters": {"rarity": "Rare"},
                "card_count": 15,
                "total_quantity": 20
            },
            {
                "name": "Holo Collection",
                "filters": {"is_holo": True},
                "card_count": 8,
                "total_quantity": 12
            },
            {
                "name": "Base Set",
                "filters": {"set": "Base Set"},
                "card_count": 25,
                "total_quantity": 35
            }
        ]
    
    def search_collection(self, user_id: int, search_term: str) -> List[Dict[str, Any]]:
        """Search collection by card name or set"""
        try:
            query = self.db.query(Collection).join(Card).filter(
                and_(
                    Collection.user_id == user_id,
                    or_(
                        Card.name.ilike(f"%{search_term}%"),
                        Card.set_name.ilike(f"%{search_term}%"),
                        Card.rarity.ilike(f"%{search_term}%")
                    )
                )
            )
            
            results = query.all()
            
            return [
                {
                    "id": collection.id,
                    "card_id": collection.card_id,
                    "quantity": collection.quantity,
                    "condition": collection.condition,
                    "is_holo": collection.is_holo,
                    "card_info": {
                        "name": collection.card.name,
                        "set": collection.card.set_name,
                        "rarity": collection.card.rarity,
                        "number": collection.card.number
                    }
                }
                for collection in results
            ]
            
        except Exception as e:
            logger.error(f"Failed to search collection: {e}")
            return []
    
    def get_collection_export(self, user_id: int) -> Dict[str, Any]:
        """Export collection data"""
        try:
            collection = self.get_user_collection(user_id)
            stats = self.get_collection_stats(user_id)
            
            return {
                "export_date": datetime.utcnow().isoformat(),
                "user_id": user_id,
                "collection": collection,
                "statistics": stats,
                "total_cards": len(collection)
            }
            
        except Exception as e:
            logger.error(f"Failed to export collection: {e}")
            return {}
    
    def bulk_update_collection(self, user_id: int, updates: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Bulk update collection entries"""
        try:
            success_count = 0
            error_count = 0
            
            for update in updates:
                card_id = update.get("card_id")
                quantity = update.get("quantity")
                condition = update.get("condition")
                is_holo = update.get("is_holo")
                notes = update.get("notes")
                
                collection = self.db.query(Collection).filter(
                    and_(Collection.user_id == user_id, Collection.card_id == card_id)
                ).first()
                
                if collection:
                    if quantity is not None:
                        collection.quantity = quantity
                    if condition is not None:
                        collection.condition = condition
                    if is_holo is not None:
                        collection.is_holo = is_holo
                    if notes is not None:
                        collection.notes = notes
                    
                    collection.updated_at = datetime.utcnow()
                    success_count += 1
                else:
                    error_count += 1
            
            self.db.commit()
            
            # Invalidate cache
            cache_service.invalidate_user_cache(user_id)
            
            return {
                "success_count": success_count,
                "error_count": error_count,
                "total_processed": len(updates)
            }
            
        except Exception as e:
            logger.error(f"Failed to bulk update collection: {e}")
            self.db.rollback()
            return {"success_count": 0, "error_count": len(updates), "total_processed": len(updates)}

# Global collection service instance
def get_collection_service(db: Session) -> CollectionService:
    """Get collection service instance"""
    return CollectionService(db) 