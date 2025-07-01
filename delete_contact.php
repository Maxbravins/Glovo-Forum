<?php
include 'db.php';
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['id'])) {
    $id = (int)$_POST['id'];
    mysqli_query($conn, "DELETE FROM contact WHERE id = $id");
}
header("Location: dashboard.php");
exit();
