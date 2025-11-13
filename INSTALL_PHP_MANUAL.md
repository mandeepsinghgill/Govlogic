# Manual PHP Installation Guide

If the automated script fails, you can install PHP manually using these steps:

## For Ubuntu

### Step 1: Add PHP Repository

```bash
sudo apt-get update
sudo apt-get install -y software-properties-common
sudo add-apt-repository -y ppa:ondrej/php
sudo apt-get update
```

### Step 2: Install PHP 8.1

```bash
sudo apt-get install -y php8.1-fpm php8.1-cli php8.1-common \
  php8.1-mysql php8.1-zip php8.1-gd php8.1-mbstring \
  php8.1-curl php8.1-xml php8.1-bcmath php8.1-pgsql
```

### Step 3: Verify Installation

```bash
php -v
php -m  # List installed extensions
```

### Step 4: Start PHP-FPM

```bash
sudo systemctl enable php8.1-fpm
sudo systemctl start php8.1-fpm
sudo systemctl status php8.1-fpm
```

## For Debian

### Step 1: Add PHP Repository

```bash
sudo apt-get update
sudo apt-get install -y apt-transport-https lsb-release ca-certificates
sudo wget -O /etc/apt/trusted.gpg.d/php.gpg https://packages.sury.org/php/apt.gpg
echo "deb https://packages.sury.org/php/ $(lsb_release -sc) main" | sudo tee /etc/apt/sources.list.d/php.list
sudo apt-get update
```

### Step 2: Install PHP 8.1

```bash
sudo apt-get install -y php8.1-fpm php8.1-cli php8.1-common \
  php8.1-mysql php8.1-zip php8.1-gd php8.1-mbstring \
  php8.1-curl php8.1-xml php8.1-bcmath php8.1-pgsql
```

### Step 3: Verify and Start

```bash
php -v
sudo systemctl enable php8.1-fpm
sudo systemctl start php8.1-fpm
```

## Alternative: Install Default PHP Version

If PHP 8.1 is not available, you can install the default PHP version:

```bash
sudo apt-get update
sudo apt-get install -y php-fpm php-cli php-common php-mysql php-zip php-gd \
  php-mbstring php-curl php-xml php-bcmath php-pgsql

# Verify
php -v

# Start PHP-FPM (service name may vary)
sudo systemctl enable php-fpm
sudo systemctl start php-fpm
```

## Find PHP-FPM Socket Location

After installation, find the PHP-FPM socket:

```bash
# List all PHP-FPM sockets
ls -la /var/run/php/*.sock

# Or check PHP-FPM config
sudo find /etc -name "*.conf" -path "*/php*/*" -exec grep -l "listen" {} \;
```

The socket path is typically:
- `/var/run/php/php8.1-fpm.sock` (for PHP 8.1)
- `/var/run/php/php-fpm.sock` (for default PHP)

## Troubleshooting

### Check if PHP is installed
```bash
which php
php -v
```

### Check installed PHP extensions
```bash
php -m
```

### Check PHP-FPM status
```bash
sudo systemctl status php8.1-fpm  # or php-fpm
```

### View PHP-FPM logs
```bash
sudo tail -f /var/log/php8.1-fpm.log
```

### Test PHP processing
Create a test file:
```bash
echo "<?php phpinfo(); ?>" | sudo tee /var/www/blog.govsureai.com/test.php
```

Visit `http://blog.govsureai.com/test.php` in your browser (then delete the file for security).

