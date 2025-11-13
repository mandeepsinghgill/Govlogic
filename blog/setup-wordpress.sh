#!/bin/bash

# WordPress Setup Script
# Downloads and sets up WordPress in the blog directory

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BLOG_DIR="$SCRIPT_DIR"
WORDPRESS_DIR="$BLOG_DIR/wordpress"
WORDPRESS_VERSION="latest"
WORDPRESS_URL="https://wordpress.org/latest.tar.gz"

echo "🚀 Setting up WordPress blog..."
echo ""

# Check if WordPress is already installed
if [ -d "$WORDPRESS_DIR" ] && [ -f "$WORDPRESS_DIR/wp-config-sample.php" ]; then
    echo "⚠️  WordPress appears to be already installed in $WORDPRESS_DIR"
    read -p "Do you want to reinstall? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "✅ Keeping existing installation"
        exit 0
    fi
    echo "🗑️  Removing existing installation..."
    rm -rf "$WORDPRESS_DIR"
fi

# Check for required commands
if ! command -v curl &> /dev/null && ! command -v wget &> /dev/null; then
    echo "❌ Error: curl or wget is required to download WordPress"
    exit 1
fi

if ! command -v tar &> /dev/null; then
    echo "❌ Error: tar is required to extract WordPress"
    exit 1
fi

# Check PHP
if ! command -v php &> /dev/null; then
    echo "❌ Error: PHP is not installed"
    echo "   Please install PHP 7.4 or higher"
    exit 1
fi

PHP_VERSION=$(php -r 'echo PHP_VERSION;')
echo "✅ Found PHP version: $PHP_VERSION"

# Check PHP extensions
echo "🔍 Checking PHP extensions..."
REQUIRED_EXTENSIONS=("pgsql" "mbstring" "xml" "curl" "zip" "gd")
MISSING_EXTENSIONS=()

for ext in "${REQUIRED_EXTENSIONS[@]}"; do
    if ! php -m | grep -q "^$ext$"; then
        MISSING_EXTENSIONS+=("$ext")
    fi
done

if [ ${#MISSING_EXTENSIONS[@]} -ne 0 ]; then
    echo "⚠️  Missing PHP extensions: ${MISSING_EXTENSIONS[*]}"
    echo "   Please install them before proceeding"
    echo ""
    echo "   macOS (Homebrew):"
    echo "   brew install php-pgsql"
    echo ""
    echo "   Ubuntu/Debian:"
    echo "   sudo apt-get install php-pgsql php-mbstring php-xml php-curl php-zip php-gd"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Download WordPress
echo ""
echo "📥 Downloading WordPress..."
cd "$BLOG_DIR"

if command -v curl &> /dev/null; then
    curl -L "$WORDPRESS_URL" -o wordpress.tar.gz
else
    wget "$WORDPRESS_URL" -O wordpress.tar.gz
fi

# Extract WordPress
echo "📦 Extracting WordPress..."
tar -xzf wordpress.tar.gz
rm wordpress.tar.gz

# Set permissions
echo "🔐 Setting permissions..."
chmod -R 755 "$WORDPRESS_DIR"

# Copy wp-config.php if it doesn't exist
if [ ! -f "$WORDPRESS_DIR/wp-config.php" ] && [ -f "$BLOG_DIR/wp-config.php" ]; then
    echo "📋 Copying wp-config.php..."
    cp "$BLOG_DIR/wp-config.php" "$WORDPRESS_DIR/wp-config.php"
fi

echo ""
echo "✅ WordPress setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Install PostgreSQL plugin for WordPress"
echo "   2. Update wp-config.php with your database credentials"
echo "   3. Run: ./start-blog-server.sh"
echo "   4. Open http://localhost:8080 in your browser"
echo ""

