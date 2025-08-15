<?php
// backend/api/login.php

ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once("../config/database.php");

// Read JSON input safely
$rawInput = file_get_contents("php://input");
error_log("📥 Raw input: " . $rawInput);

$data = json_decode($rawInput, true);
if (!$data) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid JSON input"]);
    exit;
}

$email = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');

// Debug input
error_log("🧾 Parsed Email: >>$email<< (" . strlen($email) . ")");
error_log("🔐 Parsed Password: >>$password<< (" . strlen($password) . ")");

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["error" => "Missing email or password"]);
    exit;
}

// Lookup user
$stmt = $db->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
$stmt->bindParam(':email', $email);
$stmt->execute();
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    $storedHash = $user['password_hash'];
    error_log("✅ User found: {$user['email']}");
    error_log("🔒 Stored hash: $storedHash");

    $verifyResult = password_verify($password, $storedHash);
    error_log("🔍 password_verify result: " . ($verifyResult ? 'true' : 'false'));

    if ($verifyResult) {
        echo json_encode([
            "success" => true,
            "message" => "Login successful",
            "user" => [
                "id" => $user['id'],
                "full_name" => $user['full_name'],
                "email" => $user['email']
            ]
        ]);
        exit;
    } else {
        error_log("❌ Password does NOT match for $email");
    }
} else {
    error_log("❌ No user found with email $email");
}

http_response_code(401);
echo json_encode(["error" => "Invalid email or password"]);
