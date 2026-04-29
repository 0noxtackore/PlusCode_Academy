<?php
/**
 * Enrollments API Endpoints
 * 
 * GET    /api/enrollments           - List all enrollments
 * GET    /api/enrollments/{id}      - Get enrollment by ID
 * POST   /api/enrollments           - Create new enrollment
 * PUT    /api/enrollments/{id}      - Update enrollment
 * DELETE /api/enrollments/{id}      - Delete enrollment
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

class EnrollmentsController {
    
    private PDO $db;
    
    public function __construct() {
        $this->db = Database::getConnection();
    }
    
    public function list(): void {
        AuthMiddleware::requirePermission(Permissions::ENROLLMENTS);
        
        try {
            $studentId = $_GET['studentId'] ?? null;
            $courseId = $_GET['courseId'] ?? null;
            $status = $_GET['status'] ?? null;
            $page = (int)($_GET['page'] ?? 1);
            $limit = (int)($_GET['limit'] ?? 50);
            $offset = ($page - 1) * $limit;
            
            $where = [];
            $params = [];
            
            if ($studentId) { $where[] = "e.studentId = :studentId"; $params['studentId'] = $studentId; }
            if ($courseId) { $where[] = "e.courseId = :courseId"; $params['courseId'] = $courseId; }
            if ($status) { $where[] = "e.status = :status"; $params['status'] = $status; }
            
            $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';
            
            $countStmt = $this->db->prepare("SELECT COUNT(*) FROM enrollments e {$whereClause}");
            $countStmt->execute($params);
            $total = $countStmt->fetchColumn();
            
            $sql = "
                SELECT 
                    e.id,
                    e.studentId,
                    CONCAT(s.name, ' ', s.lastName) as studentName,
                    s.idNumber as studentIdNumber,
                    e.courseId,
                    c.name as courseName,
                    c.code as courseCode,
                    c.fee as courseFee,
                    e.enrollmentDate,
                    e.status,
                    COALESCE(SUM(p.amount), 0) as totalPaid,
                    (c.fee - COALESCE(SUM(p.amount), 0)) as balanceDue,
                    e.createdAt
                FROM enrollments e
                JOIN students s ON e.studentId = s.id
                JOIN courses c ON e.courseId = c.id
                LEFT JOIN payments p ON e.id = p.enrollmentId
                {$whereClause}
                GROUP BY e.id
                ORDER BY e.enrollmentDate DESC
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
                'enrollments' => $stmt->fetchAll(),
                'pagination' => ['page' => $page, 'limit' => $limit, 'total' => $total, 'pages' => ceil($total / $limit)]
            ]);
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
    
    public function get(int $id): void {
        AuthMiddleware::requirePermission(Permissions::ENROLLMENTS);
        
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    e.*,
                    CONCAT(s.name, ' ', s.lastName) as studentName,
                    c.name as courseName,
                    c.code as courseCode,
                    c.fee as courseFee
                FROM enrollments e
                JOIN students s ON e.studentId = s.id
                JOIN courses c ON e.courseId = c.id
                WHERE e.id = :id
                LIMIT 1
            ");
            $stmt->execute(['id' => $id]);
            $enrollment = $stmt->fetch();
            
            if (!$enrollment) {
                errorResponse('Enrollment not found', 'ENR_001', 404);
            }
            
            // Get payments
            $paymentsStmt = $this->db->prepare("
                SELECT * FROM payments WHERE enrollmentId = :enrollmentId ORDER BY paymentDate DESC
            ");
            $paymentsStmt->execute(['enrollmentId' => $id]);
            $enrollment['payments'] = $paymentsStmt->fetchAll();
            
            successResponse($enrollment);
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
    
    public function create(): void {
        AuthMiddleware::requirePermission(Permissions::ENROLLMENTS);
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (empty($input['studentId']) || empty($input['courseId'])) {
            errorResponse('studentId and courseId are required', 'VAL_001', 400);
        }
        
        try {
            // Validate student exists and is active
            $studentStmt = $this->db->prepare("SELECT id, status FROM students WHERE id = :id");
            $studentStmt->execute(['id' => $input['studentId']]);
            $student = $studentStmt->fetch();
            
            if (!$student) {
                errorResponse('Student not found', 'STU_001', 404);
            }
            if ($student['status'] !== 'Active') {
                errorResponse('Student is not active', 'ENR_001', 409);
            }
            
            // Validate course exists and is active
            $courseStmt = $this->db->prepare("
                SELECT c.id, c.status, c.maxCapacity, COUNT(e.id) as currentEnrollment
                FROM courses c
                LEFT JOIN enrollments e ON c.id = e.courseId AND e.status = 'Active'
                WHERE c.id = :id
                GROUP BY c.id
            ");
            $courseStmt->execute(['id' => $input['courseId']]);
            $course = $courseStmt->fetch();
            
            if (!$course) {
                errorResponse('Course not found', 'CRS_001', 404);
            }
            if ($course['status'] !== 'Active') {
                errorResponse('Course is not active', 'ENR_002', 409);
            }
            if ($course['currentEnrollment'] >= $course['maxCapacity']) {
                errorResponse('Course has reached maximum capacity', 'ENR_003', 409);
            }
            
            // Check for duplicate active enrollment
            $dupStmt = $this->db->prepare("
                SELECT id FROM enrollments 
                WHERE studentId = :studentId AND courseId = :courseId AND status = 'Active'
            ");
            $dupStmt->execute(['studentId' => $input['studentId'], 'courseId' => $input['courseId']]);
            if ($dupStmt->fetch()) {
                errorResponse('Student already enrolled in this course', 'ENR_004', 409);
            }
            
            $stmt = $this->db->prepare("
                INSERT INTO enrollments (studentId, courseId, enrollmentDate, status, createdAt)
                VALUES (:studentId, :courseId, :enrollmentDate, :status, NOW())
            ");
            
            $stmt->execute([
                'studentId' => $input['studentId'],
                'courseId' => $input['courseId'],
                'enrollmentDate' => $input['enrollmentDate'] ?? date('Y-m-d'),
                'status' => $input['status'] ?? 'Active'
            ]);
            
            $newId = $this->db->lastInsertId();
            $this->get((int)$newId);
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
    
    public function update(int $id): void {
        AuthMiddleware::requirePermission(Permissions::ENROLLMENTS);
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        try {
            $checkStmt = $this->db->prepare("SELECT id FROM enrollments WHERE id = :id");
            $checkStmt->execute(['id' => $id]);
            if (!$checkStmt->fetch()) {
                errorResponse('Enrollment not found', 'ENR_001', 404);
            }
            
            $fields = [];
            $params = ['id' => $id];
            $allowedFields = ['status', 'enrollmentDate'];
            
            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    $fields[] = "{$field} = :{$field}";
                    $params[$field] = $input[$field];
                }
            }
            
            if (empty($fields)) {
                errorResponse('No fields to update', 'VAL_001', 400);
            }
            
            $fields[] = "updatedAt = NOW()";
            
            $sql = "UPDATE enrollments SET " . implode(', ', $fields) . " WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            successResponse(null, 'Enrollment updated successfully');
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
    
    public function delete(int $id): void {
        AuthMiddleware::requirePermission(Permissions::ENROLLMENTS);
        
        try {
            // Check for payments
            $checkStmt = $this->db->prepare("SELECT COUNT(*) FROM payments WHERE enrollmentId = :id");
            $checkStmt->execute(['id' => $id]);
            if ($checkStmt->fetchColumn() > 0) {
                errorResponse('Cannot delete enrollment with recorded payments', 'ENR_005', 409);
            }
            
            $stmt = $this->db->prepare("DELETE FROM enrollments WHERE id = :id");
            $stmt->execute(['id' => $id]);
            
            if ($stmt->rowCount() === 0) {
                errorResponse('Enrollment not found', 'ENR_001', 404);
            }
            
            successResponse(null, 'Enrollment deleted successfully');
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
}

$method = $_SERVER['REQUEST_METHOD'];
$path = $_GET['path'] ?? '';
$id = $_GET['id'] ?? null;

$controller = new EnrollmentsController();

if ($method === 'GET' && $path === '' && !$id) {
    $controller->list();
} elseif ($method === 'GET' && is_numeric($id) && $path === '') {
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
