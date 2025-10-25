"""
Rich Text Editor Service - Full-featured document editing with collaboration
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
import json
import asyncio
from collections import defaultdict
import hashlib


class DocumentVersion:
    """Represents a version of a document"""
    
    def __init__(self, content: str, user_id: str, user_name: str):
        self.version_id = self._generate_version_id(content)
        self.content = content
        self.user_id = user_id
        self.user_name = user_name
        self.created_at = datetime.utcnow()
        self.metadata = {}
    
    def _generate_version_id(self, content: str) -> str:
        """Generate unique version ID"""
        timestamp = datetime.utcnow().isoformat()
        hash_input = f"{content}{timestamp}".encode()
        return hashlib.sha256(hash_input).hexdigest()[:16]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'version_id': self.version_id,
            'content': self.content,
            'user_id': self.user_id,
            'user_name': self.user_name,
            'created_at': self.created_at.isoformat(),
            'metadata': self.metadata
        }


class DocumentDraft:
    """Represents a draft of a document"""
    
    def __init__(self, document_id: str, user_id: str):
        self.draft_id = f"draft_{document_id}_{user_id}_{datetime.utcnow().timestamp()}"
        self.document_id = document_id
        self.user_id = user_id
        self.content = ""
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        self.auto_saved = False
    
    def update(self, content: str):
        """Update draft content"""
        self.content = content
        self.updated_at = datetime.utcnow()
        self.auto_saved = True
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'draft_id': self.draft_id,
            'document_id': self.document_id,
            'user_id': self.user_id,
            'content': self.content,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'auto_saved': self.auto_saved
        }


class DocumentPermission:
    """Document permission management"""
    
    PERMISSION_LEVELS = {
        'view': 1,
        'comment': 2,
        'edit': 3,
        'admin': 4
    }
    
    def __init__(self, document_id: str):
        self.document_id = document_id
        self.permissions: Dict[str, str] = {}  # user_id -> permission_level
        self.public_access: Optional[str] = None
    
    def grant_permission(self, user_id: str, level: str):
        """Grant permission to user"""
        if level not in self.PERMISSION_LEVELS:
            raise ValueError(f"Invalid permission level: {level}")
        self.permissions[user_id] = level
    
    def revoke_permission(self, user_id: str):
        """Revoke user permission"""
        if user_id in self.permissions:
            del self.permissions[user_id]
    
    def has_permission(self, user_id: str, required_level: str) -> bool:
        """Check if user has required permission"""
        if user_id not in self.permissions:
            return False
        
        user_level = self.permissions[user_id]
        return self.PERMISSION_LEVELS[user_level] >= self.PERMISSION_LEVELS[required_level]
    
    def get_permission(self, user_id: str) -> Optional[str]:
        """Get user's permission level"""
        return self.permissions.get(user_id)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'document_id': self.document_id,
            'permissions': self.permissions,
            'public_access': self.public_access
        }


class RichEditorService:
    """
    Full-featured rich text editor service with:
    - Auto-save functionality
    - Draft management
    - Version history with rollback
    - Permission levels (view, comment, edit, admin)
    - Email invitations
    - Real-time presence indicators
    """
    
    def __init__(self):
        # Document storage
        self.documents: Dict[str, Dict[str, Any]] = {}
        
        # Version history: document_id -> List[DocumentVersion]
        self.version_history: Dict[str, List[DocumentVersion]] = defaultdict(list)
        
        # Drafts: document_id -> Dict[user_id, DocumentDraft]
        self.drafts: Dict[str, Dict[str, DocumentDraft]] = defaultdict(dict)
        
        # Permissions: document_id -> DocumentPermission
        self.permissions: Dict[str, DocumentPermission] = {}
        
        # Auto-save queue
        self.auto_save_queue: Dict[str, Dict] = {}
        
        # Active editors: document_id -> Set[user_id]
        self.active_editors: Dict[str, set] = defaultdict(set)
    
    async def create_document(
        self,
        document_id: str,
        title: str,
        content: str,
        owner_id: str,
        owner_name: str,
        document_type: str = 'proposal'
    ) -> Dict[str, Any]:
        """
        Create a new document
        """
        self.documents[document_id] = {
            'document_id': document_id,
            'title': title,
            'content': content,
            'owner_id': owner_id,
            'owner_name': owner_name,
            'document_type': document_type,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        # Create initial version
        version = DocumentVersion(content, owner_id, owner_name)
        self.version_history[document_id].append(version)
        
        # Set up permissions
        permissions = DocumentPermission(document_id)
        permissions.grant_permission(owner_id, 'admin')
        self.permissions[document_id] = permissions
        
        return {
            'status': 'created',
            'document': self.documents[document_id],
            'version_id': version.version_id
        }
    
    async def auto_save(
        self,
        document_id: str,
        user_id: str,
        user_name: str,
        content: str,
        save_as_draft: bool = True
    ) -> Dict[str, Any]:
        """
        Auto-save document content
        """
        if document_id not in self.documents:
            return {'status': 'error', 'message': 'Document not found'}
        
        # Check permission
        if not self.permissions[document_id].has_permission(user_id, 'edit'):
            return {'status': 'error', 'message': 'Insufficient permissions'}
        
        if save_as_draft:
            # Save as draft
            if user_id not in self.drafts[document_id]:
                self.drafts[document_id][user_id] = DocumentDraft(document_id, user_id)
            
            draft = self.drafts[document_id][user_id]
            draft.update(content)
            
            return {
                'status': 'auto_saved',
                'draft_id': draft.draft_id,
                'timestamp': draft.updated_at.isoformat()
            }
        else:
            # Save to document
            self.documents[document_id]['content'] = content
            self.documents[document_id]['updated_at'] = datetime.utcnow().isoformat()
            
            # Create version
            version = DocumentVersion(content, user_id, user_name)
            self.version_history[document_id].append(version)
            
            return {
                'status': 'saved',
                'version_id': version.version_id,
                'timestamp': version.created_at.isoformat()
            }
    
    async def save_version(
        self,
        document_id: str,
        user_id: str,
        user_name: str,
        content: str,
        version_note: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Save a new version of the document
        """
        if document_id not in self.documents:
            return {'status': 'error', 'message': 'Document not found'}
        
        # Check permission
        if not self.permissions[document_id].has_permission(user_id, 'edit'):
            return {'status': 'error', 'message': 'Insufficient permissions'}
        
        # Update document
        self.documents[document_id]['content'] = content
        self.documents[document_id]['updated_at'] = datetime.utcnow().isoformat()
        
        # Create version
        version = DocumentVersion(content, user_id, user_name)
        if version_note:
            version.metadata['note'] = version_note
        
        self.version_history[document_id].append(version)
        
        # Clear draft if exists
        if user_id in self.drafts[document_id]:
            del self.drafts[document_id][user_id]
        
        return {
            'status': 'version_saved',
            'version_id': version.version_id,
            'version_number': len(self.version_history[document_id]),
            'timestamp': version.created_at.isoformat()
        }
    
    async def get_version_history(
        self,
        document_id: str,
        user_id: str,
        limit: int = 50
    ) -> Dict[str, Any]:
        """
        Get version history for document
        """
        if document_id not in self.documents:
            return {'status': 'error', 'message': 'Document not found'}
        
        # Check permission
        if not self.permissions[document_id].has_permission(user_id, 'view'):
            return {'status': 'error', 'message': 'Insufficient permissions'}
        
        versions = self.version_history[document_id][-limit:]
        
        return {
            'status': 'success',
            'document_id': document_id,
            'total_versions': len(self.version_history[document_id]),
            'versions': [v.to_dict() for v in reversed(versions)]
        }
    
    async def rollback_to_version(
        self,
        document_id: str,
        version_id: str,
        user_id: str,
        user_name: str
    ) -> Dict[str, Any]:
        """
        Rollback document to a specific version
        """
        if document_id not in self.documents:
            return {'status': 'error', 'message': 'Document not found'}
        
        # Check permission
        if not self.permissions[document_id].has_permission(user_id, 'edit'):
            return {'status': 'error', 'message': 'Insufficient permissions'}
        
        # Find version
        target_version = None
        for version in self.version_history[document_id]:
            if version.version_id == version_id:
                target_version = version
                break
        
        if not target_version:
            return {'status': 'error', 'message': 'Version not found'}
        
        # Rollback
        self.documents[document_id]['content'] = target_version.content
        self.documents[document_id]['updated_at'] = datetime.utcnow().isoformat()
        
        # Create new version for rollback
        new_version = DocumentVersion(target_version.content, user_id, user_name)
        new_version.metadata['rollback_from'] = version_id
        self.version_history[document_id].append(new_version)
        
        return {
            'status': 'rolled_back',
            'version_id': new_version.version_id,
            'rolled_back_to': version_id,
            'timestamp': new_version.created_at.isoformat()
        }
    
    async def share_document(
        self,
        document_id: str,
        inviter_id: str,
        invitee_email: str,
        permission_level: str,
        message: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Share document via email invitation
        """
        if document_id not in self.documents:
            return {'status': 'error', 'message': 'Document not found'}
        
        # Check permission (must be admin to share)
        if not self.permissions[document_id].has_permission(inviter_id, 'admin'):
            return {'status': 'error', 'message': 'Insufficient permissions'}
        
        # Validate permission level
        if permission_level not in DocumentPermission.PERMISSION_LEVELS:
            return {'status': 'error', 'message': 'Invalid permission level'}
        
        # In production, send email invitation
        invitation = {
            'document_id': document_id,
            'document_title': self.documents[document_id]['title'],
            'inviter_id': inviter_id,
            'invitee_email': invitee_email,
            'permission_level': permission_level,
            'message': message,
            'invitation_link': f"/documents/{document_id}/accept-invite",
            'created_at': datetime.utcnow().isoformat()
        }
        
        return {
            'status': 'invitation_sent',
            'invitation': invitation
        }
    
    async def accept_invitation(
        self,
        document_id: str,
        user_id: str,
        permission_level: str
    ) -> Dict[str, Any]:
        """
        Accept document invitation
        """
        if document_id not in self.documents:
            return {'status': 'error', 'message': 'Document not found'}
        
        # Grant permission
        self.permissions[document_id].grant_permission(user_id, permission_level)
        
        return {
            'status': 'invitation_accepted',
            'document_id': document_id,
            'permission_level': permission_level
        }
    
    async def update_permission(
        self,
        document_id: str,
        admin_id: str,
        target_user_id: str,
        new_permission: str
    ) -> Dict[str, Any]:
        """
        Update user permission
        """
        if document_id not in self.documents:
            return {'status': 'error', 'message': 'Document not found'}
        
        # Check admin permission
        if not self.permissions[document_id].has_permission(admin_id, 'admin'):
            return {'status': 'error', 'message': 'Insufficient permissions'}
        
        # Update permission
        self.permissions[document_id].grant_permission(target_user_id, new_permission)
        
        return {
            'status': 'permission_updated',
            'user_id': target_user_id,
            'new_permission': new_permission
        }
    
    async def get_document_permissions(
        self,
        document_id: str,
        user_id: str
    ) -> Dict[str, Any]:
        """
        Get document permissions
        """
        if document_id not in self.documents:
            return {'status': 'error', 'message': 'Document not found'}
        
        # Check permission
        if not self.permissions[document_id].has_permission(user_id, 'view'):
            return {'status': 'error', 'message': 'Insufficient permissions'}
        
        return {
            'status': 'success',
            'permissions': self.permissions[document_id].to_dict()
        }
    
    async def track_active_editor(
        self,
        document_id: str,
        user_id: str,
        is_active: bool
    ):
        """
        Track active editors for presence indicators
        """
        if is_active:
            self.active_editors[document_id].add(user_id)
        else:
            self.active_editors[document_id].discard(user_id)
    
    async def get_active_editors(self, document_id: str) -> List[str]:
        """
        Get list of active editors
        """
        return list(self.active_editors[document_id])


# Global instance
rich_editor_service = RichEditorService()

