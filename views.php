<?php
include 'db.php';
session_start();

// Validate and get post ID
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id <= 0) {
    header("Location: 404.html");
    exit();
}

// ✅ Increase view count before fetching post
mysqli_query($conn, "UPDATE posts SET views = views + 1 WHERE id = $id");

// Fetch the post
$post = mysqli_fetch_assoc(mysqli_query($conn, "SELECT * FROM posts WHERE id=$id"));
if (!$post) {
    header("Location: 404.html");
    exit();
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>View Post</title>
    <link rel="stylesheet" href="style.css">
    <style>
.view-count {
    display: inline-block;
    background: #f3f3f3;
    color: #333;
    padding: 6px 12px;
    border-radius: 20px;
    font-weight: bold;
    font-size: 14px;
    margin-bottom: 10px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
</style>

</head>
<body>

<h2><?= htmlspecialchars($post['title']) ?></h2>

<!-- ✅ View Count -->
<p class="view-count">👁️ <?= $post['views'] ?> views</p>

<!-- ✅ Post Content -->
<p><?= nl2br(htmlspecialchars($post['content'])) ?></p>

<hr>
<h3>Comments</h3>

<?php
$comments = mysqli_query($conn, "SELECT * FROM comments WHERE post_id=$id ORDER BY created_at DESC");
while ($c = mysqli_fetch_assoc($comments)) {
    echo "<p><strong>" . htmlspecialchars($c['author']) . ":</strong> " . htmlspecialchars($c['comment']) . "</p>";
}
?>

<?php if (isset($_SESSION['username'])): ?>
<form method="post" action="comment.php">
    <input type="hidden" name="post_id" value="<?= $id ?>">
    <textarea name="comment" required></textarea><br>
    <input type="submit" value="Comment">
</form>
<?php endif; ?>

</body>
</html>

