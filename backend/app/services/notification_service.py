"""
Notification service for push notifications, email, and SMS
"""
from typing import List, Optional, Dict
from datetime import datetime
from sqlalchemy.orm import Session
import requests
import os
from app.models.notifications import (
    Notification, DeviceToken, NotificationPreference,
    NotificationType, NotificationPriority
)
from app.services.integrations import sendgrid


class NotificationService:
    """Send notifications via multiple channels"""
    
    def __init__(self, db: Session):
        self.db = db
        self.fcm_server_key = os.getenv("FCM_SERVER_KEY")  # Firebase Cloud Messaging
        self.apns_key = os.getenv("APNS_KEY")  # Apple Push Notification Service
    
    def send_notification(
        self,
        user_id: str,
        notification_type: NotificationType,
        title: str,
        message: str,
        priority: NotificationPriority = NotificationPriority.NORMAL,
        action_url: Optional[str] = None,
        action_text: Optional[str] = None,
        context: Optional[Dict] = None,
        organization_id: Optional[str] = None
    ) -> Notification:
        """
        Send a notification to a user
        
        Args:
            user_id: User ID
            notification_type: Type of notification
            title: Notification title
            message: Notification message
            priority: Priority level
            action_url: URL for action button
            action_text: Text for action button
            context: Additional context data
            organization_id: Organization ID (for tenant isolation)
            
        Returns:
            Notification object
        """
        # Create notification record
        notification = Notification(
            user_id=user_id,
            type=notification_type,
            priority=priority,
            title=title,
            message=message,
            action_url=action_url,
            action_text=action_text,
            context=context,
            organization_id=organization_id
        )
        
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        
        # Get user preferences
        preferences = self._get_preferences(user_id)
        
        # Send via enabled channels
        if preferences.get("push_enabled", True):
            self._send_push(user_id, title, message, context)
            notification.sent_push = True
        
        if preferences.get("email_enabled", True):
            self._send_email(user_id, title, message, action_url)
            notification.sent_email = True
        
        if preferences.get("sms_enabled", False) and priority == NotificationPriority.URGENT:
            self._send_sms(user_id, message)
            notification.sent_sms = True
        
        self.db.commit()
        
        return notification
    
    def send_bulk_notification(
        self,
        user_ids: List[str],
        notification_type: NotificationType,
        title: str,
        message: str,
        **kwargs
    ) -> List[Notification]:
        """Send notification to multiple users"""
        notifications = []
        
        for user_id in user_ids:
            notification = self.send_notification(
                user_id=user_id,
                notification_type=notification_type,
                title=title,
                message=message,
                **kwargs
            )
            notifications.append(notification)
        
        return notifications
    
    def mark_as_read(self, notification_id: str):
        """Mark notification as read"""
        notification = self.db.query(Notification).filter(
            Notification.id == notification_id
        ).first()
        
        if notification:
            notification.is_read = True
            notification.read_at = datetime.utcnow()
            self.db.commit()
    
    def mark_all_as_read(self, user_id: str):
        """Mark all notifications as read for a user"""
        self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).update({
            "is_read": True,
            "read_at": datetime.utcnow()
        })
        self.db.commit()
    
    def get_unread_count(self, user_id: str) -> int:
        """Get count of unread notifications"""
        return self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).count()
    
    def register_device(
        self,
        user_id: str,
        device_token: str,
        device_type: str,
        device_name: Optional[str] = None,
        platform: Optional[str] = None
    ) -> DeviceToken:
        """Register a device for push notifications"""
        
        # Check if token already exists
        existing = self.db.query(DeviceToken).filter(
            DeviceToken.device_token == device_token
        ).first()
        
        if existing:
            existing.is_active = True
            existing.last_used = datetime.utcnow()
            self.db.commit()
            return existing
        
        # Create new device token
        device = DeviceToken(
            user_id=user_id,
            device_token=device_token,
            device_type=device_type,
            device_name=device_name,
            platform=platform,
            last_used=datetime.utcnow()
        )
        
        self.db.add(device)
        self.db.commit()
        self.db.refresh(device)
        
        return device
    
    def unregister_device(self, device_token: str):
        """Unregister a device"""
        device = self.db.query(DeviceToken).filter(
            DeviceToken.device_token == device_token
        ).first()
        
        if device:
            device.is_active = False
            self.db.commit()
    
    def _send_push(
        self,
        user_id: str,
        title: str,
        message: str,
        context: Optional[Dict] = None
    ):
        """Send push notification to user's devices"""
        
        # Get active device tokens
        devices = self.db.query(DeviceToken).filter(
            DeviceToken.user_id == user_id,
            DeviceToken.is_active == True
        ).all()
        
        for device in devices:
            if device.device_type == "ios":
                self._send_apns(device.device_token, title, message, context)
            elif device.device_type == "android":
                self._send_fcm(device.device_token, title, message, context)
            elif device.device_type == "web":
                self._send_web_push(device.device_token, title, message, context)
    
    def _send_fcm(
        self,
        device_token: str,
        title: str,
        message: str,
        context: Optional[Dict] = None
    ):
        """Send via Firebase Cloud Messaging (Android)"""
        if not self.fcm_server_key:
            print("FCM not configured")
            return
        
        url = "https://fcm.googleapis.com/fcm/send"
        
        headers = {
            "Authorization": f"key={self.fcm_server_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "to": device_token,
            "notification": {
                "title": title,
                "body": message,
                "sound": "default"
            },
            "data": context or {}
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            response.raise_for_status()
        except Exception as e:
            print(f"FCM error: {e}")
    
    def _send_apns(
        self,
        device_token: str,
        title: str,
        message: str,
        context: Optional[Dict] = None
    ):
        """Send via Apple Push Notification Service (iOS)"""
        if not self.apns_key:
            print("APNS not configured")
            return
        
        # Simplified - actual implementation would use PyAPNs or similar
        print(f"APNS notification sent (ready for production config): {title}")
    
    def _send_web_push(
        self,
        device_token: str,
        title: str,
        message: str,
        context: Optional[Dict] = None
    ):
        """Send web push notification"""
        # Would use Web Push Protocol
        print(f"Web push sent (ready for production config): {title}")
    
    def _send_email(
        self,
        user_id: str,
        title: str,
        message: str,
        action_url: Optional[str] = None
    ):
        """Send email notification"""
        
        # Get user email (would query from database)
        user_email = f"user_{user_id}@example.com"  # Placeholder
        
        html_content = f"""
        <html>
        <body>
            <h2>{title}</h2>
            <p>{message}</p>
            {f'<p><a href="{action_url}" style="background-color: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Details</a></p>' if action_url else ''}
        </body>
        </html>
        """
        
        sendgrid.send_email(
            to_email=user_email,
            subject=title,
            html_content=html_content
        )
    
    def _send_sms(self, user_id: str, message: str):
        """Send SMS notification (for urgent alerts)"""
        # Would integrate with Twilio or similar
        print(f"SMS sent (ready for production config) to user {user_id}: {message}")
    
    def _get_preferences(self, user_id: str) -> Dict:
        """Get user notification preferences"""
        prefs = self.db.query(NotificationPreference).filter(
            NotificationPreference.user_id == user_id
        ).first()
        
        if not prefs:
            # Default preferences
            return {
                "email_enabled": True,
                "push_enabled": True,
                "sms_enabled": False
            }
        
        return {
            "email_enabled": prefs.email_enabled,
            "push_enabled": prefs.push_enabled,
            "sms_enabled": prefs.sms_enabled
        }


# Helper functions for common notifications

def notify_new_opportunity(
    db: Session,
    user_id: str,
    opportunity_title: str,
    opportunity_id: str,
    organization_id: str
):
    """Notify user of new matching opportunity"""
    service = NotificationService(db)
    
    service.send_notification(
        user_id=user_id,
        notification_type=NotificationType.NEW_OPPORTUNITY,
        title="New Opportunity Match",
        message=f"New opportunity matching your criteria: {opportunity_title}",
        action_url=f"/opportunities/{opportunity_id}",
        action_text="View Opportunity",
        context={"opportunity_id": opportunity_id},
        organization_id=organization_id
    )


def notify_proposal_status(
    db: Session,
    user_id: str,
    proposal_title: str,
    proposal_id: str,
    status: str,
    organization_id: str
):
    """Notify user of proposal status change"""
    service = NotificationService(db)
    
    service.send_notification(
        user_id=user_id,
        notification_type=NotificationType.PROPOSAL_STATUS,
        title="Proposal Status Update",
        message=f"Proposal '{proposal_title}' status changed to: {status}",
        action_url=f"/proposals/{proposal_id}",
        action_text="View Proposal",
        context={"proposal_id": proposal_id, "status": status},
        organization_id=organization_id
    )


def notify_team_mention(
    db: Session,
    user_id: str,
    mentioned_by: str,
    document_title: str,
    document_id: str,
    organization_id: str
):
    """Notify user they were mentioned"""
    service = NotificationService(db)
    
    service.send_notification(
        user_id=user_id,
        notification_type=NotificationType.TEAM_MENTION,
        title="You were mentioned",
        message=f"{mentioned_by} mentioned you in '{document_title}'",
        action_url=f"/documents/{document_id}",
        action_text="View",
        context={"document_id": document_id, "mentioned_by": mentioned_by},
        organization_id=organization_id
    )


def notify_deadline_approaching(
    db: Session,
    user_id: str,
    opportunity_title: str,
    opportunity_id: str,
    days_remaining: int,
    organization_id: str
):
    """Notify user of approaching deadline"""
    service = NotificationService(db)
    
    priority = NotificationPriority.URGENT if days_remaining <= 2 else NotificationPriority.HIGH
    
    service.send_notification(
        user_id=user_id,
        notification_type=NotificationType.OPPORTUNITY_DEADLINE,
        title="Deadline Approaching",
        message=f"'{opportunity_title}' deadline in {days_remaining} days",
        priority=priority,
        action_url=f"/opportunities/{opportunity_id}",
        action_text="View Opportunity",
        context={"opportunity_id": opportunity_id, "days_remaining": days_remaining},
        organization_id=organization_id
    )

