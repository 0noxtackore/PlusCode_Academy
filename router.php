<?php
/**
 * PlusCode Academy - PHP Built-in Server Router
 * 
 * This file handles URL routing for PHP's built-in development server.
 * Place this file in the project root and start server with:
 * php -S localhost:8080 router.php
 */

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Log requests in development
error_log("[API] {$uri} - " . $_SERVER['REQUEST_METHOD']);

// If it's a file that exists, serve it directly
if ($uri !== '/' && file_exists(__DIR__ . $uri)) {
    return false;
}

// Handle API requests
if (strpos($uri, '/api/') === 0) {
    $endpoint = substr($uri, 5); // Remove '/api/'
    
    // Route to appropriate endpoint file
    $routes = [
        'auth' => '/api/endpoints/auth.php',
        'students' => '/api/endpoints/students.php',
        'courses' => '/api/endpoints/courses.php',
        'enrollments' => '/api/endpoints/enrollments.php',
        'payments' => '/api/endpoints/payments.php',
        'teachers' => '/api/endpoints/teachers.php',
        'expenses' => '/api/endpoints/expenses.php',
        'dashboard' => '/api/endpoints/dashboard.php',
        'reports/financial' => '/api/endpoints/dashboard.php',
    ];
    
    // Parse endpoint and ID
    $parts = explode('/', $endpoint);
    $mainEndpoint = $parts[0] ?? '';
    $path = $parts[1] ?? '';
    
    // Check if it's an ID (numeric)
    $isId = is_numeric($path);
    
    if (isset($routes[$mainEndpoint])) {
        // Set up query parameters
        if ($isId) {
            $_GET['id'] = $path;
        } elseif (!empty($path)) {
            $_GET['path'] = $path;
        }
        
        // Include the endpoint file
        require __DIR__ . $routes[$mainEndpoint];
        exit;
    }
    
    // Check for test-connection.php
    if ($endpoint === 'test-connection.php') {
        require __DIR__ . '/api/test-connection.php';
        exit;
    }
    
    // Check for health/root endpoint
    if (empty($endpoint) || $endpoint === '/') {
        require __DIR__ . '/api/index.php';
        exit;
    }
    
    // Unknown endpoint
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => [
            'code' => 'SYS_003',
            'message' => 'Unknown endpoint: ' . $endpoint
        ]
    ]);
    exit;
}

// For all other requests, serve index.html (SPA support)
if (file_exists(__DIR__ . '/index.html')) {
    require __DIR__ . '/index.html';
} else {
    http_response_code(404);
    echo 'Not Found';
}
