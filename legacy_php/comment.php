<?php
session_start();
include 'db.php';

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_SESSION['user_id'])) {
    $post_id = isset($_POST['post_id']) ? (int)$_POST['post_id'] : 0;
    $user_id = $_SESSION['user_id'];
    $comment = trim($_POST['comment']);

    if ($post_id > 0 && !empty($comment)) {
        $stmt = mysqli_prepare($conn, "INSERT INTO comments (post_id, user_id, comment) VALUES (?, ?, ?)");
        mysqli_stmt_bind_param($stmt, "iis", $post_id, $user_id, $comment);
        mysqli_stmt_execute($stmt);
    }

    header("Location: views.php?id=$post_id");
    exit();
} else {
    header("Location: login.php");
    exit();
}
