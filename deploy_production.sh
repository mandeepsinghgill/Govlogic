#!/bin/bash
# Production Deployment Script for GovSure AI
# This script ensures proper production configuration without CORS issues

set -e  # Exit on any error

echo "🚀 GovSure AI - Production Deployment"
echo "======================================"
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ] && ! groups | grep -q docker; then 
    echo "⚠️  Warning: You may need sudo or to be in the docker group"
fi

# Confirm production deployment
echo "⚠️  This will deploy to PRODUCTION with the following settings:"
echo "  - DEBUG: false (CORS handled by Caddy only)"
echo "  - API URL: https://api.govsureai.com"
echo "  - Frontend: https://govsureai.com"
echo ""
read -p "Continue with production deployment? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "📋 Step 1: Stopping existing services..."
docker compose -f docker-compose.prod.yml down

echo ""
echo "🗑️  Step 2: Removing old frontend volume (force rebuild)..."
docker volume rm govlogic_frontend_dist 2>/dev/null || echo "   Volume already removed or doesn't exist"

echo ""
echo "🔨 Step 3: Building services with no cache..."
docker compose -f docker-compose.prod.yml build --no-cache

echo ""
echo "🚀 Step 4: Starting all services..."
docker compose -f docker-compose.prod.yml up -d

echo ""
echo "⏳ Step 5: Waiting for services to be ready..."
sleep 10

echo ""
echo "🔍 Step 6: Checking service health..."
docker compose -f docker-compose.prod.yml ps

echo ""
echo "📊 Step 7: Checking backend logs for DEBUG status..."
docker compose -f docker-compose.prod.yml logs backend | grep -i "cors\|debug" | head -5

echo ""
echo "✅ Step 8: Reloading Caddy configuration..."
docker compose -f docker-compose.prod.yml exec caddy caddy reload --config /etc/caddy/Caddyfile

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Production Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Your application should now be available at:"
echo "   Frontend: https://govsureai.com"
echo "   API:      https://api.govsureai.com"
echo ""
echo "🔍 Verify deployment:"
echo "   curl -I https://govsureai.com"
echo "   curl -I https://api.govsureai.com/api/v1/health"
echo ""
echo "📝 Monitor logs:"
echo "   docker compose -f docker-compose.prod.yml logs -f backend"
echo "   docker compose -f docker-compose.prod.yml logs -f caddy"
echo ""
echo "🔧 Troubleshooting:"
echo "   - Clear browser cache: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)"
echo "   - Check CORS headers: curl -I -H 'Origin: https://govsureai.com' https://api.govsureai.com/api/v1/health"
echo "   - View all logs: docker compose -f docker-compose.prod.yml logs --tail=100"
echo ""

