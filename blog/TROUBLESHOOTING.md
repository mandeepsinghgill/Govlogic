# WordPress PostgreSQL Connection Troubleshooting

## Current Configuration

- **Database**: `GovSure_blog`
- **User**: `GovSure`
- **Password**: `GovSure`
- **Host**: `localhost:5432`
- **Plugin**: PostgreSQL for WordPress (PG4WP) v1.3.1

## Verification Steps

### 1. Check Database Connection
```bash
cd blog
php test-db-connection.php
```
This should show: `✓ SUCCESS: Database connection established!`

### 2. Check PostgreSQL is Running
```bash
pg_isready -h localhost -p 5432
```

### 3. Verify Database Exists
```bash
PGPASSWORD=GovSure psql -h localhost -p 5432 -U GovSure -d postgres -c "\l" | grep GovSure_blog
```

### 4. Check PHP PostgreSQL Extension
```bash
php -m | grep pgsql
```
Should output: `pgsql`

### 5. Verify Plugin is Installed
```bash
ls -la wordpress/wp-content/plugins/postgresql-for-wordpress/pg4wp/db.php
```

### 6. Check Plugin Symlink
```bash
ls -la wordpress/wp-content/pg4wp
```
Should show a symlink to `plugins/postgresql-for-wordpress/pg4wp`

## Common Issues and Solutions

### Issue: "Error establishing a database connection"

**Possible Causes:**

1. **Plugin not loading before WordPress connects**
   - **Solution**: The plugin is loaded in `wp-config.php` before `wp-settings.php`
   - Verify line 99-100 in `wp-config.php` loads the plugin

2. **Database credentials incorrect**
   - **Solution**: Verify credentials in `wp-config.php` match your PostgreSQL setup
   - Test connection: `php test-db-connection.php`

3. **PostgreSQL not running**
   - **Solution**: Start PostgreSQL service
   - Docker: `docker-compose up -d postgres`
   - Local: Check service status

4. **PHP pgsql extension missing**
   - **Solution**: Install PHP PostgreSQL extension
   - macOS: `brew install php-pgsql`
   - Ubuntu: `sudo apt-get install php-pgsql`

5. **Database doesn't exist**
   - **Solution**: Create database
   - Run: `./create-blog-database.sh`

6. **Plugin path incorrect**
   - **Solution**: Verify symlink exists
   - `ls -la wordpress/wp-content/pg4wp` should show symlink

### Issue: Plugin not found

If WordPress can't find the plugin:
1. Check plugin directory: `wordpress/wp-content/plugins/postgresql-for-wordpress/`
2. Verify symlink: `wordpress/wp-content/pg4wp -> plugins/postgresql-for-wordpress/pg4wp`
3. Recreate symlink if needed:
   ```bash
   cd wordpress/wp-content
   rm -f pg4wp
   ln -s plugins/postgresql-for-wordpress/pg4wp pg4wp
   ```

### Issue: Connection works but WordPress still shows error

1. **Clear browser cache** - Old error pages may be cached
2. **Check WordPress debug mode** - Enable in `wp-config.php`:
   ```php
   define('WP_DEBUG', true);
   define('WP_DEBUG_LOG', true);
   ```
3. **Check PHP error logs** - Look for detailed error messages
4. **Verify plugin is actually loading** - Check if `wpdb2` class exists

## Testing the Connection

### Direct Database Test
```bash
cd blog
php test-db-connection.php
```

### WordPress Connection Test
```bash
cd blog
php test-wordpress-connection.php
```
(Note: This may fail outside WordPress context, but database test should work)

### Manual PostgreSQL Test
```bash
PGPASSWORD=GovSure psql -h localhost -p 5432 -U GovSure -d GovSure_blog -c "SELECT 1;"
```

## WordPress Installation

If connection works but WordPress isn't installed:

1. Start PHP server: `./start-blog-server.sh`
2. Open: `http://localhost:8080`
3. Follow WordPress installation wizard
4. The PostgreSQL plugin should automatically create tables

## Debug Mode

To enable detailed error logging in WordPress:

Edit `wp-config.php` and add:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

Check logs at: `wordpress/wp-content/debug.log`

## Plugin Debug Mode

To enable PostgreSQL plugin debugging:

Edit `wordpress/wp-content/plugins/postgresql-for-wordpress/pg4wp/db.php`:
```php
define('PG4WP_DEBUG', true);
define('PG4WP_LOG_ERRORS', true);
```

Check logs at: `wordpress/wp-content/plugins/postgresql-for-wordpress/pg4wp/logs/`

## Still Having Issues?

1. Check all verification steps above
2. Enable debug mode and check logs
3. Verify PostgreSQL is accessible from PHP
4. Test with a simple PHP script (test-db-connection.php)
5. Check WordPress and plugin error logs

