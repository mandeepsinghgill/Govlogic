<?php
/**
 * Test PostgreSQL connection for WordPress
 */

$db_name = 'GovSure_blog';
$db_user = 'GovSure';
$db_password = 'GovSure';
$db_host = 'localhost';
$db_port = '5432';

echo "Testing PostgreSQL connection...\n";
echo "Host: $db_host\n";
echo "Port: $db_port\n";
echo "Database: $db_name\n";
echo "User: $db_user\n\n";

// Check if pgsql extension is loaded
if (!extension_loaded('pgsql')) {
    die("ERROR: PostgreSQL extension (pgsql) is not loaded!\n");
}

echo "✓ PostgreSQL extension is loaded\n\n";

// Build connection string
$conn_string = "host=$db_host port=$db_port dbname=$db_name user=$db_user password=$db_password";

echo "Connection string: host=$db_host port=$db_port dbname=$db_name user=$db_user password=***\n\n";

// Try to connect
$conn = @pg_connect($conn_string);

if ($conn) {
    echo "✓ SUCCESS: Database connection established!\n";
    
    // Test a simple query
    $result = pg_query($conn, "SELECT version();");
    if ($result) {
        $row = pg_fetch_row($result);
        echo "✓ PostgreSQL version: " . $row[0] . "\n";
    }
    
    // Check if tables exist
    $result = pg_query($conn, "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' LIMIT 5;");
    if ($result) {
        $tables = pg_fetch_all($result);
        if ($tables) {
            echo "\n✓ Found " . count($tables) . " table(s) in database:\n";
            foreach ($tables as $table) {
                echo "  - " . $table['table_name'] . "\n";
            }
        } else {
            echo "\n✓ Database is empty (no tables yet) - ready for WordPress installation\n";
        }
    }
    
    pg_close($conn);
    echo "\n✓ Connection test completed successfully!\n";
} else {
    $error = pg_last_error();
    echo "✗ ERROR: Failed to connect to database\n";
    echo "Error: " . ($error ? $error : "Unknown error") . "\n";
    echo "\nTroubleshooting:\n";
    echo "1. Check if PostgreSQL is running: pg_isready\n";
    echo "2. Verify database exists: psql -h $db_host -p $db_port -U $db_user -d postgres -c '\\l'\n";
    echo "3. Check credentials in wp-config.php\n";
    exit(1);
}

