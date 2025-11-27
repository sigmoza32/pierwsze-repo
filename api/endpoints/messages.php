<?php
require "../config.php";
require "../auth.php";

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    $last = intval($_GET["last_id"] ?? 0);

    $stmt = $db->prepare("
        SELECT m.id, m.text, m.created_at, u.name 
        FROM messages m
        JOIN users u ON u.id = m.user_id
        WHERE m.id > ?
        ORDER BY m.id ASC
    ");
    $stmt->execute([$last]);

    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $user = require_token($db);
    $data = json_decode(file_get_contents("php://input"), true);

    $stmt = $db->prepare("INSERT INTO messages (user_id, text) VALUES (?, ?)");
    $stmt->execute([$user["id"], $data["text"]]);

    echo json_encode(["ok" => true]);
    exit;
}

echo json_encode(["error" => "Invalid method"]);
