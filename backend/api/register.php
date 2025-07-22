<?php
// backend/api/register.php

// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight (OPTIONS) requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Handle both JSON and form-data
if ($_SERVER['CONTENT_TYPE'] === 'application/json') {
    $data = json_decode(file_get_contents("php://input"), true);
    $full_name = $data['full_name'] ?? null;
    $email = $data['email'] ?? null;
    $password = $data['password'] ?? null;
} else {
    $full_name = $_POST['full_name'] ?? null;
    $email = $_POST['email'] ?? null;
    $password = $_POST['password'] ?? null;
}

// Validate input
if (!$full_name || !$email || !$password) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required fields"]);
    exit;
}

require_once("../config/database.php");

$password_hash = password_hash($password, PASSWORD_DEFAULT);

// Check for duplicate email
$query = "SELECT id FROM users WHERE email = :email";
$stmt = $db->prepare($query);
$stmt->bindValue(':email', $email);
$stmt->execute();

if ($stmt->rowCount() > 0) {
    http_response_code(409);
    echo json_encode(["error" => "Email already registered"]);
    exit;
}

// Insert user
$query = "INSERT INTO users (full_name, email, password_hash) 
          VALUES (:full_name, :email, :password_hash)";
$stmt = $db->prepare($query);
$stmt->bindParam(':full_name', $full_name);
$stmt->bindParam(':email', $email);
$stmt->bindParam(':password_hash', $password_hash);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "User registered successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Registration failed"]);
}
?>
