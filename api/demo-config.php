<?php
// Shared private credential storage. Mutable settings survive website deployments.
function demo_seed_path(): string {
    return getenv('OPTICORE_DEMO_CONFIG_PATH') ?: dirname(__DIR__, 2) . '/opticore-scan-private/demo-auth.json';
}
function demo_seed(): array {
    $path = demo_seed_path();
    $data = is_file($path) ? json_decode(file_get_contents($path), true) : null;
    if (!is_array($data) || !is_string($data['username'] ?? null) || !is_string($data['password_hash'] ?? null)) throw new RuntimeException('Private configuration unavailable');
    return $data;
}
function demo_current(): array {
    $seed = demo_seed();
    $path = dirname(demo_seed_path()) . '/demo-auth-state.json';
    $data = is_file($path) ? json_decode(file_get_contents($path), true) : $seed;
    if (!is_array($data) || !is_string($data['username'] ?? null) || !is_string($data['password_hash'] ?? null)) throw new RuntimeException('Private settings unavailable');
    $data['version'] ??= 'initial-v1';
    return $data;
}

function demo_accounts(): array {
    $path = dirname(demo_seed_path()) . '/demo-accounts.json';
    if (!is_file($path)) return [];
    $data = json_decode(file_get_contents($path), true, 512, JSON_THROW_ON_ERROR);
    if (!is_array($data)) throw new RuntimeException('Private accounts unavailable');
    return $data;
}

function demo_write_accounts(array $accounts): void {
    $folder = dirname(demo_seed_path());
    $temporary = tempnam($folder, '.demo-accounts-');
    try {
        if (!$temporary || file_put_contents($temporary, json_encode($accounts, JSON_THROW_ON_ERROR)) === false) throw new RuntimeException('Write failed');
        chmod($temporary, 0600);
        if (!rename($temporary, $folder . '/demo-accounts.json')) throw new RuntimeException('Replace failed');
    } finally { if ($temporary && is_file($temporary)) unlink($temporary); }
}
