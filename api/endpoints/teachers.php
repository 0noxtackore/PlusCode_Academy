<?php
/**
 * Teachers API Endpoints
 * 
 * GET    /api/teachers           - List all teachers
 * GET    /api/teachers/{id}      - Get teacher by ID
 * POST   /api/teachers           - Create new teacher
 * PUT    /api/teachers/{id}      - Update teacher
 * DELETE /api/teachers/{id}      - Delete teacher
 * GET    /api/teachers/{id}/payments    - Get teacher payment history
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

class TeachersController {
    
    private PDO $db;
    
    public function __construct() {
        $this->db = Database::getConnection();
    }
    
    public function list(): void {
        AuthMiddleware::requirePermission(Permissions::TEACHERS);
        
        try {
            $status = $_GET['status'] ?? null;
            $page = (int)($_GET['page'] ?? 1);
            $limit = (int)($_GET['limit'] ?? 50);
            $offset = ($page - 1) * $limit;
            
            $where = [];
            $params = [];
            
            if ($status) { $where[] = "t.status = :status"; $params['status'] = $status; }
            
            $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';
            
            $countStmt = $this->db->prepare("SELECT COUNT(*) FROM teachers t {$whereClause}");
            $countStmt->execute($params);
            $total = $countStmt->fetchColumn();
            
            $sql = "
                SELECT 
                    t.id,
                    t.idNumber,
                    t.name,
                    t.lastName,
                    t.email,
                    t.phone,
                    t.specialty,
                    t.hourlyRate,
                    t.status,
                    t.hireDate,
                    COUNT(DISTINCT c.id) as assignedCourses,
                    COALESCE(SUM(tp.totalSalary), 0) as totalPaidYTD
                FROM teachers t
                LEFT JOIN courses c ON t.id = c.teacherId AND c.status = 'Active'
                LEFT JOIN teacher_payments tp ON t.id = tp.teacherId AND tp.period LIKE CONCAT(YEAR(CURDATE()), '%')
                {$whereClause}
                GROUP BY t.id
                ORDER BY t.name ASC
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
                'teachers' => $stmt->fetchAll(),
                'pagination' => ['page' => $page, 'limit' => $limit, 'total' => $total, 'pages' => ceil($total / $limit)]
            ]);
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
    
    public function get(int $id): void {
        AuthMiddleware::requirePermission(Permissions::TEACHERS);
        
        try {
            $stmt = $this->db->prepare("SELECT * FROM teachers WHERE id = :id LIMIT 1");
            $stmt->execute(['id' => $id]);
            $teacher = $stmt->fetch();
            
            if (!$teacher) {
                errorResponse('Teacher not found', 'TCH_001', 404);
            }
            
            // Get assigned courses
            $coursesStmt = $this->db->prepare("
                SELECT id, code, name, status FROM courses WHERE teacherId = :id
            ");
            $coursesStmt->execute(['id' => $id]);
            $teacher['courses'] = $coursesStmt->fetchAll();
            
            successResponse($teacher);
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
    
    public function create(): void {
        AuthMiddleware::requirePermission(Permissions::TEACHERS);
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (empty($input['idNumber']) || empty($input['name']) || empty($input['lastName'])) {
            errorResponse('idNumber, name and lastName are required', 'VAL_001', 400);
        }
        
        try {
            // Check duplicate
            $checkStmt = $this->db->prepare("SELECT id FROM teachers WHERE idNumber = :idNumber");
            $checkStmt->execute(['idNumber' => $input['idNumber']]);
            if ($checkStmt->fetch()) {
                errorResponse('Teacher with this ID already exists', 'VAL_003', 409);
            }
            
            $stmt = $this->db->prepare("
                INSERT INTO teachers (idNumber, name, lastName, email, phone, specialty, hourlyRate, status, hireDate, createdAt)
                VALUES (:idNumber, :name, :lastName, :email, :phone, :specialty, :hourlyRate, :status, :hireDate, NOW())
            ");
            
            $stmt->execute([
                'idNumber' => $input['idNumber'],
                'name' => $input['name'],
                'lastName' => $input['lastName'],
                'email' => $input['email'] ?? null,
                'phone' => $input['phone'] ?? null,
                'specialty' => $input['specialty'] ?? null,
                'hourlyRate' => $input['hourlyRate'] ?? 25.00,
                'status' => $input['status'] ?? 'Active',
                'hireDate' => $input['hireDate'] ?? date('Y-m-d')
            ]);
            
            $newId = $this->db->lastInsertId();
            $this->get((int)$newId);
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
    
    public function update(int $id): void {
        AuthMiddleware::requirePermission(Permissions::TEACHERS);
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        try {
            $fields = [];
            $params = ['id' => $id];
            $allowedFields = ['idNumber', 'name', 'lastName', 'email', 'phone', 'specialty', 'hourlyRate', 'status'];
            
            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    $fields[] = "{$field} = :{$field}";
                    $params[$field] = $input[$field];
                }
            }
            
            if (empty($fields)) {
                errorResponse('No fields to update', 'VAL_001', 400);
            }
            
            $sql = "UPDATE teachers SET " . implode(', ', $fields) . " WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            successResponse(null, 'Teacher updated successfully');
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
    
    public function delete(int $id): void {
        AuthMiddleware::requirePermission(Permissions::TEACHERS);
        
        try {
            // Check for assigned courses
            $checkStmt = $this->db->prepare("SELECT COUNT(*) FROM courses WHERE teacherId = :id AND status = 'Active'");
            $checkStmt->execute(['id' => $id]);
            if ($checkStmt->fetchColumn() > 0) {
                errorResponse('Cannot delete teacher with assigned active courses', 'TCH_002', 409);
            }
            
            $stmt = $this->db->prepare("DELETE FROM teachers WHERE id = :id");
            $stmt->execute(['id' => $id]);
            
            if ($stmt->rowCount() === 0) {
                errorResponse('Teacher not found', 'TCH_001', 404);
            }
            
            successResponse(null, 'Teacher deleted successfully');
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
}

$method = $_SERVER['REQUEST_METHOD'];
$path = $_GET['path'] ?? '';
$id = $_GET['id'] ?? null;

$controller = new TeachersController();

if ($method === 'GET' && $path === '' && !$id) {
    $controller->list();
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
