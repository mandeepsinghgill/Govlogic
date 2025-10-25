"""
GovBot AI Chat Assistant API
"""
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.services.govbot_service import GovBotService

router = APIRouter(prefix="/api/v1/govbot", tags=["govbot"])


class ChatMessage(BaseModel):
    message: str
    context: Optional[dict] = None


@router.post("/chat")
async def chat(
    request: ChatMessage,
    organization_id: str,
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Send a message to GovBot
    
    Args:
        message: User's message
        context: Current page context
            - page: "opportunity_detail", "proposal_writing", etc.
            - opportunity_id: Current opportunity ID
            - proposal_id: Current proposal ID
            - etc.
    """
    
    govbot = GovBotService(db, organization_id, user_id)
    
    response = await govbot.chat(
        message=request.message,
        context=request.context
    )
    
    return response


@router.websocket("/ws/{organization_id}/{user_id}")
async def websocket_chat(
    websocket: WebSocket,
    organization_id: str,
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint for real-time chat with GovBot
    """
    await websocket.accept()
    
    govbot = GovBotService(db, organization_id, user_id)
    
    try:
        while True:
            # Receive message
            data = await websocket.receive_json()
            
            message = data.get("message")
            context = data.get("context")
            
            if not message:
                continue
            
            # Process with GovBot
            response = await govbot.chat(message=message, context=context)
            
            # Send response
            await websocket.send_json(response)
    
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"GovBot WebSocket error: {e}")


@router.post("/clear-history")
async def clear_history(
    organization_id: str,
    user_id: str,
    db: Session = Depends(get_db)
):
    """Clear conversation history"""
    
    govbot = GovBotService(db, organization_id, user_id)
    govbot.clear_history()
    
    return {"message": "History cleared"}

