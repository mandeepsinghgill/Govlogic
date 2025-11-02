#!/usr/bin/env python3
"""
Test script to verify SAM.gov integration
Run this after configuring your SAM_GOV_API_KEY
"""

import asyncio
import os
from backend.app.services.samgov_service import samgov_service

async def test_sam_integration():
    print("🧪 Testing SAM.gov Integration")
    print("=" * 40)
    
    # Check API key
    api_key = os.getenv("SAM_GOV_API_KEY")
    if not api_key or api_key == "demo_api_key_12345":
        print("❌ No valid SAM.gov API key found")
        print("📝 Please add your real API key to backend/.env")
        return
    
    print(f"✅ API key configured: {api_key[:8]}...")
    
    try:
        # Test search
        print("\n🔍 Testing search...")
        result = await samgov_service.search_opportunities(
            keyword="cybersecurity",
            limit=5
        )
        
        print(f"✅ Search successful!")
        print(f"📊 Found {result['total']} opportunities")
        print(f"📄 Results: {len(result['items'])} items")
        
        if result['items']:
            first_item = result['items'][0]
            print(f"🎯 Sample opportunity: {first_item['title'][:50]}...")
            print(f"🏢 Agency: {first_item['agency']}")
            print(f"💰 Value: ${first_item.get('value', 'N/A')}")
            print(f"📅 Due: {first_item.get('dueDate', 'N/A')}")
        
        print("
🎉 SAM.gov integration is working!"        print("🌐 Your search will now show live SAM.gov data")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print("💡 Check your API key and try again")

if __name__ == "__main__":
    asyncio.run(test_sam_integration())
