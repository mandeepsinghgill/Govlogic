#!/bin/bash

# Simple PHP Installation Script
# This script installs PHP using default Ubuntu packages (no PPA needed)

set -e

echo "🚀 Installing PHP (Simple Method)"
echo "=================================="
echo ""

if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  This script requires sudo. Please run:"
    echo "   sudo bash INSTALL_PHP_SIMPLE.sh"
    exit 1
fi

# Update package list
echo "📦 Updating package list..."
apt-get update

# Install PHP and all required extensions using default packages
echo ""
echo "🔧 Installing PHP and extensions..."
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

# Find PHP-FPM service
echo ""
echo "🔍 Detecting PHP-FPM service..."
PHP_FPM_SERVICE=$(systemctl list-unit-files 2>/dev/null | grep -o 'php[0-9.]*-fpm' | head -1)
if [ -z "$PHP_FPM_SERVICE" ]; then
    PHP_FPM_SERVICE="php-fpm"
fi

echo "   PHP-FPM service: ${PHP_FPM_SERVICE}"

# Start and enable PHP-FPM
echo ""
echo "⚙️  Starting PHP-FPM..."
systemctl enable "${PHP_FPM_SERVICE}"
systemctl start "${PHP_FPM_SERVICE}"
systemctl status "${PHP_FPM_SERVICE}" --no-pager -l || true

# Find PHP-FPM socket
echo ""
echo "🔍 Detecting PHP-FPM socket..."
PHP_FPM_SOCKET=$(ls /var/run/php/*.sock 2>/dev/null | head -1)
if [ -n "$PHP_FPM_SOCKET" ]; then
    echo "   PHP-FPM socket: ${PHP_FPM_SOCKET}"
else
    echo "   ⚠️  PHP-FPM socket not found. Check PHP-FPM configuration."
fi

echo ""
echo "=================================="
echo "✅ PHP installation complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Run the WordPress setup script: sudo bash QUICK_WORDPRESS_SETUP.sh"
echo "   2. Or configure your web server to use PHP-FPM"
echo ""

