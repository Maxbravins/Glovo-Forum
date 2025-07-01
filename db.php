<?php
// db.php

$host = 'localhost';        // or '127.0.0.1'
$dbname = 'glovo_forum';    // Your database name
$username = 'root';         // Default XAMPP username
$password = '';             // Default XAMPP password (empty)

// Create the connection
$conn = mysqli_connect($host, $username, $password, $dbname);

// Check the connection
if (!$conn) {
    die("❌ Connection failed: " . mysqli_connect_error());
}
?>
