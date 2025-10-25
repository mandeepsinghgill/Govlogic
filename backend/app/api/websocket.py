"""
WebSocket endpoints for real-time collaboration
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
import json
from app.core.database import get_db
from app.services.collaboration_service import collaboration_manager
from app.services.subscription_service import check_feature_access

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/collaborate/{document_id}")
async def websocket_collaborate(
    websocket: WebSocket,
    document_id: str,
    document_type: str = Query(...),
    user_id: str = Query(...),
    user_name: str = Query(...),
    organization_id: str = Query(...),
    user_color: str = Query("#3B82F6"),
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint for real-time collaboration
    
    Query params:
    - document_type: proposal, capture_plan, grant, etc.
    - user_id: Current user ID
    - user_name: User's display name
    - organization_id: Organization ID
    - user_color: User's cursor color (hex)
    """
    
    # Check if organization has access to live collaboration
    has_access = check_feature_access(db, organization_id, "live_coediting")
    
    if not has_access:
        await websocket.close(code=1008, reason="Live collaboration not available in your tier")
        return
    
    # Connect user to collaboration session
    await collaboration_manager.connect(
        websocket=websocket,
        document_id=document_id,
        document_type=document_type,
        user_id=user_id,
        user_name=user_name,
        user_color=user_color
    )
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            message_type = message.get("type")
            
            if message_type == "cursor_move":
                # User moved cursor
                await collaboration_manager.handle_cursor_move(
                    document_id=document_id,
                    user_id=user_id,
                    cursor_position=message.get("cursor", {})
                )
            
            elif message_type == "selection_change":
                # User changed text selection
                await collaboration_manager.handle_selection_change(
                    document_id=document_id,
                    user_id=user_id,
                    selection=message.get("selection", {})
                )
            
            elif message_type == "content_change":
                # User edited content
                await collaboration_manager.handle_content_change(
                    document_id=document_id,
                    user_id=user_id,
                    change=message.get("change", {})
                )
            
            elif message_type == "comment":
                # User added a comment
                await collaboration_manager.handle_comment(
                    document_id=document_id,
                    user_id=user_id,
                    comment=message.get("comment", {})
                )
            
            elif message_type == "mention":
                # User @mentioned someone
                await collaboration_manager.handle_mention(
                    document_id=document_id,
                    user_id=user_id,
                    mentioned_user_id=message.get("mentioned_user_id"),
                    context=message.get("context", {})
                )
            
            elif message_type == "ping":
                # Heartbeat
                await websocket.send_json({"type": "pong"})
    
    except WebSocketDisconnect:
        # User disconnected
        await collaboration_manager.disconnect(document_id, user_id)
    
    except Exception as e:
        print(f"WebSocket error: {e}")
        await collaboration_manager.disconnect(document_id, user_id)


@router.websocket("/ws/notifications/{user_id}")
async def websocket_notifications(
    websocket: WebSocket,
    user_id: str,
    organization_id: str = Query(...)
):
    """
    WebSocket endpoint for real-time notifications
    
    Sends notifications for:
    - New opportunities matching criteria
    - Proposal status changes
    - Team mentions
    - Deadline reminders
    - System alerts
    """
    await websocket.accept()
    
    try:
        while True:
            # Keep connection alive
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
    
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"Notification WebSocket error: {e}")

