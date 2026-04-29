<?php
require_once 'config.php';

// Obtener la entidad de la URL, por ejemplo: api.php?entity=students
$entity = $_GET['entity'] ?? '';
$action = $_GET['action'] ?? '';

// Obtener datos del cuerpo de la petición (JSON)
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true) ?? [];

$method = $_SERVER['REQUEST_METHOD'];

switch ($entity) {
    case 'auth':
        handleAuth($pdo, $method, $input);
        break;
    case 'students':
        handleCrud($pdo, 'students', $method, $input);
        break;
    case 'courses':
        handleCrud($pdo, 'courses', $method, $input);
        break;
    case 'enrollments':
        handleCrud($pdo, 'enrollments', $method, $input);
        break;
    case 'payments':
        handleCrud($pdo, 'payments', $method, $input);
        break;
    case 'expenses':
        handleCrud($pdo, 'expenses', $method, $input);
        break;
    case 'expense_categories':
        handleCrud($pdo, 'expense_categories', $method, $input);
        break;
    case 'teachers':
        handleCrud($pdo, 'teachers', $method, $input);
        break;
    case 'teacher_payments':
        handleCrud($pdo, 'teacher_payments', $method, $input);
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
        break;
}

// ---------------------------------------------------------
// Funciones Controladoras
// ---------------------------------------------------------

function handleAuth($pdo, $method, $input) {
    if ($method !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }

    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';

    $stmt = $pdo->prepare("SELECT * FROM users WHERE (username = ? OR email = ?) AND password = ?");
    $stmt->execute([$username, $username, $password]);
    $user = $stmt->fetch();

    if ($user) {
        unset($user['password']); // No devolver el password
        // Parsear permisos de nuevo a array JSON para el frontend
        $user['permissions'] = json_decode($user['permissions']);
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Credenciales incorrectas']);
    }
}

function handleCrud($pdo, $table, $method, $input) {
    $id = $_GET['id'] ?? null;

    try {
        switch ($method) {
            case 'GET':
                if ($id) {
                    $stmt = $pdo->prepare("SELECT * FROM `$table` WHERE id = ?");
                    $stmt->execute([$id]);
                    $result = $stmt->fetch();
                    echo json_encode($result ?: null);
                } else {
                    $stmt = $pdo->query("SELECT * FROM `$table`");
                    $results = $stmt->fetchAll();
                    echo json_encode($results);
                }
                break;

            case 'POST':
                // Construir query de insert dinámicamente
                $fields = array_keys($input);
                $placeholders = array_fill(0, count($fields), '?');
                
                $sql = "INSERT INTO `$table` (`" . implode("`, `", $fields) . "`) VALUES (" . implode(", ", $placeholders) . ")";
                $stmt = $pdo->prepare($sql);
                $stmt->execute(array_values($input));
                
                // Devolver el elemento creado
                $newId = $pdo->lastInsertId();
                $stmt = $pdo->prepare("SELECT * FROM `$table` WHERE id = ?");
                $stmt->execute([$newId]);
                echo json_encode($stmt->fetch());
                break;

            case 'PUT':
                if (!$id) {
                    http_response_code(400);
                    echo json_encode(['error' => 'ID required for PUT']);
                    return;
                }
                
                $setClauses = [];
                $values = [];
                foreach ($input as $key => $value) {
                    if ($key !== 'id') {
                        $setClauses[] = "`$key` = ?";
                        $values[] = $value;
                    }
                }
                $values[] = $id;
                
                $sql = "UPDATE `$table` SET " . implode(", ", $setClauses) . " WHERE id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($values);
                
                // Devolver el elemento actualizado
                $stmt = $pdo->prepare("SELECT * FROM `$table` WHERE id = ?");
                $stmt->execute([$id]);
                echo json_encode($stmt->fetch());
                break;

            case 'DELETE':
                if (!$id) {
                    http_response_code(400);
                    echo json_encode(['error' => 'ID required for DELETE']);
                    return;
                }
                
                $stmt = $pdo->prepare("DELETE FROM `$table` WHERE id = ?");
                $stmt->execute([$id]);
                echo json_encode(['success' => true]);
                break;
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
    }
}
?>
