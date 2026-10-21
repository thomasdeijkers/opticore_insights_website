<?php
function clean_text($value) {
    $value = is_string($value) ? trim($value) : '';
    return str_replace(["\r", "\n"], ' ', $value);
}

function render_page($title, $message, $is_success = false) {
    $safe_title = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
    $safe_message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
    $heading = $is_success ? 'Bedankt voor je bericht.' : 'Bericht niet verzonden.';
    $status_class = $is_success ? 'success-panel' : 'error-panel';
    echo "<!doctype html><html lang=\"nl\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>{$safe_title} | OptiCore Insights</title><link rel=\"stylesheet\" href=\"/assets/css/site.css?v=20261020f\"></head><body><main class=\"section\"><div class=\"container text-page info-panel {$status_class}\"><h1>{$heading}</h1><p>{$safe_message}</p><div class=\"actions\"><a class=\"button button-primary\" href=\"/contact/\">Terug naar contact</a><a class=\"button button-secondary\" href=\"/\">Naar home</a></div></div></main></body></html>";
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /contact/');
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
$topics = json_decode(<<<'JSON'
{
  "webapp": {
    "label": "Een modulaire webapp",
    "question": "Welk werk moet de webapp makkelijker maken?",
    "fields": {
      "modules": {"label": "Welke modules wil je bespreken?", "required": false},
      "systems": {"label": "Welke systemen moeten we koppelen?", "required": false},
      "users": {"label": "Wie gaat de webapp gebruiken?", "required": false}
    }
  },
  "bol-tools": {
    "label": "De app voor bol-ondernemers",
    "question": "Waar wil je meer grip op krijgen?",
    "fields": {
      "bol_account": {"label": "Verkoop je al op bol?", "required": false},
      "assortment": {"label": "Hoe groot is je assortiment?", "required": false}
    }
  },
  "business-scan": {
    "label": "Mijn bedrijfsscan bespreken",
    "question": "Mijn bedrijfsscan en voorstel",
    "fields": {}
  },
  "dashboard": {
    "label": "Een dashboard",
    "question": "Waar wil je meer inzicht in krijgen?",
    "fields": {
      "sources": {
        "label": "Waar staan je gegevens nu?",
        "required": false
      },
      "users": {
        "label": "Wie gaat het dashboard gebruiken?",
        "required": false
      }
    }
  },
  "automation": {
    "label": "Automatisering of een koppeling",
    "question": "Welk werk wil je makkelijker maken?",
    "fields": {
      "systems": {
        "label": "Welke systemen of bestanden gebruik je?",
        "required": false
      },
      "frequency": {
        "label": "Hoe vaak komt dit werk terug?",
        "required": false
      }
    }
  },
  "website": {
    "label": "Een website in HTML",
    "question": "Wat moet je website voor je doen?",
    "fields": {
      "current_site": {
        "label": "Heb je al een website?",
        "required": false
      },
      "content": {
        "label": "Welke inhoud heb je al beschikbaar?",
        "required": false
      }
    }
  },
  "choice-guide": {
    "label": "Een keuzehulp",
    "question": "Waar moeten je bezoekers een keuze in maken?",
    "fields": {
      "range": {
        "label": "Hoe groot is het aanbod?",
        "required": false
      },
      "guide_site": {
        "label": "Op welke website wil je de keuzehulp gebruiken?",
        "required": false
      }
    }
  },
  "existing": {
    "label": "Een bestaande opdracht",
    "question": "Waar kunnen we je mee helpen?",
    "fields": {
      "project": {
        "label": "Om welke opdracht of website gaat het?",
        "required": true
      }
    }
  },
  "other": {
    "label": "Iets anders / ik weet het nog niet",
    "question": "Wat wil je bespreken?",
    "fields": {}
  }
}
JSON
, true);
$topic_key = clean_text($_POST['topic'] ?? '');
$topic = $topics[$topic_key] ?? null;
if ($topic_key !== '' && !$topic) {
    render_page('Kies een onderwerp', 'Kies een onderwerp uit de lijst op de contactpagina.');
}
// Keep forms opened before this update working, too.
$subject_input = $topic ? $topic['label'] : clean_text($_POST['subject'] ?? '');
$message = is_string($_POST['message'] ?? null) ? trim($_POST['message']) : '';
$privacy = $_POST['privacy'] ?? '';

if ($name === '' || !$email || $subject_input === '' || $message === '' || $privacy !== 'accepted') {
    render_page('Controleer je gegevens', 'Niet alle verplichte velden zijn correct ingevuld. Controleer je naam, e-mail, onderwerp, bericht en privacybevestiging.');
}

if (strlen($name) > 480 || strlen($company) > 720 || strlen($email_raw) > 254 || strlen($phone) > 320 || strlen($subject_input) > 600 || strlen($message) > ($topic_key === 'business-scan' ? 72000 : 20000)) {
    render_page('Bericht te lang', 'Het bericht is langer dan verwacht. Maak het iets korter of stuur rechtstreeks een e-mail naar info@opticore-insights.nl.');
}

$details = '';
$submitted_details = is_array($_POST['details'] ?? null) ? $_POST['details'] : [];
foreach (($topic['fields'] ?? []) as $key => $field) {
    $answer = clean_text($submitted_details[$key] ?? '');
    if ($field['required'] && $answer === '') {
        render_page('Controleer je gegevens', 'Vul in om welke opdracht of website je vraag gaat.');
    }
    if (strlen($answer) > 4000) {
        render_page('Antwoord te lang', 'Maak je toelichting iets korter of mail rechtstreeks naar info@opticore-insights.nl.');
    }
    if ($answer !== '') {
        $details .= $field['label'] . ': ' . $answer . "\n";
    }
}
$question_label = $topic['question'] ?? 'Bericht';

$to = 'info@opticore-insights.nl';
$mail_subject = 'Contactaanvraag via OptiCore Insights: ' . $subject_input;
$body = "Naam: {$name}\nBedrijf: {$company}\nE-mail: {$email}\nTelefoon: {$phone}\nOnderwerp: {$subject_input}\n\n{$question_label}\n{$message}\n\n{$details}\n---\nVerzonden via opticore-insights.nl/contact\n";
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
