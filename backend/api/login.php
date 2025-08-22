<?php
// backend/api/login.php

// CORS (adjust origin to your dev server if needed)
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=utf-8");

ini_set('display_errors', 1);
error_reporting(E_ALL);

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Read body as JSON if content-type contains application/json
$rawContentType = $_SERVER['CONTENT_TYPE'] ?? '';
$body = file_get_contents("php://input");
$data = null;

if (stripos($rawContentType, 'application/json') !== false) {
    $data = json_decode($body, true);
}

// Fallback to POST if not JSON
$email = '';
$password = '';

if (is_array($data)) {
    $email = strtolower(trim($data['email'] ?? ''));
    $password = trim($data['password'] ?? '');
} else {
    $email = strtolower(trim($_POST['email'] ?? ''));
    $password = trim($_POST['password'] ?? '');
}

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing email or password."]);
    exit;
}

require_once("../config/database.php");

try {
    $query = "SELECT id, email, full_name, password_hash FROM users WHERE LOWER(email) = :email LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $email, PDO::PARAM_STR);
    $stmt->execute();

    if ($stmt->rowCount() !== 1) {
        http_response_code(401);
        echo json_encode(["success" => false, "error" => "Invalid email or password."]);
        exit;
    }

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(["success" => false, "error" => "Invalid email or password."]);
        exit;
    }

    // Successful login
    echo json_encode([
        "success" => true,
        "user" => [
            "id" => $user['id'],
            "email" => $user['email'],
            "full_name" => $user['full_name']
        ]
        // Optionally include a token if you implement JWT/sessions
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Server error: " . $e->getMessage()]);
}
