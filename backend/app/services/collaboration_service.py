"""
Real-time collaboration service
"""
from typing import Dict, List, Set, Optional
from datetime import datetime
import json
from fastapi import WebSocket
from collections import defaultdict


class CollaborationSession:
    """Represents a collaboration session on a document"""
    
    def __init__(self, document_id: str, document_type: str):
        self.document_id = document_id
        self.document_type = document_type  # proposal, capture_plan, etc.
        self.users: Dict[str, Dict] = {}  # user_id -> user_info
        self.cursors: Dict[str, Dict] = {}  # user_id -> cursor_position
        self.selections: Dict[str, Dict] = {}  # user_id -> selection
        self.active_editors: Set[str] = set()
        self.created_at = datetime.utcnow()
        self.last_activity = datetime.utcnow()


class CollaborationManager:
    """Manage real-time collaboration sessions"""
    
    def __init__(self):
        # document_id -> CollaborationSession
        self.sessions: Dict[str, CollaborationSession] = {}
        
        # user_id -> Set[document_id] (documents user is editing)
        self.user_documents: Dict[str, Set[str]] = defaultdict(set)
        
        # (document_id, user_id) -> WebSocket
        self.connections: Dict[tuple, WebSocket] = {}
        
        # document_id -> List[change_events]
        self.change_history: Dict[str, List[Dict]] = defaultdict(list)
    
    async def connect(
        self,
        websocket: WebSocket,
        document_id: str,
        document_type: str,
        user_id: str,
        user_name: str,
        user_color: str = "#3B82F6"
    ):
        """Connect a user to a document collaboration session"""
        await websocket.accept()
        
        # Create session if doesn't exist
        if document_id not in self.sessions:
            self.sessions[document_id] = CollaborationSession(document_id, document_type)
        
        session = self.sessions[document_id]
        
        # Add user to session
        session.users[user_id] = {
            "user_id": user_id,
            "user_name": user_name,
            "user_color": user_color,
            "joined_at": datetime.utcnow().isoformat()
        }
        
        # Store connection
        self.connections[(document_id, user_id)] = websocket
        self.user_documents[user_id].add(document_id)
        
        # Notify other users
        await self.broadcast_to_document(
            document_id,
            {
                "type": "user_joined",
                "user": session.users[user_id],
                "active_users": list(session.users.values())
            },
            exclude_user=user_id
        )
        
        # Send current state to new user
        await websocket.send_json({
            "type": "session_state",
            "document_id": document_id,
            "active_users": list(session.users.values()),
            "cursors": session.cursors,
            "selections": session.selections
        })
    
    async def disconnect(self, document_id: str, user_id: str):
        """Disconnect a user from a collaboration session"""
        if document_id not in self.sessions:
            return
        
        session = self.sessions[document_id]
        
        # Remove user
        if user_id in session.users:
            del session.users[user_id]
        
        if user_id in session.cursors:
            del session.cursors[user_id]
        
        if user_id in session.selections:
            del session.selections[user_id]
        
        session.active_editors.discard(user_id)
        
        # Remove connection
        if (document_id, user_id) in self.connections:
            del self.connections[(document_id, user_id)]
        
        if user_id in self.user_documents:
            self.user_documents[user_id].discard(document_id)
        
        # Notify other users
        await self.broadcast_to_document(
            document_id,
            {
                "type": "user_left",
                "user_id": user_id,
                "active_users": list(session.users.values())
            }
        )
        
        # Clean up empty sessions
        if not session.users:
            del self.sessions[document_id]
    
    async def handle_cursor_move(
        self,
        document_id: str,
        user_id: str,
        cursor_position: Dict
    ):
        """Handle cursor position update"""
        if document_id not in self.sessions:
            return
        
        session = self.sessions[document_id]
        session.cursors[user_id] = {
            **cursor_position,
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Broadcast to other users
        await self.broadcast_to_document(
            document_id,
            {
                "type": "cursor_move",
                "user_id": user_id,
                "cursor": session.cursors[user_id]
            },
            exclude_user=user_id
        )
    
    async def handle_selection_change(
        self,
        document_id: str,
        user_id: str,
        selection: Dict
    ):
        """Handle text selection update"""
        if document_id not in self.sessions:
            return
        
        session = self.sessions[document_id]
        session.selections[user_id] = {
            **selection,
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Broadcast to other users
        await self.broadcast_to_document(
            document_id,
            {
                "type": "selection_change",
                "user_id": user_id,
                "selection": session.selections[user_id]
            },
            exclude_user=user_id
        )
    
    async def handle_content_change(
        self,
        document_id: str,
        user_id: str,
        change: Dict
    ):
        """Handle content change (edit)"""
        if document_id not in self.sessions:
            return
        
        session = self.sessions[document_id]
        session.last_activity = datetime.utcnow()
        
        # Add to change history
        change_event = {
            **change,
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        self.change_history[document_id].append(change_event)
        
        # Broadcast to other users
        await self.broadcast_to_document(
            document_id,
            {
                "type": "content_change",
                "user_id": user_id,
                "change": change
            },
            exclude_user=user_id
        )
    
    async def handle_comment(
        self,
        document_id: str,
        user_id: str,
        comment: Dict
    ):
        """Handle comment/annotation"""
        if document_id not in self.sessions:
            return
        
        # Broadcast comment to all users
        await self.broadcast_to_document(
            document_id,
            {
                "type": "comment_added",
                "user_id": user_id,
                "comment": comment
            }
        )
    
    async def handle_mention(
        self,
        document_id: str,
        user_id: str,
        mentioned_user_id: str,
        context: Dict
    ):
        """Handle @mention notification"""
        # Send notification to mentioned user
        if (document_id, mentioned_user_id) in self.connections:
            websocket = self.connections[(document_id, mentioned_user_id)]
            await websocket.send_json({
                "type": "mention",
                "from_user_id": user_id,
                "context": context
            })
    
    async def broadcast_to_document(
        self,
        document_id: str,
        message: Dict,
        exclude_user: Optional[str] = None
    ):
        """Broadcast message to all users in a document session"""
        if document_id not in self.sessions:
            return
        
        session = self.sessions[document_id]
        
        for user_id in session.users.keys():
            if user_id == exclude_user:
                continue
            
            if (document_id, user_id) in self.connections:
                websocket = self.connections[(document_id, user_id)]
                try:
                    await websocket.send_json(message)
                except Exception as e:
                    print(f"Error sending to {user_id}: {e}")
    
    def get_active_users(self, document_id: str) -> List[Dict]:
        """Get list of active users in a document"""
        if document_id not in self.sessions:
            return []
        
        session = self.sessions[document_id]
        return list(session.users.values())
    
    def get_change_history(
        self,
        document_id: str,
        since: Optional[datetime] = None
    ) -> List[Dict]:
        """Get change history for a document"""
        if document_id not in self.change_history:
            return []
        
        changes = self.change_history[document_id]
        
        if since:
            changes = [
                c for c in changes
                if datetime.fromisoformat(c["timestamp"]) > since
            ]
        
        return changes


# Global collaboration manager instance
collaboration_manager = CollaborationManager()

