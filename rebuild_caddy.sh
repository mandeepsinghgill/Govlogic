#!/bin/bash
# Rebuild Caddy and Frontend - Complete Cache Clear

echo "🛑 Stopping all services..."
docker compose down

echo "🗑️  Removing frontend build volume (this forces a complete rebuild)..."
docker volume rm govlogic_frontend_dist 2>/dev/null || echo "Volume already removed or doesn't exist"

echo "🔨 Rebuilding frontend with no cache..."
docker compose build --no-cache web

echo "🚀 Starting all services..."
docker compose up -d

echo "⏳ Waiting for services to start..."
sleep 5

echo "✅ Reloading Caddy configuration..."
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile

echo ""
echo "✨ Done! Your services should now serve fresh content."
echo ""
echo "🔍 Test with: curl -I localhost"
echo "🌐 Then try in browser with: Ctrl+Shift+R (hard refresh) or Cmd+Shift+R (Mac)"
echo ""
echo "If browser still shows old content, try:"
echo "  - Clear browser cache completely"
echo "  - Use incognito/private mode"
echo "  - Try different browser"

