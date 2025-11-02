"""
OAuth Service - Social authentication (Google, GitHub, Microsoft)
"""
from typing import Optional, Dict, Any
import os
import requests
from datetime import datetime


class OAuthService:
    """
    Handle OAuth authentication with social providers
    """
    
    def __init__(self):
        # Google OAuth
        self.google_client_id = os.getenv('GOOGLE_CLIENT_ID')
        self.google_client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
        self.google_redirect_uri = os.getenv('GOOGLE_REDIRECT_URI', 'https://app.GovSure.ai/auth/google/callback')
        
        # GitHub OAuth
        self.github_client_id = os.getenv('GITHUB_CLIENT_ID')
        self.github_client_secret = os.getenv('GITHUB_CLIENT_SECRET')
        self.github_redirect_uri = os.getenv('GITHUB_REDIRECT_URI', 'https://app.GovSure.ai/auth/github/callback')
        
        # Microsoft OAuth
        self.microsoft_client_id = os.getenv('MICROSOFT_CLIENT_ID')
        self.microsoft_client_secret = os.getenv('MICROSOFT_CLIENT_SECRET')
        self.microsoft_redirect_uri = os.getenv('MICROSOFT_REDIRECT_URI', 'https://app.GovSure.ai/auth/microsoft/callback')
        self.microsoft_tenant = os.getenv('MICROSOFT_TENANT', 'common')
    
    def get_google_auth_url(self, state: str) -> str:
        """
        Get Google OAuth authorization URL
        
        Args:
            state: CSRF protection state token
        
        Returns:
            str: Authorization URL
        """
        if not self.google_client_id:
            raise ValueError("Google OAuth not configured")
        
        base_url = "https://accounts.google.com/o/oauth2/v2/auth"
        params = {
            'client_id': self.google_client_id,
            'redirect_uri': self.google_redirect_uri,
            'response_type': 'code',
            'scope': 'openid email profile',
            'state': state,
            'access_type': 'offline',
            'prompt': 'consent'
        }
        
        query_string = '&'.join([f"{k}={v}" for k, v in params.items()])
        return f"{base_url}?{query_string}"
    
    def get_github_auth_url(self, state: str) -> str:
        """
        Get GitHub OAuth authorization URL
        """
        if not self.github_client_id:
            raise ValueError("GitHub OAuth not configured")
        
        base_url = "https://github.com/login/oauth/authorize"
        params = {
            'client_id': self.github_client_id,
            'redirect_uri': self.github_redirect_uri,
            'scope': 'user:email',
            'state': state
        }
        
        query_string = '&'.join([f"{k}={v}" for k, v in params.items()])
        return f"{base_url}?{query_string}"
    
    def get_microsoft_auth_url(self, state: str) -> str:
        """
        Get Microsoft OAuth authorization URL
        """
        if not self.microsoft_client_id:
            raise ValueError("Microsoft OAuth not configured")
        
        base_url = f"https://login.microsoftonline.com/{self.microsoft_tenant}/oauth2/v2.0/authorize"
        params = {
            'client_id': self.microsoft_client_id,
            'redirect_uri': self.microsoft_redirect_uri,
            'response_type': 'code',
            'scope': 'openid email profile',
            'state': state,
            'response_mode': 'query'
        }
        
        query_string = '&'.join([f"{k}={v}" for k, v in params.items()])
        return f"{base_url}?{query_string}"
    
    def exchange_google_code(self, code: str) -> Optional[Dict[str, Any]]:
        """
        Exchange Google authorization code for user info
        
        Args:
            code: Authorization code from Google
        
        Returns:
            Dict with user info (email, name, picture) or None
        """
        if not self.google_client_id or not self.google_client_secret:
            return None
        
        try:
            # Exchange code for access token
            token_url = "https://oauth2.googleapis.com/token"
            token_data = {
                'code': code,
                'client_id': self.google_client_id,
                'client_secret': self.google_client_secret,
                'redirect_uri': self.google_redirect_uri,
                'grant_type': 'authorization_code'
            }
            
            token_response = requests.post(token_url, data=token_data)
            token_response.raise_for_status()
            tokens = token_response.json()
            
            # Get user info
            user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
            headers = {'Authorization': f"Bearer {tokens['access_token']}"}
            user_response = requests.get(user_info_url, headers=headers)
            user_response.raise_for_status()
            user_info = user_response.json()
            
            return {
                'email': user_info.get('email'),
                'name': user_info.get('name'),
                'picture': user_info.get('picture'),
                'provider': 'google',
                'provider_id': user_info.get('id')
            }
        
        except Exception as e:
            print(f"Google OAuth error: {str(e)}")
            return None
    
    def exchange_github_code(self, code: str) -> Optional[Dict[str, Any]]:
        """
        Exchange GitHub authorization code for user info
        """
        if not self.github_client_id or not self.github_client_secret:
            return None
        
        try:
            # Exchange code for access token
            token_url = "https://github.com/login/oauth/access_token"
            token_data = {
                'client_id': self.github_client_id,
                'client_secret': self.github_client_secret,
                'code': code,
                'redirect_uri': self.github_redirect_uri
            }
            headers = {'Accept': 'application/json'}
            
            token_response = requests.post(token_url, data=token_data, headers=headers)
            token_response.raise_for_status()
            tokens = token_response.json()
            
            # Get user info
            user_info_url = "https://api.github.com/user"
            headers = {
                'Authorization': f"Bearer {tokens['access_token']}",
                'Accept': 'application/json'
            }
            user_response = requests.get(user_info_url, headers=headers)
            user_response.raise_for_status()
            user_info = user_response.json()
            
            # Get primary email
            email_url = "https://api.github.com/user/emails"
            email_response = requests.get(email_url, headers=headers)
            email_response.raise_for_status()
            emails = email_response.json()
            primary_email = next((e['email'] for e in emails if e['primary']), None)
            
            return {
                'email': primary_email or user_info.get('email'),
                'name': user_info.get('name') or user_info.get('login'),
                'picture': user_info.get('avatar_url'),
                'provider': 'github',
                'provider_id': str(user_info.get('id'))
            }
        
        except Exception as e:
            print(f"GitHub OAuth error: {str(e)}")
            return None
    
    def exchange_microsoft_code(self, code: str) -> Optional[Dict[str, Any]]:
        """
        Exchange Microsoft authorization code for user info
        """
        if not self.microsoft_client_id or not self.microsoft_client_secret:
            return None
        
        try:
            # Exchange code for access token
            token_url = f"https://login.microsoftonline.com/{self.microsoft_tenant}/oauth2/v2.0/token"
            token_data = {
                'client_id': self.microsoft_client_id,
                'client_secret': self.microsoft_client_secret,
                'code': code,
                'redirect_uri': self.microsoft_redirect_uri,
                'grant_type': 'authorization_code',
                'scope': 'openid email profile'
            }
            
            token_response = requests.post(token_url, data=token_data)
            token_response.raise_for_status()
            tokens = token_response.json()
            
            # Get user info
            user_info_url = "https://graph.microsoft.com/v1.0/me"
            headers = {'Authorization': f"Bearer {tokens['access_token']}"}
            user_response = requests.get(user_info_url, headers=headers)
            user_response.raise_for_status()
            user_info = user_response.json()
            
            return {
                'email': user_info.get('mail') or user_info.get('userPrincipalName'),
                'name': user_info.get('displayName'),
                'picture': None,  # Microsoft Graph requires separate call for photo
                'provider': 'microsoft',
                'provider_id': user_info.get('id')
            }
        
        except Exception as e:
            print(f"Microsoft OAuth error: {str(e)}")
            return None


# Global instance
oauth_service = OAuthService()

