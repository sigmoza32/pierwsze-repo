<?php
require_once __DIR__ . "/../config.php";

// DEBUG helper
function dbg($s) {
    file_put_contents(__DIR__ . "/debug_messages.log", date("c") . " - " . $s . PHP_EOL, FILE_APPEND);
}

// fetch possible token from headers robustnie
$headers = getallheaders();
$token = $headers['Authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? "";

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Proste SELECT bez JOIN — żeby nic nie filtrowało wyników
        $stmt = $pdo->query("SELECT id, user_id, text, created_at FROM messages ORDER BY id ASC");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($rows);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // sprawdź token
        if (!$token) {
            echo json_encode(["error" => "Brak tokena"]);
            dbg("POST brak tokena, _SERVER: " . json_encode($_SERVER));
            exit;
        }

        $body = json_decode(file_get_contents("php://input"), true);
        $text = trim($body['text'] ?? '');

        if ($text === '') {
            echo json_encode(["error" => "Brak text"]);
            exit;
        }

        // dekodowanie prostego tokenu (u Ciebie base64 JSON)
        $user = json_decode(base64_decode($token), true);
        if (!$user || !isset($user['id'])) {
            echo json_encode(["error" => "Token niepoprawny"]);
            dbg("Token niepoprawny: $token");
            exit;
        }

        // wstaw
        $stmt = $pdo->prepare("INSERT INTO messages (user_id, text) VALUES (?, ?)");
        $stmt->execute([$user['id'], $text]);

        echo json_encode(["ok" => true]);
        exit;
    }

    // OPTIONS
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

} catch (Exception $e) {
    dbg("EXCEPTION: " . $e->getMessage());
    echo json_encode(["error" => "server error"]);
    exit;
}
