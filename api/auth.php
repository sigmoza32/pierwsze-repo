<?php

$JWT_SECRET = "super_tajny_klucz_123"; // Zmień na własny!

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data) {
    return base64_decode(strtr($data, '-_', '+/'));
}

function jwt_generate($payload, $secret) {
    $header = base64url_encode(json_encode(["alg" => "HS256", "typ" => "JWT"]));
    $payload = base64url_encode(json_encode($payload));

    $signature = base64url_encode(
        hash_hmac("sha256", "$header.$payload", $secret, true)
    );

    return "$header.$payload.$signature";
}

function jwt_verify($token, $secret) {
    $parts = explode(".", $token);
    if (count($parts) !== 3) return false;

    list($header, $payload, $signature) = $parts;

    $check = base64url_encode(
        hash_hmac("sha256", "$header.$payload", $secret, true)
    );

    if ($check !== $signature) return false;

    $data = json_decode(base64url_decode($payload), true);

    if (isset($data["exp"]) && $data["exp"] < time()) return false;

    return $data;
}

function require_token($db) {
    global $JWT_SECRET;

    $headers = getallheaders();
    if (!isset($headers["Authorization"])) {
        echo json_encode(["error" => "Missing token"]);
        exit;
    }

    $token = $headers["Authorization"];
    $data = jwt_verify($token, $JWT_SECRET);

    if (!$data) {
        echo json_encode(["error" => "Invalid or expired token"]);
        exit;
    }

    return $data; // zawiera id, name, role
}

function require_teacher($user) {
    if ($user["role"] !== "teacher") {
        echo json_encode(["error" => "Teacher only"]);
        exit;
    }
}
