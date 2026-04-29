<?php
/**
 * Payments API Endpoints
 * 
 * GET    /api/payments           - List all payments
 * GET    /api/payments/{id}      - Get payment by ID
 * POST   /api/payments           - Create new payment
 * PUT    /api/payments/{id}      - Update payment (limited fields)
 * DELETE /api/payments/{id}      - Delete payment (admin only)
 * GET    /api/payments/summary   - Get payment summary/stats
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

class PaymentsController {
    
    private PDO $db;
    
    public function __construct() {
        $this->db = Database::getConnection();
    }
    
    public function list(): void {
        AuthMiddleware::requirePermission(Permissions::PAYMENTS);
        
        try {
            $enrollmentId = $_GET['enrollmentId'] ?? null;
            $studentId = $_GET['studentId'] ?? null;
            $status = $_GET['status'] ?? null;
            $dateFrom = $_GET['dateFrom'] ?? null;
            $dateTo = $_GET['dateTo'] ?? null;
            $page = (int)($_GET['page'] ?? 1);
            $limit = (int)($_GET['limit'] ?? 50);
            $offset = ($page - 1) * $limit;
            
            $where = ["1=1"];
            $params = [];
            
            if ($enrollmentId) { $where[] = "p.enrollmentId = :enrollmentId"; $params['enrollmentId'] = $enrollmentId; }
            if ($status) { $where[] = "p.status = :status"; $params['status'] = $status; }
            if ($dateFrom) { $where[] = "p.paymentDate >= :dateFrom"; $params['dateFrom'] = $dateFrom; }
            if ($dateTo) { $where[] = "p.paymentDate <= :dateTo"; $params['dateTo'] = $dateTo; }
            
            if ($studentId) {
                $where[] = "e.studentId = :studentId";
                $params['studentId'] = $studentId;
            }
            
            $whereClause = 'WHERE ' . implode(' AND ', $where);
            
            $countStmt = $this->db->prepare("
                SELECT COUNT(*) FROM payments p
                JOIN enrollments e ON p.enrollmentId = e.id
                {$whereClause}
            ");
            $countStmt->execute($params);
            $total = $countStmt->fetchColumn();
            
            $sql = "
                SELECT 
                    p.id,
                    p.enrollmentId,
                    p.paymentDate,
                    p.amount,
                    p.method,
                    p.reference,
                    p.status,
                    p.notes,
                    p.createdAt,
                    CONCAT(s.name, ' ', s.lastName) as studentName,
                    s.idNumber as studentIdNumber,
                    c.name as courseName,
                    c.code as courseCode
                FROM payments p
                JOIN enrollments e ON p.enrollmentId = e.id
                JOIN students s ON e.studentId = s.id
                JOIN courses c ON e.courseId = c.id
                {$whereClause}
                ORDER BY p.paymentDate DESC
                LIMIT :limit OFFSET :offset
            ";
            
            $stmt = $this->db->prepare($sql);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            
            successResponse([
                'payments' => $stmt->fetchAll(),
                'pagination' => ['page' => $page, 'limit' => $limit, 'total' => $total, 'pages' => ceil($total / $limit)]
            ]);
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
    
    public function get(int $id): void {
        AuthMiddleware::requirePermission(Permissions::PAYMENTS);
        
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    p.*,
                    CONCAT(s.name, ' ', s.lastName) as studentName,
                    c.name as courseName
                FROM payments p
                JOIN enrollments e ON p.enrollmentId = e.id
                JOIN students s ON e.studentId = s.id
                JOIN courses c ON e.courseId = c.id
                WHERE p.id = :id
                LIMIT 1
            ");
            $stmt->execute(['id' => $id]);
            $payment = $stmt->fetch();
            
            if (!$payment) {
                errorResponse('Payment not found', 'PAY_001', 404);
            }
            
            successResponse($payment);
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
    
    public function create(): void {
        AuthMiddleware::requirePermission(Permissions::PAYMENTS);
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (empty($input['enrollmentId']) || !isset($input['amount']) || empty($input['method'])) {
            errorResponse('enrollmentId, amount and method are required', 'VAL_001', 400);
        }
        
        if ($input['amount'] <= 0) {
            errorResponse('Amount must be positive', 'VAL_004', 400);
        }
        
        $allowedMethods = ['Cash', 'Transfer', 'Card', 'Check'];
        if (!in_array($input['method'], $allowedMethods)) {
            errorResponse('Invalid payment method. Allowed: ' . implode(', ', $allowedMethods), 'VAL_002', 400);
        }
        
        try {
            // Check enrollment exists
            $enrollStmt = $this->db->prepare("SELECT id, status FROM enrollments WHERE id = :id");
            $enrollStmt->execute(['id' => $input['enrollmentId']]);
            $enrollment = $enrollStmt->fetch();
            
            if (!$enrollment) {
                errorResponse('Enrollment not found', 'ENR_001', 404);
            }
            
            // Check reference uniqueness
            if (!empty($input['reference'])) {
                $refStmt = $this->db->prepare("SELECT id FROM payments WHERE reference = :reference");
                $refStmt->execute(['reference' => $input['reference']]);
                if ($refStmt->fetch()) {
                    errorResponse('Payment reference already exists', 'PAY_002', 409);
                }
            }
            
            $stmt = $this->db->prepare("
                INSERT INTO payments (enrollmentId, paymentDate, amount, method, reference, status, notes, createdAt)
                VALUES (:enrollmentId, :paymentDate, :amount, :method, :reference, :status, :notes, NOW())
            ");
            
            $stmt->execute([
                'enrollmentId' => $input['enrollmentId'],
                'paymentDate' => $input['paymentDate'] ?? date('Y-m-d'),
                'amount' => $input['amount'],
                'method' => $input['method'],
                'reference' => $input['reference'] ?? null,
                'status' => $input['status'] ?? 'Paid',
                'notes' => $input['notes'] ?? null
            ]);
            
            $newId = $this->db->lastInsertId();
            $this->get((int)$newId);
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
    
    public function update(int $id): void {
        AuthMiddleware::requirePermission(Permissions::PAYMENTS);
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        try {
            $checkStmt = $this->db->prepare("SELECT id FROM payments WHERE id = :id");
            $checkStmt->execute(['id' => $id]);
            if (!$checkStmt->fetch()) {
                errorResponse('Payment not found', 'PAY_001', 404);
            }
            
            $fields = [];
            $params = ['id' => $id];
            $allowedFields = ['status', 'notes'];
            
            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    $fields[] = "{$field} = :{$field}";
                    $params[$field] = $input[$field];
                }
            }
            
            if (empty($fields)) {
                errorResponse('No fields to update', 'VAL_001', 400);
            }
            
            $sql = "UPDATE payments SET " . implode(', ', $fields) . " WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            successResponse(null, 'Payment updated successfully');
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
    
    public function delete(int $id): void {
        AuthMiddleware::requireAdmin();
        
        try {
            $stmt = $this->db->prepare("DELETE FROM payments WHERE id = :id");
            $stmt->execute(['id' => $id]);
            
            if ($stmt->rowCount() === 0) {
                errorResponse('Payment not found', 'PAY_001', 404);
            }
            
            successResponse(null, 'Payment deleted successfully');
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
    
    public function summary(): void {
        AuthMiddleware::requirePermission(Permissions::PAYMENTS);
        
        try {
            $dateFrom = $_GET['dateFrom'] ?? date('Y-m-01');
            $dateTo = $_GET['dateTo'] ?? date('Y-m-t');
            
            // Total payments
            $totalStmt = $this->db->prepare("
                SELECT 
                    COUNT(*) as count,
                    COALESCE(SUM(amount), 0) as total
                FROM payments 
                WHERE paymentDate BETWEEN :dateFrom AND :dateTo
                AND status = 'Paid'
            ");
            $totalStmt->execute(['dateFrom' => $dateFrom, 'dateTo' => $dateTo]);
            $summary = $totalStmt->fetch();
            
            // By method
            $methodStmt = $this->db->prepare("
                SELECT 
                    method,
                    COUNT(*) as count,
                    COALESCE(SUM(amount), 0) as total
                FROM payments 
                WHERE paymentDate BETWEEN :dateFrom AND :dateTo
                AND status = 'Paid'
                GROUP BY method
            ");
            $methodStmt->execute(['dateFrom' => $dateFrom, 'dateTo' => $dateTo]);
            $summary['byMethod'] = $methodStmt->fetchAll();
            
            successResponse($summary);
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
}

$method = $_SERVER['REQUEST_METHOD'];
$path = $_GET['path'] ?? '';
$id = $_GET['id'] ?? null;

$controller = new PaymentsController();

if ($method === 'GET' && $path === '' && !$id) {
    $controller->list();
} elseif ($method === 'GET' && $path === 'summary') {
    $controller->summary();
} elseif ($method === 'GET' && is_numeric($id)) {
    $controller->get((int)$id);
} elseif ($method === 'POST' && $path === '') {
    $controller->create();
} elseif ($method === 'PUT' && is_numeric($id)) {
    $controller->update((int)$id);
} elseif ($method === 'DELETE' && is_numeric($id)) {
    $controller->delete((int)$id);
} else {
    errorResponse('Endpoint not found', 'SYS_003', 404);
}
