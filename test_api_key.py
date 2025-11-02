#!/usr/bin/env python3
"""
Test SAM.gov API key validity
Run this to check if your API key works
"""

import os
import requests
import json
from datetime import datetime, timedelta

def test_api_key():
    api_key = os.getenv("SAM_GOV_API_KEY")
    
    print("🔑 SAM.gov API Key Test")
    print("=" * 30)
    
    if not api_key:
        print("❌ No SAM_GOV_API_KEY found in environment")
        print("📝 Add it to backend/.env file:")
        print("   SAM_GOV_API_KEY=your_real_api_key_here")
        return
    
    if api_key in ['demo_api_key_12345', 'your_sam_gov_api_key_here', '3wLjNRkUoBtpPEymw0LphKvRmAayb3Lk8byG0b4J']:
        print(f"❌ Demo/placeholder API key detected: {api_key[:12]}...")
        print("📝 You need a REAL SAM.gov API key!")
        print("🌐 Get one from: https://api.sam.gov/prod/opp/v1/api-key/")
        return
    
    print(f"✅ API key found: {api_key[:12]}...")
    
    # Test the API
    request_body = {
        'api_key': api_key,
        'limit': 1,
        'postedFrom': (datetime.now() - timedelta(days=7)).strftime('%m/%d/%Y'),
        'postedTo': datetime.now().strftime('%m/%d/%Y'),
        'ptype': 'o'
    }
    
    print(f"🔄 Testing API call...")
    print(f"📤 URL: https://api.sam.gov/prod/opp/v1/opportunities/search")
    
    try:
        response = requests.post(
            "https://api.sam.gov/prod/opp/v1/opportunities/search",
            json=request_body,
            timeout=10
        )
        
        print(f"📥 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            opportunities = data.get('opportunitiesData', [])
            print(f"🎉 SUCCESS! API key is valid")
            print(f"📊 Found {len(opportunities)} opportunities")
            
            if opportunities:
                opp = opportunities[0]
                print(f"🎯 Sample: {opp.get('title', 'N/A')[:60]}...")
                print(f"🏢 Agency: {opp.get('department', 'N/A')}")
        
        elif response.status_code == 401:
            print("❌ API key is invalid or unauthorized")
            print("📝 Get a new key from: https://api.sam.gov/prod/opp/v1/api-key/")
        
        elif response.status_code == 403:
            print("❌ API key doesn't have required permissions")
            print("📝 Make sure you requested 'Opportunity Search API' access")
        
        elif response.status_code == 429:
            print("❌ Rate limited - too many requests")
            print("📝 SAM.gov allows ~1,000 requests per hour")
        
        else:
            print(f"❌ Error {response.status_code}")
            try:
                error_data = response.json()
                print(f"📝 Error message: {error_data.get('message', 'Unknown error')}")
            except:
                print(f"📝 Response: {response.text[:200]}")
                
    except requests.exceptions.RequestException as e:
        print(f"❌ Network error: {str(e)}")
        print("💡 Check your internet connection")

if __name__ == "__main__":
    test_api_key()
