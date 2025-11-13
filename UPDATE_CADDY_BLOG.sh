#!/bin/bash

# Update Caddy Configuration for Blog
# This script updates the Caddyfile with the correct PHP-FPM socket

set -e

echo "🔧 Updating Caddy Configuration for Blog"
echo "=========================================="
echo ""

if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  This script requires sudo. Please run:"
    echo "   sudo bash UPDATE_CADDY_BLOG.sh"
    exit 1
fi

# Find PHP-FPM socket
echo "🔍 Finding PHP-FPM socket..."
PHP_FPM_SOCKET=""
for version in 8.3 8.2 8.1 8.0; do
    if [ -S "/var/run/php/php${version}-fpm.sock" ]; then
        PHP_FPM_SOCKET="/var/run/php/php${version}-fpm.sock"
        echo "   ✅ Found: ${PHP_FPM_SOCKET}"
        break
    fi
done

if [ -z "$PHP_FPM_SOCKET" ]; then
    if [ -S "/var/run/php/php-fpm.sock" ]; then
        PHP_FPM_SOCKET="/var/run/php/php-fpm.sock"
        echo "   ✅ Found: ${PHP_FPM_SOCKET}"
    else
        echo "   ❌ PHP-FPM socket not found!"
        echo "   Please ensure PHP-FPM is installed and running"
        exit 1
    fi
fi

# Find Caddyfile
CADDYFILE=""
if [ -f "/etc/caddy/Caddyfile" ]; then
    CADDYFILE="/etc/caddy/Caddyfile"
    echo "   Using: ${CADDYFILE}"
elif [ -f "./Caddyfile" ]; then
    CADDYFILE="./Caddyfile"
    echo "   Using: ${CADDYFILE}"
else
    echo "   ❌ Caddyfile not found!"
    exit 1
fi

# Update Caddyfile with correct socket
echo ""
echo "📝 Updating Caddyfile..."
if grep -q "php_fastcgi unix//var/run/php" "${CADDYFILE}"; then
    # Replace the socket path
    sed -i "s|php_fastcgi unix//var/run/php/[^ ]*|php_fastcgi unix//${PHP_FPM_SOCKET}|g" "${CADDYFILE}"
    echo "✅ Caddyfile updated with socket: ${PHP_FPM_SOCKET}"
else
    echo "   ⚠️  php_fastcgi directive not found in Caddyfile"
    echo "   Please check the Caddyfile manually"
fi

# Reload Caddy
echo ""
echo "🔄 Reloading Caddy..."
if systemctl is-active --quiet caddy; then
    # Try different reload methods
    if systemctl reload caddy 2>/dev/null; then
        echo "✅ Caddy reloaded via systemctl"
    elif caddy reload --config "${CADDYFILE}" 2>/dev/null; then
        echo "✅ Caddy reloaded via caddy command"
    else
        echo "   ⚠️  Could not reload Caddy automatically"
        echo "   Please run manually: sudo systemctl reload caddy"
        echo "   Or: sudo caddy reload --config ${CADDYFILE}"
    fi
else
    echo "   ⚠️  Caddy is not running"
    echo "   Start it with: sudo systemctl start caddy"
fi

echo ""
echo "=========================================="
echo "✅ Caddy configuration updated!"
echo ""
echo "📝 Next steps:"
echo "   1. Visit: http://blog.govsureai.com"
echo "   2. If you see the main site, check:"
echo "      - DNS propagation (may take a few minutes)"
echo "      - Caddy logs: sudo journalctl -u caddy -f"
echo "      - WordPress files: ls -la /var/www/blog.govsureai.com"
echo ""

