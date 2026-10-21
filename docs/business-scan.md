# Bedrijfsscan

Route: `/bedrijfsscan/`, met identieke alias `bedrijfsscan.html`. De homepage, dienstenpagina en contactpagina verwijzen naar deze route. De sitemapgenerator neemt hem automatisch op.

## Gedrag

Vier vraagstappen met keuzelijsten en aankruisvragen: bedrijf, dagelijks werk, systemen/inzicht en doel/prioriteit. Alleen een optionele extra toelichting gebruikt vrije tekst. Na de laatste vraagstap wordt de AI-samenvatting automatisch gegenereerd, zonder aparte toestemmingscheckbox of extra bevestiging. Stap 5 toont de bewerkbare samenvatting en de contactvelden samen. Alleen de expliciete knop ‘Verstuur mijn bedrijfsscan’ POST naar `contact.php` verstuurt een aanvraag. De scan zelf heeft geen mail- of databasekoppeling.

De procesdefinities in `assets/data/bedrijfsscan.json` worden zowel door frontend als server gebruikt. De server valideert types, bekende opties, verplichte antwoorden en tekstlengtes. Contactgegevens worden pas op de laatste pagina gevraagd en maken geen deel uit van de procesdefinities of AI-invoer. De server-allowlist houdt handmatig meegestuurde contactvelden eveneens tegen. Vrije tekst kan alsnog persoonlijke informatie bevatten; de pagina vraagt daarom expliciet om die weg te laten. Bezoekers kunnen vooraf bekijken welke procesantwoorden meegaan.

De Responses API gebruikt `gpt-4o-mini`, structured JSON output en `store: false`. Er is geen gereedschapstoegang of automatisch uitgevoerde vervolgactie. Uitvoer wordt gecontroleerd, uitsluitend als tekst weergegeven en kan worden aangepast. De instructie verbiedt verzonnen bedrijfsfeiten, besparingen, prijzen en garanties. Een kwalitatieve eerste denkrichting wordt duidelijk onderscheiden van een offerte of definitief advies.

## Configuratie en publicatie

GitHub Actions-secret: `OPTICORE_SCAN_OPENAI_API_KEY`. De bestaande TransIP-deployroute genereert tijdelijk `.scan-deploy/config.json` (genegeerd door Git én uitgesloten van de publieke upload). Via dezelfde SFTP-actie gaat dit bestand naar `TRANSIP_SFTP_TARGET/../opticore-scan-private/config.json`, dus een sibling van de webroot, met behoud van bestandsmodus 0600. De map wordt niet door de website-deploy gewist. De tijdelijke lokale kopie wordt na de run verwijderd. Nooit de sleutel in HTML, JS, bronbestanden of logs plaatsen.

`api/bedrijfsscan.php` leest deze configuratie buiten de document root. Lokaal kan `OPTICORE_SCAN_API_KEY` gebruikt worden; `OPTICORE_SCAN_MODEL` is een optionele override. Geen onveilige TLS-fallback. PHP 8.1+ met cURL en sessies is nodig.

Bescherming: sessiegebonden CSRF-token, Secure/HttpOnly/SameSite-cookie in productie, controle op cross-originverzoeken, JSON/bodylimieten, honeypot, servervalidatie en time-outs. Maximaal vijf AI-pogingen per netwerkadres per UTC-uur en honderd totaal per UTC-dag, met een korte sessiecooldown. Tellers staan in één vergrendeld tijdelijk bestand buiten de webroot. Ze bevatten alleen aantallen, het tijdvenster en een met de sleutel gehasht netwerkadres. Geen antwoordteksten of contactgegevens. Een fout of limiet laat de antwoorden op de pagina staan en biedt opnieuw proberen of antwoorden aanpassen; er verschijnt geen namaak-AI-resultaat. Een ongewijzigde scan hergebruikt de samenvatting bij teruggaan. Contactgegevens en bewerkte samenvatting blijven behouden. De mailinhoud wordt bij het expliciete versturen samengesteld uit de bewerkte samenvatting en oorspronkelijke keuzes.

## Controle

- `php scripts/test-business-scan.php`: afscherming contactvelden, verplichte velden, enum- en lengtevalidatie, nested/ongeldige input en onvolledige AI-uitvoer; geen AI of e-mail.
- `php -l api/bedrijfsscan.php`, `php -l api/scan-lib.php`, `php -l contact.php`.
- `node --check assets/js/bedrijfsscan.js`.
- Bestaande nieuws-, sitemap- en HTML/SEO-controles.
- Browsercontrole met fictieve bedrijfsgegevens: verplichte velden, alle stappen, echte AI-uitkomst, eigen wijzigingen, teruggaan zonder verlies, contactvelden direct onder de samenvatting, mobiel en leescontrast.
- Live controle na deployment: pagina, AI-beschikbaarheid, daadwerkelijke AI-samenvatting en contactconcept. Geen testaanvraag versturen naar de inbox.

Officiële API-referenties: [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses) en [Data controls](https://developers.openai.com/api/docs/guides/your-data). `store: false` is geen belofte dat de provider geen beveiligings- of misbruiklogs verwerkt.
