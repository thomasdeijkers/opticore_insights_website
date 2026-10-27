<?php
require_once __DIR__ . '/demo-config.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
header('X-Robots-Tag: noindex, nofollow');
header('X-Content-Type-Options: nosniff');
function management_reply(int $status, array $body): never {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    exit;
}
try { $seed = demo_seed(); } catch (Throwable $error) { management_reply(503, ['ok' => false]); }
$key = $seed['management_key'] ?? '';
$authorization = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
if (!is_string($key) || strlen($key) < 40 || (!hash_equals('Bearer ' . $key, $authorization) && !hash_equals($key, $_SERVER['HTTP_X_OPTICORE_DEMO_KEY'] ?? ''))) management_reply(403, ['ok' => false]);
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') management_reply(405, ['ok' => false]);
if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 4096) management_reply(400, ['ok' => false]);
$input = json_decode(file_get_contents('php://input', false, null, 0, 4097), true);
if (!is_array($input) || !in_array($input['action'] ?? '', ['status', 'update'], true)) management_reply(400, ['ok' => false]);
$folder = dirname(demo_seed_path());
$lock = fopen($folder . '/demo-auth.lock', 'c');
if (!$lock || !flock($lock, LOCK_EX)) management_reply(503, ['ok' => false]);
@chmod($folder . '/demo-auth.lock', 0600);
try {
    $current = demo_current();
    if ($input['action'] === 'update') {
        $username = $input['username'] ?? null;
        $password = $input['password'] ?? null;
        $version = $input['version'] ?? null;
        if (!is_string($username) || !preg_match('/^[A-Za-z0-9_.@-]{1,80}$/D', $username) || !is_string($password) || strlen($password) < 8 || strlen($password) > 256 || !is_string($version) || !preg_match('/^[a-f0-9-]{36}$/D', $version)) management_reply(400, ['ok' => false]);
        if ($current['version'] === $version) {
            if ($current['username'] !== $username || !password_verify($password, $current['password_hash'])) management_reply(409, ['ok' => false]);
        } else {
            if (($input['expected_version'] ?? null) !== $current['version']) management_reply(409, ['ok' => false, 'version' => $current['version']]);
            $current = ['username' => $username, 'password_hash' => password_hash($password, PASSWORD_DEFAULT), 'version' => $version, 'updated_at' => gmdate('c')];
            $temporary = tempnam($folder, '.demo-auth-');
            try {
                if (!$temporary || file_put_contents($temporary, json_encode($current, JSON_THROW_ON_ERROR)) === false) throw new RuntimeException('Write failed');
                chmod($temporary, 0600);
                if (!rename($temporary, $folder . '/demo-auth-state.json')) throw new RuntimeException('Replace failed');
            } finally { if ($temporary && is_file($temporary)) unlink($temporary); }
        }
    }
    management_reply(200, ['ok' => true, 'username' => $current['username'], 'version' => $current['version'], 'updated_at' => $current['updated_at'] ?? '']);
} catch (Throwable $error) { management_reply(503, ['ok' => false]); }
finally { flock($lock, LOCK_UN); fclose($lock); }
