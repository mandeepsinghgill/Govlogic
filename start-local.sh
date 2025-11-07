#!/bin/bash

# 🚀 GovSure - Local Development Startup Script

echo "🚀 Starting GovSure Local Development Environment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start backend services
echo -e "${BLUE}📦 Starting backend services (PostgreSQL, Redis, FastAPI, Celery)...${NC}"
docker-compose -f docker-compose.local.yml up -d

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 5

# Check if backend is healthy
echo -e "${BLUE}🏥 Checking backend health...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is ready!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}⚠️  Backend is taking longer than expected. Check logs with: docker-compose -f docker-compose.local.yml logs backend${NC}"
    fi
    sleep 1
done

echo ""
echo -e "${GREEN}✅ Backend services are running!${NC}"
echo ""
echo "📍 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo "🏥 Health Check: http://localhost:8000/health"
echo ""
echo -e "${BLUE}To start the frontend, run:${NC}"
echo "  cd frontend"
echo "  npm install  # (first time only)"
echo "  npm run dev"
echo ""
echo -e "${BLUE}To view logs:${NC}"
echo "  docker-compose -f docker-compose.local.yml logs -f"
echo ""
echo -e "${BLUE}To stop services:${NC}"
echo "  docker-compose -f docker-compose.local.yml down"
echo ""
echo -e "${GREEN}🎉 Happy coding!${NC}"

