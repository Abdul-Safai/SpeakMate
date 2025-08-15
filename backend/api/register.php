<?php
// backend/api/register.php
error_log("🚀 register.php was triggered");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

ini_set('display_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if ($contentType === 'application/json') {
    $data = json_decode(file_get_contents("php://input"), true);
    $full_name = trim($data['full_name'] ?? '');
    $email     = strtolower(trim($data['email'] ?? '')); // ✅ Force lowercase
    $password  = trim($data['password'] ?? '');
} else {
    $full_name = trim($_POST['full_name'] ?? '');
    $email     = strtolower(trim($_POST['email'] ?? '')); // ✅ Force lowercase fallback
    $password  = trim($_POST['password'] ?? '');
}

// Log raw input
error_log("📥 Register Input — Name: $full_name | Email: $email | Password Length: " . strlen($password));

if (!$full_name || !$email || !$password) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required fields"]);
    exit;
}

require_once("../config/database.php");
require '../vendor/autoload.php'; // PHPMailer autoload

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Log and hash password
error_log("🔐 Password received for hashing: $password");

$password_hash = password_hash($password, PASSWORD_DEFAULT);
error_log("🧠 Hashed password: $password_hash");

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

error_log("💾 Attempting to insert: $full_name | $email | HASH: $password_hash");

if ($stmt->execute()) {
    error_log("✅ Insert successful for user: $email");

    // Send confirmation email
    $mail = new PHPMailer(true);
    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'myclass.practice@gmail.com'; // 🔁 Replace with yours
        $mail->Password = 'doaqfikprkljvptn';           // 🔁 Replace with your App Password
        $mail->SMTPSecure = 'tls';
        $mail->Port = 587;

        // Recipients
        $mail->setFrom('myclass.practice@gmail.com', 'SpeakMate');
        $mail->addAddress($email, $full_name);

        // Content
        $mail->isHTML(true);
        $mail->Subject = 'Welcome to SpeakMate!';
        $mail->Body    = "
            <h3>Hello {$full_name},</h3>
            <p>Thank you for registering at <strong>SpeakMate</strong>.</p>
            <p>We’re excited to help you on your language journey.</p>
            <p>Best regards,<br/>SpeakMate Team</p>
        ";

        $mail->send();
        echo json_encode(["success" => true, "message" => "User registered successfully and confirmation email sent"]);
    } catch (Exception $e) {
        error_log("📧 Email sending failed: " . $mail->ErrorInfo);
        echo json_encode(["success" => true, "message" => "Registered, but email failed to send: {$mail->ErrorInfo}"]);
    }
} else {
    error_log("❌ Insert failed for: $email");
    http_response_code(500);
    echo json_encode(["error" => "Registration failed"]);
}
