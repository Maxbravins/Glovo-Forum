<?php
session_start();

// Clear all session variables
$_SESSION = [];

// Destroy the session
session_destroy();

// Redirect to login with logout message
header("Location: login.php?logout=1");
exit();
?>
