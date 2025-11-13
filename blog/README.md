# WordPress Blog Setup

This directory contains the WordPress blog installation configured to use PostgreSQL database.

## Prerequisites

1. **PHP 7.4 or higher** with required extensions:
   - php-pgsql (PostgreSQL extension)
   - php-mbstring
   - php-xml
   - php-curl
   - php-zip
   - php-gd

2. **PostgreSQL Database** - The blog will use the existing PostgreSQL database from the main project.

3. **WordPress** - Will be downloaded during setup.

## Quick Setup

1. **Download WordPress**:
   ```bash
   cd blog
   ./setup-wordpress.sh
   ```

2. **Configure Database**:
   - Edit `wp-config.php` with your database credentials
   - Default uses: `postgresql://GovSure:GovSure@localhost:5432/GovSure`

3. **Install PostgreSQL Plugin**:
   - WordPress doesn't natively support PostgreSQL
   - You'll need to install a PostgreSQL plugin (see Installation section)

4. **Start PHP Server**:
   ```bash
   ./start-blog-server.sh
   ```
   The blog will be available at `http://localhost:8080`

## Installation Steps

### Step 1: Download WordPress

Run the setup script:
```bash
./setup-wordpress.sh
```

This will download WordPress to the `wordpress/` directory.

### Step 2: Install PostgreSQL Support

WordPress requires a plugin to work with PostgreSQL. Options:

**Option A: PostgreSQL for WordPress (Recommended)**
1. Download from: https://wordpress.org/plugins/postgresql-for-wordpress/
2. Extract to `wordpress/wp-content/plugins/postgresql-for-wordpress/`
3. Activate in WordPress admin

**Option B: Use wp-pg (Alternative)**
1. Download from: https://github.com/kevinoid/wp-pg
2. Follow installation instructions

### Step 3: Configure Database

The `wp-config.php` file is pre-configured for PostgreSQL. Verify these settings:

```php
define('DB_NAME', 'GovSure');
define('DB_USER', 'GovSure');
define('DB_PASSWORD', 'GovSure');
define('DB_HOST', 'localhost:5432');
define('DB_CHARSET', 'utf8');
```

### Step 4: Create Database Schema

Before running WordPress installation, you need to create the database tables. The PostgreSQL plugin will handle this during the WordPress installation process.

### Step 5: Run WordPress Installation

1. Start the PHP server: `./start-blog-server.sh`
2. Open `http://localhost:8080` in your browser
3. Follow the WordPress installation wizard
4. The PostgreSQL plugin will create the necessary tables

## Running the Blog

### Start Server
```bash
./start-blog-server.sh
```

### Stop Server
Press `Ctrl+C` or run:
```bash
pkill -f "php -S localhost:8080"
```

## Directory Structure

```
blog/
├── README.md                 # This file
├── setup-wordpress.sh        # Script to download WordPress
├── start-blog-server.sh      # Script to start PHP server
├── wp-config.php            # WordPress configuration
├── wordpress/               # WordPress installation (created by setup script)
└── .gitignore              # Git ignore file
```

## Database Configuration

The blog uses the same PostgreSQL database as the main application:
- **Host**: localhost
- **Port**: 5432
- **Database**: GovSure (or create a separate database: GovSure_blog)
- **User**: GovSure
- **Password**: GovSure

**Note**: It's recommended to create a separate database for WordPress:
```sql
CREATE DATABASE GovSure_blog OWNER GovSure;
```

Then update `wp-config.php` to use `GovSure_blog` instead of `GovSure`.

## Troubleshooting

### PHP Extensions Missing
Install required PHP extensions:
```bash
# macOS (using Homebrew)
brew install php@8.1
brew install php-pgsql

# Ubuntu/Debian
sudo apt-get install php-pgsql php-mbstring php-xml php-curl php-zip php-gd
```

### Database Connection Issues
- Verify PostgreSQL is running: `pg_isready`
- Check database credentials in `wp-config.php`
- Ensure PostgreSQL user has proper permissions

### WordPress Installation Issues
- Make sure the PostgreSQL plugin is installed and activated
- Check file permissions: `chmod -R 755 wordpress/`
- Check PHP error logs

## Production Considerations

For production deployment:
1. Use a proper web server (Apache/Nginx) instead of PHP built-in server
2. Set up proper file permissions
3. Configure SSL/HTTPS
4. Use environment variables for sensitive data
5. Enable WordPress security features
6. Set up regular backups

