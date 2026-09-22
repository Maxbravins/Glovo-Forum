<?php
session_start();
include 'db.php';

// Validate post ID
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id <= 0) {
    header("Location: 404.html");
    exit();
}

// ✅ Increment view count
$view_stmt = mysqli_prepare($conn, "UPDATE posts SET views = views + 1 WHERE id = ?");
mysqli_stmt_bind_param($view_stmt, "i", $id);
mysqli_stmt_execute($view_stmt);

// ✅ Fetch post and author
$post_stmt = mysqli_prepare($conn, "
    SELECT posts.*, users.username AS author 
    FROM posts 
    JOIN users ON posts.user_id = users.id 
    WHERE posts.id = ?
");
mysqli_stmt_bind_param($post_stmt, "i", $id);
mysqli_stmt_execute($post_stmt);
$result = mysqli_stmt_get_result($post_stmt);
$post = mysqli_fetch_assoc($result);

if (!$post) {
    header("Location: 404.html");
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title><?= htmlspecialchars($post['title']) ?> | View Post</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
    .comment-block {
      background: #f9f9f9;
      padding: 10px;
      margin-bottom: 15px;
      border-left: 4px solid #3498db;
      word-wrap: break-word;
    }
    textarea {
      width: 100%;
      height: 100px;
    }
    button {
      margin-top: 8px;
      padding: 6px 12px;
      font-weight: bold;
      cursor: pointer;
    }
    .admin-btn {
      float: right;
      background-color: #e74c3c;
      color: white;
      border: none;
      padding: 4px 8px;
      cursor: pointer;
      border-radius: 4px;
    }
    img.post-image {
      max-width: 100%;
      height: auto;
      margin: 10px 0;
      border-radius: 6px;
    }
  </style>
</head>
<body>

  <h2><?= htmlspecialchars($post['title']) ?></h2>

  <p class="view-count">👁️ <?= (int)$post['views'] ?> views</p>

  <p>
    <small>
      Posted on <?= date('M j, Y g:i a', strtotime($post['created_at'])) ?>
      by <strong><?= htmlspecialchars($post['author']) ?></strong>
    </small>
  </p>

  <p><?= nl2br(htmlspecialchars($post['content'])) ?></p>

  <?php if (!empty($post['image'])): ?>
    <img src="<?= htmlspecialchars($post['image']) ?>" alt="Post Image" class="post-image">
  <?php endif; ?>

  <hr>
  <h3>Comments</h3>

  <?php
  // ✅ Fetch comments with user name via JOIN
  $comment_stmt = mysqli_prepare($conn, "
      SELECT comments.id, comments.comment, comments.created_at, users.username 
      FROM comments 
      JOIN users ON comments.user_id = users.id 
      WHERE comments.post_id = ? 
      ORDER BY comments.created_at DESC
  ");
  mysqli_stmt_bind_param($comment_stmt, "i", $id);
  mysqli_stmt_execute($comment_stmt);
  $comments = mysqli_stmt_get_result($comment_stmt);

  while ($c = mysqli_fetch_assoc($comments)) {
      echo "<div class='comment-block'>";
      echo "<strong>" . htmlspecialchars($c['username']) . "</strong> ";
      echo "<small style='color: #777;'>" . date('M j, Y g:i a', strtotime($c['created_at'])) . "</small>";
      echo "<p>" . nl2br(htmlspecialchars($c['comment'])) . "</p>";

      // ✅ Admin delete option
      if (isset($_SESSION['role']) && $_SESSION['role'] === 'admin') {
          echo "<form method='post' action='delete_comment.php' onsubmit='return confirm(\"Delete this comment?\")'>";
          echo "<input type='hidden' name='comment_id' value='" . $c['id'] . "'>";
          echo "<input type='hidden' name='post_id' value='" . $id . "'>";
          echo "<button class='admin-btn'>Delete</button>";
          echo "</form>";
      }

      echo "</div>";
  }
  ?>

  <?php if (isset($_SESSION['user_id'])): ?>
    <form method="post" action="comment.php" id="comment-form">
      <input type="hidden" name="post_id" value="<?= $id ?>">
      <label for="comment">Add a comment:</label><br>
      <textarea id="comment" name="comment" required></textarea><br>
      <button type="submit">Comment</button>
    </form>
  <?php else: ?>
    <p><a href="login.php">Log in</a> to comment.</p>
  <?php endif; ?>

</body>
</html>
