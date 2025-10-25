"""
Real-time Collaboration WebSocket API
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
import json

from app.core.database import get_db
from app.services.realtime_service import connection_manager
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/v1/realtime", tags=["realtime"])


@router.websocket("/proposals/{proposal_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    proposal_id: str,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint for real-time proposal collaboration
    
    Query params:
        token: JWT access token for authentication
    """
    
    # Authenticate user from token
    try:
        # Decode JWT token
        from jose import jwt
        from app.config import settings
        
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"]
        )
        user_id = payload.get("sub")
        user_email = payload.get("email")
        
        if not user_id:
            await websocket.close(code=1008, reason="Invalid token")
            return
        
        # Get user from database
        user = AuthService.get_user_by_email(db, user_email)
        if not user:
            await websocket.close(code=1008, reason="User not found")
            return
        
        user_name = user.full_name
    
    except Exception as e:
        await websocket.close(code=1008, reason=f"Authentication failed: {str(e)}")
        return
    
    # Connect user to proposal
    await connection_manager.connect(websocket, proposal_id, user_id, user_name)
    
    try:
        # Listen for messages
        while True:
            # Receive message
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle message
            await connection_manager.handle_message(proposal_id, user_id, message)
    
    except WebSocketDisconnect:
        # User disconnected
        connection_manager.disconnect(proposal_id, user_id)
        
        # Notify others
        await connection_manager.broadcast_to_proposal(
            proposal_id,
            {
                'type': 'user_left',
                'user_id': user_id,
                'user_name': user_name
            }
        )
    
    except Exception as e:
        print(f"WebSocket error for user {user_id}: {str(e)}")
        connection_manager.disconnect(proposal_id, user_id)


@router.get("/proposals/{proposal_id}/users")
async def get_active_users(proposal_id: str):
    """
    Get list of currently active users in a proposal
    """
    users = connection_manager.get_active_users(proposal_id)
    
    return {
        'proposal_id': proposal_id,
        'active_users': users,
        'count': len(users)
    }

