<?php
session_start();
include 'db.php';

// Only allow logged-in admins
if (!isset($_SESSION['username']) || $_SESSION['role'] !== 'admin') {
    header("Location: login.php");
    exit();
}

// Get all posts with usernames
$posts = mysqli_query($conn, "
    SELECT posts.*, users.username 
    FROM posts 
    JOIN users ON posts.user_id = users.id 
    ORDER BY posts.created_at DESC
");

// Get all comments with usernames
$comments = mysqli_query($conn, "
    SELECT comments.*, users.username 
    FROM comments 
    JOIN users ON comments.user_id = users.id 
    ORDER BY comments.created_at DESC
");
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Admin Dashboard</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/admin.css">
    <style>
        body {
    font-family: 'Segoe UI', sans-serif;
    padding: 30px;
    background-color: #eef1f5;
    color: #333;
}

h1 {
    color: #c0392b;
    margin-bottom: 20px;
}

h2 {
    color: #2c3e50;
    margin-top: 40px;
    border-bottom: 2px solid #ddd;
    padding-bottom: 8px;
}

ul {
    list-style: none;
    padding: 0;
}

li {
    background-color: #ffffff;
    border: 1px solid #ddd;
    padding: 20px;
    margin-bottom: 15px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.05);
    transition: box-shadow 0.2s ease-in-out;
}

li:hover {
    box-shadow: 0 6px 12px rgba(0,0,0,0.08);
}

li strong {
    font-size: 1.1rem;
    color: #333;
}

a {
    color: #e74c3c;
    font-weight: bold;
    margin-left: 15px;
    text-decoration: none;
    transition: color 0.2s ease;
}

a:hover {
    color: #c0392b;
    text-decoration: underline;
}

small {
    display: block;
    margin-top: 5px;
    color: #777;
    font-size: 0.85rem;
}

p {
    margin: 10px 0 5px;
    line-height: 1.6;
}
    .logout {
    color: #e74c3c;
    font-weight: bold;
    text-decoration: none;
}
    </style>
</head>
<body>

    <h1>Admin Dashboard</h1>
    <p>Welcome, <?= htmlspecialchars($_SESSION['username']) ?> | <a href="logout.php">Logout</a></p>

    <h2>All Posts</h2>
    <ul>
        <?php while ($post = mysqli_fetch_assoc($posts)): ?>
            <li>
                <strong><?= htmlspecialchars($post['title']) ?></strong> by <?= htmlspecialchars($post['username']) ?><br>
                <small>Posted on <?= date('F j, Y \a\t g:i A', strtotime($post['created_at'])) ?></small>
                <p><?= nl2br(htmlspecialchars($post['content'])) ?></p>
                <a href="delete_post.php?id=<?= $post['id'] ?>" onclick="return confirm('Delete this post?')">🗑 Delete</a>
            </li>
        <?php endwhile; ?>
    </ul>

    <h2>All Comments</h2>
    <ul>
        <?php while ($comment = mysqli_fetch_assoc($comments)): ?>
            <li>
                [Post ID <?= $comment['post_id'] ?>] <?= htmlspecialchars($comment['username']) ?>: <?= htmlspecialchars($comment['comment']) ?><br>
                <small>Commented on <?= date('F j, Y \a\t g:i A', strtotime($comment['created_at'])) ?></small>
                <a href="delete_comment.php?id=<?= $comment['id'] ?>" onclick="return confirm('Delete this comment?')">🗑 Delete</a>
            </li>
        <?php endwhile; ?>
    </ul>

</body>
</html>

<?php
mysqli_close($conn);
?>

