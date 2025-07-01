<?php
include 'db.php';
$message = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = mysqli_real_escape_string($conn, $_POST['name']);
    $email = mysqli_real_escape_string($conn, $_POST['email']);
    $subject = mysqli_real_escape_string($conn, $_POST['subject']);
    $msg = mysqli_real_escape_string($conn, $_POST['message']);

    $sql = "INSERT INTO contact (name, email, subject, message) VALUES ('$name', '$email', '$subject', '$msg')";
    if (mysqli_query($conn, $sql)) {
        $message = "Message sent successfully!";
    } else {
        $message = "Failed to send message.";
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Contact Admin</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h2>Contact Us</h2>
    <p style="color:green;"><?php echo $message; ?></p>
    <form method="post">
        Name: <input type="text" name="name" required><br><br>
        Email: <input type="email" name="email" required><br><br>
        Subject: <input type="text" name="subject" required><br><br>
        Message:<br>
        <textarea name="message" rows="5" required></textarea><br><br>
        <input type="submit" value="Send">
    </form>
</body>
</html>
