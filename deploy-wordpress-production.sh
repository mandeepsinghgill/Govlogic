#!/bin/bash

# WordPress Production Deployment Script for govsureai.com
# This script sets up WordPress, PHP, and configures the domain

set -e

echo "🚀 Starting WordPress Production Deployment for govsureai.com"
echo "================================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="govsureai.com"
BLOG_DOMAIN="blog.${DOMAIN}"
PROJECT_DIR="/home/ubuntu/govlogic"
BLOG_DIR="${PROJECT_DIR}/blog"
WORDPRESS_DIR="${BLOG_DIR}/wordpress"
WEB_ROOT="/var/www/govsureai.com"
BLOG_WEB_ROOT="/var/www/${BLOG_DOMAIN}"

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}⚠️  This script requires sudo privileges${NC}"
    echo "Please run: sudo bash deploy-wordpress-production.sh"
    exit 1
fi

echo "📋 Configuration:"
echo "   Domain: ${DOMAIN}"
echo "   Blog Domain: ${BLOG_DOMAIN}"
echo "   Project Directory: ${PROJECT_DIR}"
echo "   WordPress Directory: ${WORDPRESS_DIR}"
echo ""

# Step 1: Install PHP and required extensions
echo "🔧 Step 1: Installing PHP and extensions..."
if ! command -v php &> /dev/null; then
    echo "Installing PHP..."
    apt-get update
    apt-get install -y php8.1-fpm php8.1-cli php8.1-common php8.1-mysql php8.1-zip php8.1-gd php8.1-mbstring php8.1-curl php8.1-xml php8.1-bcmath php8.1-pgsql
else
    PHP_VERSION=$(php -r 'echo PHP_VERSION;')
    echo -e "${GREEN}✅ PHP already installed: ${PHP_VERSION}${NC}"
fi

# Install required PHP extensions
echo "Installing PHP extensions..."
apt-get install -y php8.1-fpm php8.1-pgsql php8.1-mbstring php8.1-xml php8.1-curl php8.1-zip php8.1-gd php8.1-mysql

# Step 2: Install and configure Nginx
echo ""
echo "🔧 Step 2: Installing and configuring Nginx..."
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
    systemctl enable nginx
    systemctl start nginx
else
    echo -e "${GREEN}✅ Nginx already installed${NC}"
fi

# Step 3: Create web directories
echo ""
echo "📁 Step 3: Creating web directories..."
mkdir -p "${WEB_ROOT}"
mkdir -p "${BLOG_WEB_ROOT}"
chown -R www-data:www-data "${WEB_ROOT}"
chown -R www-data:www-data "${BLOG_WEB_ROOT}"

# Step 4: Copy WordPress files
echo ""
echo "📦 Step 4: Setting up WordPress..."
if [ -d "${WORDPRESS_DIR}" ]; then
    echo "Copying WordPress files to web root..."
    cp -r "${WORDPRESS_DIR}"/* "${BLOG_WEB_ROOT}/"
    chown -R www-data:www-data "${BLOG_WEB_ROOT}"
    chmod -R 755 "${BLOG_WEB_ROOT}"
    echo -e "${GREEN}✅ WordPress files copied${NC}"
else
    echo -e "${RED}❌ WordPress directory not found at ${WORDPRESS_DIR}${NC}"
    echo "Please run: cd ${BLOG_DIR} && bash setup-wordpress.sh"
    exit 1
fi

# Step 5: Configure WordPress database
echo ""
echo "🔐 Step 5: Configuring WordPress database..."
if [ ! -f "${BLOG_WEB_ROOT}/wp-config.php" ]; then
    echo -e "${YELLOW}⚠️  wp-config.php not found. You'll need to configure it manually.${NC}"
    echo "Run WordPress installation at: https://${BLOG_DOMAIN}/wp-admin/install.php"
else
    echo -e "${GREEN}✅ wp-config.php found${NC}"
fi

# Step 6: Create Nginx configuration for blog
echo ""
echo "🌐 Step 6: Creating Nginx configuration..."
cat > "/etc/nginx/sites-available/${BLOG_DOMAIN}" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${BLOG_DOMAIN} www.${BLOG_DOMAIN};
    
    root ${BLOG_WEB_ROOT};
    index index.php index.html index.htm;
    
    # Logging
    access_log /var/log/nginx/${BLOG_DOMAIN}-access.log;
    error_log /var/log/nginx/${BLOG_DOMAIN}-error.log;
    
    # WordPress configuration
    location / {
        try_files \$uri \$uri/ /index.php?\$args;
    }
    
    # PHP processing
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        include fastcgi_params;
    }
    
    # Deny access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ /(wp-config\.php|wp-content/uploads/.*\.php|readme\.html|license\.txt) {
        deny all;
    }
    
    # Cache static files
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

# Enable the site
ln -sf "/etc/nginx/sites-available/${BLOG_DOMAIN}" "/etc/nginx/sites-enabled/${BLOG_DOMAIN}"

# Test Nginx configuration
echo "Testing Nginx configuration..."
if nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
    systemctl reload nginx
else
    echo -e "${RED}❌ Nginx configuration error${NC}"
    exit 1
fi

# Step 7: Configure PHP-FPM
echo ""
echo "⚙️  Step 7: Configuring PHP-FPM..."
PHP_FPM_CONF="/etc/php/8.1/fpm/pool.d/www.conf"
if [ -f "${PHP_FPM_CONF}" ]; then
    # Update PHP-FPM settings for WordPress
    sed -i 's/;listen.owner = www-data/listen.owner = www-data/' "${PHP_FPM_CONF}"
    sed -i 's/;listen.group = www-data/listen.group = www-data/' "${PHP_FPM_CONF}"
    systemctl restart php8.1-fpm
    echo -e "${GREEN}✅ PHP-FPM configured${NC}"
fi

# Step 8: Set up SSL with Let's Encrypt (optional)
echo ""
echo "🔒 Step 8: SSL Certificate Setup"
read -p "Do you want to set up SSL with Let's Encrypt? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if ! command -v certbot &> /dev/null; then
        apt-get install -y certbot python3-certbot-nginx
    fi
    echo "Running certbot for ${BLOG_DOMAIN}..."
    certbot --nginx -d "${BLOG_DOMAIN}" -d "www.${BLOG_DOMAIN}" --non-interactive --agree-tos --email admin@${DOMAIN} || echo "Certbot setup failed. You can run it manually later."
fi

echo ""
echo "================================================================"
echo -e "${GREEN}✅ WordPress deployment complete!${NC}"
echo ""
echo "📝 Next Steps:"
echo "   1. Point DNS for ${BLOG_DOMAIN} to this server's IP"
echo "   2. Visit https://${BLOG_DOMAIN}/wp-admin/install.php to complete WordPress setup"
echo "   3. Activate the 'GovSure' theme in WordPress admin"
echo "   4. Update frontend blog link to: https://${BLOG_DOMAIN}"
echo ""
echo "🔍 Useful Commands:"
echo "   - Check Nginx status: systemctl status nginx"
echo "   - Check PHP-FPM status: systemctl status php8.1-fpm"
echo "   - View Nginx logs: tail -f /var/log/nginx/${BLOG_DOMAIN}-error.log"
echo "   - Restart Nginx: systemctl restart nginx"
echo "   - Restart PHP-FPM: systemctl restart php8.1-fpm"
echo ""

