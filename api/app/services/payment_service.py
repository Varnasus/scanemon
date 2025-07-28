"""
Stripe payment service for subscription management
"""

import os
import json
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import logging

try:
    import stripe
    STRIPE_AVAILABLE = True
except ImportError:
    STRIPE_AVAILABLE = False
    logging.warning("Stripe not available - using mock payments")

logger = logging.getLogger(__name__)

class PaymentService:
    """Stripe payment service for subscription management"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("STRIPE_SECRET_KEY")
        self.stripe = None
        
        if STRIPE_AVAILABLE and self.api_key:
            try:
                stripe.api_key = self.api_key
                self.stripe = stripe
                logger.info("Stripe payment service initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Stripe: {e}")
                self.stripe = None
        else:
            logger.warning("Stripe not configured - using mock payments")
    
    def create_customer(self, user_id: int, email: str, name: str) -> Dict[str, Any]:
        """Create a Stripe customer"""
        try:
            if not self.stripe:
                return self._mock_create_customer(user_id, email, name)
            
            customer = self.stripe.Customer.create(
                email=email,
                name=name,
                metadata={
                    "user_id": str(user_id),
                    "created_at": datetime.utcnow().isoformat()
                }
            )
            
            logger.info(f"Created Stripe customer: {customer.id} for user {user_id}")
            
            return {
                "customer_id": customer.id,
                "user_id": user_id,
                "email": email,
                "name": name,
                "created_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to create customer: {e}")
            return {"error": str(e)}
    
    def create_subscription(self, customer_id: str, price_id: str) -> Dict[str, Any]:
        """Create a subscription for a customer"""
        try:
            if not self.stripe:
                return self._mock_create_subscription(customer_id, price_id)
            
            subscription = self.stripe.Subscription.create(
                customer=customer_id,
                items=[{"price": price_id}],
                payment_behavior="default_incomplete",
                expand=["latest_invoice.payment_intent"]
            )
            
            logger.info(f"Created subscription: {subscription.id} for customer {customer_id}")
            
            return {
                "subscription_id": subscription.id,
                "customer_id": customer_id,
                "status": subscription.status,
                "current_period_start": datetime.fromtimestamp(subscription.current_period_start).isoformat(),
                "current_period_end": datetime.fromtimestamp(subscription.current_period_end).isoformat(),
                "created_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to create subscription: {e}")
            return {"error": str(e)}
    
    def cancel_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """Cancel a subscription"""
        try:
            if not self.stripe:
                return self._mock_cancel_subscription(subscription_id)
            
            subscription = self.stripe.Subscription.modify(
                subscription_id,
                cancel_at_period_end=True
            )
            
            logger.info(f"Cancelled subscription: {subscription_id}")
            
            return {
                "subscription_id": subscription_id,
                "status": subscription.status,
                "cancel_at_period_end": subscription.cancel_at_period_end,
                "cancelled_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to cancel subscription: {e}")
            return {"error": str(e)}
    
    def get_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """Get subscription details"""
        try:
            if not self.stripe:
                return self._mock_get_subscription(subscription_id)
            
            subscription = self.stripe.Subscription.retrieve(subscription_id)
            
            return {
                "subscription_id": subscription.id,
                "customer_id": subscription.customer,
                "status": subscription.status,
                "current_period_start": datetime.fromtimestamp(subscription.current_period_start).isoformat(),
                "current_period_end": datetime.fromtimestamp(subscription.current_period_end).isoformat(),
                "cancel_at_period_end": subscription.cancel_at_period_end,
                "items": [
                    {
                        "price_id": item.price.id,
                        "quantity": item.quantity
                    }
                    for item in subscription.items.data
                ]
            }
            
        except Exception as e:
            logger.error(f"Failed to get subscription: {e}")
            return {"error": str(e)}
    
    def create_payment_intent(self, amount: int, currency: str = "usd", 
                            customer_id: Optional[str] = None) -> Dict[str, Any]:
        """Create a payment intent for one-time payments"""
        try:
            if not self.stripe:
                return self._mock_create_payment_intent(amount, currency)
            
            payment_intent = self.stripe.PaymentIntent.create(
                amount=amount,
                currency=currency,
                customer=customer_id,
                automatic_payment_methods={"enabled": True}
            )
            
            logger.info(f"Created payment intent: {payment_intent.id}")
            
            return {
                "payment_intent_id": payment_intent.id,
                "client_secret": payment_intent.client_secret,
                "amount": amount,
                "currency": currency,
                "status": payment_intent.status
            }
            
        except Exception as e:
            logger.error(f"Failed to create payment intent: {e}")
            return {"error": str(e)}
    
    def get_prices(self) -> Dict[str, Any]:
        """Get available subscription prices"""
        try:
            if not self.stripe:
                return self._mock_get_prices()
            
            prices = self.stripe.Price.list(active=True, expand=["data.product"])
            
            price_list = []
            for price in prices.data:
                price_list.append({
                    "price_id": price.id,
                    "product_id": price.product.id,
                    "nickname": price.nickname,
                    "unit_amount": price.unit_amount,
                    "currency": price.currency,
                    "recurring": {
                        "interval": price.recurring.interval,
                        "interval_count": price.recurring.interval_count
                    } if price.recurring else None,
                    "product": {
                        "name": price.product.name,
                        "description": price.product.description
                    }
                })
            
            return {"prices": price_list}
            
        except Exception as e:
            logger.error(f"Failed to get prices: {e}")
            return {"error": str(e)}
    
    def create_checkout_session(self, price_id: str, customer_id: str, 
                              success_url: str, cancel_url: str) -> Dict[str, Any]:
        """Create a checkout session for subscription"""
        try:
            if not self.stripe:
                return self._mock_create_checkout_session(price_id, customer_id)
            
            session = self.stripe.checkout.Session.create(
                customer=customer_id,
                payment_method_types=["card"],
                line_items=[{"price": price_id, "quantity": 1}],
                mode="subscription",
                success_url=success_url,
                cancel_url=cancel_url
            )
            
            logger.info(f"Created checkout session: {session.id}")
            
            return {
                "session_id": session.id,
                "url": session.url,
                "customer_id": customer_id,
                "price_id": price_id
            }
            
        except Exception as e:
            logger.error(f"Failed to create checkout session: {e}")
            return {"error": str(e)}
    
    def handle_webhook(self, payload: str, sig_header: str) -> Dict[str, Any]:
        """Handle Stripe webhook events"""
        try:
            if not self.stripe:
                return self._mock_handle_webhook(payload)
            
            endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
            
            try:
                event = self.stripe.Webhook.construct_event(
                    payload, sig_header, endpoint_secret
                )
            except ValueError as e:
                logger.error(f"Invalid payload: {e}")
                return {"error": "Invalid payload"}
            except stripe.error.SignatureVerificationError as e:
                logger.error(f"Invalid signature: {e}")
                return {"error": "Invalid signature"}
            
            # Handle the event
            if event.type == "customer.subscription.created":
                return self._handle_subscription_created(event.data.object)
            elif event.type == "customer.subscription.updated":
                return self._handle_subscription_updated(event.data.object)
            elif event.type == "customer.subscription.deleted":
                return self._handle_subscription_deleted(event.data.object)
            elif event.type == "invoice.payment_succeeded":
                return self._handle_payment_succeeded(event.data.object)
            elif event.type == "invoice.payment_failed":
                return self._handle_payment_failed(event.data.object)
            else:
                logger.info(f"Unhandled event type: {event.type}")
                return {"status": "unhandled", "event_type": event.type}
                
        except Exception as e:
            logger.error(f"Failed to handle webhook: {e}")
            return {"error": str(e)}
    
    def _handle_subscription_created(self, subscription) -> Dict[str, Any]:
        """Handle subscription created event"""
        logger.info(f"Subscription created: {subscription.id}")
        return {"status": "subscription_created", "subscription_id": subscription.id}
    
    def _handle_subscription_updated(self, subscription) -> Dict[str, Any]:
        """Handle subscription updated event"""
        logger.info(f"Subscription updated: {subscription.id}")
        return {"status": "subscription_updated", "subscription_id": subscription.id}
    
    def _handle_subscription_deleted(self, subscription) -> Dict[str, Any]:
        """Handle subscription deleted event"""
        logger.info(f"Subscription deleted: {subscription.id}")
        return {"status": "subscription_deleted", "subscription_id": subscription.id}
    
    def _handle_payment_succeeded(self, invoice) -> Dict[str, Any]:
        """Handle payment succeeded event"""
        logger.info(f"Payment succeeded: {invoice.id}")
        return {"status": "payment_succeeded", "invoice_id": invoice.id}
    
    def _handle_payment_failed(self, invoice) -> Dict[str, Any]:
        """Handle payment failed event"""
        logger.warning(f"Payment failed: {invoice.id}")
        return {"status": "payment_failed", "invoice_id": invoice.id}
    
    # Mock methods for development/testing
    def _mock_create_customer(self, user_id: int, email: str, name: str) -> Dict[str, Any]:
        """Mock customer creation"""
        return {
            "customer_id": f"cus_mock_{user_id}",
            "user_id": user_id,
            "email": email,
            "name": name,
            "created_at": datetime.utcnow().isoformat()
        }
    
    def _mock_create_subscription(self, customer_id: str, price_id: str) -> Dict[str, Any]:
        """Mock subscription creation"""
        return {
            "subscription_id": f"sub_mock_{customer_id}",
            "customer_id": customer_id,
            "status": "active",
            "current_period_start": datetime.utcnow().isoformat(),
            "current_period_end": (datetime.utcnow() + timedelta(days=30)).isoformat(),
            "created_at": datetime.utcnow().isoformat()
        }
    
    def _mock_cancel_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """Mock subscription cancellation"""
        return {
            "subscription_id": subscription_id,
            "status": "canceled",
            "cancel_at_period_end": True,
            "cancelled_at": datetime.utcnow().isoformat()
        }
    
    def _mock_get_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """Mock subscription retrieval"""
        return {
            "subscription_id": subscription_id,
            "customer_id": "cus_mock_1",
            "status": "active",
            "current_period_start": datetime.utcnow().isoformat(),
            "current_period_end": (datetime.utcnow() + timedelta(days=30)).isoformat(),
            "cancel_at_period_end": False,
            "items": [{"price_id": "price_basic", "quantity": 1}]
        }
    
    def _mock_create_payment_intent(self, amount: int, currency: str) -> Dict[str, Any]:
        """Mock payment intent creation"""
        return {
            "payment_intent_id": f"pi_mock_{amount}",
            "client_secret": f"pi_mock_{amount}_secret",
            "amount": amount,
            "currency": currency,
            "status": "requires_payment_method"
        }
    
    def _mock_get_prices(self) -> Dict[str, Any]:
        """Mock price list"""
        return {
            "prices": [
                {
                    "price_id": "price_basic",
                    "product_id": "prod_basic",
                    "nickname": "Basic Plan",
                    "unit_amount": 999,
                    "currency": "usd",
                    "recurring": {"interval": "month", "interval_count": 1},
                    "product": {
                        "name": "Basic Plan",
                        "description": "Perfect for casual collectors"
                    }
                },
                {
                    "price_id": "price_premium",
                    "product_id": "prod_premium",
                    "nickname": "Premium Plan",
                    "unit_amount": 1999,
                    "currency": "usd",
                    "recurring": {"interval": "month", "interval_count": 1},
                    "product": {
                        "name": "Premium Plan",
                        "description": "For serious collectors"
                    }
                }
            ]
        }
    
    def _mock_create_checkout_session(self, price_id: str, customer_id: str) -> Dict[str, Any]:
        """Mock checkout session creation"""
        return {
            "session_id": f"cs_mock_{customer_id}",
            "url": "https://checkout.stripe.com/mock",
            "customer_id": customer_id,
            "price_id": price_id
        }
    
    def _mock_handle_webhook(self, payload: str) -> Dict[str, Any]:
        """Mock webhook handling"""
        return {"status": "mock_webhook_handled"}

# Global payment service instance
payment_service = PaymentService()

# Convenience functions
def create_customer(user_id: int, email: str, name: str) -> Dict[str, Any]:
    """Create a Stripe customer"""
    return payment_service.create_customer(user_id, email, name)

def create_subscription(customer_id: str, price_id: str) -> Dict[str, Any]:
    """Create a subscription"""
    return payment_service.create_subscription(customer_id, price_id)

def cancel_subscription(subscription_id: str) -> Dict[str, Any]:
    """Cancel a subscription"""
    return payment_service.cancel_subscription(subscription_id)

def get_subscription(subscription_id: str) -> Dict[str, Any]:
    """Get subscription details"""
    return payment_service.get_subscription(subscription_id)

def get_prices() -> Dict[str, Any]:
    """Get available prices"""
    return payment_service.get_prices()

def create_checkout_session(price_id: str, customer_id: str, 
                          success_url: str, cancel_url: str) -> Dict[str, Any]:
    """Create a checkout session"""
    return payment_service.create_checkout_session(price_id, customer_id, success_url, cancel_url) 