<?php
session_start();
include 'db.php';

// Only allow logged-in admins
if (!isset($_SESSION['username']) || $_SESSION['role'] !== 'admin') {
    header("Location: login.php");
    exit();
}

// Get all posts and comments
$posts = mysqli_query($conn, "SELECT * FROM posts ORDER BY created_at DESC");
$comments = mysqli_query($conn, "SELECT * FROM comments ORDER BY created_at DESC");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Admin Dashboard</title>
    <link rel="stylesheet" href="css/style.css">
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #d13c3c; }
        ul { list-style: none; padding-left: 0; }
        li { background: #f4f4f4; margin-bottom: 10px; padding: 10px; border-radius: 5px; }
        a { color: red; margin-left: 10px; }
    </style>
</head>
<body>
    <h1>Admin Dashboard</h1>
    <p>Welcome, <?= htmlspecialchars($_SESSION['username']) ?> | <a href="logout.php">Logout</a></p>

    <h2>All Posts</h2>
    <ul>
        <?php while ($post = mysqli_fetch_assoc($posts)): ?>
            <li>
                <strong><?= htmlspecialchars($post['title']) ?></strong> by <?= htmlspecialchars($post['author']) ?>
                <a href="delete_post.php?id=<?= $post['id'] ?>" onclick="return confirm('Delete this post?')">🗑 Delete</a>
            </li>
        <?php endwhile; ?>
    </ul>

    <h2>All Comments</h2>
    <ul>
        <?php while ($comment = mysqli_fetch_assoc($comments)): ?>
            <li>
                [Post ID <?= $comment['post_id'] ?>] <?= htmlspecialchars($comment['author']) ?>: <?= htmlspecialchars($comment['comment']) ?>
                <a href="delete_comment.php?id=<?= $comment['id'] ?>" onclick="return confirm('Delete this comment?')">🗑 Delete</a>
            </li>
        <?php endwhile; ?>
    </ul>
</body>
</html>

<?php
// Only close connection at the end of processing
mysqli_close($conn);

?>
