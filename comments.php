<?php
session_start();
include 'db.php';
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_SESSION['username'])) {
    $author = $_SESSION['username'];
    $comment = $_POST['comment'];
    $post_id = $_POST['post_id'];
    mysqli_query($conn, "INSERT INTO comments (post_id, author, comment) VALUES ($post_id, '$author', '$comment')");
}
header("Location: view.php?id=$post_id");
exit();

// This code handles the submission of comments on posts.
// It checks if the request method is POST and if the user is logged in.
// If so, it retrieves the author's username from the session, the comment text from the POST data,