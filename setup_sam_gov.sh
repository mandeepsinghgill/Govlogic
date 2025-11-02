#!/bin/bash

echo "🔑 SAM.gov Integration Setup"
echo "================================"
echo ""
echo "This script will help you configure SAM.gov API integration"
echo ""

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "❌ Backend .env file not found"
    echo "📝 Creating .env file..."
    cp backend/.env.example backend/.env 2>/dev/null || echo "⚠️  No .env.example found, creating basic .env..."
fi

echo ""
echo "🌐 Step 1: Get your SAM.gov API Key"
echo "====================================="
echo "1. Go to: https://api.sam.gov/prod/opp/v1/api-key/"
echo "2. Sign in with your SAM.gov account"
echo "3. Request API key for 'Opportunity Search API'"
echo "4. Copy the API key"
echo ""

read -p "📋 Paste your SAM.gov API key here: " SAM_API_KEY

if [ -z "$SAM_API_KEY" ]; then
    echo "❌ No API key provided"
    exit 1
fi

echo ""
echo "💾 Step 2: Update .env file"
echo "==========================="
sed -i.bak "s/SAM_GOV_API_KEY=.*/SAM_GOV_API_KEY=$SAM_API_KEY/" backend/.env

echo "✅ API key saved to backend/.env"
echo ""

echo "🚀 Step 3: Test Integration"
echo "============================"
echo "Starting backend to test integration..."
echo ""

cd backend

# Test the integration
echo "🧪 Testing SAM.gov connection..."
python -c "
import os
import asyncio
from app.services.samgov_service import samgov_service

async def test():
    api_key = os.getenv('SAM_GOV_API_KEY')
    if not api_key:
        print('❌ No API key found')
        return
    
    print(f'✅ API key configured: {api_key[:8]}...')
    
    try:
        result = await samgov_service.search_opportunities(keyword='cybersecurity', limit=3)
        print(f'🎉 SUCCESS! Found {result[\"total\"]} opportunities')
        print(f'📊 Sample: {result[\"items\"][0][\"title\"][:50]}...' if result[\"items\"] else 'No results')
    except Exception as e:
        print(f'❌ Error: {str(e)}')

asyncio.run(test())
"

echo ""
echo "🎯 Step 4: Start Services"
echo "========================="
echo "Backend should now use live SAM.gov data!"
echo ""
echo "Commands to run:"
echo "  cd backend"
echo "  uvicorn app.main:app --reload --port 8000"
echo ""
echo "Then test in browser: http://localhost:3000/opportunities"
echo "Search for 'cyber' and see real SAM.gov results!"
