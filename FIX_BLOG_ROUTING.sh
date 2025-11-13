#!/bin/bash

# Fix Blog Subdomain Routing
# This script fixes the blog subdomain to show WordPress instead of main site

set -e

echo "🔧 Fixing Blog Subdomain Routing"
echo "=================================="
echo ""

if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  This script requires sudo. Please run:"
    echo "   sudo bash FIX_BLOG_ROUTING.sh"
    exit 1
fi

BLOG_DOMAIN="blog.govsureai.com"
WEB_ROOT="/var/www/${BLOG_DOMAIN}"
WORDPRESS_DIR=""

# Find WordPress directory
if [ -d "/home/ubuntu/govlogic/blog/wordpress" ]; then
    WORDPRESS_DIR="/home/ubuntu/govlogic/blog/wordpress"
elif [ -d "$(pwd)/blog/wordpress" ]; then
    WORDPRESS_DIR="$(pwd)/blog/wordpress"
elif [ -d "./blog/wordpress" ]; then
    WORDPRESS_DIR="./blog/wordpress"
else
    echo "❌ WordPress directory not found"
    echo "   Please run this script from the project root directory"
    exit 1
fi

echo "📋 Configuration:"
echo "   Blog Domain: ${BLOG_DOMAIN}"
echo "   WordPress Source: ${WORDPRESS_DIR}"
echo "   Web Root: ${WEB_ROOT}"
echo ""

# Step 1: Ensure WordPress files are in place
echo "📦 Step 1: Checking WordPress files..."
if [ ! -d "${WEB_ROOT}" ]; then
    echo "   Creating web root directory..."
    mkdir -p "${WEB_ROOT}"
fi

if [ ! -f "${WEB_ROOT}/index.php" ]; then
    echo "   Copying WordPress files..."
    cp -r "${WORDPRESS_DIR}"/* "${WEB_ROOT}/"
    chown -R www-data:www-data "${WEB_ROOT}"
    chmod -R 755 "${WEB_ROOT}"
    echo "✅ WordPress files copied"
else
    echo "✅ WordPress files already exist"
fi

# Step 2: Find PHP-FPM socket
echo ""
echo "🔍 Step 2: Finding PHP-FPM socket..."
PHP_FPM_SOCKET=""
for version in 8.3 8.2 8.1 8.0; do
    if [ -S "/var/run/php/php${version}-fpm.sock" ]; then
        PHP_FPM_SOCKET="/var/run/php/php${version}-fpm.sock"
        echo "   Found: ${PHP_FPM_SOCKET}"
        break
    fi
done

if [ -z "$PHP_FPM_SOCKET" ]; then
    if [ -S "/var/run/php/php-fpm.sock" ]; then
        PHP_FPM_SOCKET="/var/run/php/php-fpm.sock"
        echo "   Found: ${PHP_FPM_SOCKET}"
    else
        echo "   ⚠️  PHP-FPM socket not found"
        echo "   Please ensure PHP-FPM is installed and running"
        echo "   Run: sudo systemctl status php*-fpm"
    fi
fi

# Step 3: Check if using Caddy or Nginx
echo ""
echo "🌐 Step 3: Checking web server..."

if systemctl is-active --quiet caddy; then
    echo "✅ Caddy is running"
    SERVER="caddy"
    
    # Check Caddyfile location
    CADDYFILE=""
    if [ -f "/etc/caddy/Caddyfile" ]; then
        CADDYFILE="/etc/caddy/Caddyfile"
    elif [ -f "./Caddyfile" ]; then
        CADDYFILE="./Caddyfile"
    elif [ -f "$(pwd)/Caddyfile" ]; then
        CADDYFILE="$(pwd)/Caddyfile"
    fi
    
    if [ -n "$CADDYFILE" ]; then
        echo "   Caddyfile found: ${CADDYFILE}"
        echo "   Reloading Caddy..."
        systemctl reload caddy || caddy reload --config "${CADDYFILE}" || true
        echo "✅ Caddy reloaded"
    else
        echo "   ⚠️  Caddyfile not found. Please update Caddyfile manually."
    fi
    
elif systemctl is-active --quiet nginx; then
    echo "✅ Nginx is running"
    SERVER="nginx"
    
    # Create/update Nginx config
    echo "   Creating Nginx configuration..."
    
    if [ -z "$PHP_FPM_SOCKET" ]; then
        PHP_FPM_SOCKET="/var/run/php/php-fpm.sock"
    fi
    
    cat > "/etc/nginx/sites-available/${BLOG_DOMAIN}" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${BLOG_DOMAIN} www.${BLOG_DOMAIN};
    root ${WEB_ROOT};
    index index.php index.html;
    
    # Logging
    access_log /var/log/nginx/${BLOG_DOMAIN}-access.log;
    error_log /var/log/nginx/${BLOG_DOMAIN}-error.log;
    
    # WordPress rewrite rules
    location / {
        try_files \$uri \$uri/ /index.php?\$args;
    }
    
    # PHP processing
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:${PHP_FPM_SOCKET};
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        include fastcgi_params;
    }
    
    # Deny access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ /(wp-config\.php|readme\.html|license\.txt) {
        deny all;
    }
    
    # Cache static files
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
    
    # Enable site
    ln -sf "/etc/nginx/sites-available/${BLOG_DOMAIN}" "/etc/nginx/sites-enabled/"
    
    # Test and reload
    if nginx -t; then
        systemctl reload nginx
        echo "✅ Nginx configuration updated and reloaded"
    else
        echo "❌ Nginx configuration error"
        exit 1
    fi
    
else
    echo "⚠️  Neither Caddy nor Nginx is running"
    echo "   Please start your web server first"
    exit 1
fi

# Step 4: Verify WordPress files
echo ""
echo "🔍 Step 4: Verifying WordPress setup..."
if [ -f "${WEB_ROOT}/wp-config.php" ]; then
    echo "✅ wp-config.php found"
else
    echo "⚠️  wp-config.php not found"
    echo "   You may need to run WordPress installation"
    echo "   Visit: http://${BLOG_DOMAIN}/wp-admin/install.php"
fi

if [ -f "${WEB_ROOT}/index.php" ]; then
    echo "✅ WordPress index.php found"
else
    echo "❌ WordPress index.php not found - installation may be incomplete"
    exit 1
fi

echo ""
echo "=================================="
echo "✅ Blog routing fix complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Visit: http://${BLOG_DOMAIN}"
echo "   2. If you see WordPress installation, complete it"
echo "   3. Activate the 'GovSure' theme"
echo ""
echo "🔍 Troubleshooting:"
echo "   - Check web server logs:"
if [ "$SERVER" = "caddy" ]; then
    echo "     sudo journalctl -u caddy -f"
else
    echo "     sudo tail -f /var/log/nginx/${BLOG_DOMAIN}-error.log"
fi
echo "   - Check PHP-FPM: sudo systemctl status php*-fpm"
echo "   - Test PHP: echo '<?php phpinfo(); ?>' | sudo tee ${WEB_ROOT}/test.php"
echo "     (then visit http://${BLOG_DOMAIN}/test.php and delete the file)"
echo ""

