<?php
declare(strict_types=1);
namespace OptiCore\MaintenanceSupport;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');
header('X-Content-Type-Options: nosniff');

function support_reply(int $status, array $body): never {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

// Only the public website and its dashboard may use this mail form.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$ownOrigin = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? '');
if ($origin !== '' && !in_array($origin, [$ownOrigin, 'https://vps.opticore-insights.nl'], true)) {
    support_reply(403, ['message' => 'Dit formulier is niet beschikbaar vanaf deze website.']);
}
if ($origin === 'https://vps.opticore-insights.nl') {
    header('Access-Control-Allow-Origin: https://vps.opticore-insights.nl');
    header('Access-Control-Allow-Credentials: true');
    header('Vary: Origin');
}
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    header('Access-Control-Allow-Methods: GET, POST');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(204);
    exit;
}

session_name('opticore_maintenance_support');
session_start(['cookie_httponly' => true, 'cookie_samesite' => 'Strict',
    'cookie_secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off', 'use_strict_mode' => true]);
$_SESSION['support_csrf'] ??= bin2hex(random_bytes(32));
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'GET') support_reply(200, ['csrf' => $_SESSION['support_csrf']]);
if ($method !== 'POST') {
    header('Allow: GET, POST');
    support_reply(405, ['message' => 'Gebruik het formulier om je vraag te versturen.']);
}
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 16000) support_reply(413, ['message' => 'Maak je vraag iets korter.']);
$input = json_decode(file_get_contents('php://input', false, null, 0, 16001), true);
if (!is_array($input) || !is_string($input['csrf'] ?? null)
    || !hash_equals($_SESSION['support_csrf'], $input['csrf'])) {
    support_reply(403, ['message' => 'Je sessie is verlopen. Sluit het formulier en open het opnieuw. Je tekst blijft bewaard.']);
}
$text = static fn(string $key): string => is_string($input[$key] ?? null) ? trim($input[$key]) : '';
$name = $text('name');
$email = $text('email');
$company = $text('company');
$question = $text('question');
$id = $text('submissionId');
if ($company === '' || strlen($company) > 400 || preg_match('/[\r\n]/', $company)
    || $name === '' || strlen($name) > 400 || preg_match('/[\r\n]/', $name)
    || strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)
    || preg_match('/[\r\n]/', $email) || $question === '' || strlen($question) > 8000
    || !preg_match('/^[a-zA-Z0-9-]{16,64}$/D', $id) || $text('website') !== '') {
    support_reply(422, ['message' => 'Controleer je naam, bedrijf, e-mailadres en vraag.']);
}
$success = ['ok' => true, 'message' => 'Je vraag is verstuurd naar support@opticore-insights.nl. We reageren via je e-mailadres.'];
// Retrying a request after a lost response must not send the same email twice.
if (isset($_SESSION['support_receipts'][$id])) support_reply(200, $success);

// A server-side limit also applies when a bot starts new browser sessions.
$limitPath = sys_get_temp_dir() . '/opticore-support-' . hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown');
$limit = @fopen($limitPath, 'c+');
if (!$limit || !flock($limit, LOCK_EX)) support_reply(503, ['message' => 'Versturen lukt nu niet. Je vraag blijft staan. Probeer het later opnieuw.']);
@chmod($limitPath, 0600);
$attempts = json_decode(stream_get_contents($limit), true);
$attempts = is_array($attempts) ? array_values(array_filter($attempts, static fn($time) => is_int($time) && $time > time() - 900)) : [];
if (count($attempts) >= 5) {
    flock($limit, LOCK_UN);
    fclose($limit);
    header('Retry-After: 900');
    support_reply(429, ['message' => 'Je hebt meerdere vragen verstuurd. Probeer het over een kwartier opnieuw.']);
}
$attempts[] = time();
rewind($limit);
ftruncate($limit, 0);
fwrite($limit, json_encode($attempts));
flock($limit, LOCK_UN);
fclose($limit);

$headers = ['From: OptiCore Insights <info@opticore-insights.nl>', 'Reply-To: ' . $email,
    'MIME-Version: 1.0', 'Content-Type: text/plain; charset=UTF-8'];
$body = "Vraag via het onderhoudsscherm van opticore-insights.nl\n\nNaam: {$name}\nBedrijf: {$company}\nE-mail: {$email}\n\n{$question}\n";
$sent = @mail('support@opticore-insights.nl', 'Supportvraag via OptiCore Insights', $body, implode("\r\n", $headers), '-finfo@opticore-insights.nl');
if (!$sent) support_reply(503, ['message' => 'De mailserver kon je vraag niet versturen. Je tekst blijft staan. Probeer het later opnieuw of mail support@opticore-insights.nl.']);
$_SESSION['support_receipts'][$id] = true;
$_SESSION['support_receipts'] = array_slice($_SESSION['support_receipts'], -10, null, true);
support_reply(200, $success);
