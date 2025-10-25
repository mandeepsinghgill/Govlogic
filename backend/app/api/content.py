"""
Content library and templates API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.models.content import ContentTemplate, Boilerplate, EmailTemplate, EmailCampaign

router = APIRouter(prefix="/api/v1/content", tags=["content"])


class ContentTemplateCreate(BaseModel):
    title: str
    category: str
    content: str
    tags: Optional[List[str]] = None
    organization_id: str


class BoilerplateCreate(BaseModel):
    title: str
    section_type: str
    content: str
    applies_to_naics: Optional[List[str]] = None
    organization_id: str


class EmailTemplateCreate(BaseModel):
    name: str
    template_type: str
    subject: str
    body_html: str
    organization_id: str


@router.get("/templates")
async def list_templates(
    organization_id: str,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List content templates"""
    query = db.query(ContentTemplate).filter(
        ContentTemplate.organization_id == organization_id
    )
    
    if category:
        query = query.filter(ContentTemplate.category == category)
    
    templates = query.all()
    
    return {"templates": templates}


@router.post("/templates")
async def create_template(
    template: ContentTemplateCreate,
    db: Session = Depends(get_db)
):
    """Create a content template"""
    db_template = ContentTemplate(**template.dict())
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    
    return db_template


@router.get("/templates/{template_id}")
async def get_template(
    template_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific template"""
    template = db.query(ContentTemplate).filter(
        ContentTemplate.id == template_id
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Increment usage count
    template.usage_count += 1
    db.commit()
    
    return template


@router.get("/boilerplate")
async def list_boilerplate(
    organization_id: str,
    section_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List boilerplate content"""
    query = db.query(Boilerplate).filter(
        Boilerplate.organization_id == organization_id
    )
    
    if section_type:
        query = query.filter(Boilerplate.section_type == section_type)
    
    boilerplate = query.all()
    
    return {"boilerplate": boilerplate}


@router.post("/boilerplate")
async def create_boilerplate(
    boilerplate: BoilerplateCreate,
    db: Session = Depends(get_db)
):
    """Create boilerplate content"""
    word_count = len(boilerplate.content.split())
    
    db_boilerplate = Boilerplate(
        **boilerplate.dict(),
        word_count=word_count
    )
    
    db.add(db_boilerplate)
    db.commit()
    db.refresh(db_boilerplate)
    
    return db_boilerplate


@router.get("/email-templates")
async def list_email_templates(
    organization_id: str,
    template_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List email templates"""
    query = db.query(EmailTemplate).filter(
        EmailTemplate.organization_id == organization_id
    )
    
    if template_type:
        query = query.filter(EmailTemplate.template_type == template_type)
    
    templates = query.all()
    
    return {"templates": templates}


@router.post("/email-templates")
async def create_email_template(
    template: EmailTemplateCreate,
    db: Session = Depends(get_db)
):
    """Create an email template"""
    db_template = EmailTemplate(**template.dict())
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    
    return db_template


@router.post("/email-templates/{template_id}/send")
async def send_email_from_template(
    template_id: str,
    recipient_email: str,
    variables: dict,
    db: Session = Depends(get_db)
):
    """Send email using template"""
    template = db.query(EmailTemplate).filter(
        EmailTemplate.id == template_id
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Replace variables in subject and body
    subject = template.subject
    body = template.body_html
    
    for key, value in variables.items():
        subject = subject.replace(f"{{{{{key}}}}}", str(value))
        body = body.replace(f"{{{{{key}}}}}", str(value))
    
    # Send email (using SendGrid service)
    from app.services.integrations import sendgrid
    
    success = sendgrid.send_email(
        to_email=recipient_email,
        subject=subject,
        html_content=body
    )
    
    if success:
        template.sent_count += 1
        db.commit()
    
    return {
        "success": success,
        "message": "Email sent" if success else "Failed to send email"
    }

