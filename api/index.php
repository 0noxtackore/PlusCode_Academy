<?php
/**
 * PlusCode Academy API - Main Entry Point
 * 
 * This file serves as the main router for the API.
 * All requests are routed through this file.
 */

// Error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', '1');

// Set headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include required files
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/vendor/jwt/JWT.php';
require_once __DIR__ . '/middleware/auth.php';

// Parse request
$endpoint = $_GET['endpoint'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// API Router
$router = [
    'auth' => 'endpoints/auth.php',
    'students' => 'endpoints/students.php',
    'courses' => 'endpoints/courses.php',
    'enrollments' => 'endpoints/enrollments.php',
    'payments' => 'endpoints/payments.php',
    'teachers' => 'endpoints/teachers.php',
    'expenses' => 'endpoints/expenses.php',
    'dashboard' => 'endpoints/dashboard.php',
];

// Route request
try {
    // Health check endpoint
    if ($endpoint === '' || $endpoint === 'health') {
        $dbConnected = Database::testConnection();
        
        jsonResponse([
            'success' => true,
            'message' => 'PlusCode Academy API is running',
            'version' => '1.0.0',
            'status' => $dbConnected ? 'healthy' : 'degraded',
            'database' => $dbConnected ? 'connected' : 'disconnected',
            'timestamp' => date('c'),
            'endpoints' => array_keys($router)
        ]);
    }
    
    // Route to specific endpoint
    $parts = explode('/', trim($endpoint, '/'));
    $mainEndpoint = $parts[0] ?? '';
    
    if (isset($router[$mainEndpoint])) {
        $file = __DIR__ . '/' . $router[$mainEndpoint];
        if (file_exists($file)) {
            require_once $file;
        } else {
            errorResponse('Endpoint file not found', 'SYS_003', 500);
        }
    } else {
        errorResponse("Unknown endpoint: {$mainEndpoint}", 'SYS_003', 404);
    }
    
} catch (Exception $e) {
    errorResponse('Internal server error: ' . $e->getMessage(), 'SYS_003', 500);
}
