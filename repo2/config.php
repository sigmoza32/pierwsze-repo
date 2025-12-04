<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: http://10.103.8.110");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

$dsn = "mysql:host=127.0.0.1;dbname=czato_notatki;charset=utf8mb4";
$user = "root";
$pass = "";

try {
    $pdo = new PDO($dsn, $user, $pass);
} catch (PDOException $e) {
    echo json_encode(["error" => "DB connection failed"]);
    exit;
}
