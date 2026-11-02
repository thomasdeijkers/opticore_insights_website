<?php
declare(strict_types=1);

// This page and its assets are uploaded before maintenance is enabled.
$method = $_SERVER['REDIRECT_REQUEST_METHOD'] ?? $_SERVER['REQUEST_METHOD'] ?? 'GET';
$html = in_array($method, ['GET', 'HEAD'], true)
    && empty($_SERVER['REDIRECT_OPTICORE_MAINTENANCE_NONGET'])
    && empty($_SERVER['OPTICORE_MAINTENANCE_NONGET'])
    && !str_contains(strtolower($_SERVER['HTTP_ACCEPT'] ?? 'text/html'), 'application/json');
$active = is_file(__DIR__ . '/.opticore-maintenance') || (int)($_SERVER['REDIRECT_STATUS'] ?? 0) === 503;
http_response_code($active || !$html ? 503 : 200);
header('Cache-Control: no-store');
header('Retry-After: 30');
header('X-Robots-Tag: noindex, nofollow');
header('X-Content-Type-Options: nosniff');
header("Content-Security-Policy: default-src 'none'; img-src data:; style-src 'unsafe-inline'; script-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
if (!$html) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'message' => 'De website wordt verbeterd, kom zo bij ons terug voor meer informatie.', 'retry_after' => 30], JSON_UNESCAPED_UNICODE);
    exit;
}
header('Content-Type: text/html; charset=utf-8');
$page = file_get_contents(__DIR__ . '/maintenance/page.tpl');
echo strtr($page, [
    '{{TITLE}}' => 'De website wordt verbeterd',
    '{{EYEBROW}}' => 'Even geduld',
    '{{MESSAGE}}' => 'Kom zo bij ons terug voor meer informatie.',
    '{{MODE}}' => 'website',
    '{{LOGO}}' => base64_encode(file_get_contents(__DIR__ . '/maintenance/logo.png')),
]);
