#!/bin/bash

# Script to switch between same-domain and subdomain API architecture

set -e

echo "=========================================="
echo "🔧 GovSureAI Architecture Switcher"
echo "=========================================="
echo ""
echo "Choose your API architecture:"
echo ""
echo "1) Same Domain    (govsureai.com/api)"
echo "   - Simpler setup"
echo "   - No CORS issues"
echo "   - Recommended for getting started"
echo ""
echo "2) Subdomain      (api.govsureai.com)"
echo "   - Professional architecture"
echo "   - Independent scaling"
echo "   - Requires DNS configuration"
echo ""
read -p "Enter choice (1 or 2): " choice

case $choice in
  1)
    echo ""
    echo "📝 Configuring for Same Domain setup..."
    API_URL=""
    SETUP_NAME="Same Domain"
    ;;
  2)
    echo ""
    echo "📝 Configuring for Subdomain setup..."
    API_URL="https://api.govsureai.com"
    SETUP_NAME="Subdomain"
    ;;
  *)
    echo "❌ Invalid choice. Exiting."
    exit 1
    ;;
esac

echo ""
echo "Configuration: $SETUP_NAME"
echo "VITE_API_URL: $API_URL"
echo ""

# Update docker-compose.yml
echo "📝 Updating docker-compose.yml..."
if [ -z "$API_URL" ]; then
  # Empty string for same domain
  sed -i.bak 's|VITE_API_URL: ".*"|VITE_API_URL: ""|' docker-compose.yml
else
  # Full URL for subdomain
  sed -i.bak "s|VITE_API_URL: \".*\"|VITE_API_URL: \"$API_URL\"|" docker-compose.yml
fi

echo "✅ Configuration updated!"
echo ""
echo "=========================================="
echo "📦 Next Steps:"
echo "=========================================="
echo ""

if [ $choice -eq 1 ]; then
  echo "Same Domain Setup:"
  echo "1. Configure DNS:"
  echo "   A Record: govsureai.com     → YOUR_SERVER_IP"
  echo "   A Record: www.govsureai.com → YOUR_SERVER_IP"
  echo ""
  echo "2. Deploy:"
  echo "   docker compose down -v"
  echo "   docker compose build --no-cache web"
  echo "   docker compose up -d"
  echo ""
  echo "3. Test:"
  echo "   curl https://govsureai.com"
  echo "   curl https://govsureai.com/api/v1/health"
else
  echo "Subdomain Setup:"
  echo "1. Configure DNS:"
  echo "   A Record: govsureai.com     → YOUR_SERVER_IP"
  echo "   A Record: www.govsureai.com → YOUR_SERVER_IP"
  echo "   A Record: api.govsureai.com → YOUR_SERVER_IP"
  echo ""
  echo "2. Update backend CORS (backend/app/core/config.py):"
  echo "   CORS_ORIGINS = ["
  echo "       'https://govsureai.com',"
  echo "       'https://www.govsureai.com',"
  echo "   ]"
  echo ""
  echo "3. Deploy:"
  echo "   docker compose down -v"
  echo "   docker compose build --no-cache web backend"
  echo "   docker compose up -d"
  echo ""
  echo "4. Test:"
  echo "   curl https://govsureai.com"
  echo "   curl https://api.govsureai.com/api/v1/health"
fi

echo ""
echo "📖 For detailed guide, see: DOMAIN_SETUP_GUIDE.md"
echo ""

# Ask if user wants to deploy now
read -p "Deploy now? (y/n): " deploy

if [ "$deploy" == "y" ] || [ "$deploy" == "Y" ]; then
  echo ""
  echo "🚀 Deploying..."
  
  # Detect docker compose command
  if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
  elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
  else
    echo "❌ Docker Compose not found"
    exit 1
  fi
  
  echo "Stopping containers and removing volumes..."
  $DOCKER_COMPOSE down -v
  
  echo "Building frontend..."
  if [ $choice -eq 2 ]; then
    $DOCKER_COMPOSE build --no-cache web backend
  else
    $DOCKER_COMPOSE build --no-cache web
  fi
  
  echo "Starting services..."
  $DOCKER_COMPOSE up -d
  
  echo ""
  echo "✅ Deployment complete!"
  echo ""
  echo "Check status: $DOCKER_COMPOSE ps"
  echo "View logs:    $DOCKER_COMPOSE logs -f"
else
  echo ""
  echo "Skipping deployment. Run manually when ready:"
  echo "  docker compose down -v"
  echo "  docker compose build --no-cache web"
  echo "  docker compose up -d"
fi

echo ""
echo "Done! 🎉"

