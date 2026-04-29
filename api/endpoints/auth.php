<?php
/**
 * Authentication Endpoints
 * 
 * POST /api/auth/login    - User login
 * POST /api/auth/logout   - User logout (client-side)
 * GET  /api/auth/me       - Get current user
 * POST /api/auth/refresh  - Refresh token
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../vendor/jwt/JWT.php';
require_once __DIR__ . '/../middleware/auth.php';

class AuthController {
    
    private PDO $db;
    
    public function __construct() {
        $this->db = Database::getConnection();
    }
    
    /**
     * POST /api/auth/login
     */
    public function login(): void {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['username']) || !isset($input['password'])) {
            errorResponse('Username and password are required', 'VAL_001', 400);
        }
        
        $username = trim($input['username']);
        $password = $input['password'];
        
        try {
            $stmt = $this->db->prepare("
                SELECT id, username, password, name, email, role, permissions 
                FROM users 
                WHERE username = :username AND status = 'active'
                LIMIT 1
            ");
            $stmt->execute(['username' => $username]);
            $user = $stmt->fetch();
            
            if (!$user) {
                errorResponse('Invalid credentials', 'AUTH_001', 401);
            }
            
            // Verify password (plain text for now, should use password_hash in production)
            if ($password !== $user['password']) {
                // Try with password_verify if password is hashed
                if (!password_verify($password, $user['password'])) {
                    errorResponse('Invalid credentials', 'AUTH_001', 401);
                }
            }
            
            // Generate JWT token
            $tokenPayload = [
                'userId' => $user['id'],
                'username' => $user['username'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'permissions' => $user['permissions']
            ];
            
            $token = JWT::encode($tokenPayload, 24); // 24 hours expiry
            
            // Update last login
            $updateStmt = $this->db->prepare("
                UPDATE users 
                SET last_login = NOW() 
                WHERE id = :id
            ");
            $updateStmt->execute(['id' => $user['id']]);
            
            successResponse([
                'authenticated' => true,
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'permissions' => explode(',', $user['permissions'])
                ],
                'token' => $token,
                'expiresAt' => date('c', strtotime('+24 hours'))
            ], 'Login successful');
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
    
    /**
     * GET /api/auth/me
     */
    public function me(): void {
        $user = AuthMiddleware::authenticate();
        
        successResponse([
            'id' => $user['userId'],
            'username' => $user['username'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'permissions' => is_string($user['permissions']) 
                ? explode(',', $user['permissions']) 
                : $user['permissions']
        ]);
    }
    
    /**
     * POST /api/auth/refresh
     */
    public function refresh(): void {
        $user = AuthMiddleware::authenticate();
        
        // Generate new token
        $tokenPayload = [
            'userId' => $user['userId'],
            'username' => $user['username'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'permissions' => $user['permissions']
        ];
        
        $token = JWT::encode($tokenPayload, 24);
        
        successResponse([
            'token' => $token,
            'expiresAt' => date('c', strtotime('+24 hours'))
        ], 'Token refreshed');
    }
    
    /**
     * POST /api/auth/change-password
     */
    public function changePassword(): void {
        $user = AuthMiddleware::authenticate();
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['currentPassword']) || !isset($input['newPassword'])) {
            errorResponse('Current and new password are required', 'VAL_001', 400);
        }
        
        try {
            // Verify current password
            $stmt = $this->db->prepare("SELECT password FROM users WHERE id = :id");
            $stmt->execute(['id' => $user['userId']]);
            $dbUser = $stmt->fetch();
            
            if (!$dbUser || $input['currentPassword'] !== $dbUser['password']) {
                errorResponse('Current password is incorrect', 'AUTH_001', 401);
            }
            
            // Update password (should hash in production)
            $updateStmt = $this->db->prepare("
                UPDATE users SET password = :password WHERE id = :id
            ");
            $updateStmt->execute([
                'password' => password_hash($input['newPassword'], PASSWORD_DEFAULT),
                'id' => $user['userId']
            ]);
            
            successResponse(null, 'Password changed successfully');
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
}

// Route handling
$method = $_SERVER['REQUEST_METHOD'];
$path = $_GET['path'] ?? '';

$controller = new AuthController();

if ($method === 'POST' && $path === 'login') {
    $controller->login();
} elseif ($method === 'GET' && $path === 'me') {
    $controller->me();
} elseif ($method === 'POST' && $path === 'refresh') {
    $controller->refresh();
} elseif ($method === 'POST' && $path === 'change-password') {
    $controller->changePassword();
} else {
    errorResponse('Endpoint not found', 'SYS_003', 404);
}
