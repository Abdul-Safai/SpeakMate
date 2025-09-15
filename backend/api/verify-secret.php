<?php
// SpeakMate/backend/api/verify-secret.php
header('Access-Control-Allow-Origin: http://localhost:4200'); // Angular dev server
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }
header('Content-Type: application/json');

// 👇 pick ONE of these requires based on where your db.php is:
require __DIR__.'/db.php';         // if db.php is in backend/api/
// require __DIR__.'/../db.php';   // if db.php is in backend/

$input = json_decode(file_get_contents('php://input'), true);
$role = $input['role'] ?? '';
$code = $input['code'] ?? '';

$allowed = ['student','instructor','admin'];
if (!$role || !$code || !in_array($role, $allowed, true)) {
  echo json_encode(['ok'=>false, 'error'=>'missing']); exit;
}

$stmt = $pdo->prepare("
  SELECT id, code_hash, uses_remaining, expires_at, revoked_at
    FROM invite_codes
   WHERE role = ?
     AND revoked_at IS NULL
     AND expires_at > NOW()
   ORDER BY id DESC
   LIMIT 300
");
$stmt->execute([$role]);
$rows = $stmt->fetchAll();

$matched = null;
foreach ($rows as $r) {
  if (password_verify($code, $r['code_hash'])) { $matched = $r; break; }
}
if (!$matched) { echo json_encode(['ok'=>false, 'error'=>'invalid']); exit; }

if ($matched['uses_remaining'] !== null) {
  $upd = $pdo->prepare("UPDATE invite_codes SET uses_remaining = uses_remaining - 1 WHERE id=? AND uses_remaining > 0");
  $upd->execute([$matched['id']]);
}
echo json_encode(['ok'=>true]);
