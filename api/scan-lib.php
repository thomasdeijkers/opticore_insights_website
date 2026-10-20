<?php
// Shared, side-effect-free validation for the public scan endpoint and its tests.
function scan_definitions(): array {
    return json_decode(file_get_contents(__DIR__ . '/../assets/data/bedrijfsscan.json'), true, 32, JSON_THROW_ON_ERROR)['steps'];
}

function scan_validate_answers($input): array {
    if (!is_array($input) || array_is_list($input)) {
        throw new InvalidArgumentException('Controleer de antwoorden van je bedrijfsscan.');
    }
    $answers = [];
    foreach (scan_definitions() as $step) {
        foreach ($step['fields'] as $field) {
            // Contact fields are deliberately never included in the AI input.
            if (!$field['ai']) continue;
            $key = $field['key'];
            $value = $input[$key] ?? ($field['type'] === 'checkboxes' ? [] : '');
            if ($field['type'] === 'checkboxes') {
                if (!is_array($value) || !array_is_list($value) || count($value) > count($field['options'])) {
                    throw new InvalidArgumentException('Controleer je keuzes bij: ' . $field['label']);
                }
                foreach ($value as $item) {
                    if (!is_string($item) || !in_array($item, $field['options'], true)) {
                        throw new InvalidArgumentException('Controleer je keuzes bij: ' . $field['label']);
                    }
                }
                $value = array_values(array_unique($value));
            } else {
                if (!is_string($value) || !preg_match('//u', $value)) {
                    throw new InvalidArgumentException('Controleer je antwoord bij: ' . $field['label']);
                }
                $value = trim($value);
                $length = preg_match_all('/./us', $value);
                if ($length > ($field['max'] ?? 250) || ($value !== '' && $length < ($field['min'] ?? 0))) {
                    throw new InvalidArgumentException('Je antwoord is te kort of te lang bij: ' . $field['label']);
                }
                if ($field['type'] === 'select' && $value !== '' && !in_array($value, $field['options'], true)) {
                    throw new InvalidArgumentException('Kies een antwoord uit de lijst bij: ' . $field['label']);
                }
            }
            if (($field['required'] ?? false) && ($value === '' || $value === [])) {
                throw new InvalidArgumentException('Vul dit antwoord nog in: ' . $field['label']);
            }
            $answers[$key] = ['question' => $field['label'], 'answer' => $value];
        }
    }
    return $answers;
}

function scan_result_schema(): array {
    $properties = [];
    foreach (['problem', 'approach', 'solution'] as $key) $properties[$key] = ['type' => 'string'];
    foreach (['benefits', 'questions'] as $key) $properties[$key] = ['type' => 'array', 'items' => ['type' => 'string']];
    return ['type' => 'object', 'properties' => $properties, 'required' => array_keys($properties), 'additionalProperties' => false];
}

function scan_validate_result($value): array {
    if (!is_array($value)) throw new RuntimeException('Incomplete analysis');
    foreach (['problem' => 1800, 'approach' => 2200, 'solution' => 2200] as $key => $limit) {
        if (!is_string($value[$key] ?? null) || trim($value[$key]) === '' || preg_match_all('/./us', $value[$key]) > $limit) throw new RuntimeException('Invalid analysis text');
    }
    foreach (['benefits', 'questions'] as $key) {
        if (!is_array($value[$key] ?? null) || !array_is_list($value[$key]) || count($value[$key]) < 1 || count($value[$key]) > 3) throw new RuntimeException('Invalid analysis list');
        foreach ($value[$key] as $item) {
            if (!is_string($item) || trim($item) === '' || preg_match_all('/./us', $item) > 400) throw new RuntimeException('Invalid analysis item');
        }
    }
    return array_intersect_key($value, scan_result_schema()['properties']);
}

function scan_reserve_usage(string $apiKey, string $ip, int $dailyLimit): void {
    // One locked file, outside the webroot. It contains counters, never answers.
    $path = sys_get_temp_dir() . '/opticore-scan-' . substr(hash('sha256', dirname(__DIR__)), 0, 16) . '.json';
    $handle = fopen($path, 'c+');
    if (!$handle || !flock($handle, LOCK_EX)) throw new RuntimeException('Rate limit storage unavailable');
    try {
        @chmod($path, 0600);
        $raw = stream_get_contents($handle);
        $state = $raw === '' ? [] : json_decode($raw, true, 32, JSON_THROW_ON_ERROR);
        $day = gmdate('Y-m-d');
        $hour = (int) floor(time() / 3600);
        if (($state['day'] ?? '') !== $day) $state = ['day' => $day, 'count' => 0, 'clients' => []];
        $client = hash_hmac('sha256', $ip, $apiKey);
        $state['clients'] = array_filter($state['clients'], fn($item) => $item['hour'] === $hour);
        $usage = $state['clients'][$client]['count'] ?? 0;
        if ($state['count'] >= $dailyLimit || $usage >= 5) throw new OverflowException('usage_limit');
        $state['count']++;
        $state['clients'][$client] = ['hour' => $hour, 'count' => $usage + 1];
        rewind($handle);
        ftruncate($handle, 0);
        if (fwrite($handle, json_encode($state, JSON_THROW_ON_ERROR)) === false) throw new RuntimeException('Could not reserve usage');
        fflush($handle);
    } finally {
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}
