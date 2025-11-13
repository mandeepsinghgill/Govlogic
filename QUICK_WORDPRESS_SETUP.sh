#!/bin/bash

# Quick WordPress Setup Script for Production Server
# Run this on your server after SSH login

set -e

echo "🚀 Quick WordPress Setup for govsureai.com"
echo "============================================"
echo ""

# Configuration
BLOG_DOMAIN="blog.govsureai.com"
PROJECT_DIR=$(pwd)
BLOG_DIR="${PROJECT_DIR}/blog"
WORDPRESS_DIR="${BLOG_DIR}/wordpress"
WEB_ROOT="/var/www/${BLOG_DOMAIN}"

# Check if running with sudo
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  This script requires sudo. Please run:"
    echo "   sudo bash QUICK_WORDPRESS_SETUP.sh"
    exit 1
fi

echo "📋 Configuration:"
echo "   Blog Domain: ${BLOG_DOMAIN}"
echo "   WordPress Source: ${WORDPRESS_DIR}"
echo "   Web Root: ${WEB_ROOT}"
echo ""

# Step 1: Install PHP
echo "🔧 Step 1: Installing PHP 8.1 and extensions..."
apt-get update
apt-get install -y php8.1-fpm php8.1-cli php8.1-common \
  php8.1-mysql php8.1-zip php8.1-gd php8.1-mbstring \
  php8.1-curl php8.1-xml php8.1-bcmath php8.1-pgsql

# Verify PHP installation
PHP_VERSION=$(php -r 'echo PHP_VERSION;')
echo "✅ PHP installed: ${PHP_VERSION}"

# Step 2: Create web directory
echo ""
echo "📁 Step 2: Creating web directory..."
mkdir -p "${WEB_ROOT}"
echo "✅ Directory created: ${WEB_ROOT}"

# Step 3: Copy WordPress files
echo ""
echo "📦 Step 3: Copying WordPress files..."
if [ -d "${WORDPRESS_DIR}" ]; then
    cp -r "${WORDPRESS_DIR}"/* "${WEB_ROOT}/"
    chown -R www-data:www-data "${WEB_ROOT}"
    chmod -R 755 "${WEB_ROOT}"
    echo "✅ WordPress files copied"
else
    echo "❌ WordPress directory not found at ${WORDPRESS_DIR}"
    echo "Please ensure you're in the project root directory"
    exit 1
fi

# Step 4: Set permissions
echo ""
echo "🔐 Step 4: Setting permissions..."
chown -R www-data:www-data "${WEB_ROOT}"
find "${WEB_ROOT}" -type d -exec chmod 755 {} \;
find "${WEB_ROOT}" -type f -exec chmod 644 {} \;
echo "✅ Permissions set"

# Step 5: Check if using Caddy or Nginx
echo ""
echo "🌐 Step 5: Checking web server..."
if systemctl is-active --quiet caddy; then
    echo "✅ Caddy is running"
    echo "   - Caddyfile has been updated with blog configuration"
    echo "   - Reload Caddy: sudo systemctl reload caddy"
    SERVER="caddy"
elif systemctl is-active --quiet nginx; then
    echo "✅ Nginx is running"
    SERVER="nginx"
    # Create Nginx config
    cat > "/etc/nginx/sites-available/${BLOG_DOMAIN}" <<EOF
server {
    listen 80;
    server_name ${BLOG_DOMAIN} www.${BLOG_DOMAIN};
    root ${WEB_ROOT};
    index index.php index.html;
    
    location / {
        try_files \$uri \$uri/ /index.php?\$args;
    }
    
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    }
    
    location ~ /\. {
        deny all;
    }
}
EOF
    ln -sf "/etc/nginx/sites-available/${BLOG_DOMAIN}" "/etc/nginx/sites-enabled/"
    nginx -t && systemctl reload nginx
    echo "✅ Nginx configuration created and reloaded"
else
    echo "⚠️  Neither Caddy nor Nginx is running"
    echo "   Please install and configure a web server"
fi

# Step 6: Start PHP-FPM
echo ""
echo "⚙️  Step 6: Starting PHP-FPM..."
systemctl enable php8.1-fpm
systemctl start php8.1-fpm
systemctl status php8.1-fpm --no-pager -l
echo "✅ PHP-FPM is running"

echo ""
echo "============================================"
echo "✅ WordPress setup complete!"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Configure DNS:"
echo "   Add A record: blog.govsureai.com → YOUR_SERVER_IP"
echo ""
echo "2. Configure WordPress database:"
echo "   Edit: ${WEB_ROOT}/wp-config.php"
echo "   Add your database credentials"
echo ""
echo "3. Complete WordPress installation:"
echo "   Visit: http://${BLOG_DOMAIN}/wp-admin/install.php"
echo ""
echo "4. Activate GovSure theme:"
echo "   WordPress Admin → Appearance → Themes → Activate GovSure"
echo ""
echo "5. Update frontend blog link (already done in code):"
echo "   Blog link now points to: https://blog.govsureai.com"
echo ""
echo "🔍 Useful Commands:"
echo "   - Check PHP-FPM: sudo systemctl status php8.1-fpm"
echo "   - Check web server: sudo systemctl status ${SERVER}"
echo "   - View logs: sudo tail -f /var/log/${SERVER}/error.log"
echo ""

