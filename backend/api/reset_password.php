<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Read incoming JSON data
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if ($contentType === 'application/json') {
    $data = json_decode(file_get_contents("php://input"), true);
    $token = $data['token'] ?? null;
    $newPassword = $data['password'] ?? null;
} else {
    $token = $_POST['token'] ?? null;
    $newPassword = $_POST['password'] ?? null;
}

// Validate inputs
if (!$token || !$newPassword) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Missing token or password."]);
    exit;
}

require_once 'database.php'; // ✅ Your database config

// Step 1: Check if token is valid and not expired
$query = "SELECT * FROM password_resets WHERE token = :token AND expires_at > NOW()";
$stmt = $db->prepare($query);
$stmt->bindParam(':token', $token);
$stmt->execute();
$resetRequest = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$resetRequest) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Invalid or expired token."]);
    exit;
}

$email = $resetRequest['email'];

// Step 2: Hash the new password
$hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

// Step 3: Update user password
$update = "UPDATE users SET password_hash = :password WHERE email = :email";
$stmt = $db->prepare($update);
$stmt->execute([
    ':password' => $hashedPassword,
    ':email' => $email
]);

// Step 4: Remove the used token
$delete = "DELETE FROM password_resets WHERE token = :token";
$stmt = $db->prepare($delete);
$stmt->bindParam(':token', $token);
$stmt->execute();

echo json_encode(["success" => true, "message" => "Password has been reset successfully."]);
?>
