<?php
// Login for the fictional demo. Credentials are deployed outside the webroot.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow');

function demo_reply(int $status, array $body): never {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if (!in_array($method, ['GET', 'POST'], true)) {
    header('Allow: GET, POST');
    demo_reply(405, ['error' => 'Deze aanvraag wordt niet ondersteund.']);
}
$configPath = getenv('OPTICORE_DEMO_CONFIG_PATH') ?: dirname(__DIR__, 2) . '/opticore-scan-private/demo-auth.json';
$config = is_file($configPath) ? json_decode(file_get_contents($configPath), true) : null;
if (!is_array($config) || !is_string($config['username'] ?? null) || !is_string($config['password_hash'] ?? null)) {
    demo_reply(503, ['error' => 'Inloggen is momenteel niet beschikbaar. Probeer het later opnieuw.']);
}
$secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
session_name('opticore_demo_access');
session_start(['use_strict_mode' => true, 'cookie_httponly' => true, 'cookie_secure' => $secure, 'cookie_samesite' => 'Lax', 'cookie_path' => '/', 'gc_maxlifetime' => 8 * 3600]);
$_SESSION['csrf'] ??= bin2hex(random_bytes(32));
$authenticated = ($_SESSION['expires'] ?? 0) > time();
if ($method === 'GET') {
    demo_reply(200, ['authenticated' => $authenticated, 'expiresAt' => $authenticated ? $_SESSION['expires'] * 1000 : 0, 'csrf' => $_SESSION['csrf']]);
}
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$expectedOrigin = ($secure ? 'https://' : 'http://') . ($_SERVER['HTTP_HOST'] ?? '');
if ($origin !== '' && !hash_equals($expectedOrigin, $origin)) demo_reply(403, ['error' => 'Open de demo opnieuw en probeer het nog eens.']);
if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 4096 || !str_starts_with($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')) {
    demo_reply(400, ['error' => 'Controleer je invoer.']);
}
$input = json_decode(file_get_contents('php://input', false, null, 0, 4097), true);
if (!is_array($input) || !is_string($input['csrf'] ?? null) || !hash_equals($_SESSION['csrf'], $input['csrf'])) {
    demo_reply(403, ['error' => 'Vernieuw de pagina en probeer het opnieuw.']);
}
$username = $input['username'] ?? null;
$password = $input['password'] ?? null;
if (!is_string($username) || !is_string($password) || strlen($username) > 120 || strlen($password) > 256) demo_reply(400, ['error' => 'Controleer je invoer.']);

// Count failed attempts per IP, without retaining addresses or login input.
$key = hash_hmac('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown', $config['password_hash']);
$path = sys_get_temp_dir() . '/opticore-demo-login-' . substr(hash('sha256', __DIR__), 0, 16) . '.json';
$handle = fopen($path, 'c+');
if (!$handle || !flock($handle, LOCK_EX)) demo_reply(503, ['error' => 'Inloggen lukt nu niet. Probeer het later opnieuw.']);
@chmod($path, 0600);
$attempts = json_decode(stream_get_contents($handle), true) ?: [];
$attempts = array_filter($attempts, fn($row) => ($row['until'] ?? 0) > time());
$limited = ($attempts[$key]['count'] ?? 0) >= 10;
$validPassword = !$limited && password_verify($password, $config['password_hash']);
$valid = $validPassword && hash_equals($config['username'], $username);
if (!$limited && !$valid) {
    $attempts[$key] = ['count' => ($attempts[$key]['count'] ?? 0) + 1, 'until' => $attempts[$key]['until'] ?? time() + 900];
}
if ($valid) unset($attempts[$key]);
rewind($handle);
ftruncate($handle, 0);
fwrite($handle, json_encode($attempts, JSON_THROW_ON_ERROR));
flock($handle, LOCK_UN);
fclose($handle);
if ($limited) {
    header('Retry-After: 900');
    demo_reply(429, ['error' => 'Te veel inlogpogingen. Probeer het over 15 minuten opnieuw.']);
}
if (!$valid) demo_reply(401, ['error' => 'De gebruikersnaam of het wachtwoord klopt niet.']);
session_regenerate_id(true);
$_SESSION['expires'] = time() + 8 * 3600;
$_SESSION['csrf'] = bin2hex(random_bytes(32));
demo_reply(200, ['authenticated' => true, 'expiresAt' => $_SESSION['expires'] * 1000, 'csrf' => $_SESSION['csrf']]);
