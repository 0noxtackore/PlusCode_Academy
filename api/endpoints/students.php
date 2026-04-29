<?php
/**
 * Students API Endpoints
 * 
 * GET    /api/students           - List all students
 * GET    /api/students/{id}      - Get student by ID
 * POST   /api/students           - Create new student
 * PUT    /api/students/{id}      - Update student
 * DELETE /api/students/{id}      - Delete student
 * GET    /api/students/{id}/payments    - Get student payment history
 * GET    /api/students/{id}/enrollments - Get student enrollments
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

class StudentsController {
    
    private PDO $db;
    
    public function __construct() {
        $this->db = Database::getConnection();
    }
    
    /**
     * GET /api/students
     */
    public function list(): void {
        AuthMiddleware::requirePermission(Permissions::STUDENTS);
        
        try {
            $status = $_GET['status'] ?? null;
            $search = $_GET['search'] ?? null;
            $page = (int)($_GET['page'] ?? 1);
            $limit = (int)($_GET['limit'] ?? 50);
            $offset = ($page - 1) * $limit;
            
            $where = [];
            $params = [];
            
            if ($status) {
                $where[] = "s.status = :status";
                $params['status'] = $status;
            }
            
            if ($search) {
                $where[] = "(s.name LIKE :search OR s.lastName LIKE :search OR s.idNumber LIKE :search OR s.email LIKE :search)";
                $params['search'] = "%{$search}%";
            }
            
            $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';
            
            // Get total count
            $countStmt = $this->db->prepare("SELECT COUNT(*) FROM students s {$whereClause}");
            $countStmt->execute($params);
            $total = $countStmt->fetchColumn();
            
            // Get students with enrollment count
            $sql = "
                SELECT 
                    s.id,
                    s.idNumber,
                    s.name,
                    s.lastName,
                    s.email,
                    s.phone,
                    s.status,
                    s.createdAt,
                    s.updatedAt,
                    COUNT(DISTINCT e.id) as enrolledCourses,
                    COALESCE(SUM(p.amount), 0) as totalPayments
                FROM students s
                LEFT JOIN enrollments e ON s.id = e.studentId AND e.status = 'Active'
                LEFT JOIN payments p ON e.id = p.enrollmentId
                {$whereClause}
                GROUP BY s.id
                ORDER BY s.createdAt DESC
                LIMIT :limit OFFSET :offset
            ";
            
            $stmt = $this->db->prepare($sql);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            
            $students = $stmt->fetchAll();
            
            successResponse([
                'students' => $students,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => ceil($total / $limit)
                ]
            ]);
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
    
    /**
     * GET /api/students/{id}
     */
    public function get(int $id): void {
        AuthMiddleware::requirePermission(Permissions::STUDENTS);
        
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    s.id,
                    s.idNumber,
                    s.name,
                    s.lastName,
                    s.email,
                    s.phone,
                    s.status,
                    s.createdAt,
                    s.updatedAt
                FROM students s
                WHERE s.id = :id
                LIMIT 1
            ");
            $stmt->execute(['id' => $id]);
            $student = $stmt->fetch();
            
            if (!$student) {
                errorResponse('Student not found', 'STU_001', 404);
            }
            
            // Get current enrollments
            $enrollStmt = $this->db->prepare("
                SELECT 
                    e.id,
                    c.name as courseName,
                    c.code as courseCode,
                    e.status,
                    e.enrollmentDate,
                    c.fee as courseFee,
                    COALESCE(SUM(p.amount), 0) as totalPaid,
                    (c.fee - COALESCE(SUM(p.amount), 0)) as balanceDue
                FROM enrollments e
                JOIN courses c ON e.courseId = c.id
                LEFT JOIN payments p ON e.id = p.enrollmentId
                WHERE e.studentId = :studentId
                GROUP BY e.id
                ORDER BY e.enrollmentDate DESC
            ");
            $enrollStmt->execute(['studentId' => $id]);
            $student['enrollments'] = $enrollStmt->fetchAll();
            
            successResponse($student);
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
    
    /**
     * POST /api/students
     */
    public function create(): void {
        AuthMiddleware::requirePermission(Permissions::STUDENTS);
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validation
        if (empty($input['idNumber']) || empty($input['name']) || empty($input['lastName'])) {
            errorResponse('idNumber, name and lastName are required', 'VAL_001', 400);
        }
        
        // Validate idNumber format
        if (!preg_match('/^[VE]-\d{6,8}$/', $input['idNumber'])) {
            errorResponse('Invalid idNumber format. Use V-12345678 or E-12345678', 'VAL_002', 400);
        }
        
        // Validate email if provided
        if (!empty($input['email']) && !filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
            errorResponse('Invalid email format', 'VAL_002', 400);
        }
        
        try {
            // Check for duplicate idNumber
            $checkStmt = $this->db->prepare("SELECT id FROM students WHERE idNumber = :idNumber");
            $checkStmt->execute(['idNumber' => $input['idNumber']]);
            if ($checkStmt->fetch()) {
                errorResponse('Student with this ID number already exists', 'VAL_003', 409);
            }
            
            $stmt = $this->db->prepare("
                INSERT INTO students (idNumber, name, lastName, email, phone, status, createdAt)
                VALUES (:idNumber, :name, :lastName, :email, :phone, :status, NOW())
            ");
            
            $stmt->execute([
                'idNumber' => $input['idNumber'],
                'name' => $input['name'],
                'lastName' => $input['lastName'],
                'email' => $input['email'] ?? null,
                'phone' => $input['phone'] ?? null,
                'status' => $input['status'] ?? 'Active'
            ]);
            
            $newId = $this->db->lastInsertId();
            
            // Return created student
            $this->get((int)$newId);
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
    
    /**
     * PUT /api/students/{id}
     */
    public function update(int $id): void {
        AuthMiddleware::requirePermission(Permissions::STUDENTS);
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        try {
            // Check if student exists
            $checkStmt = $this->db->prepare("SELECT id FROM students WHERE id = :id");
            $checkStmt->execute(['id' => $id]);
            if (!$checkStmt->fetch()) {
                errorResponse('Student not found', 'STU_001', 404);
            }
            
            // Build update query dynamically
            $fields = [];
            $params = ['id' => $id];
            
            $allowedFields = ['idNumber', 'name', 'lastName', 'email', 'phone', 'status'];
            
            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    $fields[] = "{$field} = :{$field}";
                    $params[$field] = $input[$field];
                }
            }
            
            if (empty($fields)) {
                errorResponse('No fields to update', 'VAL_001', 400);
            }
            
            // Check for duplicate idNumber if changing
            if (isset($input['idNumber'])) {
                $dupStmt = $this->db->prepare("SELECT id FROM students WHERE idNumber = :idNumber AND id != :id");
                $dupStmt->execute(['idNumber' => $input['idNumber'], 'id' => $id]);
                if ($dupStmt->fetch()) {
                    errorResponse('Another student with this ID number already exists', 'VAL_003', 409);
                }
            }
            
            $fields[] = "updatedAt = NOW()";
            
            $sql = "UPDATE students SET " . implode(', ', $fields) . " WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            successResponse(null, 'Student updated successfully');
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
    
    /**
     * DELETE /api/students/{id}
     */
    public function delete(int $id): void {
        AuthMiddleware::requirePermission(Permissions::STUDENTS);
        
        try {
            // Check for active enrollments
            $checkStmt = $this->db->prepare("
                SELECT COUNT(*) FROM enrollments 
                WHERE studentId = :id AND status = 'Active'
            ");
            $checkStmt->execute(['id' => $id]);
            $activeEnrollments = $checkStmt->fetchColumn();
            
            if ($activeEnrollments > 0) {
                errorResponse('Cannot delete student with active enrollments', 'STU_002', 409);
            }
            
            // Soft delete - change status to Inactive
            $stmt = $this->db->prepare("
                UPDATE students SET status = 'Inactive', updatedAt = NOW() WHERE id = :id
            ");
            $stmt->execute(['id' => $id]);
            
            if ($stmt->rowCount() === 0) {
                errorResponse('Student not found', 'STU_001', 404);
            }
            
            successResponse(null, 'Student deleted successfully');
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
}

// Route handling
$method = $_SERVER['REQUEST_METHOD'];
$path = $_GET['path'] ?? '';
$id = $_GET['id'] ?? null;

$controller = new StudentsController();

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
