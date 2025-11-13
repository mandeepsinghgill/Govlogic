<?php
/**
 * Test WordPress PostgreSQL connection
 * This simulates what WordPress does when connecting
 */

// Define ABSPATH (WordPress root)
define('ABSPATH', __DIR__ . '/wordpress/');

// Load the PostgreSQL plugin
if (file_exists(ABSPATH . 'wp-content/plugins/postgresql-for-wordpress/pg4wp/db.php')) {
    require_once ABSPATH . 'wp-content/plugins/postgresql-for-wordpress/pg4wp/db.php';
    echo "✓ PostgreSQL plugin loaded\n";
} else {
    die("✗ ERROR: PostgreSQL plugin not found!\n");
}

// Define database constants (from wp-config.php)
define('DB_NAME', 'GovSure_blog');
define('DB_USER', 'GovSure');
define('DB_PASSWORD', 'GovSure');
define('DB_HOST', 'localhost:5432');

echo "Database configuration:\n";
echo "  DB_NAME: " . DB_NAME . "\n";
echo "  DB_USER: " . DB_USER . "\n";
echo "  DB_HOST: " . DB_HOST . "\n\n";

// Try to create wpdb object (this is what WordPress does)
if (class_exists('wpdb2')) {
    echo "✓ wpdb2 class found\n";
    try {
        $wpdb = new wpdb2(DB_USER, DB_PASSWORD, DB_NAME, DB_HOST);
        echo "✓ wpdb object created\n";
        
        // Test connection
        $result = $wpdb->query("SELECT 1 as test");
        if ($result !== false) {
            echo "✓ Database query successful!\n";
            echo "✓ WordPress can connect to PostgreSQL!\n";
        } else {
            echo "✗ Query failed: " . $wpdb->last_error . "\n";
        }
    } catch (Exception $e) {
        echo "✗ Error creating wpdb: " . $e->getMessage() . "\n";
    }
} else {
    echo "✗ ERROR: wpdb2 class not found - plugin may not have loaded correctly\n";
}

