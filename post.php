<?php
session_start();
include 'db.php';

// ✅ Redirect if not logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

// ✅ Use session-stored user_id directly
$user_id = $_SESSION['user_id'];

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $title = mysqli_real_escape_string($conn, $_POST['title']);
    $content = mysqli_real_escape_string($conn, $_POST['content']);

    // ✅ Insert post into DB
    $query = "INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)";
    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, "iss", $user_id, $title, $content);
    mysqli_stmt_execute($stmt);

    // ✅ Redirect after posting
    if ($_SESSION['role'] === 'admin') {
        header("Location: dashboard.php");
    } else {
        header("Location: index.php");
    }
    exit();
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Post a View</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h2>Share Your View</h2>

    <form method="post">
        Title: <input type="text" name="title" required><br><br>
        Message:<br>
        <textarea name="content" rows="5" required></textarea><br><br>
        <input type="submit" value="Post">
    </form>
</body>
</html>

