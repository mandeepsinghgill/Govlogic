#!/bin/bash

# Simple test user creation using API from within Docker network
# This method uses the signup API endpoint (most reliable)

set -e

echo "=========================================="
echo "🚀 GovLogic Test Users Creator (Simple)"
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

# Check if backend is running
if ! $DOCKER_COMPOSE ps backend | grep -q "Up"; then
    echo "❌ Backend container is not running!"
    echo ""
    echo "Start it with:"
    echo "  docker compose up -d backend"
    exit 1
fi

echo "✅ Backend container is running"
echo ""

# Test accounts
declare -a ACCOUNTS=(
    "admin@govsureai.com|Admin123!|Admin User|GovSure AI Admin"
    "test@govsureai.com|Test123!|Test User|Test Organization"
    "demo@govsureai.com|Demo123!|Demo User|Demo Company"
)

echo "📝 Creating test users via signup API..."
echo ""

SUCCESS_COUNT=0
TOTAL_COUNT=${#ACCOUNTS[@]}

for account in "${ACCOUNTS[@]}"; do
    IFS='|' read -r EMAIL PASSWORD NAME ORG <<< "$account"
    
    # Create JSON payload
    JSON_PAYLOAD=$(cat <<EOF
{
  "email": "$EMAIL",
  "password": "$PASSWORD",
  "full_name": "$NAME",
  "organization_name": "$ORG",
  "user_types": ["proposals", "grants"],
  "primary_focus": "proposals"
}
EOF
)
    
    # Call signup API from within backend container
    RESPONSE=$($DOCKER_COMPOSE exec -T backend curl -s -w "\n%{http_code}" -X POST \
        http://localhost:8000/api/v1/auth/signup \
        -H "Content-Type: application/json" \
        -d "$JSON_PAYLOAD" 2>/dev/null)
    
    # Extract HTTP status code (last line)
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ Created: $EMAIL"
        USER_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        [ -n "$USER_ID" ] && echo "   User ID: $USER_ID"
        ((SUCCESS_COUNT++))
    elif [ "$HTTP_CODE" = "400" ]; then
        if echo "$BODY" | grep -q "already registered"; then
            echo "ℹ️  Exists:  $EMAIL (already registered)"
            ((SUCCESS_COUNT++))
        else
            echo "❌ Failed:  $EMAIL"
            echo "   Error: $(echo "$BODY" | grep -o '"detail":"[^"]*"' | cut -d'"' -f4)"
        fi
    else
        echo "❌ Failed:  $EMAIL (HTTP $HTTP_CODE)"
    fi
    echo ""
done

# Summary
echo "=========================================="
echo "📊 SUMMARY"
echo "=========================================="
echo ""
echo "✅ Successfully created/verified: $SUCCESS_COUNT/$TOTAL_COUNT accounts"
echo ""

if [ $SUCCESS_COUNT -eq $TOTAL_COUNT ]; then
    echo "=========================================="
    echo "🔑 TEST ACCOUNT CREDENTIALS:"
    echo "=========================================="
    echo ""
    echo "📧 admin@govsureai.com"
    echo "   Password: Admin123!"
    echo ""
    echo "📧 test@govsureai.com"
    echo "   Password: Test123!"
    echo ""
    echo "📧 demo@govsureai.com"
    echo "   Password: Demo123!"
    echo ""
    echo "=========================================="
    echo "🌐 Login at: https://govsureai.com/login"
    echo "=========================================="
    echo ""
else
    echo "⚠️  Some accounts failed to create"
    echo "   Check the errors above for details"
    echo ""
fi










