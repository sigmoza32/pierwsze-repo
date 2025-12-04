<?php
require "../config.php";

function getToken() {
    $headers = getallheaders();

    if (isset($headers["Authorization"])) return $headers["Authorization"];
    if (isset($_SERVER["HTTP_AUTHORIZATION"])) return $_SERVER["HTTP_AUTHORIZATION"];
    if (isset($_SERVER["REDIRECT_HTTP_AUTHORIZATION"])) return $_SERVER["REDIRECT_HTTP_AUTHORIZATION"];

    return "";
}

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $stmt = $pdo->query("SELECT content FROM board ORDER BY id DESC LIMIT 1");
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode($row ?: ["content" => ""]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $auth = getToken();
    $user = json_decode(base64_decode($auth), true);

    if (!$user || $user["role"] !== "teacher") {
        echo json_encode(["error" => "Tylko nauczyciel"]);
        exit;
    }

    $body = json_decode(file_get_contents("php://input"), true);
    $content = $body["content"] ?? "";

    // Nadpisujemy tablicę
    $pdo->query("DELETE FROM board");

    $stmt = $pdo->prepare("INSERT INTO board (content) VALUES (?)");
    $stmt->execute([$content]);

    echo json_encode(["ok" => true]);
    exit;
}

echo json_encode(["error" => "Nieobsługiwana metoda"]);
