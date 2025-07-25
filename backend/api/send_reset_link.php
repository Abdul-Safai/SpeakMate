<?php
// ---------- DEBUG (disable in production) ----------
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// ---------- CORS ----------
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

// ---------- Preflight ----------
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ---------- Helper ----------
function fail(string $msg, int $code = 400) {
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $msg]);
    exit;
}

// ---------- Load PHPMailer ----------
$autoloadPath = dirname(__DIR__) . '/vendor/autoload.php';
if (!file_exists($autoloadPath)) {
    fail('Missing PHPMailer autoload file', 500);
}
require $autoloadPath;

// ---------- DB ----------
require_once __DIR__ . '/../config/database.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

// ---------- Input ----------
$payload = json_decode(file_get_contents('php://input'), true);
$email = filter_var($payload['email'] ?? '', FILTER_VALIDATE_EMAIL);

if (!$email) {
    fail('Invalid email address.', 422);
}

// ---------- Find user ----------
$query = "SELECT id, full_name FROM users WHERE email = :email";
$stmt = $db->prepare($query);
$stmt->bindValue(':email', $email);
$stmt->execute();
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    fail('No account with this email address.', 404);
}

// ---------- Generate token ----------
$token = bin2hex(random_bytes(32));
$expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

$update = $db->prepare("
    UPDATE users
    SET reset_token = :token, reset_expires = :expires
    WHERE id = :id
");
$update->execute([
    ':token' => $token,
    ':expires' => $expires,
    ':id' => $user['id']
]);

$resetLink = "http://localhost/SpeakMate/php/reset_password.php?token=$token";

// ---------- Send email ----------
$mail = new PHPMailer(true);

// Enable debug logging to PHP log (for testing)
$mail->SMTPDebug  = SMTP::DEBUG_SERVER;
$mail->Debugoutput = 'error_log';

try {
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'myclass.practice@gmail.com';  // ✅ Your Gmail
    $mail->Password   = 'doaqfikprkljvptn';         // ✅ App password — no spaces, copy-paste exactly
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    $mail->setFrom('myclass.practice@gmail.com', 'SpeakMate Support');
    $mail->addAddress($email, $user['full_name']);
    $mail->isHTML(true);
    $mail->Subject = 'Password Reset - SpeakMate';
    $mail->Body    = "
        <h3>Hello " . htmlspecialchars($user['full_name']) . ",</h3>
        <p>You requested a password reset for your SpeakMate account.</p>
        <p><a href='$resetLink'>Click here to reset your password</a></p>
        <p>This link will expire in 1 hour.</p>
        <br><p>If you didn’t request this, you can safely ignore this email.</p>
    ";

    $mail->send();
    echo json_encode(['success' => true, 'message' => 'Password reset link sent to your email.']);
} catch (Exception $e) {
    error_log('Mailer Error: ' . $mail->ErrorInfo);
    fail('Email sending failed. Please try again later.', 500);
}
