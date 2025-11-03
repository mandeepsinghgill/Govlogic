#!/bin/bash

# Production Fix Deployment Script
# This script rebuilds the frontend with correct API configuration
# and restarts all services

set -e  # Exit on error

echo "=========================================="
echo "🚀 GovSureAI Production Fix Deployment"
echo "=========================================="
echo ""

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose not found. Please install it first."
    exit 1
fi

echo "📋 Step 1: Validating docker-compose.yml..."
if docker-compose config --quiet; then
    echo "✅ docker-compose.yml is valid"
else
    echo "❌ docker-compose.yml has errors. Please fix them first."
    exit 1
fi

echo ""
echo "📦 Step 2: Building frontend with production configuration..."
echo "   - Setting VITE_API_URL to empty string (relative paths)"
echo "   - This will make API calls go to the same domain"
echo ""
docker-compose build --no-cache web

echo ""
echo "🛑 Step 3: Stopping existing containers..."
docker-compose down

echo ""
echo "🚀 Step 4: Starting all services..."
docker-compose up -d

echo ""
echo "⏳ Step 5: Waiting for services to be healthy..."
sleep 10

echo ""
echo "📊 Step 6: Checking service status..."
docker-compose ps

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "📝 Next Steps:"
echo "   1. Visit your production domain (e.g., http://govsureai.com)"
echo "   2. Open browser DevTools (F12) → Network tab"
echo "   3. Try logging in"
echo "   4. Verify API calls go to your domain (not localhost)"
echo ""
echo "🔍 Troubleshooting:"
echo "   - View Caddy logs:   docker-compose logs -f caddy"
echo "   - View backend logs: docker-compose logs -f backend"
echo "   - View all logs:     docker-compose logs -f"
echo ""
echo "📖 For more details, see: PRODUCTION_FIX_COMPLETE.md"
echo ""

