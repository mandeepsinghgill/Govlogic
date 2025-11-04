#!/bin/bash

# Create test users using Docker backend
# This script works when backend is running in Docker

set -e

echo "=========================================="
echo "🚀 GovLogic Test Users Creator (Docker)"
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

# Create Python script inside container
echo "📝 Creating test users via backend container..."
echo ""

$DOCKER_COMPOSE exec -T backend python3 << 'PYTHON_SCRIPT'
import sys
sys.path.insert(0, '/app')

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.organization import User, Organization
from app.services.auth_service import AuthService
from datetime import datetime

# Test accounts
TEST_ACCOUNTS = [
    {
        "email": "admin@govsureai.com",
        "password": "Admin123!",
        "full_name": "Admin User",
        "organization_name": "GovSure AI Admin",
    },
    {
        "email": "test@govsureai.com",
        "password": "Test123!",
        "full_name": "Test User",
        "organization_name": "Test Organization",
    },
    {
        "email": "demo@govsureai.com",
        "password": "Demo123!",
        "full_name": "Demo User",
        "organization_name": "Demo Company",
    }
]

def create_user(db: Session, account: dict) -> bool:
    """Create a user directly in database"""
    try:
        # Check if user exists
        existing_user = db.query(User).filter(User.email == account['email']).first()
        if existing_user:
            print(f"ℹ️  Exists:  {account['email']}")
            return True
        
        # Check if organization exists
        org = db.query(Organization).filter(
            Organization.name == account['organization_name']
        ).first()
        
        if not org:
            # Create organization
            org = Organization(
                name=account['organization_name'],
                subscription_tier="free",
                max_users=10,
                is_active=True,
                created_at=datetime.utcnow()
            )
            db.add(org)
            db.flush()
        
        # Create user
        user = User(
            email=account['email'],
            hashed_password=AuthService.get_password_hash(account['password']),
            full_name=account['full_name'],
            organization_id=org.id,
            role="admin",
            is_active=True,
            is_verified=True,
            created_at=datetime.utcnow()
        )
        db.add(user)
        db.commit()
        
        print(f"✅ Created: {account['email']}")
        print(f"   User ID: {user.id}")
        print(f"   Organization: {org.name}")
        return True
        
    except Exception as e:
        db.rollback()
        print(f"❌ Failed:  {account['email']}")
        print(f"   Error: {str(e)}")
        return False

# Main execution
print("=" * 70)
print("📝 Creating test users in database...")
print()

db = SessionLocal()
try:
    results = []
    for account in TEST_ACCOUNTS:
        success = create_user(db, account)
        results.append((account['email'], account['password'], success))
        print()
    
    successful = sum(1 for _, _, success in results if success)
    
    print("=" * 70)
    print("📊 SUMMARY")
    print("=" * 70)
    print(f"\n✅ Successfully created/verified: {successful}/{len(results)} accounts\n")
    
    print("=" * 70)
    print("🔑 TEST ACCOUNT CREDENTIALS:")
    print("=" * 70)
    for email, password, success in results:
        if success:
            print(f"\n📧 {email}")
            print(f"   Password: {password}")
    
    print("\n" + "=" * 70)
    
finally:
    db.close()

PYTHON_SCRIPT

echo ""
echo "=========================================="
echo "✅ Done!"
echo "=========================================="
echo ""
echo "🌐 You can now login at:"
echo "   https://govsureai.com/login"
echo ""

