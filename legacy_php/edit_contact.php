<?php
include 'db.php';

if (!isset($_GET['id'])) {
    die("Missing ID.");
}

$id = (int)$_GET['id'];
$contact = mysqli_fetch_assoc(mysqli_query($conn, "SELECT * FROM contact WHERE id = $id"));

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['name'];
    $email = $_POST['email'];
    $subject = $_POST['subject'];
    $message = $_POST['message'];

    mysqli_query($conn, "UPDATE contact SET name='$name', email='$email', subject='$subject', message='$message' WHERE id=$id");
    header("Location: dashboard.php");
    exit();
}
?>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="style.css">
<link rel="stylesheet" href="edit_contact.css">

    <title>Edit Contact</title></head>
<body>
<h2>Edit Contact Message</h2>
<form method="post">
    Name: <input type="text" name="name" value="<?= htmlspecialchars($contact['name']) ?>"><br>
    Email: <input type="email" name="email" value="<?= htmlspecialchars($contact['email']) ?>"><br>
    Subject: <input type="text" name="subject" value="<?= htmlspecialchars($contact['subject']) ?>"><br>
    Message:<br>
    <textarea name="message" rows="5"><?= htmlspecialchars($contact['message']) ?></textarea><br>
    <input type="submit" value="Update">
</form>
</body>
</html>
