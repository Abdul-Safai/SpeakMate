<?php
$password = '22222'; // Change this to test different passwords
$hash = '$2y$10$g4tW3Gaq5cvmZ0QOi7SQxexITnS05ru1BKULBJUHQBfzpHnxdpyde';

if (password_verify($password, $hash)) {
    echo "✅ Password matches!";
} else {
    echo "❌ Password does NOT match!";
}
?>
