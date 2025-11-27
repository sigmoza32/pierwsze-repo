<?php
require "../config.php";
require "../auth.php";

$data = json_decode(file_get_contents("php://input"), true);

$name = $data["name"] ?? "";
$password = $data["password"] ?? "";

$stmt = $db->prepare("SELECT * FROM users WHERE name = ? AND password = ?");
$stmt->execute([$name, $password]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode(["error" => "Invalid login"]);
    exit;
}

global $JWT_SECRET;

$payload = [
    "id" => $user["id"],
    "name" => $user["name"],
    "role" => $user["role"],
    "exp" => time() + (24 * 60 * 60) // 24h
];

$token = jwt_generate($payload, $JWT_SECRET);

echo json_encode([
    "token" => $token,
    "user" => [
        "id" => $user["id"],
        "name" => $user["name"],
        "role" => $user["role"]
    ]
]);
