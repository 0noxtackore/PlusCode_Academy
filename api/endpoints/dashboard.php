<?php
/**
 * Dashboard & Reports API Endpoints
 * 
 * GET /api/dashboard              - Main dashboard statistics
 * GET /api/dashboard/revenue      - Revenue analytics
 * GET /api/dashboard/enrollments  - Enrollment statistics
 * GET /api/reports/financial      - Financial reports
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

class DashboardController {
    
    private PDO $db;
    
    public function __construct() {
        $this->db = Database::getConnection();
    }
    
    /**
     * GET /api/dashboard
     * Main dashboard statistics
     */
    public function index(): void {
        AuthMiddleware::requireAnyPermission([Permissions::STUDENTS, Permissions::COURSES, Permissions::REPORTS]);
        
        try {
            // Students stats
            $studentStmt = $this->db->query("
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active,
                    SUM(CASE WHEN status = 'Inactive' THEN 1 ELSE 0 END) as inactive,
                    SUM(CASE WHEN MONTH(createdAt) = MONTH(CURDATE()) AND YEAR(createdAt) = YEAR(CURDATE()) THEN 1 ELSE 0 END) as newThisMonth
                FROM students
            ");
            $students = $studentStmt->fetch();
            
            // Courses stats
            $courseStmt = $this->db->query("
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active
                FROM courses
            ");
            $courses = $courseStmt->fetch();
            
            // Enrollments stats
            $enrollStmt = $this->db->query("
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active,
                    SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
                    SUM(CASE WHEN status = 'Dropped' THEN 1 ELSE 0 END) as dropped
                FROM enrollments
            ");
            $enrollments = $enrollStmt->fetch();
            
            // Financial stats
            $revenueStmt = $this->db->query("
                SELECT 
                    COALESCE(SUM(amount), 0) as totalRevenue,
                    COALESCE(SUM(CASE WHEN MONTH(paymentDate) = MONTH(CURDATE()) AND YEAR(paymentDate) = YEAR(CURDATE()) THEN amount ELSE 0 END), 0) as monthlyRevenue,
                    COALESCE(SUM(CASE WHEN YEAR(paymentDate) = YEAR(CURDATE()) THEN amount ELSE 0 END), 0) as ytdRevenue
                FROM payments
                WHERE status = 'Paid'
            ");
            $financial = $revenueStmt->fetch();
            
            // Pending payments (accounts receivable)
            $pendingStmt = $this->db->query("
                SELECT COALESCE(SUM(e.balanceDue), 0) as pendingPayments
                FROM (
                    SELECT 
                        en.id,
                        (c.fee - COALESCE(SUM(p.amount), 0)) as balanceDue
                    FROM enrollments en
                    JOIN courses c ON en.courseId = c.id
                    LEFT JOIN payments p ON en.id = p.enrollmentId
                    WHERE en.status = 'Active'
                    GROUP BY en.id
                    HAVING balanceDue > 0
                ) e
            ");
            $financial['pendingPayments'] = $pendingStmt->fetchColumn();
            
            // Teachers stats
            $teacherStmt = $this->db->query("
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active,
                    COALESCE(SUM(monthlyPayroll), 0) as monthlyPayroll
                FROM teachers
                LEFT JOIN (
                    SELECT teacherId, SUM(totalSalary) as monthlyPayroll
                    FROM teacher_payments
                    WHERE period = DATE_FORMAT(CURDATE(), '%Y-%m')
                    GROUP BY teacherId
                ) tp ON teachers.id = tp.teacherId
            ");
            $teachers = $teacherStmt->fetch();
            
            successResponse([
                'students' => $students,
                'courses' => $courses,
                'enrollments' => $enrollments,
                'financial' => $financial,
                'teachers' => $teachers,
                'timestamp' => date('c')
            ]);
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
    
    /**
     * GET /api/dashboard/revenue
     * Revenue analytics with trends
     */
    public function revenue(): void {
        AuthMiddleware::requirePermission(Permissions::REPORTS);
        
        try {
            $period = $_GET['period'] ?? 'monthly'; // monthly, weekly, daily
            $months = (int)($_GET['months'] ?? 6);
            
            if ($period === 'monthly') {
                $stmt = $this->db->prepare("
                    SELECT 
                        DATE_FORMAT(paymentDate, '%Y-%m') as period,
                        COALESCE(SUM(amount), 0) as revenue,
                        COUNT(*) as paymentCount
                    FROM payments
                    WHERE paymentDate >= DATE_SUB(CURDATE(), INTERVAL :months MONTH)
                    AND status = 'Paid'
                    GROUP BY DATE_FORMAT(paymentDate, '%Y-%m')
                    ORDER BY period ASC
                ");
                $stmt->execute(['months' => $months]);
            } else {
                $stmt = $this->db->query("
                    SELECT 
                        DATE(paymentDate) as period,
                        COALESCE(SUM(amount), 0) as revenue,
                        COUNT(*) as paymentCount
                    FROM payments
                    WHERE paymentDate >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                    AND status = 'Paid'
                    GROUP BY DATE(paymentDate)
                    ORDER BY period ASC
                ");
            }
            
            $data = $stmt->fetchAll();
            
            // Calculate trend
            $trend = 'stable';
            if (count($data) >= 2) {
                $first = (float)($data[0]['revenue'] ?? 0);
                $last = (float)($data[count($data) - 1]['revenue'] ?? 0);
                if ($last > $first * 1.1) $trend = 'up';
                elseif ($last < $first * 0.9) $trend = 'down';
            }
            
            successResponse([
                'data' => $data,
                'trend' => $trend,
                'period' => $period
            ]);
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
    
    /**
     * GET /api/dashboard/enrollments
     * Enrollment statistics by course
     */
    public function enrollments(): void {
        AuthMiddleware::requirePermission(Permissions::ENROLLMENTS);
        
        try {
            // Enrollment by course
            $courseStmt = $this->db->query("
                SELECT 
                    c.id,
                    c.code,
                    c.name,
                    c.maxCapacity,
                    COUNT(e.id) as enrolledCount,
                    (c.maxCapacity - COUNT(e.id)) as availableSpots,
                    ROUND((COUNT(e.id) / c.maxCapacity) * 100, 1) as fillPercentage,
                    COALESCE(SUM(p.amount), 0) as revenue
                FROM courses c
                LEFT JOIN enrollments e ON c.id = e.courseId AND e.status = 'Active'
                LEFT JOIN payments p ON e.id = p.enrollmentId
                WHERE c.status = 'Active'
                GROUP BY c.id
                ORDER BY enrolledCount DESC
            ");
            
            // Monthly trend
            $trendStmt = $this->db->query("
                SELECT 
                    DATE_FORMAT(enrollmentDate, '%Y-%m') as month,
                    COUNT(*) as count
                FROM enrollments
                WHERE enrollmentDate >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                GROUP BY DATE_FORMAT(enrollmentDate, '%Y-%m')
                ORDER BY month ASC
            ");
            
            successResponse([
                'byCourse' => $courseStmt->fetchAll(),
                'monthlyTrend' => $trendStmt->fetchAll()
            ]);
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
    
    /**
     * GET /api/reports/financial
     * Comprehensive financial report
     */
    public function financial(): void {
        AuthMiddleware::requirePermission(Permissions::REPORTS);
        
        try {
            $year = (int)($_GET['year'] ?? date('Y'));
            $month = $_GET['month'] ?? null;
            
            // Income statement
            if ($month) {
                // Monthly report
                $revenueStmt = $this->db->prepare("
                    SELECT COALESCE(SUM(amount), 0) as total
                    FROM payments
                    WHERE YEAR(paymentDate) = :year AND MONTH(paymentDate) = :month
                    AND status = 'Paid'
                ");
                $revenueStmt->execute(['year' => $year, 'month' => $month]);
                
                $expenseStmt = $this->db->prepare("
                    SELECT COALESCE(SUM(amount), 0) as total
                    FROM expenses
                    WHERE YEAR(date) = :year AND MONTH(date) = :month
                    AND status = 'paid'
                ");
                $expenseStmt->execute(['year' => $year, 'month' => $month]);
            } else {
                // Annual report
                $revenueStmt = $this->db->prepare("
                    SELECT COALESCE(SUM(amount), 0) as total
                    FROM payments
                    WHERE YEAR(paymentDate) = :year
                    AND status = 'Paid'
                ");
                $revenueStmt->execute(['year' => $year]);
                
                $expenseStmt = $this->db->prepare("
                    SELECT COALESCE(SUM(amount), 0) as total
                    FROM expenses
                    WHERE YEAR(date) = :year
                    AND status = 'paid'
                ");
                $expenseStmt->execute(['year' => $year]);
            }
            
            $revenue = $revenueStmt->fetchColumn();
            $expenses = $expenseStmt->fetchColumn();
            $netIncome = $revenue - $expenses;
            $margin = $revenue > 0 ? round(($netIncome / $revenue) * 100, 2) : 0;
            
            successResponse([
                'period' => $month ? "{$year}-{$month}" : (string)$year,
                'revenue' => (float)$revenue,
                'expenses' => (float)$expenses,
                'netIncome' => (float)$netIncome,
                'margin' => $margin
            ]);
            
        } catch (PDOException $e) {
            errorResponse('Database error: ' . $e->getMessage(), 'SYS_001', 500);
        }
    }
}

$method = $_SERVER['REQUEST_METHOD'];
$path = $_GET['path'] ?? '';

$controller = new DashboardController();

if ($method === 'GET' && $path === '') {
    $controller->index();
} elseif ($method === 'GET' && $path === 'revenue') {
    $controller->revenue();
} elseif ($method === 'GET' && $path === 'enrollments') {
    $controller->enrollments();
} else {
    errorResponse('Endpoint not found', 'SYS_003', 404);
}
