<?php
// Creates a user and (for instructor/admin) validates a secret code.
// Requires: backend/api/db.php to define $pdo (PDO connected to your DB)

header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 1);
error_reporting(E_ALL);

try {
  // --- DB ---
  require __DIR__ . '/db.php';
  if (!isset($pdo) || !$pdo) {
    throw new Exception('DB not initialized');
  }

  // --- Input ---
  $in = json_decode(file_get_contents('php://input'), true) ?: [];
  $fullName = trim($in['fullName'] ?? '');
  $email    = strtolower(trim($in['email'] ?? ''));
  $password = (string)($in['password'] ?? '');
  $role     = strtolower(trim($in['role'] ?? 'student'));
  $secret   = trim((string)($in['secretCode'] ?? ''));

  // --- Validate basics ---
  if ($fullName === '' || $email === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']); exit;
  }
  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email']); exit;
  }
  if (!in_array($role, ['student','instructor','admin'], true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid role']); exit;
  }

  // --- Secret required for instructor/admin ---
  if ($role === 'instructor' || $role === 'admin') {   // <-- fixed: removed extra ')'
    if ($secret === '') {
      http_response_code(400);
      echo json_encode(['error' => 'Secret code required']); exit;
    }

    // Verify secret against invite_codes
    $stmt = $pdo->prepare(
      "SELECT id, code_hash, uses_remaining
         FROM invite_codes
        WHERE role = ?
          AND revoked_at IS NULL
          AND (expires_at IS NULL OR expires_at > NOW())
        ORDER BY id DESC
        LIMIT 500"
    );
    $stmt->execute([$role]);

    $matchId = null; $usesRemaining = null;
    foreach ($stmt as $row) {
      if (password_verify(strtoupper($secret), $row['code_hash'])) {
        $matchId = (int)$row['id'];
        $usesRemaining = $row['uses_remaining'];
        break;
      }
    }
    if (!$matchId) {
      http_response_code(401);
      echo json_encode(['error' => 'Invalid secret']); exit;
    }

    // decrement if limited-use code
    if ($usesRemaining !== null) {
      $usesRemaining = (int)$usesRemaining;
      if ($usesRemaining <= 0) {
        http_response_code(401);
        echo json_encode(['error' => 'Secret exhausted']); exit;
      }
      $upd = $pdo->prepare("UPDATE invite_codes SET uses_remaining = uses_remaining - 1 WHERE id = ?");
      $upd->execute([$matchId]);
    }
  }

  // --- Ensure users table exists (safe if already created) ---
  $pdo->exec("CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student','instructor','admin') NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

  // --- Unique email check ---
  $exists = $pdo->prepare("SELECT id FROM users WHERE email = ?");
  $exists->execute([$email]);
  if ($exists->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'Email already registered']); exit;
  }

  // --- Insert user ---
  $hash = password_hash($password, PASSWORD_DEFAULT);
  $ins  = $pdo->prepare("INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)");
  $ins->execute([$fullName, $email, $hash, $role]);
  $userId = (int)$pdo->lastInsertId();

  echo json_encode([
    'id'       => (string)$userId,
    'fullName' => $fullName,
    'email'    => $email,
    'role'     => $role,
    'token'    => null
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['error' => $e->getMessage()]);
  error_log('[register.php] ' . $e->getMessage());
}
