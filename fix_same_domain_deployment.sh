#!/bin/bash

# Script to fix same-domain deployment and rebuild with correct configuration

set -e

echo "=========================================="
echo "🔧 Fixing Same Domain Configuration"
echo "=========================================="
echo ""

# Detect docker compose command
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    echo "❌ Docker Compose not found"
    exit 1
fi

echo "Using: $DOCKER_COMPOSE"
echo ""

echo "📋 Current Issue:"
echo "   Frontend is using localhost:8000 instead of relative paths"
echo "   This means VITE_API_URL wasn't properly embedded during build"
echo ""

echo "🔧 Solution:"
echo "   1. Stop all containers"
echo "   2. Remove ALL volumes (including old frontend build)"
echo "   3. Rebuild frontend with VITE_API_URL=''"
echo "   4. Start fresh"
echo ""

read -p "Continue? (y/n): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "🛑 Step 1: Stopping containers and removing ALL volumes..."
$DOCKER_COMPOSE down -v

echo ""
echo "🗑️  Step 2: Removing any dangling volumes..."
docker volume prune -f

echo ""
echo "📦 Step 3: Rebuilding frontend with VITE_API_URL='' (empty string)..."
$DOCKER_COMPOSE build --no-cache --build-arg VITE_API_URL="" web

echo ""
echo "📦 Step 4: Rebuilding backend (to ensure CORS is correct)..."
$DOCKER_COMPOSE build --no-cache backend

echo ""
echo "🚀 Step 5: Starting all services..."
$DOCKER_COMPOSE up -d

echo ""
echo "⏳ Step 6: Waiting for services to start..."
sleep 15

echo ""
echo "📊 Step 7: Checking service status..."
$DOCKER_COMPOSE ps

echo ""
echo "🔍 Step 8: Verifying frontend files..."
if $DOCKER_COMPOSE exec -T caddy test -f /usr/share/caddy/index.html; then
    echo "   ✅ Frontend files found in Caddy"
    
    # Check if the build has the correct API URL
    echo ""
    echo "🔍 Step 9: Checking compiled frontend code..."
    if $DOCKER_COMPOSE exec -T caddy grep -q "localhost:8000" /usr/share/caddy/assets/*.js 2>/dev/null; then
        echo "   ⚠️  WARNING: Found localhost:8000 in compiled code!"
        echo "   This means the build didn't use VITE_API_URL correctly."
        echo ""
        echo "   Try this manual fix:"
        echo "   1. Check if there's a .env file in frontend/"
        echo "   2. Make sure it doesn't have VITE_API_URL set"
        echo "   3. Run: docker compose build --no-cache web"
    else
        echo "   ✅ No localhost:8000 found in compiled code"
        echo "   Frontend should now use relative paths!"
    fi
else
    echo "   ❌ Frontend files NOT found!"
    echo "   Check build logs: $DOCKER_COMPOSE logs web"
fi

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "🧪 Testing Steps:"
echo ""
echo "1. Clear browser cache:"
echo "   - Press: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)"
echo "   - Clear: Cached images and files"
echo "   - Or: Hard refresh with Ctrl+F5"
echo ""
echo "2. Visit: https://govsureai.com"
echo ""
echo "3. Open DevTools (F12) → Network tab"
echo ""
echo "4. Try logging in"
echo ""
echo "5. Check the Network tab:"
echo "   ✅ Should see: /api/v1/auth/login (relative path)"
echo "   ❌ Should NOT see: http://localhost:8000"
echo ""
echo "6. If still seeing localhost:8000:"
echo "   - Clear browser cache completely"
echo "   - Try incognito/private window"
echo "   - Check for .env files in frontend/"
echo ""
echo "🔍 Quick Tests:"
echo "   Test API from server: curl http://localhost/api/v1/health"
echo "   Check Caddy logs:     $DOCKER_COMPOSE logs -f caddy"
echo "   Check backend logs:   $DOCKER_COMPOSE logs -f backend"
echo ""

