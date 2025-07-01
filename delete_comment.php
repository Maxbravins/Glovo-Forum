<?php
session_start();
include 'db.php';

// Admin only
if (!isset($_SESSION['username']) || $_SESSION['role'] !== 'admin') {
    header("Location: login.php");
    exit();
}

// Get comment ID
if (isset($_POST['comment_id'])) {
    $id = (int) $_POST['comment_id'];
    $delete = mysqli_query($conn, "DELETE FROM comments WHERE id = $id");
}

header("Location: dashboard.php");
exit();
