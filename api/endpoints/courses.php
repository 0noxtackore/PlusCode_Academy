<?php
/**
 * Courses API Endpoints
 * 
 * GET    /api/courses           - List all courses
 * GET    /api/courses/{id}      - Get course by ID
 * POST   /api/courses           - Create new course
 * PUT    /api/courses/{id}      - Update course
 * DELETE /api/courses/{id}      - Delete course
 * GET    /api/courses/{id}/students    - Get enrolled students
 * GET    /api/courses/available  - Get courses with available spots
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

class CoursesController {
    
    private PDO $db;
    
    public function __construct() {
        $this->db = Database::getConnection();
    }
    
    /**
     * GET /api/courses
     */
    public function list(): void {
        AuthMiddleware::requirePermission(Permissions::COURSES);
        
        try {
            $status = $_GET['status'] ?? null;
            $teacherId = $_GET['teacherId'] ?? null;
            $available = $_GET['available'] ?? false;
            $page = (int)($_GET['page'] ?? 1);
            $limit = (int)($_GET['limit'] ?? 50);
            $offset = ($page - 1) * $limit;
            
            $where = [];
            $params = [];
            
            if ($status) {
                $where[] = "c.status = :status";
                $params['status'] = $status;
            }
            
            if ($teacherId) {
                $where[] = "c.teacherId = :teacherId";
                $params['teacherId'] = $teacherId;
            }
            
            $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';
            
            // Get total count
            $countStmt = $this->db->prepare("SELECT COUNT(*) FROM courses c {$whereClause}");
            $countStmt->execute($params);
            $total = $countStmt->fetchColumn();
            
            // Get courses with enrollment counts
            $sql = "
                SELECT 
                    c.id,
                    c.code,
                    c.name,
                    c.description,
                    c.fee,
                    c.credits,
                    c.status,
                    c.maxCapacity,
                    c.teacherId,
                    CONCAT(t.name, ' ', t.lastName) as teacherName,
                    COUNT(DISTINCT e.id) as currentEnrollment,
                    (c.maxCapacity - COUNT(DISTINCT e.id)) as availableSpots,
                    c.createdAt,
                    c.updatedAt
                FROM courses c
                LEFT JOIN teachers t ON c.teacherId = t.id
                LEFT JOIN enrollments e ON c.id = e.courseId AND e.status = 'Active'
                {$whereClause}
                GROUP BY c.id
                HAVING (:available = 0 OR availableSpots > 0)
                ORDER BY c.createdAt DESC
                LIMIT :limit OFFSET :offset
            ";
            
            $stmt = $this->db->prepare($sql);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->bindValue(':available', $available ? 1 : 0, PDO::PARAM_INT);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            
            $courses = $stmt->fetchAll();
            
            successResponse([
                'courses' => $courses,
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
     * GET /api/courses/{id}
     */
    public function get(int $id): void {
        AuthMiddleware::requirePermission(Permissions::COURSES);
        
        try {
            $stmt = $this->db->prepare("
                SELECT 
                    c.id,
                    c.code,
                    c.name,
                    c.description,
                    c.fee,
                    c.credits,
                    c.status,
                    c.maxCapacity,
                    c.teacherId,
                    CONCAT(t.name, ' ', t.lastName) as teacherName,
                    COUNT(DISTINCT e.id) as currentEnrollment
                FROM courses c
                LEFT JOIN teachers t ON c.teacherId = t.id
                LEFT JOIN enrollments e ON c.id = e.courseId AND e.status = 'Active'
                WHERE c.id = :id
                GROUP BY c.id
                LIMIT 1
            ");
            $stmt->execute(['id' => $id]);
            $course = $stmt->fetch();
            
            if (!$course) {
                errorResponse('Course not found', 'CRS_001', 404);
            }
            
            // Get enrolled students
            $studentsStmt = $this->db->prepare("
                SELECT 
                    s.id,
                    s.idNumber,
                    s.name,
                    s.lastName,
                    s.email,
                    e.enrollmentDate,
                    e.status as enrollmentStatus
                FROM enrollments e
                JOIN students s ON e.studentId = s.id
                WHERE e.courseId = :courseId
                ORDER BY e.enrollmentDate DESC
            ");
            $studentsStmt->execute(['courseId' => $id]);
            $course['enrolledStudents'] = $studentsStmt->fetchAll();
            
            successResponse($course);
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
    
    /**
     * POST /api/courses
     */
    public function create(): void {
        AuthMiddleware::requirePermission(Permissions::COURSES);
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validation
        if (empty($input['code']) || empty($input['name'])) {
            errorResponse('code and name are required', 'VAL_001', 400);
        }
        
        // Validate code format (alphanumeric, 2-10 chars)
        if (!preg_match('/^[A-Z0-9]{2,10}$/', $input['code'])) {
            errorResponse('Invalid code format. Use 2-10 uppercase alphanumeric characters', 'VAL_002', 400);
        }
        
        // Validate fee
        if (isset($input['fee']) && ($input['fee'] < 0 || $input['fee'] > 10000)) {
            errorResponse('Fee must be between 0 and 10000', 'VAL_004', 400);
        }
        
        // Validate capacity
        if (isset($input['maxCapacity']) && ($input['maxCapacity'] < 1 || $input['maxCapacity'] > 200)) {
            errorResponse('Capacity must be between 1 and 200', 'VAL_004', 400);
        }
        
        try {
            // Check for duplicate code
            $checkStmt = $this->db->prepare("SELECT id FROM courses WHERE code = :code");
            $checkStmt->execute(['code' => $input['code']]);
            if ($checkStmt->fetch()) {
                errorResponse('Course with this code already exists', 'VAL_003', 409);
            }
            
            $stmt = $this->db->prepare("
                INSERT INTO courses (code, name, description, fee, credits, maxCapacity, teacherId, status, createdAt)
                VALUES (:code, :name, :description, :fee, :credits, :maxCapacity, :teacherId, :status, NOW())
            ");
            
            $stmt->execute([
                'code' => $input['code'],
                'name' => $input['name'],
                'description' => $input['description'] ?? null,
                'fee' => $input['fee'] ?? 0,
                'credits' => $input['credits'] ?? 0,
                'maxCapacity' => $input['maxCapacity'] ?? 30,
                'teacherId' => $input['teacherId'] ?? null,
                'status' => $input['status'] ?? 'Active'
            ]);
            
            $newId = $this->db->lastInsertId();
            
            // Return created course
            $this->get((int)$newId);
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
    
    /**
     * PUT /api/courses/{id}
     */
    public function update(int $id): void {
        AuthMiddleware::requirePermission(Permissions::COURSES);
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        try {
            // Check if course exists
            $checkStmt = $this->db->prepare("
                SELECT c.id, c.maxCapacity, COUNT(e.id) as currentEnrollment
                FROM courses c
                LEFT JOIN enrollments e ON c.id = e.courseId AND e.status = 'Active'
                WHERE c.id = :id
                GROUP BY c.id
            ");
            $checkStmt->execute(['id' => $id]);
            $course = $checkStmt->fetch();
            
            if (!$course) {
                errorResponse('Course not found', 'CRS_001', 404);
            }
            
            // Check capacity constraint
            if (isset($input['maxCapacity']) && $input['maxCapacity'] < $course['currentEnrollment']) {
                errorResponse(
                    "Cannot reduce capacity below current enrollment ({$course['currentEnrollment']})", 
                    'CRS_002', 
                    409
                );
            }
            
            // Check if deactivating with active enrollments
            if (isset($input['status']) && $input['status'] !== 'Active' && $course['currentEnrollment'] > 0) {
                errorResponse('Cannot deactivate course with active enrollments', 'CRS_003', 409);
            }
            
            // Check for duplicate code if changing
            if (isset($input['code'])) {
                $dupStmt = $this->db->prepare("SELECT id FROM courses WHERE code = :code AND id != :id");
                $dupStmt->execute(['code' => $input['code'], 'id' => $id]);
                if ($dupStmt->fetch()) {
                    errorResponse('Another course with this code already exists', 'VAL_003', 409);
                }
            }
            
            // Build update query
            $fields = [];
            $params = ['id' => $id];
            
            $allowedFields = ['code', 'name', 'description', 'fee', 'credits', 'maxCapacity', 'teacherId', 'status'];
            
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
            
            $sql = "UPDATE courses SET " . implode(', ', $fields) . " WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            successResponse(null, 'Course updated successfully');
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
    
    /**
     * DELETE /api/courses/{id}
     */
    public function delete(int $id): void {
        AuthMiddleware::requirePermission(Permissions::COURSES);
        
        try {
            // Check for active enrollments
            $checkStmt = $this->db->prepare("
                SELECT COUNT(*) FROM enrollments 
                WHERE courseId = :id AND status = 'Active'
            ");
            $checkStmt->execute(['id' => $id]);
            $activeEnrollments = $checkStmt->fetchColumn();
            
            if ($activeEnrollments > 0) {
                errorResponse('Cannot delete course with active enrollments', 'CRS_003', 409);
            }
            
            $stmt = $this->db->prepare("DELETE FROM courses WHERE id = :id");
            $stmt->execute(['id' => $id]);
            
            if ($stmt->rowCount() === 0) {
                errorResponse('Course not found', 'CRS_001', 404);
            }
            
            successResponse(null, 'Course deleted successfully');
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
}

// Route handling
$method = $_SERVER['REQUEST_METHOD'];
$path = $_GET['path'] ?? '';
$id = $_GET['id'] ?? null;

$controller = new CoursesController();

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
