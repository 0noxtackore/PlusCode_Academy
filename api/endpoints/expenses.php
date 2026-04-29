<?php
/**
 * Expenses API Endpoints
 * 
 * GET    /api/expenses           - List all expenses
 * GET    /api/expenses/{id}      - Get expense by ID
 * POST   /api/expenses           - Create new expense
 * PUT    /api/expenses/{id}      - Update expense
 * DELETE /api/expenses/{id}      - Delete expense
 * GET    /api/expenses/categories - Get expense categories
 * GET    /api/expenses/summary   - Get expense summary
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

class ExpensesController {
    
    private PDO $db;
    
    public function __construct() {
        $this->db = Database::getConnection();
    }
    
    public function list(): void {
        AuthMiddleware::requirePermission(Permissions::EXPENSES);
        
        try {
            $categoryId = $_GET['categoryId'] ?? null;
            $status = $_GET['status'] ?? null;
            $dateFrom = $_GET['dateFrom'] ?? null;
            $dateTo = $_GET['dateTo'] ?? null;
            $page = (int)($_GET['page'] ?? 1);
            $limit = (int)($_GET['limit'] ?? 50);
            $offset = ($page - 1) * $limit;
            
            $where = [];
            $params = [];
            
            if ($categoryId) { $where[] = "e.categoryId = :categoryId"; $params['categoryId'] = $categoryId; }
            if ($status) { $where[] = "e.status = :status"; $params['status'] = $status; }
            if ($dateFrom) { $where[] = "e.date >= :dateFrom"; $params['dateFrom'] = $dateFrom; }
            if ($dateTo) { $where[] = "e.date <= :dateTo"; $params['dateTo'] = $dateTo; }
            
            $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';
            
            $countStmt = $this->db->prepare("
                SELECT COUNT(*) FROM expenses e {$whereClause}
            ");
            $countStmt->execute($params);
            $total = $countStmt->fetchColumn();
            
            $sql = "
                SELECT 
                    e.id,
                    e.categoryId,
                    ec.name as categoryName,
                    e.description,
                    e.amount,
                    e.date,
                    e.paymentMethod,
                    e.reference,
                    e.status,
                    e.createdAt
                FROM expenses e
                JOIN expense_categories ec ON e.categoryId = ec.id
                {$whereClause}
                ORDER BY e.date DESC
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
                'expenses' => $stmt->fetchAll(),
                'pagination' => ['page' => $page, 'limit' => $limit, 'total' => $total, 'pages' => ceil($total / $limit)]
            ]);
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
    
    public function get(int $id): void {
        AuthMiddleware::requirePermission(Permissions::EXPENSES);
        
        try {
            $stmt = $this->db->prepare("
                SELECT e.*, ec.name as categoryName 
                FROM expenses e
                JOIN expense_categories ec ON e.categoryId = ec.id
                WHERE e.id = :id
                LIMIT 1
            ");
            $stmt->execute(['id' => $id]);
            $expense = $stmt->fetch();
            
            if (!$expense) {
                errorResponse('Expense not found', 'EXP_001', 404);
            }
            
            successResponse($expense);
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
    
    public function create(): void {
        AuthMiddleware::requirePermission(Permissions::EXPENSES);
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (empty($input['categoryId']) || empty($input['description']) || !isset($input['amount'])) {
            errorResponse('categoryId, description and amount are required', 'VAL_001', 400);
        }
        
        if ($input['amount'] <= 0) {
            errorResponse('Amount must be positive', 'VAL_004', 400);
        }
        
        try {
            // Check category exists
            $catStmt = $this->db->prepare("SELECT id FROM expense_categories WHERE id = :id");
            $catStmt->execute(['id' => $input['categoryId']]);
            if (!$catStmt->fetch()) {
                errorResponse('Expense category not found', 'EXP_002', 404);
            }
            
            $stmt = $this->db->prepare("
                INSERT INTO expenses (categoryId, description, amount, date, paymentMethod, reference, status, createdAt)
                VALUES (:categoryId, :description, :amount, :date, :paymentMethod, :reference, :status, NOW())
            ");
            
            $stmt->execute([
                'categoryId' => $input['categoryId'],
                'description' => $input['description'],
                'amount' => $input['amount'],
                'date' => $input['date'] ?? date('Y-m-d'),
                'paymentMethod' => $input['paymentMethod'] ?? 'Transfer',
                'reference' => $input['reference'] ?? null,
                'status' => $input['status'] ?? 'paid'
            ]);
            
            $newId = $this->db->lastInsertId();
            $this->get((int)$newId);
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
    
    public function update(int $id): void {
        AuthMiddleware::requirePermission(Permissions::EXPENSES);
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        try {
            $fields = [];
            $params = ['id' => $id];
            $allowedFields = ['categoryId', 'description', 'amount', 'date', 'paymentMethod', 'reference', 'status'];
            
            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    $fields[] = "{$field} = :{$field}";
                    $params[$field] = $input[$field];
                }
            }
            
            if (empty($fields)) {
                errorResponse('No fields to update', 'VAL_001', 400);
            }
            
            $sql = "UPDATE expenses SET " . implode(', ', $fields) . " WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            successResponse(null, 'Expense updated successfully');
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
    
    public function delete(int $id): void {
        AuthMiddleware::requirePermission(Permissions::EXPENSES);
        
        try {
            $stmt = $this->db->prepare("DELETE FROM expenses WHERE id = :id");
            $stmt->execute(['id' => $id]);
            
            if ($stmt->rowCount() === 0) {
                errorResponse('Expense not found', 'EXP_001', 404);
            }
            
            successResponse(null, 'Expense deleted successfully');
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
    
    public function categories(): void {
        AuthMiddleware::requirePermission(Permissions::EXPENSES);
        
        try {
            $stmt = $this->db->query("
                SELECT 
                    ec.*,
                    COALESCE(SUM(e.amount), 0) as currentMonthTotal
                FROM expense_categories ec
                LEFT JOIN expenses e ON ec.id = e.categoryId 
                    AND MONTH(e.date) = MONTH(CURDATE()) 
                    AND YEAR(e.date) = YEAR(CURDATE())
                    AND e.status = 'paid'
                GROUP BY ec.id
            ");
            
            successResponse(['categories' => $stmt->fetchAll()]);
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
    
    public function summary(): void {
        AuthMiddleware::requirePermission(Permissions::EXPENSES);
        
        try {
            $month = $_GET['month'] ?? date('Y-m');
            list($year, $monthNum) = explode('-', $month);
            
            $stmt = $this->db->prepare("
                SELECT 
                    COALESCE(SUM(amount), 0) as total,
                    COUNT(*) as count
                FROM expenses
                WHERE MONTH(date) = :month AND YEAR(date) = :year
                AND status = 'paid'
            ");
            $stmt->execute(['month' => $monthNum, 'year' => $year]);
            $summary = $stmt->fetch();
            
            // By category
            $catStmt = $this->db->prepare("
                SELECT 
                    ec.name,
                    COALESCE(SUM(e.amount), 0) as total,
                    COUNT(*) as count
                FROM expense_categories ec
                LEFT JOIN expenses e ON ec.id = e.categoryId 
                    AND MONTH(e.date) = :month 
                    AND YEAR(e.date) = :year
                    AND e.status = 'paid'
                GROUP BY ec.id
            ");
            $catStmt->execute(['month' => $monthNum, 'year' => $year]);
            $summary['byCategory'] = $catStmt->fetchAll();
            
            successResponse($summary);
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
}

$method = $_SERVER['REQUEST_METHOD'];
$path = $_GET['path'] ?? '';
$id = $_GET['id'] ?? null;

$controller = new ExpensesController();

if ($method === 'GET' && $path === '' && !$id) {
    $controller->list();
} elseif ($method === 'GET' && $path === 'categories') {
    $controller->categories();
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
