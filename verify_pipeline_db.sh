#!/bin/bash

echo "🔍 PIPELINE DATABASE VERIFICATION"
echo "=================================="
echo ""

cd "$(dirname "$0")/backend"

echo "📋 Checking database file..."
if [ -f "test.db" ]; then
    echo "✅ Database file exists: test.db"
else
    echo "⚠️  Database file not found. Will be created on first run."
fi
echo ""

echo "📊 Checking for pipeline_items table..."
if [ -f "test.db" ]; then
    TABLES=$(sqlite3 test.db ".tables" 2>/dev/null | grep -o "pipeline_items")
    if [ "$TABLES" = "pipeline_items" ]; then
        echo "✅ pipeline_items table exists!"
        echo ""
        echo "📝 Table schema:"
        sqlite3 test.db ".schema pipeline_items"
        echo ""
        echo "📈 Current row count:"
        COUNT=$(sqlite3 test.db "SELECT COUNT(*) FROM pipeline_items;" 2>/dev/null)
        echo "   Records in pipeline_items: $COUNT"
    else
        echo "⚠️  pipeline_items table not found yet."
        echo "   It will be created when you start the backend."
    fi
else
    echo "⚠️  Database not initialized yet."
fi
echo ""

echo "🚀 TO START THE BACKEND:"
echo "   cd backend"
echo "   uvicorn app.main:app --reload --port 8000"
echo ""
echo "   Look for this message on startup:"
echo "   ✅ Pipeline tables created/verified"
echo ""

echo "🧪 TO TEST THE API:"
echo "   1. Log in to get a token"
echo "   2. Use the token to call:"
echo "      curl -X POST http://localhost:8000/api/v1/pipeline/items \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -H 'Authorization: Bearer YOUR_TOKEN' \\"
echo "        -d '{\"opportunity_id\": \"test\", \"title\": \"Test\", \"agency\": \"Test Agency\"}'"
echo ""

