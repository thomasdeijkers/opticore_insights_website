# OptiCore Insights website

Statische HTML/CSS/JS website voor OptiCore Insights. De site is bedoeld als snelle, onderhoudbare vervanging van de huidige WordPress-site op opticore-insights.nl.

## Structuur

- `index.html` - Home
- `diensten.html` - Diensten
- `projecten.html` - Voorbeeldprojecten
- `over.html` - Over Thomas Deijkers / OptiCore Insights
- `contact.html` - Contactformulier
- `privacy.html` - Privacyverklaring
- `contact.php` - Simpele PHP mail fallback
- `assets/css/style.css` - Styling
- `assets/js/main.js` - Mobiel menu en lokale mail fallback
- `.github/workflows/deploy.yml` - Deploy via SFTP naar TransIP

## Lokaal testen

Open `index.html` direct in je browser. Omdat de site statisch is, is er geen buildstap nodig.

Let op: als je het contactformulier lokaal opent via `file://`, gebruikt JavaScript automatisch een mailto-fallback. Op de server probeert het formulier `contact.php` te gebruiken.

## Benodigde GitHub Secrets

Maak in GitHub onder `Settings > Secrets and variables > Actions` deze secrets aan:

- `TRANSIP_SFTP_HOST`
- `TRANSIP_SFTP_USERNAME`
- `TRANSIP_SFTP_PASSWORD`
- `TRANSIP_SFTP_PORT`
- `TRANSIP_SFTP_TARGET`

Voorbeeldwaarden:

- Host: je SFTP hostnaam van TransIP
- Username: je SFTP/hosting gebruikersnaam
- Password: je SFTP wachtwoord
- Port: meestal `22`, tenzij TransIP iets anders aangeeft
- Target: de map waarin je websitebestanden moeten komen, bijvoorbeeld `/www/` of `/public_html/` afhankelijk van je hostingpakket

## Deploy

De workflow draait automatisch bij een push naar `main`.

De workflow uploadt de statische site via SFTP en verwijdert voorlopig geen bestanden op de server, omdat `delete_remote_files` op `false` staat. Bestanden zoals `.git`, `.github`, `README.md`, backups en zipbestanden worden uitgesloten.

## Belangrijk voor livegang

Maak eerst een volledige backup van de bestaande WordPress-bestanden en database voordat je deze statische site live zet. Controleer daarna welke map TransIP als webroot gebruikt en upload daar pas de statische bestanden naartoe.
