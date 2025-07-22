<?php
// backend/config/database.php

$host = 'localhost';
$dbname = 'speakmate';
$username = 'root';
$password = ''; // Keep blank for local XAMPP

try {
    $db = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}
?>
