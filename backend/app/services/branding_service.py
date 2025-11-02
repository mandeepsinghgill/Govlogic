"""
Branding Service - Company logo and branding for exports
"""
from typing import Optional
import os
from pathlib import Path


class BrandingService:
    """
    Manage company branding (logo, colors, fonts) for document exports
    """
    
    def __init__(self):
        self.branding_dir = Path(__file__).parent.parent / "static" / "branding"
        self.branding_dir.mkdir(parents=True, exist_ok=True)
        
        # Default branding
        self.default_logo_path = self.branding_dir / "default_logo.png"
        self.default_colors = {
            'primary': '#1e40af',  # Blue
            'secondary': '#64748b',  # Gray
            'accent': '#10b981'  # Green
        }
        self.default_fonts = {
            'heading': 'Arial',
            'body': 'Arial'
        }
    
    def get_logo_path(self, organization_id: Optional[str] = None) -> str:
        """
        Get logo path for organization (or default)
        
        Args:
            organization_id: Organization ID
        
        Returns:
            str: Path to logo file
        """
        if organization_id:
            org_logo = self.branding_dir / f"{organization_id}_logo.png"
            if org_logo.exists():
                return str(org_logo)
        
        # Return default logo path (create if doesn't exist)
        if not self.default_logo_path.exists():
            self._create_default_logo()
        
        return str(self.default_logo_path)
    
    def get_colors(self, organization_id: Optional[str] = None) -> dict:
        """
        Get brand colors for organization
        """
        # In production: Load from database
        return self.default_colors
    
    def get_fonts(self, organization_id: Optional[str] = None) -> dict:
        """
        Get brand fonts for organization
        """
        # In production: Load from database
        return self.default_fonts
    
    def upload_logo(self, organization_id: str, logo_data: bytes) -> str:
        """
        Upload and save organization logo
        
        Args:
            organization_id: Organization ID
            logo_data: Logo image bytes
        
        Returns:
            str: Path to saved logo
        """
        logo_path = self.branding_dir / f"{organization_id}_logo.png"
        
        with open(logo_path, 'wb') as f:
            f.write(logo_data)
        
        return str(logo_path)
    
    def _create_default_logo(self):
        """
        Create a default logo using PIL
        """
        try:
            from PIL import Image, ImageDraw, ImageFont
            
            # Create image
            img = Image.new('RGB', (400, 100), color='#1e40af')
            draw = ImageDraw.Draw(img)
            
            # Add text
            try:
                font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 36)
            except:
                font = ImageFont.load_default()
            
            text = "GovSureAI"
            # Get text bbox
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            
            # Center text
            x = (400 - text_width) / 2
            y = (100 - text_height) / 2
            
            draw.text((x, y), text, fill='white', font=font)
            
            # Save
            img.save(self.default_logo_path)
            print(f"Default logo created at {self.default_logo_path}")
        
        except Exception as e:
            print(f"Could not create default logo: {str(e)}")
            # Create empty file so path exists
            self.default_logo_path.touch()
    
    def get_branding_package(self, organization_id: Optional[str] = None) -> dict:
        """
        Get complete branding package for exports
        
        Returns:
            dict: Logo path, colors, fonts
        """
        return {
            'logo_path': self.get_logo_path(organization_id),
            'colors': self.get_colors(organization_id),
            'fonts': self.get_fonts(organization_id)
        }


# Global instance
branding_service = BrandingService()

# Initialize default logo
if __name__ == "__main__":
    branding_service._create_default_logo()

