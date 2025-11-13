# WordPress Blog - Quick Start Guide

Get your WordPress blog up and running in minutes!

## Prerequisites Check

Before starting, ensure you have:
- ✅ PHP 7.4+ installed
- ✅ PostgreSQL running (from main project)
- ✅ Required PHP extensions (pgsql, mbstring, xml, curl, zip, gd)

## Quick Setup (5 Steps)

### Step 1: Create Database
```bash
cd blog
./create-blog-database.sh
```
This creates a separate database `GovSure_blog` for WordPress.

### Step 2: Download WordPress
```bash
./setup-wordpress.sh
```
This downloads WordPress to the `wordpress/` directory.

### Step 3: Install PostgreSQL Plugin
```bash
./install-postgresql-plugin.sh
```
WordPress needs this plugin to work with PostgreSQL.

### Step 4: Start PHP Server
```bash
./start-blog-server.sh
```
The blog will be available at `http://localhost:8080`

### Step 5: Complete WordPress Installation
1. Open `http://localhost:8080` in your browser
2. Follow the WordPress installation wizard
3. Activate the "PostgreSQL for WordPress" plugin if not already active
4. Complete the setup

## Configuration

### Database Settings
The default configuration uses:
- **Database**: `GovSure_blog`
- **User**: `GovSure`
- **Password**: `GovSure`
- **Host**: `localhost:5432`

To change these, edit `wp-config.php` before starting the server.

### Server Port
By default, the blog runs on port `8080`. To change:
```bash
BLOG_PORT=3000 ./start-blog-server.sh
```

## Troubleshooting

### "PHP extension missing"
Install missing extensions:
```bash
# macOS
brew install php-pgsql

# Ubuntu/Debian
sudo apt-get install php-pgsql php-mbstring php-xml php-curl php-zip php-gd
```

### "Cannot connect to database"
1. Check PostgreSQL is running: `pg_isready`
2. Verify credentials in `wp-config.php`
3. Ensure database exists: `./create-blog-database.sh`

### "WordPress installation fails"
1. Make sure PostgreSQL plugin is installed and activated
2. Check file permissions: `chmod -R 755 wordpress/`
3. Check PHP error logs

## File Structure

```
blog/
├── README.md                      # Full documentation
├── QUICK_START.md                 # This file
├── create-blog-database.sh        # Create database
├── setup-wordpress.sh             # Download WordPress
├── install-postgresql-plugin.sh   # Install PostgreSQL plugin
├── start-blog-server.sh           # Start PHP server
├── wp-config.php                  # WordPress configuration
├── .gitignore                     # Git ignore rules
└── wordpress/                     # WordPress installation (created)
```

## Next Steps

After setup, you can:
- Customize themes and plugins
- Create blog posts
- Configure settings
- Set up users and permissions

For production deployment, consider:
- Using Apache/Nginx instead of PHP built-in server
- Setting up SSL/HTTPS
- Configuring proper file permissions
- Setting up backups

