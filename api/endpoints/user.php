<?php
require "../config.php";
require "../auth.php";

$user = require_token($db);

echo json_encode($user);
