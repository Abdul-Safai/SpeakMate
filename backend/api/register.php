<?php
// backend/api/register.php

// ---- CORS / JSON headers (align with login.php) ----
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=utf-8");

// Dev logging (remove in prod)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Method not allowed']);
  exit;
}

// ---- Parse body: prefer JSON; fallback to form-encoded ----
$raw = file_get_contents('php://input');
$input = json_decode($raw, true);

// If not JSON or empty, fallback to POST (e.g., from form submit)
if (!is_array($input) || empty($input)) {
  $input = $_POST;
}

$full_name = trim((string)($input['full_name'] ?? ''));
$email     = strtolower(trim((string)($input['email'] ?? '')));
$password  = (string)($input['password'] ?? '');

// Basic validation
if ($full_name === '' || $email === '' || $password === '') {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Full name, email and password are required.']);
  exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Invalid email format.']);
  exit;
}
if (strlen($password) < 8) { // adjust policy as you like
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Password must be at least 8 characters.']);
  exit;
}

// Hash the password
$hash = password_hash($password, PASSWORD_DEFAULT);

require_once(__DIR__ . '/../config/database.php'); // must define $db (PDO)

try {
  // Throw exceptions on SQL errors
  $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

  // Case-insensitive duplicate check
  $check = $db->prepare("SELECT id FROM users WHERE LOWER(email) = :email LIMIT 1");
  $check->execute([':email' => $email]);
  if ($check->fetch()) {
    http_response_code(409);
    echo json_encode(['success' => false, 'error' => 'Email already registered.']);
    exit;
  }

  // Insert user (ensure password_hash column exists and is VARCHAR(255))
  $ins = $db->prepare("
    INSERT INTO users (full_name, email, password_hash)
    VALUES (:full_name, :email, :hash)
  ");
  $ins->execute([
    ':full_name' => $full_name,
    ':email'     => $email,
    ':hash'      => $hash,
  ]);

  // Optionally send a welcome email (only if SMTP env vars are configured)
  $smtpUser = getenv('SMTP_USER') ?: 'myclass.practice@gmail.com'; // change/remove defaults
  $smtpPass = getenv('SMTP_PASS') ?: '';                           // store securely, not in source
  $sentMail = false;
  $mailError = null;

  if ($smtpUser && $smtpPass) {
    $autoload = __DIR__ . '/../vendor/autoload.php';
    if (file_exists($autoload)) {
      require $autoload;
      try {
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = $smtpUser;
        $mail->Password   = $smtpPass;       // App Password recommended
        $mail->SMTPSecure = 'tls';
        $mail->Port       = 587;

        $mail->setFrom($smtpUser, 'SpeakMate');
        $mail->addAddress($email, $full_name);

        $mail->isHTML(true);
        $mail->Subject = 'Welcome to SpeakMate!';
        $mail->Body    = "<h3>Hello " . htmlspecialchars($full_name) . ",</h3>
                          <p>Thanks for registering at <strong>SpeakMate</strong>.</p>
                          <p>We’re excited to help you on your language journey.</p>
                          <p>— SpeakMate Team</p>";
        $mail->send();
        $sentMail = true;
      } catch (Throwable $e) {
        $mailError = $e->getMessage();
        // Don’t fail the registration if email fails
      }
    }
  }

  http_response_code(201);
  echo json_encode([
    'success' => true,
    'message' => $sentMail ? 'User registered and email sent.' : 'User registered.',
    'email_sent' => $sentMail,
    'email_error' => $sentMail ? null : $mailError
  ]);
} catch (Throwable $e) {
  // Log details server-side; generic error to client
  error_log('[register.php] ' . $e->getMessage());
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Server error.']);
}
