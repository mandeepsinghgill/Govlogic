"""
Subscription and billing API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from datetime import date
from app.core.database import get_db
from app.models.subscription import Subscription, UsageTracking, Invoice, AddOnPurchase, ServiceEngagement, SubscriptionTier
from app.services.subscription_service import TIER_LIMITS, ADDON_PRICING
from app.services.subscription_service import SubscriptionService, check_feature_access
from app.services.integrations import stripe_service

router = APIRouter(prefix="/api/v1/subscriptions", tags=["subscriptions"])


class SubscriptionCreate(BaseModel):
    organization_id: str
    tier: str
    billing_interval: str = "monthly"
    is_founder: bool = False


class SubscriptionUpdate(BaseModel):
    tier: Optional[str] = None
    billing_interval: Optional[str] = None


class AddOnPurchaseRequest(BaseModel):
    addon_type: str
    quantity: int = 1
    metadata: Optional[dict] = None


class ServiceEngagementRequest(BaseModel):
    service_type: str
    scope_of_work: str
    opportunity_id: Optional[str] = None
    proposal_id: Optional[str] = None


@router.get("/")
async def get_subscription(
    organization_id: str,
    db: Session = Depends(get_db)
):
    """Get organization's subscription"""
    subscription = db.query(Subscription).filter(
        Subscription.organization_id == organization_id
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    return subscription


@router.post("/")
async def create_subscription(
    request: SubscriptionCreate,
    db: Session = Depends(get_db)
):
    """Create a new subscription"""
    
    # Check if subscription already exists
    existing = db.query(Subscription).filter(
        Subscription.organization_id == request.organization_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Subscription already exists")
    
    # Get tier limits
    tier = SubscriptionTier(request.tier)
    limits = TIER_LIMITS[tier]
    
    # Calculate price
    if request.is_founder:
        monthly_price = limits["founder_price"]
        founder_discount = 25.0
    else:
        monthly_price = limits["monthly_price"]
        founder_discount = 0.0
    
    # Create subscription
    subscription = Subscription(
        organization_id=request.organization_id,
        tier=tier,
        billing_interval=request.billing_interval,
        monthly_price=monthly_price,
        base_price=limits["monthly_price"],
        is_founder=request.is_founder,
        founder_discount_percent=founder_discount,
        status="active",
        current_period_start=date.today(),
        limits=limits
    )
    
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    
    # Create usage tracking record
    service = SubscriptionService(db)
    service._create_usage_record(request.organization_id, tier)
    
    return subscription


@router.put("/{subscription_id}")
async def update_subscription(
    subscription_id: str,
    request: SubscriptionUpdate,
    db: Session = Depends(get_db)
):
    """Update subscription (upgrade/downgrade)"""
    
    subscription = db.query(Subscription).filter(
        Subscription.id == subscription_id
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    # Update tier if provided
    if request.tier:
        new_tier = SubscriptionTier(request.tier)
        limits = TIER_LIMITS[new_tier]
        
        # Calculate new price (keep founder discount if applicable)
        if subscription.is_founder:
            new_price = limits["founder_price"]
        else:
            new_price = limits["monthly_price"]
        
        subscription.tier = new_tier
        subscription.monthly_price = new_price
        subscription.base_price = limits["monthly_price"]
        subscription.limits = limits
        
        # Update usage limits for current period
        usage = db.query(UsageTracking).filter(
            UsageTracking.organization_id == subscription.organization_id,
            UsageTracking.period_start <= date.today(),
            UsageTracking.period_end >= date.today()
        ).first()
        
        if usage:
            usage.proposals_limit = limits["proposals_per_month"]
            usage.opportunities_limit = limits["opportunities_max"]
            usage.contacts_limit = limits["contacts_max"]
            usage.users_limit = limits["users_max"]
            # ... update other limits
    
    # Update billing interval if provided
    if request.billing_interval:
        subscription.billing_interval = request.billing_interval
    
    db.commit()
    db.refresh(subscription)
    
    return subscription


@router.get("/{organization_id}/usage")
async def get_usage(
    organization_id: str,
    db: Session = Depends(get_db)
):
    """Get current usage and limits"""
    
    service = SubscriptionService(db)
    subscription = service.get_subscription(organization_id)
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    usage = service.get_usage(organization_id)
    
    if not usage:
        raise HTTPException(status_code=404, detail="Usage record not found")
    
    # Calculate percentages
    usage_summary = {
        "tier": subscription.tier.value,
        "period_start": usage.period_start,
        "period_end": usage.period_end,
        "usage": {
            "proposals": {
                "used": usage.proposals_generated,
                "limit": usage.proposals_limit,
                "percentage": (usage.proposals_generated / usage.proposals_limit * 100) if usage.proposals_limit > 0 else 0
            },
            "opportunities": {
                "used": usage.opportunities_tracked,
                "limit": usage.opportunities_limit,
                "percentage": (usage.opportunities_tracked / usage.opportunities_limit * 100) if usage.opportunities_limit > 0 else 0
            },
            "contacts": {
                "used": usage.contacts_count,
                "limit": usage.contacts_limit,
                "percentage": (usage.contacts_count / usage.contacts_limit * 100) if usage.contacts_limit > 0 else 0
            },
            "users": {
                "used": usage.users_count,
                "limit": usage.users_limit,
                "percentage": (usage.users_count / usage.users_limit * 100) if usage.users_limit > 0 else 0
            }
        }
    }
    
    return usage_summary


@router.post("/{organization_id}/check-limit")
async def check_limit(
    organization_id: str,
    feature: str,
    increment: int = 1,
    db: Session = Depends(get_db)
):
    """Check if organization can use a feature"""
    
    service = SubscriptionService(db)
    allowed, info = service.check_limit(organization_id, feature, increment)
    
    return {
        "allowed": allowed,
        **info
    }


@router.post("/{organization_id}/increment-usage")
async def increment_usage(
    organization_id: str,
    feature: str,
    amount: int = 1,
    db: Session = Depends(get_db)
):
    """Increment usage counter"""
    
    service = SubscriptionService(db)
    result = service.increment_usage(organization_id, feature, amount)
    
    if not result["success"]:
        # Return upgrade suggestions
        suggestions = service.get_upgrade_suggestions(organization_id, f"hit_{feature}_limit")
        result["upgrade_suggestions"] = suggestions
    
    return result


@router.get("/{organization_id}/upgrade-suggestions")
async def get_upgrade_suggestions(
    organization_id: str,
    trigger: str,
    db: Session = Depends(get_db)
):
    """Get upgrade suggestions"""
    
    service = SubscriptionService(db)
    suggestions = service.get_upgrade_suggestions(organization_id, trigger)
    
    return suggestions


@router.get("/tiers")
async def list_tiers():
    """List all subscription tiers and their limits"""
    
    tiers = []
    for tier, limits in TIER_LIMITS.items():
        tiers.append({
            "tier": tier.value,
            "name": tier.value.title(),
            "monthly_price": limits["monthly_price"],
            "founder_price": limits["founder_price"],
            "limits": {
                "proposals_per_month": limits["proposals_per_month"],
                "opportunities_max": limits["opportunities_max"],
                "contacts_max": limits["contacts_max"],
                "users_max": limits["users_max"],
                "storage_mb": limits["storage_mb"]
            },
            "features": limits.get("features", {})
        })
    
    return {"tiers": tiers}


@router.get("/addons")
async def list_addons(
    organization_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List available add-ons and pricing"""
    
    addons = []
    
    for addon_type, pricing in ADDON_PRICING.items():
        addon_info = {
            "type": addon_type,
            "name": addon_type.replace("_", " ").title()
        }
        
        if isinstance(pricing, dict):
            # Pricing varies by tier
            if organization_id:
                service = SubscriptionService(db)
                price = service.get_addon_price(organization_id, addon_type)
                addon_info["price"] = price
            else:
                addon_info["pricing_by_tier"] = {
                    tier.value: price for tier, price in pricing.items()
                }
        else:
            addon_info["price"] = pricing
        
        addons.append(addon_info)
    
    return {"addons": addons}


@router.post("/{organization_id}/purchase-addon")
async def purchase_addon(
    organization_id: str,
    request: AddOnPurchaseRequest,
    db: Session = Depends(get_db)
):
    """Purchase an add-on"""
    
    service = SubscriptionService(db)
    price = service.get_addon_price(organization_id, request.addon_type)
    
    if not price:
        raise HTTPException(status_code=400, detail="Invalid add-on type")
    
    total = price * request.quantity
    
    # Create purchase record
    purchase = AddOnPurchase(
        organization_id=organization_id,
        addon_type=request.addon_type,
        addon_name=request.addon_type.replace("_", " ").title(),
        price=price,
        quantity=request.quantity,
        total=total,
        metadata=request.metadata,
        status="pending"
    )
    
    db.add(purchase)
    db.commit()
    db.refresh(purchase)
    
    # In real implementation, would process payment via Stripe
    # stripe_service.create_payment_intent(...)
    
    return purchase


@router.post("/{organization_id}/request-service")
async def request_service(
    organization_id: str,
    request: ServiceEngagementRequest,
    db: Session = Depends(get_db)
):
    """Request a professional service"""
    
    # Get service pricing
    service_pricing = {
        "expert_review": 1500,
        "full_service_proposal": 15000,
        "capture_retainer": 3500,
        "grant_writing": 8000,
        "win_strategy_workshop": 2500,
        "orals_coaching": 999
    }
    
    price = service_pricing.get(request.service_type)
    
    if not price:
        raise HTTPException(status_code=400, detail="Invalid service type")
    
    # Create service engagement
    engagement = ServiceEngagement(
        organization_id=organization_id,
        service_type=request.service_type,
        service_name=request.service_type.replace("_", " ").title(),
        price=price,
        scope_of_work=request.scope_of_work,
        opportunity_id=request.opportunity_id,
        proposal_id=request.proposal_id,
        status="pending"
    )
    
    db.add(engagement)
    db.commit()
    db.refresh(engagement)
    
    return engagement


@router.get("/{organization_id}/invoices")
async def list_invoices(
    organization_id: str,
    db: Session = Depends(get_db)
):
    """List invoices for an organization"""
    
    invoices = db.query(Invoice).filter(
        Invoice.organization_id == organization_id
    ).order_by(Invoice.invoice_date.desc()).all()
    
    return {"invoices": invoices}


@router.get("/{organization_id}/feature-access/{feature_name}")
async def check_feature_access_endpoint(
    organization_id: str,
    feature_name: str,
    db: Session = Depends(get_db)
):
    """Check if organization has access to a feature"""
    
    has_access = check_feature_access(db, organization_id, feature_name)
    
    return {
        "feature": feature_name,
        "has_access": has_access
    }

