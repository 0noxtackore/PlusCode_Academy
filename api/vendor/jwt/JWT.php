<?php
/**
 * JSON Web Token (JWT) Implementation
 * 
 * Simplified JWT library for PlusCode Academy authentication.
 */

class JWT {
    private static string $secret = 'pluscode_academy_secret_key_2026_change_in_production';
    private static string $algorithm = 'HS256';
    
    /**
     * Generate JWT token
     */
    public static function encode(array $payload, int $expiryHours = 24): string {
        $header = json_encode(['typ' => 'JWT', 'alg' => self::$algorithm]);
        
        $time = time();
        $payload['iat'] = $time;
        $payload['exp'] = $time + ($expiryHours * 3600);
        $payload['jti'] = uniqid('jwt_', true);
        
        $payloadJson = json_encode($payload);
        
        $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payloadJson));
        
        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, self::$secret, true);
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        return $base64Header . "." . $base64Payload . "." . $base64Signature;
    }
    
    /**
     * Decode and verify JWT token
     */
    public static function decode(string $token): ?array {
        try {
            $parts = explode('.', $token);
            if (count($parts) !== 3) {
                return null;
            }
            
            $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);
            
            if (!$payload || !isset($payload['exp'])) {
                return null;
            }
            
            if ($payload['exp'] < time()) {
                return null; // Token expired
            }
            
            // Verify signature
            $signature = hash_hmac('sha256', $parts[0] . "." . $parts[1], self::$secret, true);
            $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
            
            if (!hash_equals($base64Signature, $parts[2])) {
                return null;
            }
            
            return $payload;
            
        } catch (Exception $e) {
            return null;
        }
    }
    
    /**
     * Extract token from Authorization header
     */
    public static function getBearerToken(): ?string {
        $headers = getallheaders();
        
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
            if (strpos($authHeader, 'Bearer ') === 0) {
                return substr($authHeader, 7);
            }
        }
        
        // Check Apache-specific header
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
            if (strpos($authHeader, 'Bearer ') === 0) {
                return substr($authHeader, 7);
            }
        }
        
        return null;
    }
    
    /**
     * Change secret key (call this in production)
     */
    public static function setSecret(string $secret): void {
        self::$secret = $secret;
    }
}
