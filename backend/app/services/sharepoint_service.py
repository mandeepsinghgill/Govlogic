"""
SharePoint Online Integration Service
Supports document sync, export, and collaboration with SharePoint
"""
import os
from typing import Dict, List, Optional, Any, BinaryIO
from io import BytesIO
import logging

logger = logging.getLogger(__name__)

try:
    from office365.sharepoint.client_context import ClientContext
    from office365.runtime.auth.authentication_context import AuthenticationContext
    from office365.sharepoint.files.file import File
    OFFICE365_AVAILABLE = True
except ImportError:
    OFFICE365_AVAILABLE = False
    logger.warning("Office365-REST-Python-Client not installed. SharePoint features will be limited.")


class SharePointService:
    """
    SharePoint Online integration service
    Supports document sync, export, and collaboration
    """
    
    def __init__(self, tenant_url: Optional[str] = None, client_id: Optional[str] = None, client_secret: Optional[str] = None):
        self.tenant_url = tenant_url or os.getenv("SHAREPOINT_TENANT_URL")
        self.client_id = client_id or os.getenv("SHAREPOINT_CLIENT_ID")
        self.client_secret = client_secret or os.getenv("SHAREPOINT_CLIENT_SECRET")
        self.ctx = None
        
        if not OFFICE365_AVAILABLE:
            logger.warning("SharePoint integration requires Office365-REST-Python-Client library")
    
    def is_configured(self) -> bool:
        """Check if SharePoint is properly configured"""
        return all([self.tenant_url, self.client_id, self.client_secret, OFFICE365_AVAILABLE])
    
    def authenticate(self) -> bool:
        """Authenticate with SharePoint using app-only authentication"""
        if not self.is_configured():
            logger.error("SharePoint not properly configured")
            return False
        
        try:
            auth_ctx = AuthenticationContext(self.tenant_url)
            auth_ctx.acquire_token_for_app(
                client_id=self.client_id,
                client_secret=self.client_secret
            )
            self.ctx = ClientContext(self.tenant_url, auth_ctx)
            return True
        except Exception as e:
            logger.error(f"SharePoint authentication failed: {e}")
            return False
    
    def upload_document(
        self,
        file_content: bytes,
        filename: str,
        folder_path: str,
        site_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Upload document to SharePoint
        
        Args:
            file_content: File content as bytes
            filename: Name of the file
            folder_path: SharePoint folder path (e.g., "Shared Documents/Proposals")
            site_url: Optional site URL (defaults to root site)
        
        Returns:
            Dict with file URL, ID, and metadata
        """
        if not self.ctx:
            if not self.authenticate():
                raise Exception("Failed to authenticate with SharePoint")
        
        try:
            target_site = self.ctx if not site_url else ClientContext(site_url, self.ctx.auth_context)
            target_folder = target_site.web.get_folder_by_server_relative_url(folder_path)
            
            # Convert bytes to file-like object
            file_stream = BytesIO(file_content)
            
            # Upload file
            uploaded_file = target_folder.upload_file(filename, file_stream).execute_query()
            
            return {
                "file_url": uploaded_file.properties["ServerRelativeUrl"],
                "file_id": uploaded_file.properties["UniqueId"],
                "filename": filename,
                "size": uploaded_file.properties["Length"],
                "modified": str(uploaded_file.properties["TimeLastModified"]),
                "success": True
            }
        except Exception as e:
            logger.error(f"Failed to upload document to SharePoint: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def sync_proposal_to_sharepoint(
        self,
        proposal_id: str,
        proposal_data: Dict[str, Any],
        folder_path: str = "Shared Documents/Proposals"
    ) -> Dict[str, Any]:
        """
        Sync proposal document to SharePoint
        
        This method:
        1. Exports proposal to DOCX
        2. Uploads to SharePoint
        3. Creates metadata list item (if list exists)
        4. Returns SharePoint URL
        """
        try:
            # Import here to avoid circular dependencies
            from app.services.document_export_service import document_export_service
            
            # Export proposal to DOCX
            docx_content = document_export_service.export_to_word(proposal_data)
            filename = f"{proposal_data.get('title', 'proposal').replace(' ', '_')}_{proposal_id}.docx"
            
            # Upload to SharePoint
            upload_result = self.upload_document(
                file_content=docx_content,
                filename=filename,
                folder_path=folder_path
            )
            
            if not upload_result.get("success"):
                return upload_result
            
            # Create metadata in SharePoint list (if list exists)
            try:
                list_item = self._create_list_item(
                    list_name="Proposals",
                    data={
                        "Title": proposal_data.get('title', 'Untitled Proposal'),
                        "ProposalID": proposal_id,
                        "RFPNumber": proposal_data.get('rfp_number', ''),
                        "Status": proposal_data.get('status', 'Draft'),
                        "FileRef": upload_result["file_url"]
                    }
                )
                upload_result["list_item_id"] = list_item.properties["Id"]
            except Exception as e:
                logger.warning(f"Could not create list item: {e}")
                # Continue even if list creation fails
            
            upload_result["sharepoint_url"] = f"{self.tenant_url}{upload_result['file_url']}"
            return upload_result
            
        except Exception as e:
            logger.error(f"Failed to sync proposal to SharePoint: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def create_folder(self, folder_path: str, site_url: Optional[str] = None) -> bool:
        """Create folder structure in SharePoint"""
        if not self.ctx:
            if not self.authenticate():
                return False
        
        try:
            target_site = self.ctx if not site_url else ClientContext(site_url, self.ctx.auth_context)
            
            # Split path and create folders recursively
            parts = folder_path.split('/')
            current_path = parts[0]
            
            for part in parts[1:]:
                folder = target_site.web.get_folder_by_server_relative_url(current_path)
                new_folder = folder.folders.add(part).execute_query()
                current_path = f"{current_path}/{part}"
            
            return True
        except Exception as e:
            logger.error(f"Failed to create folder: {e}")
            return False
    
    def get_document_versions(
        self,
        file_url: str
    ) -> List[Dict[str, Any]]:
        """Get version history of a SharePoint document"""
        if not self.ctx:
            if not self.authenticate():
                return []
        
        try:
            file = self.ctx.web.get_file_by_server_relative_url(file_url)
            versions = file.versions.get().execute_query()
            
            return [
                {
                    "version": v.properties["VersionLabel"],
                    "modified": str(v.properties["Modified"]),
                    "modified_by": v.properties["ModifiedBy"].get("Name", "Unknown")
                }
                for v in versions
            ]
        except Exception as e:
            logger.error(f"Failed to get document versions: {e}")
            return []
    
    def list_folders(self, folder_path: str = "Shared Documents") -> List[str]:
        """List folders in SharePoint"""
        if not self.ctx:
            if not self.authenticate():
                return []
        
        try:
            folder = self.ctx.web.get_folder_by_server_relative_url(folder_path)
            folders = folder.folders.get().execute_query()
            
            return [f.properties["Name"] for f in folders]
        except Exception as e:
            logger.error(f"Failed to list folders: {e}")
            return []
    
    def _create_list_item(
        self,
        list_name: str,
        data: Dict[str, Any]
    ) -> Any:
        """Create list item in SharePoint"""
        try:
            target_list = self.ctx.web.lists.get_by_title(list_name)
            item_properties = target_list.add_item(data).execute_query()
            return item_properties
        except Exception as e:
            logger.warning(f"List '{list_name}' may not exist: {e}")
            raise

# Singleton instance
sharepoint_service = SharePointService()

