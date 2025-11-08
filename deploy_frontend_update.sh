#!/bin/bash

# Quick Frontend Update - Deploy New UI Changes to Production
# This script rebuilds only the frontend and restarts Caddy
# without disrupting backend services

set -e  # Exit on error

echo "=========================================="
echo "🎨 GovSure Frontend Update Deployment"
echo "=========================================="
echo ""

# Detect which docker compose command to use
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
    echo "✅ Using Docker Compose V2 (docker compose)"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
    echo "✅ Using Docker Compose V1 (docker-compose)"
else
    echo "❌ Neither 'docker compose' nor 'docker-compose' found."
    exit 1
fi

echo ""
echo "📦 Step 1: Rebuilding frontend with latest changes..."
$DOCKER_COMPOSE build --no-cache web

echo ""
echo "🔄 Step 2: Updating web service..."
$DOCKER_COMPOSE up -d web

echo ""
echo "🔄 Step 3: Restarting Caddy to serve new files..."
$DOCKER_COMPOSE restart caddy

echo ""
echo "⏳ Step 4: Waiting for services to stabilize..."
sleep 5

echo ""
echo "📊 Step 5: Checking service status..."
$DOCKER_COMPOSE ps

echo ""
echo "🔍 Step 6: Verifying frontend files..."
if $DOCKER_COMPOSE exec -T caddy test -f /usr/share/caddy/index.html; then
    echo "   ✅ Frontend files are accessible"
    FILE_COUNT=$($DOCKER_COMPOSE exec -T caddy find /usr/share/caddy -type f | wc -l)
    echo "   ✅ Total files: $FILE_COUNT"
else
    echo "   ⚠️  WARNING: Frontend files not found!"
fi

echo ""
echo "=========================================="
echo "✅ Frontend Update Complete!"
echo "=========================================="
echo ""
echo "🌐 Your changes should now be live at:"
echo "   🔗 https://govsureai.com"
echo ""
echo "💡 Tips:"
echo "   - Clear your browser cache (Cmd+Shift+R or Ctrl+Shift+R)"
echo "   - Check in incognito/private window"
echo "   - Wait 30 seconds for CDN/cache to clear"
echo ""
echo "🔍 If changes don't appear:"
echo "   - View Caddy logs: $DOCKER_COMPOSE logs -f caddy"
echo "   - Check files: $DOCKER_COMPOSE exec caddy ls -la /usr/share/caddy"
echo "   - Test locally: curl -I http://localhost"
echo ""

