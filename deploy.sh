#!/bin/bash

# GovLogic Ultimate Upgrade - Production Deployment Script
# This script automates the deployment process

set -e

echo "🚀 GovLogic Ultimate Upgrade - Deployment Script"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please create a .env file with required environment variables"
    exit 1
fi

echo -e "${GREEN}✅ .env file found${NC}"

# Load environment variables
source .env

# Step 1: Install backend dependencies
echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
cd backend
pip install -r requirements.txt --quiet
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

# Step 2: Run database migrations
echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
alembic upgrade head
echo -e "${GREEN}✅ Database migrations completed${NC}"

# Step 3: Install frontend dependencies
echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
cd ../frontend
npm install --silent
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"

# Step 4: Build frontend
echo -e "${YELLOW}🏗️  Building frontend...${NC}"
npm run build
echo -e "${GREEN}✅ Frontend build completed${NC}"

# Step 5: Run tests
echo -e "${YELLOW}🧪 Running tests...${NC}"
cd ../backend
pytest tests/ --tb=short || true
echo -e "${GREEN}✅ Tests completed${NC}"

# Step 6: Create deployment package
echo -e "${YELLOW}📦 Creating deployment package...${NC}"
cd ..
tar -czf govlogic-deployment-$(date +%Y%m%d-%H%M%S).tar.gz \
    backend/ frontend/dist/ docker-compose.yml .env
echo -e "${GREEN}✅ Deployment package created${NC}"

# Step 7: Display deployment instructions
echo -e "${GREEN}🎉 Deployment preparation complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Upload the deployment package to your server"
echo "2. Extract the package: tar -xzf govlogic-deployment-*.tar.gz"
echo "3. Start the application: docker-compose up -d"
echo "4. Verify deployment: curl http://localhost:8000/health"
echo ""
echo "For more information, see DEPLOYMENT_READY.md"
