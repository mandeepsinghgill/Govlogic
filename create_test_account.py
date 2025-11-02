"""
Script to create a test account for GovLogic GovConAI
"""
import requests
import json

# API endpoint - update this to match your backend URL
BACKEND_URL = "http://localhost:8000"  # Change if your backend is running elsewhere

# Test account credentials
TEST_ACCOUNT = {
    "email": "testuser@GovSure.com",
    "password": "TestPass123!",
    "full_name": "Test User",
    "organization_name": "Test Organization",
    "organization_email": "admin@testorg.com",
    "phone": "+1 (555) 123-4567",
    "website": "https://testorg.com",
    "user_types": ["proposals", "grants"],
    "primary_focus": "proposals"
}

def create_test_account():
    """Create a test account via the signup API"""
    print("=" * 60)
    print("🚀 GovLogic Test Account Creator")
    print("=" * 60)
    
    print("\n📝 Creating test account with credentials:")
    print(f"   Email: {TEST_ACCOUNT['email']}")
    print(f"   Password: {TEST_ACCOUNT['password']}")
    print(f"   Name: {TEST_ACCOUNT['full_name']}")
    print(f"   Organization: {TEST_ACCOUNT['organization_name']}")
    print("\n⏳ Sending request to backend...\n")
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/v1/auth/signup",
            json=TEST_ACCOUNT,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS! Test account created successfully!\n")
            print("=" * 60)
            print("🔑 LOGIN CREDENTIALS:")
            print("=" * 60)
            print(f"   Email:    {TEST_ACCOUNT['email']}")
            print(f"   Password: {TEST_ACCOUNT['password']}")
            print("=" * 60)
            print("\n📊 Account Details:")
            print(f"   User ID: {data['user']['id']}")
            print(f"   Full Name: {data['user']['full_name']}")
            print(f"   Role: {data['user']['role']}")
            print(f"   Organization: {data['organization']['name']}")
            print(f"   Subscription Tier: {data['organization']['subscription_tier']}")
            print("\n🌐 You can now login at: http://localhost:3000/login")
            print("=" * 60)
            
            return True
            
        elif response.status_code == 400:
            error = response.json()
            if "Email already registered" in error.get('detail', ''):
                print("ℹ️  Account already exists! You can use these credentials:\n")
                print("=" * 60)
                print("🔑 EXISTING LOGIN CREDENTIALS:")
                print("=" * 60)
                print(f"   Email:    {TEST_ACCOUNT['email']}")
                print(f"   Password: {TEST_ACCOUNT['password']}")
                print("=" * 60)
                print("\n🌐 Login at: http://localhost:3000/login")
                print("=" * 60)
                return True
            else:
                print(f"❌ Error: {error.get('detail', 'Unknown error')}")
                return False
        else:
            print(f"❌ Failed with status code: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Could not connect to backend!")
        print(f"   Make sure your backend is running at: {BACKEND_URL}")
        print("\n💡 To start the backend:")
        print("   cd GovSure/backend")
        print("   uvicorn app.main:app --reload --port 8000")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False

if __name__ == "__main__":
    create_test_account()

