<?php
/**
 * Authentication & Authorization Middleware
 * 
 * Validates JWT tokens and checks user permissions.
 */

require_once __DIR__ . '/../vendor/jwt/JWT.php';
require_once __DIR__ . '/../config/database.php';

class AuthMiddleware {
    
    /**
     * Authenticate request and return user data
     */
    public static function authenticate(): ?array {
        $token = JWT::getBearerToken();
        
        if (!$token) {
            errorResponse('Authorization token required', 'AUTH_001', 401);
        }
        
        $payload = JWT::decode($token);
        
        if (!$payload) {
            errorResponse('Invalid or expired token', 'AUTH_003', 401);
        }
        
        return $payload;
    }
    
    /**
     * Check if user has required permission
     */
    public static function requirePermission(string $permission): void {
        $user = self::authenticate();
        
        if (!$user || !isset($user['permissions'])) {
            errorResponse('Access denied', 'AUTH_004', 403);
        }
        
        $permissions = is_string($user['permissions']) 
            ? explode(',', $user['permissions']) 
            : $user['permissions'];
            
        if (!in_array($permission, $permissions) && !in_array('all', $permissions)) {
            errorResponse("Permission required: {$permission}", 'AUTH_004', 403);
        }
    }
    
    /**
     * Check if user has any of the required permissions
     */
    public static function requireAnyPermission(array $permissions): void {
        $user = self::authenticate();
        
        if (!$user || !isset($user['permissions'])) {
            errorResponse('Access denied', 'AUTH_004', 403);
        }
        
        $userPermissions = is_string($user['permissions']) 
            ? explode(',', $user['permissions']) 
            : $user['permissions'];
            
        $hasPermission = false;
        foreach ($permissions as $perm) {
            if (in_array($perm, $userPermissions) || in_array('all', $userPermissions)) {
                $hasPermission = true;
                break;
            }
        }
        
        if (!$hasPermission) {
            errorResponse('Insufficient permissions', 'AUTH_004', 403);
        }
    }
    
    /**
     * Get current authenticated user
     */
    public static function getCurrentUser(): ?array {
        try {
            $token = JWT::getBearerToken();
            if (!$token) return null;
            return JWT::decode($token);
        } catch (Exception $e) {
            return null;
        }
    }
    
    /**
     * Check if user is admin
     */
    public static function requireAdmin(): void {
        $user = self::authenticate();
        
        if (!isset($user['role']) || $user['role'] !== 'admin') {
            errorResponse('Administrator access required', 'AUTH_004', 403);
        }
    }
}

/**
 * Permission definitions
 */
class Permissions {
    public const STUDENTS = 'students';
    public const COURSES = 'courses';
    public const ENROLLMENTS = 'enrollments';
    public const PAYMENTS = 'payments';
    public const TEACHERS = 'teachers';
    public const EXPENSES = 'expenses';
    public const REPORTS = 'reports';
    public const INVENTORY = 'inventory';
    public const USERS = 'users';
    public const ALL = 'all';
    
    /**
     * Get permissions by role
     */
    public static function getByRole(string $role): array {
        $rolePermissions = [
            'admin' => [self::ALL],
            'receptionista' => [
                self::STUDENTS, 
                self::COURSES, 
                self::ENROLLMENTS, 
                self::PAYMENTS
            ],
            'cajero' => [
                self::PAYMENTS, 
                self::REPORTS
            ],
            'control_academico' => [
                self::STUDENTS, 
                self::COURSES, 
                self::ENROLLMENTS, 
                self::REPORTS
            ]
        ];
        
        return $rolePermissions[$role] ?? [];
    }
}
