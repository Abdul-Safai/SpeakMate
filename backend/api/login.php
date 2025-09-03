<?php
// backend/api/login.php — minimal, production-safe

// If opcache is holding onto an old file, reset it (safe in dev)
if (function_exists('opcache_reset')) { @opcache_reset(); }

header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Method not allowed']);
  exit;
}

$in = json_decode(file_get_contents('php://input'), true) ?? [];
$email = strtolower(trim($in['email'] ?? ''));
$pw    = (string)($in['password'] ?? '');

if ($email === '' || $pw === '') {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Email and password are required.']);
  exit;
}

require_once __DIR__ . '/../config/database.php'; // must define $db (PDO)

try {
  $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

  // We assume standard columns used by your register.php
  $stmt = $db->prepare("
    SELECT id, email, full_name, password_hash
    FROM users
    WHERE LOWER(email) = :e
    ORDER BY id DESC
    LIMIT 1
  ");
  $stmt->execute([':e' => $email]);
  $user = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$user || !isset($user['password_hash'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Invalid email or password.']);
    exit;
  }

  // Normalize hash the same way as dev_verify.php
  $hash = rtrim((string)$user['password_hash'], " \t\n\r\0\x0B");

  $ok = ($hash !== '' && password_verify($pw, $hash));
  if (!$ok && str_starts_with($hash, '$2y$')) {
    // Defensive: also accept crypt() match (same result if hash is valid)
    $cryptOut = crypt($pw, $hash);
    $ok = is_string($cryptOut) && hash_equals($cryptOut, $hash);
  }

  if (!$ok) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Invalid email or password.']);
    exit;
  }

  // Optional: upgrade to current default if needed
  if (password_needs_rehash($hash, PASSWORD_DEFAULT)) {
    $newHash = password_hash($pw, PASSWORD_DEFAULT);
    $upd = $db->prepare("UPDATE users SET password_hash = :h WHERE id = :id");
    $upd->execute([':h' => $newHash, ':id' => $user['id']]);
  }

  http_response_code(200);
  echo json_encode([
    'success' => true,
    'user' => [
      'id'        => (int)$user['id'],
      'email'     => $user['email'],
      'full_name' => $user['full_name'] ?? '',
    ]
  ]);

} catch (Throwable $e) {
  error_log('[login.php] '.$e->getMessage());
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Server error.']);
}
