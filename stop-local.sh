#!/bin/bash

# 🛑 GovSure - Stop Local Development Environment

echo "🛑 Stopping GovSure Local Development Environment..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Stop Docker services
docker-compose -f docker-compose.local.yml down

echo ""
echo -e "${GREEN}✅ All services stopped!${NC}"
echo ""
echo -e "To remove all data (database, redis, uploads), run:"
echo "  docker-compose -f docker-compose.local.yml down -v"
echo ""

