<?php
require_once __DIR__ . '/../api/scan-lib.php';
$checks = 0;
function expect_scan(bool $condition, string $message): void {
    global $checks;
    if (!$condition) throw new RuntimeException($message);
    $checks++;
}
function rejects_scan(callable $operation, string $exception): void {
    try { $operation(); } catch (Throwable $failure) {
        expect_scan($failure instanceof $exception, 'Unexpected exception type');
        return;
    }
    throw new RuntimeException('Invalid input was accepted');
}
$input = [];
foreach (scan_definitions() as $step) foreach ($step['fields'] as $field) {
    if (!$field['ai']) continue;
    $input[$field['key']] = $field['type'] === 'checkboxes' ? [$field['options'][0]] : ($field['options'][0] ?? 'Een concreet fictief procesvoorbeeld voor deze controle.');
}
$input['name'] = 'Deze naam mag niet naar de AI';
$input['email'] = 'fictief@example.com';
$input['company'] = 'Privé bedrijfsnaam';
$clean = scan_validate_answers($input);
expect_scan(!isset($clean['name'], $clean['email'], $clean['company']), 'Contact data leaked into AI input');
expect_scan(count($clean) === 16, 'Unexpected process fields');
expect_scan($clean['sector']['question'] === 'Wat doet je bedrijf?', 'Question context missing');
rejects_scan(fn() => scan_validate_answers([]), InvalidArgumentException::class);
$bad = $input; $bad['team'] = 'onbekende optie';
rejects_scan(fn() => scan_validate_answers($bad), InvalidArgumentException::class);
$bad = $input; $bad['areas'] = [['nested']];
rejects_scan(fn() => scan_validate_answers($bad), InvalidArgumentException::class);
$bad = $input; $bad['pain'] = str_repeat('a', 1201);
rejects_scan(fn() => scan_validate_answers($bad), InvalidArgumentException::class);
$bad = $input; $bad['goal'] = 'Te kort';
rejects_scan(fn() => scan_validate_answers($bad), InvalidArgumentException::class);
$bad = $input; $bad['sector'] = "\xB1\x31";
rejects_scan(fn() => scan_validate_answers($bad), InvalidArgumentException::class);
$bad = $input; $bad['areas'] = [];
rejects_scan(fn() => scan_validate_answers($bad), InvalidArgumentException::class);
$validResult = ['problem' => 'Probleem', 'approach' => 'Aanpak', 'solution' => 'Oplossing', 'benefits' => ['Minder dubbel werk.'], 'questions' => ['Welke controle is nodig?']];
expect_scan(scan_validate_result($validResult) === $validResult, 'Valid result rejected');
$badResult = $validResult; $badResult['problem'] = '';
rejects_scan(fn() => scan_validate_result($badResult), RuntimeException::class);
$badResult = $validResult; $badResult['questions'] = [['not a string']];
rejects_scan(fn() => scan_validate_result($badResult), RuntimeException::class);
$badResult = $validResult; $badResult['benefits'] = array_fill(0, 4, 'Too many');
rejects_scan(fn() => scan_validate_result($badResult), RuntimeException::class);
echo "Business scan validation: {$checks} checks passed. No AI or mail calls made.\n";
