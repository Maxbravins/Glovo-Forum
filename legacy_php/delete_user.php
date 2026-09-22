<?php
session_start();
include 'db.php';

// Only admins allowed
if (!isset($_SESSION['username']) || $_SESSION['role'] !== 'admin') {
    header("Location: login.php");
    exit();
}

if (isset($_GET['id'])) {
    $userId = intval($_GET['id']);

    // Prevent admin from deleting themselves
    if ($_SESSION['user_id'] == $userId) {
        echo "You cannot delete your own admin account!";
        exit();
    }

    // Delete user
    $stmt = mysqli_prepare($conn, "DELETE FROM users WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "i", $userId);
    mysqli_stmt_execute($stmt);

    header("Location: dashboard.php"); // Redirect back to dashboard
    exit();
} else {
    echo "Invalid request!";
}
?>
