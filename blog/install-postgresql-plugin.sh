#!/bin/bash

# Script to download and install PostgreSQL plugin for WordPress

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORDPRESS_DIR="$SCRIPT_DIR/wordpress"
PLUGINS_DIR="$WORDPRESS_DIR/wp-content/plugins"
PLUGIN_NAME="postgresql-for-wordpress"
PLUGIN_URL="https://downloads.wordpress.org/plugin/postgresql-for-wordpress.latest-stable.zip"

# Check if WordPress is installed
if [ ! -d "$WORDPRESS_DIR" ]; then
    echo "❌ Error: WordPress is not installed"
    echo "   Please run ./setup-wordpress.sh first"
    exit 1
fi

# Create plugins directory if it doesn't exist
mkdir -p "$PLUGINS_DIR"

# Check if plugin is already installed
if [ -d "$PLUGINS_DIR/$PLUGIN_NAME" ]; then
    echo "⚠️  PostgreSQL plugin appears to be already installed"
    read -p "Do you want to reinstall? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "✅ Keeping existing installation"
        exit 0
    fi
    rm -rf "$PLUGINS_DIR/$PLUGIN_NAME"
fi

# Check for required commands
if ! command -v curl &> /dev/null && ! command -v wget &> /dev/null; then
    echo "❌ Error: curl or wget is required"
    exit 1
fi

if ! command -v unzip &> /dev/null; then
    echo "❌ Error: unzip is required"
    exit 1
fi

echo "📥 Downloading PostgreSQL for WordPress plugin..."

cd "$PLUGINS_DIR"

if command -v curl &> /dev/null; then
    curl -L "$PLUGIN_URL" -o "$PLUGIN_NAME.zip"
else
    wget "$PLUGIN_URL" -O "$PLUGIN_NAME.zip"
fi

echo "📦 Extracting plugin..."
unzip -q "$PLUGIN_NAME.zip"
rm "$PLUGIN_NAME.zip"

# Find the actual plugin directory (zip might have a different structure)
if [ -d "$PLUGINS_DIR/postgresql-for-wordpress" ]; then
    echo "✅ Plugin installed successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Start the blog server: ./start-blog-server.sh"
    echo "   2. Open http://localhost:8080/wp-admin"
    echo "   3. Go to Plugins and activate 'PostgreSQL for WordPress'"
    echo "   4. Run the WordPress installation"
else
    echo "⚠️  Plugin extracted, but directory structure may be different"
    echo "   Please check $PLUGINS_DIR and activate manually"
fi

