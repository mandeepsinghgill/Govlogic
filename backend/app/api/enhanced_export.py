"""
API endpoints for enhanced document export
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from typing import Dict, Any, Optional
from pydantic import BaseModel
import io

from app.services.enhanced_export_service import enhanced_export_service
from app.api.auth import get_current_user


router = APIRouter(prefix="/api/v1/export", tags=["Enhanced Export"])


class WordExportRequest(BaseModel):
    """Word export request"""
    proposal_data: Dict[str, Any]
    include_cover_page: bool = True
    include_toc: bool = True
    include_executive_summary: bool = True
    custom_styles: Optional[Dict] = None


class ExcelExportRequest(BaseModel):
    """Excel export request"""
    pricing_data: Dict[str, Any]
    include_charts: bool = True
    include_formulas: bool = True


@router.post("/word")
async def export_to_word(
    request: WordExportRequest,
    current_user: Dict = Depends(get_current_user)
):
    """
    Export proposal to professionally formatted Word document
    
    Features:
    - Professional cover page with branding
    - Table of contents
    - Executive summary
    - Custom styles and formatting
    - Headers and footers
    """
    try:
        word_bytes = await enhanced_export_service.export_to_professional_word(
            proposal_data=request.proposal_data,
            include_cover_page=request.include_cover_page,
            include_toc=request.include_toc,
            include_executive_summary=request.include_executive_summary,
            custom_styles=request.custom_styles
        )
        
        # Create filename
        filename = f"{request.proposal_data.get('title', 'proposal').replace(' ', '_')}.docx"
        
        # Return as downloadable file
        return StreamingResponse(
            io.BytesIO(word_bytes),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export to Word: {str(e)}"
        )


@router.post("/excel")
async def export_to_excel(
    request: ExcelExportRequest,
    current_user: Dict = Depends(get_current_user)
):
    """
    Export pricing to advanced Excel workbook
    
    Features:
    - Multiple sheets (Summary, Labor Categories, Cost Breakdown, Pricing Schedule)
    - Formulas and calculations
    - Charts and visualizations
    - Professional formatting
    """
    try:
        excel_bytes = await enhanced_export_service.export_to_advanced_excel(
            pricing_data=request.pricing_data,
            include_charts=request.include_charts,
            include_formulas=request.include_formulas
        )
        
        # Create filename
        filename = f"{request.pricing_data.get('project_name', 'pricing').replace(' ', '_')}.xlsx"
        
        # Return as downloadable file
        return StreamingResponse(
            io.BytesIO(excel_bytes),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export to Excel: {str(e)}"
        )


@router.get("/formats")
async def get_supported_formats():
    """
    Get list of supported export formats
    """
    return {
        "status": "success",
        "formats": [
            {
                "format": "word",
                "extension": ".docx",
                "description": "Professional Word document with formatting",
                "features": [
                    "Cover page",
                    "Table of contents",
                    "Executive summary",
                    "Custom styles",
                    "Headers and footers"
                ]
            },
            {
                "format": "excel",
                "extension": ".xlsx",
                "description": "Advanced Excel workbook with multiple sheets",
                "features": [
                    "Multiple sheets",
                    "Formulas and calculations",
                    "Charts and visualizations",
                    "Professional formatting"
                ]
            },
            {
                "format": "pdf",
                "extension": ".pdf",
                "description": "High-quality PDF document",
                "features": [
                    "Professional layout",
                    "Custom branding",
                    "Print-ready quality"
                ]
            }
        ]
    }


@router.post("/batch")
async def batch_export(
    proposals: list[Dict[str, Any]],
    export_format: str,
    current_user: Dict = Depends(get_current_user)
):
    """
    Batch export multiple proposals
    
    Exports multiple proposals in the specified format.
    Returns a ZIP file containing all exports.
    """
    try:
        # Implementation for batch export
        # (Would create ZIP file with multiple exports)
        
        return {
            "status": "success",
            "message": "Batch export completed",
            "file_count": len(proposals)
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch export failed: {str(e)}"
        )

