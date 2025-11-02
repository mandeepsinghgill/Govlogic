#!/usr/bin/env python3
"""
Test script to verify SAM.gov API connection
Run this to debug API issues
"""

import asyncio
import os
import httpx
from datetime import datetime, timedelta

async def test_sam_api():
    api_key = os.getenv("SAM_GOV_API_KEY")
    if not api_key:
        print("❌ No SAM_GOV_API_KEY found in environment")
        print("📝 Add it to backend/.env file")
        return
    
    print(f"🔑 API Key: {api_key[:12]}...")
    print("🧪 Testing SAM.gov API connection...")
    
    # Test basic connectivity first
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Test with minimal parameters
            request_body = {
                'api_key': api_key,
                'limit': 1,
                'postedFrom': (datetime.now() - timedelta(days=7)).strftime('%m/%d/%Y'),
                'postedTo': datetime.now().strftime('%m/%d/%Y'),
                'ptype': 'o'
            }
            
            print(f"📤 Request: POST https://api.sam.gov/prod/opp/v1/opportunities/search")
            print(f"📤 Body: {request_body}")
            
            response = await client.post(
                "https://api.sam.gov/prod/opp/v1/opportunities/search",
                json=request_body
            )
            
            print(f"📥 Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Success! API returned data")
                print(f"📊 Opportunities found: {len(data.get('opportunitiesData', []))}")
                
                if data.get('opportunitiesData'):
                    opp = data['opportunitiesData'][0]
                    print(f"🎯 Sample opportunity: {opp.get('title', 'N/A')[:50]}...")
                    
            elif response.status_code == 401:
                print("❌ Authentication failed - check API key")
            elif response.status_code == 403:
                print("❌ Forbidden - API key may be invalid or expired")
            elif response.status_code == 429:
                print("❌ Rate limited - too many requests")
            else:
                print(f"❌ Error {response.status_code}: {response.text[:200]}")
                
    except Exception as e:
        print(f"❌ Connection error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_sam_api())
