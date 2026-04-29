<?php
/**
 * Database Connection Test
 * 
 * Test this endpoint: curl http://localhost/api/test-connection.php
 */

require_once __DIR__ . '/config/database.php';

try {
    $connected = Database::testConnection();
    
    if ($connected) {
        jsonResponse([
            'success' => true,
            'message' => 'Database connection successful',
            'timestamp' => date('c')
        ]);
    } else {
        errorResponse('Database connection failed', 'SYS_001', 503);
    }
    
} catch (Exception $e) {
    errorResponse('Connection error: ' . $e->getMessage(), 'SYS_001', 503);
}
