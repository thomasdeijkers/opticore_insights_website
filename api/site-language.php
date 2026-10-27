<?php
// Public, offline language catalogues. Never build a file path from unvalidated input.
function site_language(): string {
    $value = $_POST['language'] ?? $_GET['lang'] ?? 'nl';
    return is_string($value) && in_array($value, ['nl', 'de', 'en', 'fr'], true) ? $value : 'nl';
}

function site_text(string $value, ?string $language = null): string {
    $language ??= site_language();
    if ($language === 'nl') return $value;
    static $catalogues = [];
    if (!array_key_exists($language, $catalogues)) {
        $path = dirname(__DIR__) . '/assets/i18n/' . $language . '.json';
        $catalogues[$language] = is_file($path) ? (json_decode(file_get_contents($path), true) ?: []) : [];
    }
    $dictionary = $catalogues[$language];
    if (isset($dictionary[$value])) return $dictionary[$value];
    // Validation messages consist of a fixed prefix and a known field label.
    foreach (['Vul het verplichte veld in: ', 'Kies een geldige optie bij: '] as $prefix) {
        if (str_starts_with($value, $prefix)) {
            $label = rtrim(substr($value, strlen($prefix)), '.');
            return ($dictionary[trim($prefix)] ?? trim($prefix)) . ' ' . ($dictionary[$label] ?? $label) . '.';
        }
    }
    return $value;
}

function site_page_url(string $canonical, ?string $language = null): string {
    $language ??= site_language();
    if ($language === 'nl') return $canonical;
    $routes = json_decode(file_get_contents(dirname(__DIR__) . '/assets/i18n/routes.json'), true);
    return $routes[$canonical][$language] ?? $canonical;
}
