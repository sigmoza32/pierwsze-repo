<?php
$auth = $_SERVER["HTTP_AUTHORIZATION"] ?? "";
$user = json_decode(base64_decode($auth), true);

echo json_encode($user ?: null);
