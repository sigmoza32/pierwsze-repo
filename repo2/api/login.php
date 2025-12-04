<?php
require "../config.php";

$data = json_decode(file_get_contents("php://input"), true);

$name = $data["name"] ?? "";
$pass = $data["password"] ?? "";

$stmt = $pdo->prepare("SELECT * FROM users WHERE name=? AND password=?");
$stmt->execute([$name, $pass]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode(["error" => "Złe dane logowania"]);
    exit;
}

$payload = [
    "id" => $user["id"],
    "name" => $user["name"],
    "role" => $user["role"],
    "exp" => time() + 3600
];

$token = base64_encode(json_encode($payload));

echo json_encode([
    "token" => $token,
    "user" => $payload
]);
