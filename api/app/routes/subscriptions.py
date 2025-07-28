"""
Subscription and payment API routes
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from typing import Dict, Any, List
import logging

from app.services.usage_service import usage_service, get_user_usage, get_tier_comparison
from app.services.payment_service import (
    payment_service, create_customer, create_subscription, 
    cancel_subscription, get_subscription, get_prices,
    create_checkout_session
)
from app.services.growth_service import (
    get_growth_metrics, get_revenue_analytics, 
    get_user_acquisition_metrics, get_churn_analysis
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])

@router.get("/tiers")
async def get_subscription_tiers() -> Dict[str, Any]:
    """Get available subscription tiers"""
    try:
        return get_tier_comparison()
    except Exception as e:
        logger.error(f"Failed to get subscription tiers: {e}")
        raise HTTPException(status_code=500, detail="Failed to get subscription tiers")

@router.get("/prices")
async def get_subscription_prices() -> Dict[str, Any]:
    """Get available subscription prices from Stripe"""
    try:
        return get_prices()
    except Exception as e:
        logger.error(f"Failed to get subscription prices: {e}")
        raise HTTPException(status_code=500, detail="Failed to get subscription prices")

@router.post("/create-customer")
async def create_stripe_customer(user_id: int, email: str, name: str) -> Dict[str, Any]:
    """Create a Stripe customer"""
    try:
        result = create_customer(user_id, email, name)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        logger.error(f"Failed to create customer: {e}")
        raise HTTPException(status_code=500, detail="Failed to create customer")

@router.post("/create-subscription")
async def create_user_subscription(customer_id: str, price_id: str) -> Dict[str, Any]:
    """Create a subscription for a customer"""
    try:
        result = create_subscription(customer_id, price_id)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        logger.error(f"Failed to create subscription: {e}")
        raise HTTPException(status_code=500, detail="Failed to create subscription")

@router.post("/cancel-subscription")
async def cancel_user_subscription(subscription_id: str) -> Dict[str, Any]:
    """Cancel a subscription"""
    try:
        result = cancel_subscription(subscription_id)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        logger.error(f"Failed to cancel subscription: {e}")
        raise HTTPException(status_code=500, detail="Failed to cancel subscription")

@router.get("/subscription/{subscription_id}")
async def get_subscription_details(subscription_id: str) -> Dict[str, Any]:
    """Get subscription details"""
    try:
        result = get_subscription(subscription_id)
        if "error" in result:
            raise HTTPException(status_code=404, detail="Subscription not found")
        return result
    except Exception as e:
        logger.error(f"Failed to get subscription: {e}")
        raise HTTPException(status_code=500, detail="Failed to get subscription")

@router.post("/checkout-session")
async def create_subscription_checkout(
    price_id: str, 
    customer_id: str,
    success_url: str,
    cancel_url: str
) -> Dict[str, Any]:
    """Create a checkout session for subscription"""
    try:
        result = create_checkout_session(price_id, customer_id, success_url, cancel_url)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        logger.error(f"Failed to create checkout session: {e}")
        raise HTTPException(status_code=500, detail="Failed to create checkout session")

@router.get("/usage/{user_id}")
async def get_user_usage_details(user_id: int) -> Dict[str, Any]:
    """Get user's usage details"""
    try:
        return get_user_usage(user_id)
    except Exception as e:
        logger.error(f"Failed to get user usage: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user usage")

@router.post("/webhook")
async def handle_stripe_webhook(request: Request) -> Dict[str, Any]:
    """Handle Stripe webhook events"""
    try:
        payload = await request.body()
        sig_header = request.headers.get("stripe-signature")
        
        if not sig_header:
            raise HTTPException(status_code=400, detail="Missing stripe-signature header")
        
        result = payment_service.handle_webhook(payload.decode(), sig_header)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
    except Exception as e:
        logger.error(f"Failed to handle webhook: {e}")
        raise HTTPException(status_code=500, detail="Failed to handle webhook")

@router.get("/analytics/growth")
async def get_growth_analytics() -> Dict[str, Any]:
    """Get growth analytics (admin only)"""
    try:
        return get_growth_metrics()
    except Exception as e:
        logger.error(f"Failed to get growth analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get growth analytics")

@router.get("/analytics/revenue")
async def get_revenue_analytics(days: int = 30) -> Dict[str, Any]:
    """Get revenue analytics (admin only)"""
    try:
        return get_revenue_analytics(days)
    except Exception as e:
        logger.error(f"Failed to get revenue analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get revenue analytics")

@router.get("/analytics/acquisition")
async def get_user_acquisition_analytics(days: int = 30) -> Dict[str, Any]:
    """Get user acquisition analytics (admin only)"""
    try:
        return get_user_acquisition_metrics(days)
    except Exception as e:
        logger.error(f"Failed to get user acquisition analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user acquisition analytics")

@router.get("/analytics/churn")
async def get_churn_analytics(days: int = 30) -> Dict[str, Any]:
    """Get churn analytics (admin only)"""
    try:
        return get_churn_analysis(days)
    except Exception as e:
        logger.error(f"Failed to get churn analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get churn analytics") 