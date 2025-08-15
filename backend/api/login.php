<?php
// backend/api/login.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

ini_set('display_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if ($contentType === 'application/json') {
    $data = json_decode(file_get_contents("php://input"), true);
    $email = strtolower(trim($data['email'] ?? '')); // ✅ lowercase
    $password = trim($data['password'] ?? '');
} else {
    $email = strtolower(trim($_POST['email'] ?? ''));
    $password = trim($_POST['password'] ?? '');
}

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(["error" => "Missing email or password"]);
    exit;
}

require_once("../config/database.php");

// ✅ Check user by lowercased email
$query = "SELECT * FROM users WHERE LOWER(email) = :email LIMIT 1";
$stmt = $db->prepare($query);
$stmt->bindParam(':email', $email);
$stmt->execute();

if ($stmt->rowCount() === 1) {
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if (password_verify($password, $user['password_hash'])) {
        echo json_encode(["success" => true, "message" => "Login successful"]);
        exit;
    } else {
        http_response_code(401);
        echo json_encode(["error" => "Invalid email or password."]);
        exit;
    }
} else {
    http_response_code(401);
    echo json_encode(["error" => "Invalid email or password."]);
    exit;
}
