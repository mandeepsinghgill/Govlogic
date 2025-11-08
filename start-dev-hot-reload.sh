#!/bin/bash

# GovSure Development Setup with Hot Reload
# This script starts the backend in Docker and frontend locally for instant updates

set -e

echo "🚀 Starting GovSure Development Environment with Hot Reload..."
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found"
    echo "Please run this script from the project root: /Users/mandeepgill/Downloads/govlogic"
    exit 1
fi

# Start Docker services (backend only)
echo "📦 Starting Docker services (postgres, redis, backend, celery)..."
docker-compose up -d postgres redis backend celery

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Docker services are running!"
else
    echo "❌ Error: Docker services failed to start"
    echo "Run: docker-compose logs backend"
    exit 1
fi

echo ""
echo "🔥 Starting Vite dev server with HOT RELOAD..."
echo ""
echo "📝 Note: This will open in the current terminal."
echo "   To stop: Press Ctrl+C"
echo "   Backend logs: docker-compose logs -f backend (in another terminal)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Change to frontend directory and start Vite
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
    echo ""
fi

# Start Vite dev server
echo "🌐 Starting Vite at http://localhost:3000"
echo "   Edit files in frontend/src/ for instant updates!"
echo ""

npm run dev

