#!/bin/bash

# Start PHP Built-in Server for WordPress Blog

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BLOG_DIR="$SCRIPT_DIR"
WORDPRESS_DIR="$BLOG_DIR/wordpress"
PORT="${BLOG_PORT:-8080}"
HOST="${BLOG_HOST:-localhost}"

# Check if WordPress is installed
if [ ! -d "$WORDPRESS_DIR" ]; then
    echo "❌ Error: WordPress is not installed"
    echo "   Please run ./setup-wordpress.sh first"
    exit 1
fi

# Check if wp-config.php exists
if [ ! -f "$WORDPRESS_DIR/wp-config.php" ]; then
    echo "⚠️  Warning: wp-config.php not found"
    echo "   Copying from blog directory..."
    if [ -f "$BLOG_DIR/wp-config.php" ]; then
        cp "$BLOG_DIR/wp-config.php" "$WORDPRESS_DIR/wp-config.php"
    else
        echo "❌ Error: wp-config.php not found in blog directory"
        echo "   Please create wp-config.php first"
        exit 1
    fi
fi

# Check if PHP is available
if ! command -v php &> /dev/null; then
    echo "❌ Error: PHP is not installed"
    exit 1
fi

# Check if port is already in use
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port $PORT is already in use"
    read -p "Do you want to use a different port? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter port number: " PORT
    else
        echo "❌ Exiting. Please stop the service using port $PORT"
        exit 1
    fi
fi

echo "🚀 Starting WordPress blog server..."
echo "   Directory: $WORDPRESS_DIR"
echo "   URL: http://$HOST:$PORT"
echo ""
echo "   Press Ctrl+C to stop the server"
echo ""

# Change to WordPress directory and start server
cd "$WORDPRESS_DIR"
php -d max_execution_time=300 -S "$HOST:$PORT"

