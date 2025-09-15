<?php
// backend/api/db.php
$DB_HOST = '127.0.0.1';
$DB_NAME = 'speakmate';          // ← ensure this matches the DB you open in phpMyAdmin
$DB_USER = 'root';               // ← XAMPP default
$DB_PASS = '';                   // ← XAMPP default empty password

$dsn = "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4";
$pdo = new PDO($dsn, $DB_USER, $DB_PASS, [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);
