<?php

// Enable error reporting (for debugging only)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight request (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Show errors (for development only – remove in production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Check content type and retrieve data
if ($_SERVER['CONTENT_TYPE'] === 'application/json') {
    $data = json_decode(file_get_contents("php://input"), true);
    $email = $data['email'] ?? null;
    $password = $data['password'] ?? null;
} else {
    $email = $_POST['email'] ?? null;
    $password = $_POST['password'] ?? null;
}

// Validate inputs
if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(["error" => "Missing email or password"]);
    exit;
}

require_once("../config/database.php");

// Fetch user by email
$query = "SELECT * FROM users WHERE email = :email";
$stmt = $db->prepare($query);
$stmt->bindParam(':email', $email);
$stmt->execute();
$user = $stmt->fetch(PDO::FETCH_ASSOC);

// Function to log login attempt
function log_login_attempt($db, $userId, $success) {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN';
    $query = "INSERT INTO login_logs (user_id, ip_address, success) 
              VALUES (:user_id, :ip_address, :success)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $userId);
    $stmt->bindParam(':ip_address', $ip);
    $stmt->bindParam(':success', $success, PDO::PARAM_BOOL);
    $stmt->execute();
}

if ($user && password_verify($password, $user['password_hash'])) {
    log_login_attempt($db, $user['id'], true);
    echo json_encode([
        "success" => true,
        "message" => "Login successful",
        "user" => [
            "id" => $user['id'],
            "full_name" => $user['full_name'],
            "email" => $user['email']
        ]
    ]);
} else {
    if ($user && isset($user['id'])) {
        log_login_attempt($db, $user['id'], false);
    }
    http_response_code(401);
    echo json_encode(["error" => "Invalid credentials"]);
}
?>
