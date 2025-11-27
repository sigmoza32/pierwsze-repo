<?php
require "../config.php";
require "../auth.php";

$user = require_token($db);

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    $stmt = $db->prepare("SELECT content FROM notes WHERE user_id = ?");
    $stmt->execute([$user["id"]]);

    echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $data = json_decode(file_get_contents("php://input"), true);
    $content = $data["content"] ?? "";

    $stmt = $db->prepare("SELECT id FROM notes WHERE user_id = ?");
    $stmt->execute([$user["id"]]);
    $exists = $stmt->fetch();

    if ($exists) {
        $stmt = $db->prepare("UPDATE notes SET content = ? WHERE user_id = ?");
        $stmt->execute([$content, $user["id"]]);
    } else {
        $stmt = $db->prepare("INSERT INTO notes (user_id, content) VALUES (?, ?)");
        $stmt->execute([$user["id"], $content]);
    }

    echo json_encode(["ok" => true]);
    exit;
}
