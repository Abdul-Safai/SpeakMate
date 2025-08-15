<?php
// backend/api/reset_password.php

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Read and decode JSON input
$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

// Validate JSON
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON body.']);
    exit;
}

$token = $data['token'] ?? '';
$newPassword = $data['new_password'] ?? '';

if (!$token || !$newPassword) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Token and new password are required.']);
    exit;
}

require_once(__DIR__ . '/../config/database.php');

// Check token
$sql = "SELECT * FROM users WHERE reset_token = :token AND reset_expires > NOW()";
$stmt = $db->prepare($sql);
$stmt->bindParam(':token', $token);
$stmt->execute();
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid or expired token.']);
    exit;
}

// Hash password
$hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

// Update password and clear token
$updateSql = "UPDATE users 
              SET password_hash = :password, reset_token = NULL, reset_expires = NULL 
              WHERE id = :id";
$updateStmt = $db->prepare($updateSql);
$updateStmt->bindParam(':password', $hashedPassword);
$updateStmt->bindParam(':id', $user['id']);

if ($updateStmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Password updated successfully.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to update password.']);
}
?>
