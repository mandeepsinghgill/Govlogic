#!/bin/bash

# Fix PHP Installation - Remove broken PPA and install default PHP
# Run this if you're getting PPA errors

set -e

echo "🔧 Fixing PHP Installation"
echo "=========================="
echo ""

if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  This script requires sudo. Please run:"
    echo "   sudo bash FIX_PHP_INSTALL.sh"
    exit 1
fi

# Step 1: Remove broken PPA
echo "🧹 Step 1: Removing broken PPA..."
if [ -f /etc/apt/sources.list.d/ondrej-ubuntu-php-*.sources ] || [ -f /etc/apt/sources.list.d/ondrej-ubuntu-php-*.list ]; then
    rm -f /etc/apt/sources.list.d/ondrej-ubuntu-php-*.sources
    rm -f /etc/apt/sources.list.d/ondrej-ubuntu-php-*.list
    echo "✅ Removed PPA sources"
fi

# Also remove from sources.list if present
if grep -q "ondrej/php" /etc/apt/sources.list 2>/dev/null; then
    sed -i '/ondrej\/php/d' /etc/apt/sources.list
    echo "✅ Removed PPA from sources.list"
fi

# Step 2: Clean apt cache
echo ""
echo "🧹 Step 2: Cleaning apt cache..."
apt-get clean
apt-get update

# Step 3: Install PHP using default packages
echo ""
echo "📦 Step 3: Installing PHP using default Ubuntu packages..."
apt-get install -y php-fpm php-cli php-common php-mysql php-zip php-gd \
  php-mbstring php-curl php-xml php-bcmath php-pgsql

# Verify installation
echo ""
echo "✅ Verifying PHP installation..."
if command -v php &> /dev/null; then
    PHP_VERSION=$(php -r 'echo PHP_VERSION;')
    echo "✅ PHP installed: ${PHP_VERSION}"
    
    # Show installed extensions
    echo ""
    echo "📋 Installed PHP extensions:"
    php -m | grep -E "(pgsql|mysql|zip|gd|mbstring|curl|xml|bcmath)" || true
else
    echo "❌ PHP installation failed"
    exit 1
fi

# Step 4: Find and start PHP-FPM
echo ""
echo "🔍 Step 4: Finding PHP-FPM service..."

# Find PHP-FPM service
PHP_FPM_SERVICE=""
for version in 8.3 8.2 8.1 8.0; do
    if systemctl list-unit-files 2>/dev/null | grep -q "php${version}-fpm"; then
        PHP_FPM_SERVICE="php${version}-fpm"
        break
    fi
done

if [ -z "$PHP_FPM_SERVICE" ]; then
    PHP_FPM_SERVICE="php-fpm"
fi

echo "   PHP-FPM service: ${PHP_FPM_SERVICE}"

# Start and enable PHP-FPM
echo ""
echo "⚙️  Starting PHP-FPM..."
systemctl enable "${PHP_FPM_SERVICE}" 2>/dev/null || true
systemctl start "${PHP_FPM_SERVICE}"
systemctl status "${PHP_FPM_SERVICE}" --no-pager -l || true

# Find PHP-FPM socket
echo ""
echo "🔍 Finding PHP-FPM socket..."
PHP_FPM_SOCKET=$(ls /var/run/php/*.sock 2>/dev/null | head -1)
if [ -n "$PHP_FPM_SOCKET" ]; then
    echo "   ✅ PHP-FPM socket: ${PHP_FPM_SOCKET}"
else
    echo "   ⚠️  PHP-FPM socket not found yet. It may appear after PHP-FPM starts."
fi

echo ""
echo "=================================="
echo "✅ PHP installation fixed!"
echo ""
echo "📝 Next steps:"
echo "   1. Run WordPress setup: sudo bash QUICK_WORDPRESS_SETUP.sh"
echo "   2. Or continue with manual WordPress configuration"
echo ""

