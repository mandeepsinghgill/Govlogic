#!/bin/bash

echo "🚀 Starting GovLogic Backend with Pipeline Support"
echo "=================================================="
echo ""

cd backend

echo "📋 Pre-flight checks..."
echo ""

# Check if requirements are installed
if ! python -c "import fastapi" 2>/dev/null; then
    echo "⚠️  FastAPI not found. Installing requirements..."
    pip install -r requirements.txt
fi

echo "✅ Dependencies OK"
echo ""

echo "🔧 Checking database..."
if [ -f "test.db" ]; then
    echo "✅ Database file found: test.db"
else
    echo "📝 Database will be created on first run"
fi
echo ""

echo "🚀 Starting backend server..."
echo "   URL: http://localhost:8000"
echo "   Docs: http://localhost:8000/docs"
echo ""
echo "👀 Watch for: ✅ Pipeline tables created/verified"
echo ""
echo "Press Ctrl+C to stop"
echo ""

uvicorn app.main:app --reload --port 8000
