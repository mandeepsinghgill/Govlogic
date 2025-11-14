#!/bin/bash

# Docker WordPress Setup Script
# Sets up WordPress in Docker with PHP-FPM

set -e

echo "🐳 Docker WordPress Setup"
echo "=========================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ docker-compose is not installed"
    exit 1
fi

echo "📋 Configuration:"
echo "   Blog Domain: blog.govsureai.com"
echo "   WordPress Location: ./blog/wordpress"
echo "   PHP-FPM Container: php-fpm:9000"
echo ""

# Step 1: Check WordPress files
echo "📦 Step 1: Checking WordPress files..."
if [ ! -d "./blog/wordpress" ] || [ ! -f "./blog/wordpress/wp-config.php" ]; then
    echo "   ⚠️  WordPress files not found or incomplete"
    echo "   Please ensure WordPress is set up in ./blog/wordpress/"
    echo "   Run: cd blog && bash setup-wordpress.sh"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ WordPress files found"
fi

# Step 2: Update docker-compose.yml
echo ""
echo "🐳 Step 2: Checking docker-compose.yml..."
if grep -q "php-fpm:" docker-compose.yml; then
    echo "✅ PHP-FPM service already configured"
else
    echo "   ⚠️  PHP-FPM service not found in docker-compose.yml"
    echo "   Please add the php-fpm service to docker-compose.yml"
    exit 1
fi

# Step 3: Build and start containers
echo ""
echo "🔨 Step 3: Building and starting containers..."
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

echo "   Building PHP-FPM image..."
$COMPOSE_CMD build php-fpm

echo "   Starting services..."
$COMPOSE_CMD up -d php-fpm caddy

# Step 4: Wait for services
echo ""
echo "⏳ Step 4: Waiting for services to be ready..."
sleep 5

# Step 5: Verify PHP-FPM is running
echo ""
echo "🔍 Step 5: Verifying PHP-FPM..."
if docker ps | grep -q php-fpm; then
    echo "✅ PHP-FPM container is running"
    
    # Test PHP-FPM connection
    if docker exec php-fpm php -v &> /dev/null; then
        PHP_VERSION=$(docker exec php-fpm php -r 'echo PHP_VERSION;')
        echo "   PHP Version: ${PHP_VERSION}"
    fi
else
    echo "❌ PHP-FPM container is not running"
    echo "   Check logs: $COMPOSE_CMD logs php-fpm"
    exit 1
fi

# Step 6: Verify Caddy is running
echo ""
echo "🔍 Step 6: Verifying Caddy..."
if docker ps | grep -q caddy; then
    echo "✅ Caddy container is running"
else
    echo "❌ Caddy container is not running"
    echo "   Check logs: $COMPOSE_CMD logs caddy"
    exit 1
fi

# Step 7: Check WordPress database configuration
echo ""
echo "📝 Step 7: WordPress Database Configuration"
echo "   WordPress needs to connect to PostgreSQL:"
echo "   - Host: postgres (Docker service name)"
echo "   - Port: 5432"
echo "   - Database: GovSure (or create a new one)"
echo "   - User: GovSure"
echo "   - Password: GovSure"
echo ""
echo "   Update wp-config.php with these settings if needed."

echo ""
echo "=========================================="
echo "✅ Docker WordPress setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Ensure DNS A record for blog.govsureai.com points to your server"
echo "   2. Visit: http://blog.govsureai.com"
echo "   3. Complete WordPress installation if needed"
echo "   4. Activate the 'GovSure' theme"
echo ""
echo "🔍 Useful Commands:"
echo "   - View logs: $COMPOSE_CMD logs -f php-fpm"
echo "   - Restart services: $COMPOSE_CMD restart php-fpm caddy"
echo "   - Stop services: $COMPOSE_CMD stop php-fpm"
echo "   - View all services: $COMPOSE_CMD ps"
echo ""

