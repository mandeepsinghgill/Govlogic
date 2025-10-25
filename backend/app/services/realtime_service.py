"""
Real-time Collaboration Service - WebSocket management
"""
from typing import Dict, Set, Optional
from fastapi import WebSocket
from datetime import datetime
import json


class ConnectionManager:
    """
    Manage WebSocket connections for real-time collaboration
    """
    
    def __init__(self):
        # proposal_id -> {user_id -> websocket}
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
        
        # proposal_id -> {user_id -> cursor_position}
        self.cursor_positions: Dict[str, Dict[str, dict]] = {}
        
        # proposal_id -> {section_id -> content}
        self.document_state: Dict[str, Dict[str, str]] = {}
    
    async def connect(self, websocket: WebSocket, proposal_id: str, user_id: str, user_name: str):
        """
        Connect a user to a proposal collaboration session
        """
        await websocket.accept()
        
        # Initialize proposal room if needed
        if proposal_id not in self.active_connections:
            self.active_connections[proposal_id] = {}
            self.cursor_positions[proposal_id] = {}
            self.document_state[proposal_id] = {}
        
        # Add connection
        self.active_connections[proposal_id][user_id] = websocket
        self.cursor_positions[proposal_id][user_id] = {
            'user_id': user_id,
            'user_name': user_name,
            'position': 0,
            'section_id': None
        }
        
        # Notify others of new user
        await self.broadcast_to_proposal(
            proposal_id,
            {
                'type': 'user_joined',
                'user_id': user_id,
                'user_name': user_name,
                'timestamp': datetime.now().isoformat()
            },
            exclude_user=user_id
        )
        
        # Send current state to new user
        await websocket.send_json({
            'type': 'initial_state',
            'active_users': [
                {'user_id': uid, **self.cursor_positions[proposal_id][uid]}
                for uid in self.active_connections[proposal_id].keys()
                if uid != user_id
            ],
            'document_state': self.document_state.get(proposal_id, {})
        })
    
    def disconnect(self, proposal_id: str, user_id: str):
        """
        Disconnect a user from a proposal
        """
        if proposal_id in self.active_connections:
            if user_id in self.active_connections[proposal_id]:
                del self.active_connections[proposal_id][user_id]
            
            if user_id in self.cursor_positions[proposal_id]:
                del self.cursor_positions[proposal_id][user_id]
            
            # Clean up empty rooms
            if not self.active_connections[proposal_id]:
                del self.active_connections[proposal_id]
                del self.cursor_positions[proposal_id]
                if proposal_id in self.document_state:
                    del self.document_state[proposal_id]
    
    async def handle_message(self, proposal_id: str, user_id: str, message: dict):
        """
        Handle incoming WebSocket message
        """
        message_type = message.get('type')
        
        if message_type == 'cursor_move':
            # Update cursor position
            if proposal_id in self.cursor_positions and user_id in self.cursor_positions[proposal_id]:
                self.cursor_positions[proposal_id][user_id].update({
                    'position': message.get('position', 0),
                    'section_id': message.get('section_id')
                })
            
            # Broadcast to others
            await self.broadcast_to_proposal(
                proposal_id,
                {
                    'type': 'cursor_update',
                    'user_id': user_id,
                    'position': message.get('position'),
                    'section_id': message.get('section_id')
                },
                exclude_user=user_id
            )
        
        elif message_type == 'content_update':
            # Update document state
            section_id = message.get('section_id')
            content = message.get('content', '')
            
            if proposal_id not in self.document_state:
                self.document_state[proposal_id] = {}
            
            self.document_state[proposal_id][section_id] = content
            
            # Broadcast to others
            await self.broadcast_to_proposal(
                proposal_id,
                {
                    'type': 'content_changed',
                    'user_id': user_id,
                    'section_id': section_id,
                    'content': content,
                    'timestamp': datetime.now().isoformat()
                },
                exclude_user=user_id
            )
        
        elif message_type == 'comment':
            # Broadcast comment to all
            await self.broadcast_to_proposal(
                proposal_id,
                {
                    'type': 'new_comment',
                    'user_id': user_id,
                    'section_id': message.get('section_id'),
                    'comment_text': message.get('comment_text'),
                    'timestamp': datetime.now().isoformat()
                }
            )
        
        elif message_type == 'selection':
            # Broadcast text selection
            await self.broadcast_to_proposal(
                proposal_id,
                {
                    'type': 'selection_update',
                    'user_id': user_id,
                    'section_id': message.get('section_id'),
                    'start': message.get('start'),
                    'end': message.get('end')
                },
                exclude_user=user_id
            )
    
    async def broadcast_to_proposal(
        self,
        proposal_id: str,
        message: dict,
        exclude_user: Optional[str] = None
    ):
        """
        Broadcast message to all users in a proposal
        """
        if proposal_id not in self.active_connections:
            return
        
        for user_id, websocket in self.active_connections[proposal_id].items():
            if exclude_user and user_id == exclude_user:
                continue
            
            try:
                await websocket.send_json(message)
            except Exception as e:
                print(f"Error sending to {user_id}: {str(e)}")
                # Connection is broken, will be cleaned up on next disconnect
    
    async def send_personal_message(self, proposal_id: str, user_id: str, message: dict):
        """
        Send message to a specific user
        """
        if proposal_id in self.active_connections:
            if user_id in self.active_connections[proposal_id]:
                try:
                    await self.active_connections[proposal_id][user_id].send_json(message)
                except Exception as e:
                    print(f"Error sending personal message to {user_id}: {str(e)}")
    
    def get_active_users(self, proposal_id: str) -> list:
        """
        Get list of active users in a proposal
        """
        if proposal_id not in self.active_connections:
            return []
        
        return [
            {
                'user_id': user_id,
                **self.cursor_positions[proposal_id].get(user_id, {})
            }
            for user_id in self.active_connections[proposal_id].keys()
        ]


# Global instance
connection_manager = ConnectionManager()

