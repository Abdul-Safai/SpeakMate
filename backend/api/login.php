<?php
// backend/api/login.php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$body = file_get_contents('php://input');
$data = json_decode($body, true);

$email = strtolower(trim($data['email'] ?? ''));
$pwd   = trim((string)($data['password'] ?? ''));

if ($email === '' || $pwd === '') {
  http_response_code(400);
  echo json_encode(["success" => false, "error" => "Missing email or password."]);
  exit;
}

require_once("../config/database.php");

try {
  $sql = "SELECT id, email, full_name, password_hash FROM users WHERE LOWER(email)=:email LIMIT 1";
  $stmt = $db->prepare($sql);
  $stmt->bindParam(':email', $email, PDO::PARAM_STR);
  $stmt->execute();

  if ($stmt->rowCount() !== 1) { http_response_code(401); echo json_encode(["success"=>false,"error"=>"Invalid email or password."]); exit; }

  $user = $stmt->fetch(PDO::FETCH_ASSOC);
  $hash = $user['password_hash'] ?? '';

  if (!is_string($hash) || strlen($hash) < 60 || !password_verify($pwd, $hash)) {
    http_response_code(401);
    echo json_encode(["success"=>false,"error"=>"Invalid email or password."]);
    exit;
  }

  if (password_needs_rehash($hash, PASSWORD_DEFAULT)) {
    $newHash = password_hash($pwd, PASSWORD_DEFAULT);
    $up = $db->prepare("UPDATE users SET password_hash=:h WHERE id=:id");
    $up->execute([':h'=>$newHash, ':id'=>$user['id']]);
  }

  echo json_encode(["success"=>true,"user"=>[
    "id"=>$user['id'], "email"=>$user['email'], "full_name"=>$user['full_name']
  ]]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(["success"=>false,"error"=>"Server error."]);
}
