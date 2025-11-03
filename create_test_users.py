#!/usr/bin/env python3
"""
Script to create test users for GovLogic GovConAI
Works with both local development and production deployments
"""
import requests
import sys
import argparse
from typing import Dict, Any

# Default test accounts
TEST_ACCOUNTS = [
    {
        "email": "admin@govsureai.com",
        "password": "Admin123!",
        "full_name": "Admin User",
        "organization_name": "GovSure AI Admin",
        "organization_email": "contact@govsureai.com",
        "phone": "+1 (555) 100-0001",
        "website": "https://govsureai.com",
        "user_types": ["proposals", "grants"],
        "primary_focus": "proposals"
    },
    {
        "email": "test@govsureai.com",
        "password": "Test123!",
        "full_name": "Test User",
        "organization_name": "Test Organization",
        "organization_email": "admin@testorg.com",
        "phone": "+1 (555) 123-4567",
        "website": "https://testorg.com",
        "user_types": ["proposals", "grants"],
        "primary_focus": "proposals"
    },
    {
        "email": "demo@govsureai.com",
        "password": "Demo123!",
        "full_name": "Demo User",
        "organization_name": "Demo Company",
        "organization_email": "contact@democompany.com",
        "phone": "+1 (555) 999-0000",
        "website": "https://democompany.com",
        "user_types": ["proposals"],
        "primary_focus": "proposals"
    }
]

def create_account(backend_url: str, account: Dict[str, Any]) -> bool:
    """Create a single account via the signup API"""
    try:
        response = requests.post(
            f"{backend_url}/api/v1/auth/signup",
            json=account,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Created: {account['email']}")
            print(f"   User ID: {data['user']['id']}")
            print(f"   Organization: {data['organization']['name']}")
            return True
            
        elif response.status_code == 400:
            error = response.json()
            if "Email already registered" in error.get('detail', ''):
                print(f"ℹ️  Exists:  {account['email']} (already registered)")
                return True
            else:
                print(f"❌ Failed:  {account['email']}")
                print(f"   Error: {error.get('detail', 'Unknown error')}")
                return False
        else:
            print(f"❌ Failed:  {account['email']} (Status: {response.status_code})")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection Error: Could not connect to {backend_url}")
        return False
    except requests.exceptions.Timeout:
        print(f"❌ Timeout: Backend did not respond in time")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(
        description='Create test users for GovLogic GovConAI',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  # Create users on local backend
  python create_test_users.py
  
  # Create users on production (via Caddy proxy)
  python create_test_users.py --backend https://govsureai.com
  
  # Create users on production API subdomain
  python create_test_users.py --backend https://api.govsureai.com
  
  # Create single custom user
  python create_test_users.py --email user@example.com --password Pass123! --name "John Doe"
        '''
    )
    
    parser.add_argument(
        '--backend',
        default='http://localhost:8000',
        help='Backend URL (default: http://localhost:8000)'
    )
    
    parser.add_argument(
        '--email',
        help='Email for custom user (requires --password and --name)'
    )
    
    parser.add_argument(
        '--password',
        help='Password for custom user'
    )
    
    parser.add_argument(
        '--name',
        help='Full name for custom user'
    )
    
    parser.add_argument(
        '--org',
        help='Organization name (default: based on email)'
    )
    
    args = parser.parse_args()
    
    print("=" * 70)
    print("🚀 GovLogic Test Users Creator")
    print("=" * 70)
    print(f"\n🌐 Backend URL: {args.backend}")
    print()
    
    # Check if creating custom user
    if args.email or args.password or args.name:
        if not (args.email and args.password and args.name):
            print("❌ Error: --email, --password, and --name are all required for custom user")
            sys.exit(1)
        
        custom_account = {
            "email": args.email,
            "password": args.password,
            "full_name": args.name,
            "organization_name": args.org or f"{args.name}'s Organization",
            "user_types": ["proposals", "grants"],
            "primary_focus": "proposals"
        }
        
        print("📝 Creating custom user...")
        success = create_account(args.backend, custom_account)
        
        if success:
            print("\n" + "=" * 70)
            print("🔑 LOGIN CREDENTIALS:")
            print("=" * 70)
            print(f"   Email:    {args.email}")
            print(f"   Password: {args.password}")
            print("=" * 70)
        
        sys.exit(0 if success else 1)
    
    # Create default test accounts
    print("📝 Creating test accounts...")
    print()
    
    results = []
    for account in TEST_ACCOUNTS:
        success = create_account(args.backend, account)
        results.append((account['email'], account['password'], success))
        print()
    
    # Summary
    print("=" * 70)
    print("📊 SUMMARY")
    print("=" * 70)
    
    successful = sum(1 for _, _, success in results if success)
    print(f"\n✅ Successfully created/verified: {successful}/{len(results)} accounts\n")
    
    print("=" * 70)
    print("🔑 TEST ACCOUNT CREDENTIALS:")
    print("=" * 70)
    for email, password, success in results:
        if success:
            print(f"\n📧 {email}")
            print(f"   Password: {password}")
    
    print("\n" + "=" * 70)
    
    # Show login URLs based on backend
    if 'localhost' in args.backend:
        print("🌐 Login at: http://localhost:3000/login")
    else:
        # Extract domain from backend URL
        domain = args.backend.replace('https://', '').replace('http://', '').split('/')[0]
        if domain.startswith('api.'):
            domain = domain.replace('api.', '')
        print(f"🌐 Login at: https://{domain}/login")
    
    print("=" * 70)
    print()

if __name__ == "__main__":
    main()

