# WordPress Deployment Guide for govsureai.com

This guide will help you deploy WordPress to your production server with PHP and domain configuration.

## Prerequisites

- SSH access to your server (via Warp terminal)
- Latest code pulled from repository
- Domain `govsureai.com` pointing to your server
- Root or sudo access on the server

## Quick Deployment Steps

### Option 1: Using Caddy (If you're using Caddy server)

1. **SSH into your server**:
   ```bash
   ssh user@your-server-ip
   ```

2. **Navigate to project directory**:
   ```bash
   cd /path/to/govlogic
   ```

3. **Install PHP and required extensions**:
   ```bash
   sudo apt-get update
   sudo apt-get install -y php8.1-fpm php8.1-cli php8.1-common \
     php8.1-mysql php8.1-zip php8.1-gd php8.1-mbstring \
     php8.1-curl php8.1-xml php8.1-bcmath php8.1-pgsql
   ```

4. **Set up WordPress directory**:
   ```bash
   sudo mkdir -p /var/www/blog.govsureai.com
   sudo cp -r blog/wordpress/* /var/www/blog.govsureai.com/
   sudo chown -R www-data:www-data /var/www/blog.govsureai.com
   sudo chmod -R 755 /var/www/blog.govsureai.com
   ```

5. **Update Caddyfile** (already updated in the repo):
   - The Caddyfile now includes `blog.govsureai.com` configuration
   - Reload Caddy: `sudo systemctl reload caddy`

6. **Configure WordPress database**:
   - Edit `/var/www/blog.govsureai.com/wp-config.php`
   - Add your database credentials

7. **Complete WordPress installation**:
   - Visit: `https://blog.govsureai.com/wp-admin/install.php`
   - Follow the WordPress installation wizard
   - Activate the "GovSure" theme

### Option 2: Using Nginx (If you prefer Nginx)

Run the automated deployment script:

```bash
cd /path/to/govlogic
chmod +x deploy-wordpress-production.sh
sudo bash deploy-wordpress-production.sh
```

The script will:
- Install PHP 8.1 and all required extensions
- Install and configure Nginx
- Set up WordPress files
- Create Nginx configuration for blog.govsureai.com
- Optionally set up SSL with Let's Encrypt

## Manual Setup (Step by Step)

### 1. Install PHP

```bash
sudo apt-get update
sudo apt-get install -y php8.1-fpm php8.1-cli php8.1-common \
  php8.1-mysql php8.1-zip php8.1-gd php8.1-mbstring \
  php8.1-curl php8.1-xml php8.1-bcmath php8.1-pgsql
```

### 2. Verify PHP Installation

```bash
php -v
php -m  # List installed extensions
```

### 3. Set Up WordPress Directory

```bash
# Create web root
sudo mkdir -p /var/www/blog.govsureai.com

# Copy WordPress files
sudo cp -r blog/wordpress/* /var/www/blog.govsureai.com/

# Set permissions
sudo chown -R www-data:www-data /var/www/blog.govsureai.com
sudo chmod -R 755 /var/www/blog.govsureai.com
```

### 4. Configure Database

Edit `/var/www/blog.govsureai.com/wp-config.php`:

```php
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_database_user');
define('DB_PASSWORD', 'your_database_password');
define('DB_HOST', 'localhost');
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', '');
```

### 5. DNS Configuration

Add an A record for `blog.govsureai.com` pointing to your server's IP:

```
Type: A
Name: blog
Value: YOUR_SERVER_IP
TTL: 3600
```

### 6. SSL Certificate (Let's Encrypt)

If using Caddy, SSL is automatic. If using Nginx:

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d blog.govsureai.com -d www.blog.govsureai.com
```

## WordPress Theme Activation

1. Log into WordPress admin: `https://blog.govsureai.com/wp-admin`
2. Go to **Appearance > Themes**
3. Activate the **GovSure** theme
4. Configure menus and settings as needed

## Update Frontend Blog Link

After deployment, update the frontend to point to the correct blog URL:

The blog link in `frontend/src/pages/LandingNew.tsx` should be:
```tsx
<a href="https://blog.govsureai.com" target="_blank" rel="noopener noreferrer" className="...">
  Blog
</a>
```

## Troubleshooting

### PHP Not Working
```bash
# Check PHP-FPM status
sudo systemctl status php8.1-fpm

# Restart PHP-FPM
sudo systemctl restart php8.1-fpm

# Check PHP-FPM logs
sudo tail -f /var/log/php8.1-fpm.log
```

### Nginx/Caddy Not Serving WordPress
```bash
# Check server status
sudo systemctl status nginx  # or caddy

# Check error logs
sudo tail -f /var/log/nginx/error.log  # for Nginx
sudo journalctl -u caddy -f  # for Caddy

# Test configuration
sudo nginx -t  # for Nginx
sudo caddy validate --config /path/to/Caddyfile  # for Caddy
```

### Permission Issues
```bash
# Fix WordPress permissions
sudo chown -R www-data:www-data /var/www/blog.govsureai.com
sudo find /var/www/blog.govsureai.com -type d -exec chmod 755 {} \;
sudo find /var/www/blog.govsureai.com -type f -exec chmod 644 {} \;
```

### Database Connection Issues
- Verify database credentials in `wp-config.php`
- Check if PostgreSQL/MySQL is running
- Test connection: `php -r "echo pg_connect('host=localhost dbname=your_db user=your_user password=your_pass') ? 'Connected' : 'Failed';"`

## Post-Deployment Checklist

- [ ] WordPress is accessible at `https://blog.govsureai.com`
- [ ] WordPress admin is accessible at `https://blog.govsureai.com/wp-admin`
- [ ] GovSure theme is activated
- [ ] Blog link in frontend navigation works
- [ ] SSL certificate is valid (green padlock)
- [ ] All WordPress features are working
- [ ] Dark mode toggle works
- [ ] Slider displays correctly
- [ ] Blog posts are visible

## Support

If you encounter issues, check:
1. Server logs: `/var/log/nginx/error.log` or Caddy logs
2. PHP-FPM logs: `/var/log/php8.1-fpm.log`
3. WordPress debug: Enable `WP_DEBUG` in `wp-config.php`

