<?php
// db.php

$host = 'localhost';        
$dbname = 'glovo_forum';   
$username = 'root';        
$password = '';             

// Create the connection
$conn = mysqli_connect($host, $username, $password, $dbname);

// Check the connection
if (!$conn) {
    die(" Connection failed: " . mysqli_connect_error());
}
?>
