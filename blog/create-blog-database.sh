#!/bin/bash

# Script to create PostgreSQL database for WordPress blog

set -e

DB_NAME="${WP_DB_NAME:-GovSure_blog}"
DB_USER="${WP_DB_USER:-GovSure}"
DB_PASSWORD="${WP_DB_PASSWORD:-GovSure}"
DB_HOST="${WP_DB_HOST:-localhost}"
DB_PORT="${WP_DB_PORT:-5432}"

echo "🗄️  Creating WordPress blog database..."
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo "   Host: $DB_HOST:$DB_PORT"
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql is not installed"
    echo "   Please install PostgreSQL client tools"
    exit 1
fi

# Test connection
echo "🔍 Testing database connection..."
export PGPASSWORD="$DB_PASSWORD"

if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT 1" > /dev/null 2>&1; then
    echo "❌ Error: Cannot connect to PostgreSQL"
    echo "   Please check:"
    echo "   - PostgreSQL is running"
    echo "   - Database credentials are correct"
    echo "   - User has proper permissions"
    exit 1
fi

echo "✅ Database connection successful"
echo ""

# Check if database already exists
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
    echo "⚠️  Database '$DB_NAME' already exists"
    read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Dropping existing database..."
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS \"$DB_NAME\";"
    else
        echo "✅ Using existing database"
        exit 0
    fi
fi

# Create database
echo "📝 Creating database '$DB_NAME'..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE \"$DB_NAME\" OWNER \"$DB_USER\";"

# Grant privileges
echo "🔐 Granting privileges..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "GRANT ALL PRIVILEGES ON DATABASE \"$DB_NAME\" TO \"$DB_USER\";"

echo ""
echo "✅ Database '$DB_NAME' created successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Update wp-config.php if needed (currently set to use $DB_NAME)"
echo "   2. Run: ./setup-wordpress.sh"
echo "   3. Run: ./install-postgresql-plugin.sh"
echo "   4. Run: ./start-blog-server.sh"
echo ""

unset PGPASSWORD

