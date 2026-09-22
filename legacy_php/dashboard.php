<?php
session_start();
include_once 'db.php';

// Enhanced security check
if (!isset($_SESSION['username']) || $_SESSION['role'] !== 'admin') {
    header("Location: login.php");
    exit();
}

// Prevent caching of admin pages
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

// Fetch comments with prepared statement
$commentsQuery = "
    SELECT 
        comments.id AS comment_id,
        users.id AS user_id,
        users.username AS commenter_name,
        users.email AS commenter_email,
        comments.comment AS comment_text,
        comments.created_at AS comment_date,
        posts.id AS post_id,
        posts.title AS post_title,
        posts.views AS post_views
    FROM comments
    JOIN users ON comments.user_id = users.id
    JOIN posts ON comments.post_id = posts.id
    ORDER BY comments.created_at DESC
    LIMIT 100
";
$comments = mysqli_query($conn, $commentsQuery);

// Fetch contact messages
$contacts = mysqli_query($conn, "SELECT * FROM contact ORDER BY created_at DESC LIMIT 100");

// Fetch recent users
$users = mysqli_query($conn, "SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 50");

// Fetch recent posts
$posts = mysqli_query($conn, "SELECT id, title, views, created_at FROM posts ORDER BY created_at DESC LIMIT 50");
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        :root {
            --primary-color: #3498db;
            --danger-color: #e74c3c;
            --warning-color: #f39c12;
            --success-color: #2ecc71;
            --dark-color: #2c3e50;
            --light-color: #ecf0f1;
            --gray-color: #95a5a6;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            padding: 0;
            margin: 0;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        
        header {
            background-color: var(--dark-color);
            color: white;
            padding: 15px 20px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        h1, h2, h3 {
            color: var(--dark-color);
        }
        
        h1 {
            margin: 0;
            font-size: 24px;
        }
        
        h2 {
            margin-top: 30px;
            padding-bottom: 10px;
            border-bottom: 2px solid var(--gray-color);
        }
        
        .logout {
            color: var(--light-color);
            text-decoration: none;
            font-weight: bold;
            transition: color 0.3s;
        }
        
        .logout:hover {
            color: var(--danger-color);
        }
        
        .welcome-message {
            font-size: 18px;
            margin-bottom: 20px;
        }
        
        .dashboard-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .stat-card h3 {
            margin-top: 0;
            color: var(--primary-color);
        }
        
        .stat-card .number {
            font-size: 28px;
            font-weight: bold;
            color: var(--dark-color);
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        th, td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        th {
            background-color: var(--dark-color);
            color: white;
            font-weight: bold;
        }
        
        tr:hover {
            background-color: #f5f5f5;
        }
        
        .btn {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 4px;
            text-decoration: none;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s;
            border: none;
            margin: 2px;
        }
        
        .btn i {
            margin-right: 5px;
        }
        
        .btn-view {
            background-color: var(--primary-color);
            color: white;
        }
        
        .btn-edit {
            background-color: var(--warning-color);
            color: white;
        }
        
        .btn-delete {
            background-color: var(--danger-color);
            color: white;
        }
        
        .btn-success {
            background-color: var(--success-color);
            color: white;
        }
        
        .actions-cell {
            white-space: nowrap;
        }
        
        .text-center {
            text-align: center;
        }
        
        .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
        }
        
        .badge-admin {
            background-color: var(--primary-color);
            color: white;
        }
        
        .badge-user {
            background-color: var(--gray-color);
            color: white;
        }
        
        @media (max-width: 768px) {
            table {
                display: block;
                overflow-x: auto;
            }
        }
    </style>
        
</head>
<body>
    <header>
        <h1>Admin Dashboard</h1>
        <div>
            <span style="color: white; margin-right: 15px;">Welcome, <?= htmlspecialchars($_SESSION['username']) ?></span>
            <a href="logout.php" class="logout"><i class="fas fa-sign-out-alt"></i> Logout</a>
        </div>
    </header>

    <div class="container">
        <div class="dashboard-stats">
            <div class="stat-card">
                <h3>Total Users</h3>
                <div class="number">
                    <?php 
                    $totalUsers = mysqli_query($conn, "SELECT COUNT(*) as count FROM users");
                    echo mysqli_fetch_assoc($totalUsers)['count'];
                    ?>
                </div>
            </div>
            <div class="stat-card">
                <h3>Total Posts</h3>
                <div class="number">
                    <?php 
                    $totalPosts = mysqli_query($conn, "SELECT COUNT(*) as count FROM posts");
                    echo mysqli_fetch_assoc($totalPosts)['count'];
                    ?>
                </div>
            </div>
            <div class="stat-card">
                <h3>Total Comments</h3>
                <div class="number">
                    <?php 
                    $totalComments = mysqli_query($conn, "SELECT COUNT(*) as count FROM comments");
                    echo mysqli_fetch_assoc($totalComments)['count'];
                    ?>
                </div>
            </div>
            <div class="stat-card">
                <h3>Messages</h3>
                <div class="number">
                    <?php 
                    $totalMessages = mysqli_query($conn, "SELECT COUNT(*) as count FROM contact");
                    echo mysqli_fetch_assoc($totalMessages)['count'];
                    ?>
                </div>
            </div>
        </div>

        <h2>Recent Comments</h2>
        <table>
            <thead>
                <tr>
                    <th>Commenter</th>
                    <th>Email</th>
                    <th>Comment</th>
                    <th>Post</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php while ($row = mysqli_fetch_assoc($comments)): ?>
                <tr>
                    <td>
                        <?= htmlspecialchars($row['commenter_name']) ?>
                        <br>
                        <a href="user_profile.php?id=<?= $row['user_id'] ?>" class="btn btn-view" style="padding: 2px 5px; font-size: 12px;">
                            <i class="fas fa-user"></i> Profile
                        </a>
                    </td>
                    <td><?= htmlspecialchars($row['commenter_email']) ?></td>
                    <td><?= nl2br(htmlspecialchars(substr($row['comment_text'], 0, 100))) ?><?= strlen($row['comment_text']) > 100 ? '...' : '' ?></td>
                    <td>
                        <a href="post.php?id=<?= $row['post_id'] ?>"><?= htmlspecialchars($row['post_title']) ?></a>
                        <br>
                        <small>Views: <?= htmlspecialchars($row['post_views']) ?></small>
                    </td>
                    <td><?= date('M j, Y g:i a', strtotime($row['comment_date'])) ?></td>
                    <td class="actions-cell">
                        <a href="delete_comment.php?id=<?= $row['comment_id'] ?>" class="btn btn-delete" onclick="return confirm('Delete this comment?')">
                            <i class="fas fa-trash"></i> Delete
                        </a>
                    </td>
                </tr>
                <?php endwhile; ?>
            </tbody>
        </table>

        <h2>Recent Contact Messages</h2>
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Subject</th>
                    <th>Message</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php while ($c = mysqli_fetch_assoc($contacts)): ?>
                <tr>
                    <td><?= htmlspecialchars($c['username']) ?></td>
                    <td><?= htmlspecialchars($c['email']) ?></td>
                    <td><?= htmlspecialchars($c['subject']) ?></td>
                    <td><?= nl2br(htmlspecialchars(substr($c['message'], 0, 100))) ?><?= strlen($c['message']) > 100 ? '...' : '' ?></td>
                    <td><?= date('M j, Y g:i a', strtotime($c['created_at'])) ?></td>
                    <td class="actions-cell">
                        <a href="view_contact.php?id=<?= $c['id'] ?>" class="btn btn-view">
                            <i class="fas fa-eye"></i> View
                        </a>
                        <a href="delete_contact.php?id=<?= $c['id'] ?>" class="btn btn-delete" onclick="return confirm('Delete this message?')">
                            <i class="fas fa-trash"></i> Delete
                        </a>
                    </td>
                </tr>
                <?php endwhile; ?>
            </tbody>
        </table>

        <h2>Recent Users</h2>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Registered</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php while ($user = mysqli_fetch_assoc($users)): ?>
                <tr>
                    <td><?= htmlspecialchars($user['id']) ?></td>
                    <td><?= htmlspecialchars($user['username']) ?></td>
                    <td><?= htmlspecialchars($user['email']) ?></td>
                    <td>
                        <span class="badge <?= $user['role'] === 'admin' ? 'badge-admin' : 'badge-user' ?>">
                            <?= htmlspecialchars($user['role']) ?>
                        </span>
                    </td>
                    <td><?= date('M j, Y', strtotime($user['created_at'])) ?></td>
                    <td class="actions-cell">
                        <a href="edit_user.php?id=<?= $user['id'] ?>" class="btn btn-edit">
                            <i class="fas fa-edit"></i> Edit
                        </a>
                        <a href="delete_user.php?id=<?= $user['id'] ?>" class="btn btn-delete" onclick="return confirm('Are you sure you want to delete this user?')">
                            <i class="fas fa-trash"></i> Delete
                        </a>
                    </td>
                </tr>
                <?php endwhile; ?>
            </tbody>
        </table>

        <h2>Recent Posts</h2>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Views</th>
                    <th>Created</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php while ($post = mysqli_fetch_assoc($posts)): ?>
                <tr>
                    <td><?= htmlspecialchars($post['id']) ?></td>
                    <td><?= htmlspecialchars($post['title']) ?></td>
                    <td><?= htmlspecialchars($post['views']) ?></td>
                    <td><?= date('M j, Y', strtotime($post['created_at'])) ?></td>
                    <td class="actions-cell">
                        <a href="views.php?id=<?= $post['id'] ?>" class="btn btn-view">
                            <i class="fas fa-eye"></i> Views
                        </a>
                        <a href="edit_post.php?id=<?= $post['id'] ?>" class="btn btn-edit">
                            <i class="fas fa-edit"></i> Edit
                        </a>
                        <a href="delete_post.php?id=<?= $post['id'] ?>" class="btn btn-delete" onclick="return confirm('Are you sure you want to delete this post?')">
                            <i class="fas fa-trash"></i> Delete
                        </a>
                    </td>
                </tr>
                <?php endwhile; ?>
            </tbody>
        </table>
    </div>

    <script>
        // Confirm before delete actions
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', function(e) {
                if (!confirm('Are you sure you want to delete this item?')) {
                    e.preventDefault();
                }
            });
        });
    </script>
</body>
</html>