"""
Email Service - Send transactional emails
"""
from typing import Optional
import os
from datetime import datetime

# Try to import SendGrid, fall back to SMTP
try:
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail
    SENDGRID_AVAILABLE = True
except ImportError:
    SENDGRID_AVAILABLE = False

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


class EmailService:
    """
    Send transactional emails using SendGrid or SMTP
    """
    
    def __init__(self):
        self.sendgrid_api_key = os.getenv('SENDGRID_API_KEY')
        self.from_email = os.getenv('FROM_EMAIL', 'noreply@govlogic.ai')
        self.from_name = os.getenv('FROM_NAME', 'GovLogic')
        
        # SMTP fallback settings
        self.smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_username = os.getenv('SMTP_USERNAME')
        self.smtp_password = os.getenv('SMTP_PASSWORD')
        
        self.use_sendgrid = SENDGRID_AVAILABLE and self.sendgrid_api_key
    
    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """
        Send an email using SendGrid or SMTP
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML email body
            text_content: Plain text email body (optional)
        
        Returns:
            bool: True if sent successfully
        """
        try:
            if self.use_sendgrid:
                return self._send_via_sendgrid(to_email, subject, html_content, text_content)
            else:
                return self._send_via_smtp(to_email, subject, html_content, text_content)
        except Exception as e:
            print(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    def _send_via_sendgrid(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str]
    ) -> bool:
        """Send email via SendGrid"""
        try:
            message = Mail(
                from_email=(self.from_email, self.from_name),
                to_emails=to_email,
                subject=subject,
                html_content=html_content,
                plain_text_content=text_content
            )
            
            sg = SendGridAPIClient(self.sendgrid_api_key)
            response = sg.send(message)
            
            return response.status_code in [200, 201, 202]
        except Exception as e:
            print(f"SendGrid error: {str(e)}")
            return False
    
    def _send_via_smtp(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str]
    ) -> bool:
        """Send email via SMTP"""
        if not self.smtp_username or not self.smtp_password:
            print(f"Email would be sent to {to_email}: {subject}")
            print(f"HTML: {html_content[:100]}...")
            return True  # Return True in development mode
        
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            
            # Add text and HTML parts
            if text_content:
                part1 = MIMEText(text_content, 'plain')
                msg.attach(part1)
            
            part2 = MIMEText(html_content, 'html')
            msg.attach(part2)
            
            # Send via SMTP
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.sendmail(self.from_email, to_email, msg.as_string())
            
            return True
        except Exception as e:
            print(f"SMTP error: {str(e)}")
            return False
    
    def send_verification_email(self, to_email: str, verification_token: str, user_name: str) -> bool:
        """
        Send email verification link
        """
        verification_url = f"https://app.govlogic.ai/verify-email?token={verification_token}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #1e40af; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 30px; background-color: #f9fafb; }}
                .button {{ display: inline-block; padding: 12px 30px; background-color: #1e40af; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to GovLogic!</h1>
                </div>
                <div class="content">
                    <p>Hi {user_name},</p>
                    <p>Thank you for signing up for GovLogic. Please verify your email address to get started.</p>
                    <p style="text-align: center;">
                        <a href="{verification_url}" class="button">Verify Email Address</a>
                    </p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #1e40af;">{verification_url}</p>
                    <p>This link will expire in 24 hours.</p>
                    <p>If you didn't create an account, you can safely ignore this email.</p>
                </div>
                <div class="footer">
                    <p>&copy; {datetime.now().year} GovLogic. All rights reserved.</p>
                    <p>You're receiving this email because you signed up for GovLogic.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Welcome to GovLogic!
        
        Hi {user_name},
        
        Thank you for signing up for GovLogic. Please verify your email address to get started.
        
        Verification link: {verification_url}
        
        This link will expire in 24 hours.
        
        If you didn't create an account, you can safely ignore this email.
        
        © {datetime.now().year} GovLogic. All rights reserved.
        """
        
        return self.send_email(to_email, "Verify your GovLogic email address", html_content, text_content)
    
    def send_password_reset_email(self, to_email: str, reset_token: str, user_name: str) -> bool:
        """
        Send password reset link
        """
        reset_url = f"https://app.govlogic.ai/reset-password?token={reset_token}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #1e40af; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 30px; background-color: #f9fafb; }}
                .button {{ display: inline-block; padding: 12px 30px; background-color: #1e40af; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }}
                .warning {{ background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                    <p>Hi {user_name},</p>
                    <p>We received a request to reset your password for your GovLogic account.</p>
                    <p style="text-align: center;">
                        <a href="{reset_url}" class="button">Reset Password</a>
                    </p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #1e40af;">{reset_url}</p>
                    <p>This link will expire in 1 hour for security reasons.</p>
                    <div class="warning">
                        <strong>⚠️ Security Notice:</strong> If you didn't request a password reset, please ignore this email and your password will remain unchanged.
                    </div>
                </div>
                <div class="footer">
                    <p>&copy; {datetime.now().year} GovLogic. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Password Reset Request
        
        Hi {user_name},
        
        We received a request to reset your password for your GovLogic account.
        
        Reset link: {reset_url}
        
        This link will expire in 1 hour for security reasons.
        
        ⚠️ Security Notice: If you didn't request a password reset, please ignore this email and your password will remain unchanged.
        
        © {datetime.now().year} GovLogic. All rights reserved.
        """
        
        return self.send_email(to_email, "Reset your GovLogic password", html_content, text_content)
    
    def send_welcome_email(self, to_email: str, user_name: str) -> bool:
        """
        Send welcome email after verification
        """
        dashboard_url = "https://app.govlogic.ai/dashboard"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #1e40af; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 30px; background-color: #f9fafb; }}
                .button {{ display: inline-block; padding: 12px 30px; background-color: #1e40af; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .feature {{ background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid: #1e40af; }}
                .footer {{ padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Welcome to GovLogic!</h1>
                </div>
                <div class="content">
                    <p>Hi {user_name},</p>
                    <p>Your email has been verified and your account is now active!</p>
                    <p style="text-align: center;">
                        <a href="{dashboard_url}" class="button">Go to Dashboard</a>
                    </p>
                    <h3>What you can do now:</h3>
                    <div class="feature">
                        <strong>🎯 Track Opportunities</strong><br>
                        Find and analyze government contracting opportunities with AI-powered scoring
                    </div>
                    <div class="feature">
                        <strong>✍️ Generate Proposals</strong><br>
                        Create winning proposals with AI assistance and export to Word/Excel/PDF
                    </div>
                    <div class="feature">
                        <strong>📊 Predictive Analytics</strong><br>
                        Forecast your pipeline and win rates with advanced analytics
                    </div>
                    <div class="feature">
                        <strong>🤝 Collaborate</strong><br>
                        Work with your team in real-time on proposals and capture plans
                    </div>
                    <p>Need help getting started? Check out our <a href="https://help.govlogic.ai">Help Center</a> or reply to this email.</p>
                </div>
                <div class="footer">
                    <p>&copy; {datetime.now().year} GovLogic. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Welcome to GovLogic!
        
        Hi {user_name},
        
        Your email has been verified and your account is now active!
        
        Go to Dashboard: {dashboard_url}
        
        What you can do now:
        
        🎯 Track Opportunities
        Find and analyze government contracting opportunities with AI-powered scoring
        
        ✍️ Generate Proposals
        Create winning proposals with AI assistance and export to Word/Excel/PDF
        
        📊 Predictive Analytics
        Forecast your pipeline and win rates with advanced analytics
        
        🤝 Collaborate
        Work with your team in real-time on proposals and capture plans
        
        Need help getting started? Check out our Help Center at https://help.govlogic.ai or reply to this email.
        
        © {datetime.now().year} GovLogic. All rights reserved.
        """
        
        return self.send_email(to_email, "Welcome to GovLogic - You're all set!", html_content, text_content)


# Global instance
email_service = EmailService()

