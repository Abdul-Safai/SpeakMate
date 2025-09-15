<?php
// SpeakMate/backend/api/generate-code.php

// 👇 pick ONE of these based on db.php location:
require __DIR__.'/db.php';         // if db.php is in backend/api/
// require __DIR__.'/../db.php';   // if db.php is in backend/

function make_human_code(): string {
  $hex = strtoupper(bin2hex(random_bytes(3))); // F3A9C2
  return implode('-', str_split($hex, 3));     // F3A-9C2
}

$plaintext = null; $msg = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $role  = $_POST['role'] ?? 'instructor';
  $days  = max(1, (int)($_POST['days'] ?? 14));
  $uses  = $_POST['uses'] === '' ? null : max(1, (int)$_POST['uses']);
  if (!in_array($role, ['student','instructor','admin'], true)) { $msg='Invalid role'; }
  else {
    $plaintext = make_human_code();
    $hash = password_hash($plaintext, PASSWORD_BCRYPT);
    $expires = (new DateTime("+$days days"))->format('Y-m-d H:i:s');
    $pdo->prepare("INSERT INTO invite_codes (code_hash, role, expires_at, uses_remaining, created_by)
                   VALUES (?,?,?,?,?)")
        ->execute([$hash, $role, $expires, $uses, 'web']);
    $msg='Code created successfully.';
  }
}
?>
<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Generate Invite Code</title><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f6f8fb;margin:0;padding:24px;color:#0b1324}
.card{max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 12px 28px rgba(0,0,0,.08);padding:16px 16px 20px}
h1{margin:0 0 10px;font-size:20px}
.row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
@media (max-width:680px){.row{grid-template-columns:1fr}}
label{font-weight:800;font-size:12px;display:block;margin-bottom:4px}
input,select{height:42px;width:100%;padding:0 10px;border:1px solid #e5e7eb;border-radius:10px}
.btn{margin-top:10px;padding:10px 14px;border-radius:10px;border:1px solid #e5e7eb;background:linear-gradient(180deg,#fff,#f7fafc);font-weight:800;cursor:pointer}
.note{color:#6b7280;font-size:12px;margin-top:8px}
.success{margin-top:14px;padding:10px;border:1px solid #e5e7eb;background:#f9fafb;border-radius:10px}
.code{font-size:26px;font-weight:900;letter-spacing:.08em}
</style></head><body><div class="card">
<h1>Generate Invite Code</h1>
<form method="post">
  <div class="row">
    <div><label>Role</label>
      <select name="role"><option value="instructor">Instructor</option><option value="admin">Admin</option><option value="student">Student</option></select>
    </div>
    <div><label>Days valid</label><input type="number" name="days" value="14" min="1"></div>
    <div><label>Uses (blank = unlimited)</label><input type="number" name="uses" placeholder=""></div>
  </div>
  <button class="btn" type="submit">Create code</button>
  <div class="note">Share codes privately. Old codes can be revoked.</div>
</form>
<?php if ($plaintext): ?>
  <div class="success"><div><strong>Plaintext code (share this):</strong></div>
  <div class="code"><?= htmlspecialchars($plaintext) ?></div>
  <div class="note">Shown only once. Stored hashed in DB.</div></div>
<?php elseif ($msg): ?>
  <div class="success"><?= htmlspecialchars($msg) ?></div>
<?php endif; ?>
</div></body></html>
