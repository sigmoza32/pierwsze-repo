<?php
require "../config.php";
require "../auth.php";

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    $stmt = $db->query("SELECT content, updated_at FROM board LIMIT 1");
    echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $user = require_token($db);
    require_teacher($user);

    $data = json_decode(file_get_contents("php://input"), true);

    $content = $data["content"] ?? "";

    $stmt = $db->query("SELECT id FROM board LIMIT 1");
    $exists = $stmt->fetch();

    if ($exists) {
        $stmt = $db->prepare("UPDATE board SET content = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$content, $exists["id"]]);
    } else {
        $stmt = $db->prepare("INSERT INTO board (content) VALUES (?)");
        $stmt->execute([$content]);
    }

    echo json_encode(["ok" => true]);
    exit;
}
