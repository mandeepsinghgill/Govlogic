"""
Subscription and usage tracking service
"""
from typing import Dict, Optional, Tuple
from datetime import datetime, date
from dateutil.relativedelta import relativedelta
from sqlalchemy.orm import Session
from app.models.subscription import (
    Subscription, UsageTracking, UpgradePrompt, FeatureUsageLog,
    SubscriptionTier, TIER_LIMITS, ADDON_PRICING
)


class SubscriptionService:
    """Manage subscriptions and usage limits"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_subscription(self, organization_id: str) -> Optional[Subscription]:
        """Get organization's subscription"""
        return self.db.query(Subscription).filter(
            Subscription.organization_id == organization_id
        ).first()
    
    def create_subscription(
        self,
        organization_id: str,
        tier: SubscriptionTier,
        billing_interval: str = "monthly",
        is_founder: bool = False
    ) -> Subscription:
        """Create a new subscription"""
        limits = TIER_LIMITS[tier]
        
        # Calculate price
        if is_founder:
            monthly_price = limits["founder_price"]
            founder_discount = 25.0
        else:
            monthly_price = limits["monthly_price"]
            founder_discount = 0.0
        
        # Create subscription
        subscription = Subscription(
            organization_id=organization_id,
            tier=tier,
            billing_interval=billing_interval,
            monthly_price=monthly_price,
            base_price=limits["monthly_price"],
            is_founder=is_founder,
            founder_discount_percent=founder_discount,
            status="active",
            current_period_start=date.today(),
            limits=limits
        )
        
        self.db.add(subscription)
        self.db.commit()
        self.db.refresh(subscription)
        
        # Create usage tracking record
        self._create_usage_record(organization_id, tier)
        
        return subscription
    
    def get_usage(self, organization_id: str) -> Optional[UsageTracking]:
        """Get current period usage"""
        today = date.today()
        return self.db.query(UsageTracking).filter(
            UsageTracking.organization_id == organization_id,
            UsageTracking.period_start <= today,
            UsageTracking.period_end >= today
        ).first()
    
    def check_limit(
        self,
        organization_id: str,
        feature: str,
        increment: int = 1
    ) -> Tuple[bool, Dict]:
        """
        Check if organization can use a feature
        
        Args:
            organization_id: Organization ID
            feature: Feature name (e.g., 'proposals_generated')
            increment: Amount to increment (default 1)
            
        Returns:
            (allowed: bool, info: dict)
        """
        subscription = self.get_subscription(organization_id)
        if not subscription:
            return False, {"error": "No active subscription"}
        
        usage = self.get_usage(organization_id)
        if not usage:
            # Create usage record for current period
            usage = self._create_usage_record(organization_id, subscription.tier)
        
        # Get limit for this feature
        limit_field = f"{feature}_limit"
        current_field = feature
        
        if not hasattr(usage, limit_field):
            return True, {"allowed": True, "unlimited": True}
        
        limit = getattr(usage, limit_field)
        current = getattr(usage, current_field)
        
        # -1 means unlimited
        if limit == -1:
            return True, {
                "allowed": True,
                "unlimited": True,
                "current": current
            }
        
        # Check if would exceed limit
        new_value = current + increment
        allowed = new_value <= limit
        
        return allowed, {
            "allowed": allowed,
            "current": current,
            "limit": limit,
            "remaining": max(0, limit - current),
            "would_be": new_value,
            "overage": max(0, new_value - limit) if not allowed else 0,
            "tier": subscription.tier.value,
            "feature": feature
        }
    
    def increment_usage(
        self,
        organization_id: str,
        feature: str,
        amount: int = 1
    ) -> Dict:
        """
        Increment usage counter
        
        Args:
            organization_id: Organization ID
            feature: Feature name
            amount: Amount to increment
            
        Returns:
            Usage info dict
        """
        allowed, info = self.check_limit(organization_id, feature, amount)
        
        if not allowed:
            # Log upgrade prompt
            self._log_upgrade_prompt(
                organization_id,
                f"hit_{feature}_limit",
                info
            )
            return {
                "success": False,
                "limit_exceeded": True,
                **info
            }
        
        # Increment usage
        usage = self.get_usage(organization_id)
        current = getattr(usage, feature)
        setattr(usage, feature, current + amount)
        self.db.commit()
        
        # Log feature usage
        self._log_feature_usage(organization_id, feature, amount)
        
        # Check if approaching limit (80%)
        if info.get("limit", -1) > 0:
            percentage_used = (current + amount) / info["limit"]
            if percentage_used >= 0.8 and percentage_used < 1.0:
                self._log_upgrade_prompt(
                    organization_id,
                    f"approaching_{feature}_limit",
                    {**info, "percentage_used": percentage_used * 100}
                )
        
        return {
            "success": True,
            "limit_exceeded": False,
            **info,
            "new_value": current + amount
        }
    
    def get_upgrade_suggestions(
        self,
        organization_id: str,
        trigger: str
    ) -> Dict:
        """
        Get upgrade suggestions when limit is hit
        
        Args:
            organization_id: Organization ID
            trigger: What triggered the suggestion
            
        Returns:
            Upgrade suggestion dict
        """
        subscription = self.get_subscription(organization_id)
        if not subscription:
            return {}
        
        current_tier = subscription.tier
        
        # Determine next tier
        tier_order = [
            SubscriptionTier.STARTER,
            SubscriptionTier.PROFESSIONAL,
            SubscriptionTier.BUSINESS,
            SubscriptionTier.ENTERPRISE
        ]
        
        current_index = tier_order.index(current_tier)
        if current_index >= len(tier_order) - 1:
            # Already on highest tier
            return {
                "current_tier": current_tier.value,
                "message": "You're on our highest tier! Contact us for custom limits."
            }
        
        next_tier = tier_order[current_index + 1]
        next_limits = TIER_LIMITS[next_tier]
        current_limits = TIER_LIMITS[current_tier]
        
        # Calculate price difference
        is_founder = subscription.is_founder
        current_price = subscription.monthly_price
        next_price = next_limits["founder_price"] if is_founder else next_limits["monthly_price"]
        price_diff = next_price - current_price
        
        return {
            "current_tier": current_tier.value,
            "suggested_tier": next_tier.value,
            "current_price": current_price,
            "next_price": next_price,
            "price_difference": price_diff,
            "trigger": trigger,
            "benefits": self._get_upgrade_benefits(current_tier, next_tier),
            "message": self._get_upgrade_message(trigger, current_tier, next_tier)
        }
    
    def get_addon_price(
        self,
        organization_id: str,
        addon_type: str
    ) -> Optional[float]:
        """Get price for an add-on"""
        subscription = self.get_subscription(organization_id)
        if not subscription:
            return None
        
        pricing = ADDON_PRICING.get(addon_type)
        if not pricing:
            return None
        
        # If pricing varies by tier
        if isinstance(pricing, dict):
            return pricing.get(subscription.tier)
        
        return pricing
    
    def _create_usage_record(
        self,
        organization_id: str,
        tier: SubscriptionTier
    ) -> UsageTracking:
        """Create usage tracking record for current period"""
        today = date.today()
        period_end = today + relativedelta(months=1)
        
        limits = TIER_LIMITS[tier]
        
        usage = UsageTracking(
            organization_id=organization_id,
            period_start=today,
            period_end=period_end,
            proposals_limit=limits["proposals_per_month"],
            opportunities_limit=limits["opportunities_max"],
            contacts_limit=limits["contacts_max"],
            users_limit=limits["users_max"],
            capture_plans_limit=limits.get("capture_plans_active", 10),
            pwin_limit=limits.get("pwin_calculations", 100),
            ai_emails_limit=limits.get("ai_emails", 50),
            partner_searches_limit=limits.get("partner_searches", 20),
            boe_limit=limits.get("boe_generations", 10),
            price_to_win_limit=limits.get("price_to_win", 10),
            resumes_limit=limits.get("resumes", 50),
            swot_limit=limits.get("swot_analyses", 10),
            storage_limit_mb=limits["storage_mb"]
        )
        
        self.db.add(usage)
        self.db.commit()
        
        return usage
    
    def _log_upgrade_prompt(
        self,
        organization_id: str,
        trigger: str,
        context: Dict
    ):
        """Log that an upgrade prompt was shown"""
        subscription = self.get_subscription(organization_id)
        if not subscription:
            return
        
        suggestions = self.get_upgrade_suggestions(organization_id, trigger)
        
        prompt = UpgradePrompt(
            organization_id=organization_id,
            user_id=context.get("user_id", "system"),
            trigger_event=trigger,
            trigger_context=context,
            current_tier=subscription.tier.value,
            suggested_tier=suggestions.get("suggested_tier", ""),
            message_title=suggestions.get("message", {}).get("title", ""),
            message_body=suggestions.get("message", {}).get("body", "")
        )
        
        self.db.add(prompt)
        self.db.commit()
    
    def _log_feature_usage(
        self,
        organization_id: str,
        feature: str,
        amount: int
    ):
        """Log feature usage"""
        today = date.today()
        
        # Check if log exists for today
        log = self.db.query(FeatureUsageLog).filter(
            FeatureUsageLog.organization_id == organization_id,
            FeatureUsageLog.feature_name == feature,
            FeatureUsageLog.usage_date == today
        ).first()
        
        if log:
            log.usage_count += amount
        else:
            log = FeatureUsageLog(
                organization_id=organization_id,
                user_id="system",  # Would be actual user in real app
                feature_name=feature,
                feature_category=self._get_feature_category(feature),
                usage_count=amount,
                usage_date=today
            )
            self.db.add(log)
        
        self.db.commit()
    
    def _get_feature_category(self, feature: str) -> str:
        """Get category for a feature"""
        categories = {
            "proposals": ["proposals_generated"],
            "opportunities": ["opportunities_tracked"],
            "contacts": ["contacts_count"],
            "capture": ["capture_plans_active", "pwin_calculations"],
            "pricing": ["boe_generations", "price_to_win_analyses"],
            "teaming": ["partner_searches"],
            "recruiting": ["resumes_formatted"],
            "competitive": ["swot_analyses"]
        }
        
        for category, features in categories.items():
            if feature in features:
                return category
        
        return "other"
    
    def _get_upgrade_benefits(
        self,
        current_tier: SubscriptionTier,
        next_tier: SubscriptionTier
    ) -> list:
        """Get list of benefits from upgrading"""
        current_limits = TIER_LIMITS[current_tier]
        next_limits = TIER_LIMITS[next_tier]
        
        benefits = []
        
        # Compare key limits
        comparisons = [
            ("proposals_per_month", "proposals/month"),
            ("opportunities_max", "opportunities"),
            ("contacts_max", "contacts"),
            ("users_max", "user seats"),
            ("capture_plans_active", "active capture plans"),
            ("ai_emails", "AI emails/month")
        ]
        
        for key, label in comparisons:
            current = current_limits[key]
            next_val = next_limits[key]
            
            if next_val == -1:
                benefits.append(f"Unlimited {label}")
            elif next_val > current:
                benefits.append(f"{next_val} {label} (vs. {current})")
        
        # Add feature unlocks
        current_features = current_limits.get("features", {})
        next_features = next_limits.get("features", {})
        
        for feature, enabled in next_features.items():
            if enabled and not current_features.get(feature, False):
                feature_name = feature.replace("_", " ").title()
                benefits.append(f"Unlock {feature_name}")
        
        return benefits
    
    def _get_upgrade_message(
        self,
        trigger: str,
        current_tier: SubscriptionTier,
        next_tier: SubscriptionTier
    ) -> Dict:
        """Get upgrade message based on trigger"""
        messages = {
            "hit_proposals_generated_limit": {
                "title": "🎉 You've generated your proposal limit!",
                "body": f"You've reached your {current_tier.value.title()} tier limit. "
                        f"Upgrade to {next_tier.value.title()} for more proposals and advanced features."
            },
            "hit_contacts_count_limit": {
                "title": "📇 You've reached your contact limit",
                "body": f"Your {current_tier.value.title()} tier includes limited contacts. "
                        f"Upgrade to {next_tier.value.title()} to track more relationships."
            },
            "approaching_proposals_generated_limit": {
                "title": "⚠️ You're approaching your proposal limit",
                "body": f"You've used 80% of your proposals this month. "
                        f"Consider upgrading to {next_tier.value.title()} for peace of mind."
            }
        }
        
        return messages.get(trigger, {
            "title": "Upgrade Available",
            "body": f"Upgrade to {next_tier.value.title()} for more capacity and features."
        })


def check_feature_access(
    db: Session,
    organization_id: str,
    feature_name: str
) -> bool:
    """
    Check if organization has access to a feature
    
    Args:
        db: Database session
        organization_id: Organization ID
        feature_name: Feature name (e.g., 'live_coediting')
        
    Returns:
        True if feature is accessible
    """
    subscription = db.query(Subscription).filter(
        Subscription.organization_id == organization_id
    ).first()
    
    if not subscription:
        return False
    
    limits = TIER_LIMITS.get(subscription.tier, {})
    features = limits.get("features", {})
    
    return features.get(feature_name, False)

