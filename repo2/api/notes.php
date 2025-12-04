<?php
require "../config.php";

function getToken() {
    $headers = getallheaders();

    if (isset($headers["Authorization"])) return $headers["Authorization"];
    if (isset($_SERVER["HTTP_AUTHORIZATION"])) return $_SERVER["HTTP_AUTHORIZATION"];
    if (isset($_SERVER["REDIRECT_HTTP_AUTHORIZATION"])) return $_SERVER["REDIRECT_HTTP_AUTHORIZATION"];

    return "";
}

$auth = getToken();
$user = json_decode(base64_decode($auth), true);

if (!$user || !isset($user["id"])) {
    echo json_encode(["error" => "Brak tokena"]);
    exit;
}

// GET — pobierz
if ($_SERVER["REQUEST_METHOD"] === "GET") {

    $stmt = $pdo->prepare("SELECT content FROM notes WHERE user_id=? LIMIT 1");
    $stmt->execute([$user["id"]]);

    echo json_encode($stmt->fetch(PDO::FETCH_ASSOC) ?: ["content" => ""]);
    exit;
}

// POST — zapisz
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $body = json_decode(file_get_contents("php://input"), true);
    $content = $body["content"] ?? "";

    // sprawdzamy czy istnieje notatka
    $stmt = $pdo->prepare("SELECT id FROM notes WHERE user_id=?");
    $stmt->execute([$user["id"]]);

    if ($stmt->fetch()) {
        $stmt = $pdo->prepare("UPDATE notes SET content=? WHERE user_id=?");
        $stmt->execute([$content, $user["id"]]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO notes (user_id, content) VALUES (?,?)");
        $stmt->execute([$user["id"], $content]);
    }

    echo json_encode(["ok" => true]);
    exit;
}

echo json_encode(["error" => "Nieobsługiwana metoda"]);
