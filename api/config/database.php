<?php
/**
 * PlusCode Academy - Database Configuration
 * 
 * Centralized database connection management with PDO.
 * Supports MySQL and MariaDB.
 */

class Database {
    private static ?PDO $instance = null;
    
    // Database configuration - Update these values for your environment
    private const HOST = 'localhost';
    private const DB_NAME = 'pluscode_academy';
    private const USERNAME = 'root';  // Change to your MySQL username
    private const PASSWORD = '';      // Change to your MySQL password
    private const CHARSET = 'utf8mb4';
    
    /**
     * Get database connection instance (Singleton pattern)
     */
    public static function getConnection(): PDO {
        if (self::$instance === null) {
            try {
                $dsn = "mysql:host=" . self::HOST . ";dbname=" . self::DB_NAME . ";charset=" . self::CHARSET;
                
                $options = [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ];
                
                self::$instance = new PDO($dsn, self::USERNAME, self::PASSWORD, $options);
                
            } catch (PDOException $e) {
                error_log("Database connection failed: " . $e->getMessage());
                throw new Exception("Database connection failed. Please check configuration.");
            }
        }
        
        return self::$instance;
    }
    
    /**
     * Test database connection
     */
    public static function testConnection(): bool {
        try {
            $db = self::getConnection();
            $stmt = $db->query("SELECT 1");
            return $stmt !== false;
        } catch (Exception $e) {
            return false;
        }
    }
    
    /**
     * Prevent cloning and unserialization
     */
    private function __clone() {}
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}

/**
 * Response helper functions
 */
function jsonResponse($data, int $statusCode = 200): void {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        exit(0);
    }
    
    echo json_encode($data, JSON_PRETTY_PRINT);
    exit;
}

function errorResponse(string $message, string $code = 'ERROR', int $statusCode = 400): void {
    jsonResponse([
        'success' => false,
        'error' => [
            'code' => $code,
            'message' => $message
        ]
    ], $statusCode);
}

function successResponse($data = null, string $message = 'Success'): void {
    jsonResponse([
        'success' => true,
        'message' => $message,
        'data' => $data,
        'meta' => [
            'timestamp' => date('c'),
            'requestId' => uniqid('req_', true)
        ]
    ]);
}
