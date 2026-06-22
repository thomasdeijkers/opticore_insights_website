<?php
function clean_text($value) {
    $value = trim((string) $value);
    return str_replace(["\r", "\n"], ' ', $value);
}

function render_page($title, $message, $is_success = false) {
    $safe_title = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
    $safe_message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
    $heading = $is_success ? 'Bedankt voor je bericht.' : 'Bericht niet verzonden.';
    $status_class = $is_success ? 'success-panel' : 'error-panel';
    echo "<!doctype html><html lang=\"nl\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>{$safe_title} | OptiCore Insights</title><link rel=\"stylesheet\" href=\"/assets/css/style.css\"></head><body><main class=\"section\"><div class=\"container text-page info-panel {$status_class}\"><h1>{$heading}</h1><p>{$safe_message}</p><div class=\"actions\"><a class=\"button button-primary\" href=\"/contact\">Terug naar contact</a><a class=\"button button-secondary\" href=\"/\">Naar home</a></div></div></main></body></html>";
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /contact');
    exit;
}

if (!empty($_POST['website'] ?? '')) {
    render_page('Spam gedetecteerd', 'Het bericht is niet verwerkt. Stuur ons rechtstreeks een e-mail via info@opticore-insights.nl.');
}

$name = clean_text($_POST['name'] ?? '');
$company = clean_text($_POST['company'] ?? '');
$email_raw = clean_text($_POST['email'] ?? '');
$email = filter_var($email_raw, FILTER_VALIDATE_EMAIL);
$phone = clean_text($_POST['phone'] ?? '');
$subject_input = clean_text($_POST['subject'] ?? '');
$message = trim((string) ($_POST['message'] ?? ''));
$privacy = $_POST['privacy'] ?? '';

if ($name === '' || !$email || $subject_input === '' || $message === '' || $privacy !== 'accepted') {
    render_page('Controleer je gegevens', 'Niet alle verplichte velden zijn correct ingevuld. Controleer je naam, e-mail, onderwerp, bericht en privacybevestiging.');
}

if (strlen($message) > 5000) {
    render_page('Bericht te lang', 'Het bericht is langer dan verwacht. Maak het iets korter of stuur rechtstreeks een e-mail naar info@opticore-insights.nl.');
}

$to = 'info@opticore-insights.nl';
$mail_subject = 'Contactaanvraag via OptiCore Insights: ' . $subject_input;
$body = "Naam: {$name}\nBedrijf: {$company}\nE-mail: {$email}\nTelefoon: {$phone}\nOnderwerp: {$subject_input}\n\nBericht:\n{$message}\n\n---\nVerzonden via opticore-insights.nl/contact\n";
$headers = [
    'From: OptiCore Insights <info@opticore-insights.nl>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion()
];

$sent = mail($to, $mail_subject, $body, implode("\r\n", $headers), '-finfo@opticore-insights.nl');

if ($sent) {
    render_page('Bericht verzonden', 'Je bericht is verzonden naar info@opticore-insights.nl. We nemen zo snel mogelijk contact met je op.', true);
}

render_page('Mail niet beschikbaar', 'De server kon het bericht niet verzenden. Stuur je vraag rechtstreeks naar info@opticore-insights.nl.');
