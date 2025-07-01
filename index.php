<?php
include 'db.php';
session_start();

// Fetch latest posts (limit to 10 for display)
$posts = mysqli_query($conn, "
    SELECT posts.id, posts.title, posts.content, posts.created_at, users.username 
    FROM posts 
    JOIN users ON posts.user_id = users.id 
    ORDER BY posts.created_at DESC 
    LIMIT 10
");
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Glovo Forum</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <header>
    <h1>Welcome to Glovo Feedback Forum</h1>
    <nav>
      <a href="index.php">Home</a> |
      <a href="login.php">Login</a> |
      <a href="register.php">Register</a> |
      <a href="post.php">Share a View</a>
      <a href="contact.php">Contact Admin</a>
    </nav>
  </header>

  <main>
    <h2>Recent Posts</h2>

    <?php if (mysqli_num_rows($posts) > 0): ?>
      <?php while ($post = mysqli_fetch_assoc($posts)): ?>
        <div class="post-preview">
          <h3><?= htmlspecialchars($post['title']) ?></h3>
          <p><?= nl2br(htmlspecialchars(substr($post['content'], 0, 100))) ?>...</p>
          <small>By <?= htmlspecialchars($post['username']) ?> | <?= date('F j, Y', strtotime($post['created_at'])) ?></small><br>
          <a href="view.php?id=<?= $post['id'] ?>">Read More</a>
        </div>
        <hr>
      <?php endwhile; ?>
    <?php else: ?>
      <p>No posts yet. Be the first to <a href="post.php">share your view</a>.</p>
    <?php endif; ?>
  </main>

  <footer>
    <p>&copy; <?= date("Y") ?> Glovo Forum</p>
  </footer>

</body>
</html>
