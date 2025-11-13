"""
Contact Form API - Handle contact form submissions
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.services.email_service import EmailService

router = APIRouter(prefix="/api/v1", tags=["contact"])

email_service = EmailService()


class ContactFormRequest(BaseModel):
    fullName: str
    email: EmailStr
    subject: str
    phone: Optional[str] = None
    message: str


@router.post("/contact")
async def submit_contact_form(request: ContactFormRequest):
    """
    Submit contact form and send emails to info@govsureai.com and info@govsure.ai
    """
    try:
        # Email addresses to send to
        recipient_emails = ["info@govsureai.com", "info@govsure.ai"]
        
        # Create email content
        subject = f"Contact Form: {request.subject}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }}
                .field {{ margin-bottom: 15px; }}
                .label {{ font-weight: bold; color: #1f2937; margin-bottom: 5px; display: block; }}
                .value {{ color: #4b5563; }}
                .message-box {{ background: white; padding: 15px; border-left: 4px solid #3b82f6; margin-top: 10px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>New Contact Form Submission</h2>
                </div>
                <div class="content">
                    <div class="field">
                        <span class="label">Full Name:</span>
                        <span class="value">{request.fullName}</span>
                    </div>
                    <div class="field">
                        <span class="label">Email:</span>
                        <span class="value">{request.email}</span>
                    </div>
                    <div class="field">
                        <span class="label">Phone:</span>
                        <span class="value">{request.phone or 'Not provided'}</span>
                    </div>
                    <div class="field">
                        <span class="label">Subject:</span>
                        <span class="value">{request.subject}</span>
                    </div>
                    <div class="field">
                        <span class="label">Message:</span>
                        <div class="message-box">
                            {request.message.replace(chr(10), '<br>')}
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
New Contact Form Submission

Full Name: {request.fullName}
Email: {request.email}
Phone: {request.phone or 'Not provided'}
Subject: {request.subject}

Message:
{request.message}
        """
        
        # Send email to both addresses
        success_count = 0
        for email in recipient_emails:
            if email_service.send_email(
                to_email=email,
                subject=subject,
                html_content=html_content,
                text_content=text_content
            ):
                success_count += 1
        
        if success_count > 0:
            return {
                "success": True,
                "message": "Your message has been sent successfully. We'll get back to you soon!"
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to send email. Please try again later."
            )
            
    except Exception as e:
        print(f"Error processing contact form: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your request. Please try again later."
        )

