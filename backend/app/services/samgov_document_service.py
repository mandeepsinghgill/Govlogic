"""
Advanced SAM.gov Document Download Service
Automatically fetches RFP documents, amendments, and attachments
"""
from typing import List, Dict, Optional
import requests
import os
from datetime import datetime
from pathlib import Path
import hashlib
from sqlalchemy.orm import Session

from app.models.opportunity import Opportunity


class SAMGovDocumentService:
    """Auto-download documents from SAM.gov"""
    
    def __init__(self, db: Session):
        self.db = db
        self.api_key = os.getenv("SAM_GOV_API_KEY")
        self.base_url = "https://api.sam.gov/opportunities/v2"
        self.download_dir = Path("/home/ubuntu/GovSure/data/rfp_documents")
        self.download_dir.mkdir(parents=True, exist_ok=True)
    
    def fetch_opportunity_documents(
        self,
        solicitation_number: str,
        opportunity_id: Optional[str] = None
    ) -> Dict:
        """
        Fetch all documents for an opportunity from SAM.gov
        
        Args:
            solicitation_number: Solicitation number (e.g., "W56KGU-25-R-0089")
            opportunity_id: Optional internal opportunity ID
            
        Returns:
            {
                "documents": List[Dict],
                "download_status": str,
                "last_checked": datetime,
                "next_check": datetime
            }
        """
        
        if not self.api_key:
            return {
                "error": "SAM.gov API key not configured",
                "documents": []
            }
        
        try:
            # Search for opportunity by solicitation number
            search_url = f"{self.base_url}/search"
            params = {
                "api_key": self.api_key,
                "solicitationNumber": solicitation_number,
                "limit": 1
            }
            
            response = requests.get(search_url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if not data.get("opportunitiesData"):
                return {
                    "error": "Opportunity not found on SAM.gov",
                    "documents": []
                }
            
            opp_data = data["opportunitiesData"][0]
            
            # Extract document information
            documents = self._extract_documents(opp_data, solicitation_number)
            
            # Download documents
            downloaded_docs = []
            for doc in documents:
                downloaded = self._download_document(doc, solicitation_number)
                if downloaded:
                    downloaded_docs.append(downloaded)
            
            return {
                "documents": downloaded_docs,
                "download_status": "success",
                "total_documents": len(downloaded_docs),
                "total_size_mb": sum(d.get("size_mb", 0) for d in downloaded_docs),
                "last_checked": datetime.utcnow().isoformat(),
                "next_check": self._calculate_next_check().isoformat()
            }
        
        except requests.exceptions.RequestException as e:
            return {
                "error": f"SAM.gov API error: {str(e)}",
                "documents": []
            }
        except Exception as e:
            return {
                "error": f"Unexpected error: {str(e)}",
                "documents": []
            }
    
    def _extract_documents(self, opp_data: Dict, solicitation_number: str) -> List[Dict]:
        """Extract document metadata from opportunity data"""
        
        documents = []
        
        # Main solicitation document
        if opp_data.get("description"):
            documents.append({
                "type": "solicitation",
                "name": "Combined Synopsis/Solicitation",
                "description": "Main solicitation document",
                "url": opp_data.get("resourceLinks", [{}])[0].get("url") if opp_data.get("resourceLinks") else None,
                "posted_date": opp_data.get("postedDate"),
                "is_amendment": False
            })
        
        # Attachments
        if opp_data.get("attachments"):
            for attachment in opp_data["attachments"]:
                doc_type = self._classify_document_type(attachment.get("name", ""))
                
                documents.append({
                    "type": doc_type,
                    "name": attachment.get("name"),
                    "description": attachment.get("description", ""),
                    "url": attachment.get("url"),
                    "posted_date": attachment.get("postedDate"),
                    "is_amendment": "amendment" in attachment.get("name", "").lower()
                })
        
        # Resource links
        if opp_data.get("resourceLinks"):
            for link in opp_data["resourceLinks"]:
                documents.append({
                    "type": "resource",
                    "name": link.get("description", "Resource Link"),
                    "description": link.get("description", ""),
                    "url": link.get("url"),
                    "posted_date": opp_data.get("postedDate"),
                    "is_amendment": False
                })
        
        return documents
    
    def _classify_document_type(self, filename: str) -> str:
        """Classify document type from filename"""
        
        filename_lower = filename.lower()
        
        if "section l" in filename_lower or "instructions" in filename_lower:
            return "section_l"
        elif "section m" in filename_lower or "evaluation" in filename_lower:
            return "section_m"
        elif "wage" in filename_lower or "wdol" in filename_lower:
            return "wage_determination"
        elif "sf-" in filename_lower or "sf1449" in filename_lower:
            return "form"
        elif "amendment" in filename_lower or "modification" in filename_lower:
            return "amendment"
        elif "q&a" in filename_lower or "questions" in filename_lower:
            return "qna"
        elif "attachment" in filename_lower:
            return "attachment"
        else:
            return "other"
    
    def _download_document(self, doc: Dict, solicitation_number: str) -> Optional[Dict]:
        """Download a single document"""
        
        if not doc.get("url"):
            return None
        
        try:
            # Create directory for this solicitation
            sol_dir = self.download_dir / solicitation_number
            sol_dir.mkdir(parents=True, exist_ok=True)
            
            # Generate filename
            filename = self._sanitize_filename(doc["name"])
            filepath = sol_dir / filename
            
            # Check if already downloaded (by hash)
            if filepath.exists():
                # File exists - check if it's the same
                existing_hash = self._file_hash(filepath)
                
                # Download to temp to compare
                response = requests.get(doc["url"], timeout=60)
                response.raise_for_status()
                
                new_hash = hashlib.md5(response.content).hexdigest()
                
                if existing_hash == new_hash:
                    # Same file - skip download
                    return {
                        **doc,
                        "local_path": str(filepath),
                        "size_mb": filepath.stat().st_size / (1024 * 1024),
                        "downloaded_at": datetime.fromtimestamp(filepath.stat().st_mtime).isoformat(),
                        "status": "already_downloaded"
                    }
            
            # Download file
            response = requests.get(doc["url"], timeout=60)
            response.raise_for_status()
            
            # Save file
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            size_mb = len(response.content) / (1024 * 1024)
            
            return {
                **doc,
                "local_path": str(filepath),
                "size_mb": round(size_mb, 2),
                "downloaded_at": datetime.utcnow().isoformat(),
                "status": "downloaded"
            }
        
        except Exception as e:
            print(f"Error downloading {doc.get('name')}: {e}")
            return {
                **doc,
                "status": "failed",
                "error": str(e)
            }
    
    def _sanitize_filename(self, filename: str) -> str:
        """Sanitize filename for filesystem"""
        
        # Remove invalid characters
        invalid_chars = '<>:"/\\|?*'
        for char in invalid_chars:
            filename = filename.replace(char, '_')
        
        # Limit length
        if len(filename) > 200:
            name, ext = os.path.splitext(filename)
            filename = name[:200-len(ext)] + ext
        
        return filename
    
    def _file_hash(self, filepath: Path) -> str:
        """Calculate MD5 hash of file"""
        
        hash_md5 = hashlib.md5()
        with open(filepath, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    
    def _calculate_next_check(self) -> datetime:
        """Calculate next check time (every 6 hours)"""
        from datetime import timedelta
        return datetime.utcnow() + timedelta(hours=6)
    
    def check_for_updates(self, solicitation_number: str) -> Dict:
        """
        Check if there are new documents or amendments
        
        Returns:
            {
                "has_updates": bool,
                "new_documents": List[Dict],
                "updated_documents": List[Dict]
            }
        """
        
        # Fetch latest from SAM.gov
        latest = self.fetch_opportunity_documents(solicitation_number)
        
        if latest.get("error"):
            return {
                "has_updates": False,
                "error": latest["error"]
            }
        
        # Get existing documents
        sol_dir = self.download_dir / solicitation_number
        existing_files = set(f.name for f in sol_dir.glob("*")) if sol_dir.exists() else set()
        
        # Find new documents
        new_docs = []
        for doc in latest.get("documents", []):
            filename = self._sanitize_filename(doc["name"])
            if filename not in existing_files:
                new_docs.append(doc)
        
        return {
            "has_updates": len(new_docs) > 0,
            "new_documents": new_docs,
            "total_new": len(new_docs),
            "checked_at": datetime.utcnow().isoformat()
        }
    
    def download_all_as_zip(self, solicitation_number: str) -> Optional[str]:
        """
        Create a ZIP file of all documents for an opportunity
        
        Returns:
            Path to ZIP file
        """
        
        import zipfile
        
        sol_dir = self.download_dir / solicitation_number
        
        if not sol_dir.exists():
            return None
        
        # Create ZIP
        zip_path = sol_dir / f"{solicitation_number}_all_documents.zip"
        
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for file in sol_dir.glob("*"):
                if file.suffix != ".zip":  # Don't include existing zips
                    zipf.write(file, file.name)
        
        return str(zip_path)

