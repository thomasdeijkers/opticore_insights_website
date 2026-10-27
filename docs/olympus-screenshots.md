# Olympus: echte schermen met fictieve gegevens

De projectpagina en beide Olympus-nieuwsartikelen gebruiken opnamen van de echte
Olympus React-frontend, geen neutrale Werkruimte-fixture. Het dashboard, de
weekplanning en het opdrachtenoverzicht zijn vastgelegd voor desktop (1280 × 900,
2×), tablet (834 × 1112, 2×) en mobiel (390 × 844, 3×). Het geopende mobiele menu
heeft een eigen opname. Vier talen maken samen 40 beelden.

De afgesproken portfolio-uitvoering is darkmode met behoud van het Olympus-logo,
groen/blauwe accenten en gekleurde documentstatussen. De productomgeving zelf
wordt niet aangepast. Een label in de opname benoemt de fictieve gegevens.

## Herkomst en afbakening

`content/olympus-captures.json` legt de bronrevisie, media-release en SHA-256 vast.
De bronrevisie hoort bij de private Olympus-repository. Die applicatiecode wordt
niet naar deze publieke repository of naar de website gekopieerd. Alleen de
beelden en een technisch beeldmanifest zitten in de media-release.

`scripts/olympus_capture_fixture.cjs` bevat uitsluitend verzonnen personen,
bedrijven, opdrachten, weekstaten en bedragen. De capture-browser onderschept
alle API-verzoeken; onbekende endpoints stoppen de opname. Er draait geen
backend. De enige toegestane externe verzoeken zijn voor het bestaande lettertype
DM Sans bij Google Fonts. Er worden geen productieaccounts, documenten, databases,
mailfuncties of AI-diensten gebruikt.

## Opnieuw vastleggen

1. Maak buiten deze checkout een schone `git archive` van de vastgelegde Olympus-
   bronrevisie: `src`, `public`, `index.html`, `olympus_bouw_logo.png`,
   `package.json` en `package-lock.json`. Gebruik geen runtimebestanden.
2. Installeer die lokale frontend met `npm ci --ignore-scripts` en start alleen
   Vite op `127.0.0.1:8874`. Start geen backend. Controleer dat de bronrevisie nog
   de bedoelde frontend is voordat je een nieuwe release vastlegt.
3. Voer vanuit deze website `node scripts/capture_olympus_source.cjs
   --output=<absolute-externe-snapshotmap>` uit. De browser laadt de originele
   React-schermen met de fictieve API-fixtures, past de donkere portfolio-palet
   toe op DOM-stijlen en verwijdert scripts uit de tijdelijke snapshots.
4. Vertaal de statische snapshots met `python scripts/olympus_snapshots.py
   --source=<snapshotmap> --translate=<externe-vertaalmap>`. De geïsoleerde,
   nagekeken UI-vertalingen staan in `content/olympus-i18n.json`; er is geen
   online vertaalstap in de build. Controleer bij gewijzigde bron alle nieuwe
   teksten (`--collect=<extern-jsonbestand>`).
5. Render met `node scripts/capture_olympus_images.cjs --source=<snapshotmap>
   --translated=<vertaalmap> --output=<externe-mediamap>
   --source-commit=<40-tekens-git-revisie>`. Playwright ondersteunt dezelfde
   `PLAYWRIGHT_MODULE_PATH`/`PLAYWRIGHT_CHROMIUM_EXECUTABLE` als de bestaande
   capturescripts. De capture controleert taal, darkmode, ontbrekende beelden,
   ongewenste scripts en horizontale pagina-overloop. Controleer de beelden
   visueel in alle talen en formaten.
6. Publiceer een nieuwe, versienummerde media-release met uitsluitend de 40
   `assets/img/.../client-olympus-*-dark.jpg`-bestanden en `manifest.json` in een
   ZIP. Houd tijdelijke HTML, broncode, node_modules en rapporten erbuiten.
   Werk tag, bestandsnaam, SHA-256 en bronrevisie in de configuratie bij. Gebruik
   een nieuwe tag; vervang een gepubliceerde release niet.

## Deployment en controles

De bestaande websiteworkflow herstelt de media vóór de contentcontroles met
`python scripts/olympus_media.py`. Dit controleert de ZIP-checksum, de complete
allowlist van 40 bestanden, beeldchecksums, talen, formaten en bronrevisie vóór
het schrijven. Gegenereerde JPEG's en de gecombineerde taalmanifesten staan in
`.gitignore`. Er komen geen gegenereerde beelden in een broncommit.

Het gedeelde galerijscript kiest dezelfde scène op het passende apparaat en
wisselt bij draaien naar de tabletweergave. De drie vertaalde edities verwijzen
naar eigen taalbeelden. De neutrale documentvoorbeelden op andere dienstenpagina's
blijven aparte collecties.

Controles: `check_screenshot_galleries.py`, `localized_screenshots.py --check`,
`i18n.py --check`, `test_i18n.py`, `news.py --check`, `metadata.py --check` en de
visuele browsercontrole van de Olympus-galerij inclusief vergroten en draaien.
