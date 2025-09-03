<?php
// TEMP ONLY — delete after use
header("Content-Type: application/json; charset=utf-8");
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../config/database.php'; // provides $db (PDO)
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$in  = json_decode(file_get_contents('php://input'), true) ?? [];
$email = strtolower(trim($in['email'] ?? ''));
$pw    = (string)($in['password'] ?? '');

if ($email === '' || $pw === '') {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'email and password required']);
  exit;
}

$stmt = $db->prepare("
  SELECT id, email, password_hash
  FROM users
  WHERE LOWER(email) = :e
  ORDER BY id DESC
  LIMIT 1
");
$stmt->execute([':e' => $email]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$row || !isset($row['password_hash'])) {
  echo json_encode(['ok' => false, 'error' => 'user not found or no hash']);
  exit;
}

$hash = rtrim((string)$row['password_hash'], " \t\n\r\0\x0B"); // <- no extra slashes
$ok   = $hash !== '' && password_verify($pw, $hash);

echo json_encode([
  'ok'          => $ok,
  'user_id'     => (int)$row['id'],
  'hash_len'    => strlen($hash),
  'hash_prefix' => substr($hash, 0, 10),
  'pw_b64'      => base64_encode($pw),
]);
