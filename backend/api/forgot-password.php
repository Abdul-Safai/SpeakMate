<?php
// forgot_password.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once("../database.php");

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);
$email = trim($data['email'] ?? '');

if (!$email) {
    echo json_encode(['success' => false, 'message' => 'Email is required.']);
    exit;
}

// Check if email exists
$query = "SELECT * FROM users WHERE email = :email";
$stmt = $db->prepare($query);
$stmt->bindValue(':email', $email);
$stmt->execute();
$user = $stmt->fetch();

if (!$user) {
    echo json_encode(['success' => false, 'message' => 'Email not found.']);
    exit;
}

// Generate secure token and expiration
$token = bin2hex(random_bytes(32));
$expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

// Store token in database
$update = "UPDATE users SET reset_token = :token, token_expires = :expires WHERE email = :email";
$updateStmt = $db->prepare($update);
$updateStmt->bindValue(':token', $token);
$updateStmt->bindValue(':expires', $expires);
$updateStmt->bindValue(':email', $email);
$updateStmt->execute();

// Create reset link
$resetLink = "http://localhost/SpeakMate/reset-password.php?token=$token";

// Send email
$to = $email;
$subject = "Reset Your SpeakMate Password";
$message = "
<html>
<head><title>Password Reset</title></head>
<body>
  <p>Hi,</p>
  <p>We received a request to reset your password. Click the link below to reset it:</p>
  <p><a href='$resetLink'>Reset Password</a></p>
  <p>This link will expire in 1 hour.</p>
  <p>If you didn't request a password reset, ignore this email.</p>
</body>
</html>
";
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=UTF-8\r\n";
$headers .= "From: SpeakMate <no-reply@speakmate.com>\r\n";

if (mail($to, $subject, $message, $headers)) {
    echo json_encode(['success' => true, 'message' => 'Reset link sent. Check your email.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to send email.']);
}
?>
