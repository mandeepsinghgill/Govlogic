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
echo "🔧 Step 1: Installing PHP and extensions..."

# Detect OS and add PHP repository if needed
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VER=$VERSION_ID
else
    echo "❌ Cannot detect OS. Please install PHP manually."
    exit 1
fi

# Check if PHP is already installed
if command -v php &> /dev/null; then
    PHP_VERSION=$(php -r 'echo PHP_VERSION;')
    echo "✅ PHP already installed: ${PHP_VERSION}"
    PHP_MAJOR=$(php -r 'echo PHP_MAJOR_VERSION;')
    PHP_MINOR=$(php -r 'echo PHP_MINOR_VERSION;')
    echo "   Using PHP ${PHP_MAJOR}.${PHP_MINOR}"
    
    # Install extensions for existing PHP version
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        apt-get update
        apt-get install -y php${PHP_MAJOR}.${PHP_MINOR}-fpm php${PHP_MAJOR}.${PHP_MINOR}-cli php${PHP_MAJOR}.${PHP_MINOR}-common \
          php${PHP_MAJOR}.${PHP_MINOR}-mysql php${PHP_MAJOR}.${PHP_MINOR}-zip php${PHP_MAJOR}.${PHP_MINOR}-gd \
          php${PHP_MAJOR}.${PHP_MINOR}-mbstring php${PHP_MAJOR}.${PHP_MINOR}-curl \
          php${PHP_MAJOR}.${PHP_MINOR}-xml php${PHP_MAJOR}.${PHP_MINOR}-bcmath \
          php${PHP_MAJOR}.${PHP_MINOR}-pgsql || {
            echo "⚠️  Some extensions may not be available. Installing available ones..."
            apt-get install -y php-fpm php-cli php-common php-mysql php-zip php-gd \
              php-mbstring php-curl php-xml php-bcmath php-pgsql
        }
    fi
else
    # Install PHP from scratch
    echo "Installing PHP..."
    apt-get update
    
    if [ "$OS" = "ubuntu" ]; then
        # Try default PHP packages first (Ubuntu 24.04+ comes with PHP 8.3)
        echo "   Trying default PHP packages..."
        if apt-get install -y php-fpm php-cli php-common php-mysql php-zip php-gd \
          php-mbstring php-curl php-xml php-bcmath php-pgsql 2>/dev/null; then
            PHP_VERSION=$(php -r 'echo PHP_VERSION;')
            echo "✅ Installed default PHP: ${PHP_VERSION}"
        else
            # If default fails, try adding PPA
            echo "   Default PHP not available, adding Ondrej's PPA..."
            apt-get install -y software-properties-common
            
            # Detect Ubuntu codename properly
            UBUNTU_CODENAME=$(lsb_release -cs)
            echo "   Detected Ubuntu codename: ${UBUNTU_CODENAME}"
            
            # Add PPA with proper codename
            add-apt-repository -y ppa:ondrej/php 2>&1 | grep -v "N: " || true
            apt-get update
            
            # Try PHP 8.1 first, then 8.2, then 8.3, then default
            if apt-cache search php8.1-fpm 2>/dev/null | grep -q php8.1-fpm; then
                apt-get install -y php8.1-fpm php8.1-cli php8.1-common \
                  php8.1-mysql php8.1-zip php8.1-gd php8.1-mbstring \
                  php8.1-curl php8.1-xml php8.1-bcmath php8.1-pgsql
                PHP_VERSION="8.1"
            elif apt-cache search php8.2-fpm 2>/dev/null | grep -q php8.2-fpm; then
                apt-get install -y php8.2-fpm php8.2-cli php8.2-common \
                  php8.2-mysql php8.2-zip php8.2-gd php8.2-mbstring \
                  php8.2-curl php8.2-xml php8.2-bcmath php8.2-pgsql
                PHP_VERSION="8.2"
            elif apt-cache search php8.3-fpm 2>/dev/null | grep -q php8.3-fpm; then
                apt-get install -y php8.3-fpm php8.3-cli php8.3-common \
                  php8.3-mysql php8.3-zip php8.3-gd php8.3-mbstring \
                  php8.3-curl php8.3-xml php8.3-bcmath php8.3-pgsql
                PHP_VERSION="8.3"
            else
                # Final fallback
                apt-get install -y php-fpm php-cli php-common php-mysql php-zip php-gd \
                  php-mbstring php-curl php-xml php-bcmath php-pgsql
                PHP_VERSION=$(php -r 'echo PHP_VERSION;')
            fi
        fi
    elif [ "$OS" = "debian" ]; then
        # For Debian, add sury.org repository
        apt-get install -y apt-transport-https lsb-release ca-certificates
        wget -O /etc/apt/trusted.gpg.d/php.gpg https://packages.sury.org/php/apt.gpg
        echo "deb https://packages.sury.org/php/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/php.list
        apt-get update
        
        if apt-cache search php8.1-fpm | grep -q php8.1-fpm; then
            apt-get install -y php8.1-fpm php8.1-cli php8.1-common \
              php8.1-mysql php8.1-zip php8.1-gd php8.1-mbstring \
              php8.1-curl php8.1-xml php8.1-bcmath php8.1-pgsql
            PHP_VERSION="8.1"
        else
            apt-get install -y php-fpm php-cli php-common php-mysql php-zip php-gd \
              php-mbstring php-curl php-xml php-bcmath php-pgsql
            PHP_VERSION=$(php -r 'echo PHP_VERSION;')
        fi
    else
        # Generic installation
        apt-get install -y php-fpm php-cli php-common php-mysql php-zip php-gd \
          php-mbstring php-curl php-xml php-bcmath php-pgsql
        PHP_VERSION=$(php -r 'echo PHP_VERSION;')
    fi
    
    echo "✅ PHP installed: ${PHP_VERSION}"
fi

# Verify PHP installation
if command -v php &> /dev/null; then
    PHP_VERSION=$(php -r 'echo PHP_VERSION;')
    echo "✅ PHP verified: ${PHP_VERSION}"
else
    echo "❌ PHP installation failed"
    exit 1
fi

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
    
    # Detect PHP-FPM socket (check multiple versions)
    PHP_FPM_SOCKET=""
    for version in 8.3 8.2 8.1 8.0 7.4; do
        if [ -S /var/run/php/php${version}-fpm.sock ]; then
            PHP_FPM_SOCKET="/var/run/php/php${version}-fpm.sock"
            break
        fi
    done
    
    # If no version-specific socket found, try generic
    if [ -z "$PHP_FPM_SOCKET" ]; then
        if [ -S /var/run/php/php-fpm.sock ]; then
            PHP_FPM_SOCKET="/var/run/php/php-fpm.sock"
        else
            # Try to find any PHP-FPM socket
            PHP_FPM_SOCKET=$(ls /var/run/php/*.sock 2>/dev/null | head -1)
            if [ -z "$PHP_FPM_SOCKET" ]; then
                # Default fallback
                PHP_FPM_SOCKET="/var/run/php/php-fpm.sock"
            fi
        fi
    fi
    
    echo "   Using PHP-FPM socket: ${PHP_FPM_SOCKET}"
    
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
        fastcgi_pass unix:${PHP_FPM_SOCKET};
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

# Detect PHP-FPM service name (check multiple versions)
PHP_FPM_SERVICE=""
for version in 8.3 8.2 8.1 8.0 7.4; do
    if systemctl list-unit-files 2>/dev/null | grep -q "php${version}-fpm"; then
        PHP_FPM_SERVICE="php${version}-fpm"
        break
    fi
done

# If no version-specific service found, try generic
if [ -z "$PHP_FPM_SERVICE" ]; then
    if systemctl list-unit-files 2>/dev/null | grep -q "php-fpm"; then
        PHP_FPM_SERVICE="php-fpm"
    else
        # Try to find any PHP-FPM service
        PHP_FPM_SERVICE=$(systemctl list-unit-files 2>/dev/null | grep -o 'php[0-9.]*-fpm' | head -1)
        if [ -z "$PHP_FPM_SERVICE" ]; then
            PHP_FPM_SERVICE="php-fpm"
        fi
    fi
fi

echo "   Using PHP-FPM service: ${PHP_FPM_SERVICE}"
systemctl enable "${PHP_FPM_SERVICE}"
systemctl start "${PHP_FPM_SERVICE}"
systemctl status "${PHP_FPM_SERVICE}" --no-pager -l || true
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

