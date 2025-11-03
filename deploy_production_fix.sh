#!/bin/bash

# Production Fix Deployment Script
# This script rebuilds the frontend with correct API configuration
# and restarts all services

set -e  # Exit on error

echo "=========================================="
echo "🚀 GovSureAI Production Fix Deployment"
echo "=========================================="
echo ""

# Detect which docker compose command to use
# Modern Docker (V2): docker compose
# Legacy Docker (V1): docker-compose
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
    echo "✅ Using Docker Compose V2 (docker compose)"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
    echo "✅ Using Docker Compose V1 (docker-compose)"
else
    echo "❌ Neither 'docker compose' nor 'docker-compose' found."
    echo "   Please install Docker Compose first:"
    echo "   https://docs.docker.com/compose/install/"
    exit 1
fi

echo ""
echo "📋 Step 1: Validating docker-compose.yml..."
if $DOCKER_COMPOSE config --quiet; then
    echo "✅ docker-compose.yml is valid"
else
    echo "❌ docker-compose.yml has errors. Please fix them first."
    exit 1
fi

echo ""
echo "🛑 Step 2: Stopping existing containers and removing old volumes..."
echo "   (This is important to clear any cached empty volumes)"
$DOCKER_COMPOSE down -v

echo ""
echo "📦 Step 3: Building frontend with production configuration..."
echo "   - Setting VITE_API_URL to empty string (relative paths)"
echo "   - Building into shared Docker volume"
echo "   - This will make API calls go to the same domain"
echo ""
$DOCKER_COMPOSE build --no-cache web

echo ""
echo "🚀 Step 4: Starting all services..."
$DOCKER_COMPOSE up -d

echo ""
echo "⏳ Step 5: Waiting for services to be healthy..."
sleep 10

echo ""
echo "📊 Step 6: Checking service status..."
$DOCKER_COMPOSE ps

echo ""
echo "🔍 Step 7: Verifying frontend files are accessible to Caddy..."
if $DOCKER_COMPOSE exec -T caddy test -f /usr/share/caddy/index.html; then
    echo "   ✅ index.html found in Caddy container"
    FILE_COUNT=$($DOCKER_COMPOSE exec -T caddy find /usr/share/caddy -type f | wc -l)
    echo "   ✅ Total files in volume: $FILE_COUNT"
else
    echo "   ⚠️  WARNING: index.html not found! Frontend may not be accessible."
    echo "   Run: $DOCKER_COMPOSE logs web"
fi

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "📝 Next Steps:"
echo "   1. Visit your production domain (e.g., http://govsureai.com)"
echo "   2. Or visit your server IP: http://YOUR_SERVER_IP"
echo "   3. You should see the GovSureAI login page (no more 404!)"
echo "   4. Open browser DevTools (F12) → Network tab"
echo "   5. Try logging in and verify API calls work"
echo ""
echo "🔍 Quick Tests:"
echo "   - Check files in Caddy: $DOCKER_COMPOSE exec caddy ls -la /usr/share/caddy"
echo "   - Test from server:     curl -I http://localhost"
echo "   - View Caddy logs:      $DOCKER_COMPOSE logs -f caddy"
echo "   - View backend logs:    $DOCKER_COMPOSE logs -f backend"
echo ""
echo "📖 For detailed troubleshooting, see: FIX_404_DEPLOYMENT.md"
echo ""

