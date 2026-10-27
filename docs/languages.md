# Nederlands, Duits, Engels en Frans

De bestaande Nederlandse URL’s blijven de hoofdbron. `content/i18n/routes.json` legt voor iedere pagina de Duitse, Engelse en Franse URL vast. Elke editie krijgt een eigen canonical, `lang`, sociale metadata en vijf wederzijdse taalverwijzingen (`nl`, `de`, `en`, `fr`, `x-default`). Er is geen automatische taalomleiding.

De taalkeuze staat als compacte vlagknop in de header en in de demo. Het uitklapmenu gebruikt lokale SVG-vlaggen en de eigen namen van de vier talen. De native disclosure werkt met toetsenbord en zonder JavaScript; Escape en buiten het menu klikken sluiten het menu. Bij wisselen blijven queryparameters en het fragment behouden, waaronder modules, zoekopdracht en demo-scherm. Taalwisselen vraagt geen demo-inlog; navigeren binnen de demo behoudt de bestaande inlogcontrole.

## Vertalingen onderhouden

1. Werk de Nederlandse HTML en eventuele renderers bij.
2. Draai `python scripts/i18n.py --extract`. De tijdelijke bronlijst is genegeerd in Git.
3. Vul de ontbrekende teksten aan in `content/i18n/de.json`, `en.json` en `fr.json`. `terminology.json` bevat redactioneel gekozen kernbegrippen, modulelabels en primaire koppen; deze krijgen voorrang op de algemene catalogi.
4. Draai `python scripts/i18n.py --write`, `python scripts/i18n.py --check` en `python scripts/test_i18n.py`.
5. Bouw de zoekindex en sitemap opnieuw: `python scripts/search_index.py --write` en `python scripts/sitemap.py --write`. Controleer metadata met `python scripts/metadata.py --check`.

De eerste catalogi zijn automatisch voorvertaald vanuit openbare websiteteksten. Kernteksten en vaktermen zijn vervolgens geredigeerd; op achtergebleven Nederlandse alinea’s, plaatsaanduidingen en prijzen wordt aanvullend gecontroleerd. Voor juridische certificering of een formele moedertaalredactie is deze workflow niet bedoeld. Bedrijfsnamen, bronverwijzingen, bedragen en oorspronkelijke publicatiedata blijven behouden.

De build gebruikt uitsluitend lokale JSON-bestanden. Nieuwe, onvertaalde bronteksten breken de build, zodat er geen stilzwijgende Nederlandse fallback op buitenlandse pagina’s wordt gepubliceerd. Vertalingen worden nooit tijdens een bezoek bij Google of een andere vertaaldienst opgevraagd. Formulierinvoer, wachtwoorden en contactgegevens worden niet door de vertaalfunctie verwerkt.

## Interactie en gegevens

`assets/js/i18n.js` vertaalt lokaal de nieuw weergegeven teksten en toegankelijke labels van de calculator, formulieren, galerij en demo. De oorspronkelijke formulierwaarden, module-ID’s en overige toepassingsgegevens blijven intact. Bestaande API’s en assets blijven op hun oorspronkelijke URL staan. Nieuwe interne paginalinks volgen de actieve taal. De observer verwerkt zijn eigen wijzigingen zonder deze opnieuw te observeren.

De zoekfunctie gebruikt uitsluitend documenten in de geselecteerde taal. Iedere taal heeft ook een eigen nieuwsfeed. Het contactformulier stuurt de taalcode mee en geeft validatie-/bedankpagina’s in dezelfde taal terug. De bedrijfsscan krijgt alleen een gecontroleerde taalcode voor de samenvatting; beveiliging, limieten en verzendstappen blijven gelden. De demo-inlog is in alle talen verplicht bij doorklikken.

App-screenshots worden opnieuw opgenomen uit de daadwerkelijk vertaalde demo. De 202 opnamen per taal bevatten alle modulegalerijen, het scrollbare dashboard en de neutrale praktijkvoorbeelden. Duits, Engels en Frans hebben elk eigen desktop-, tablet- en telefoonbeelden: samen 606 bestanden, standaard in darkmode en op hoge resolutie. De Nederlandse beelden behouden hun Nederlandse tekst. Productfoto’s, logo’s en bronvermeldingen blijven origineel. Externe ingesloten keuzehulpen en screenshots van zelfstandige klantwebsites worden niet door deze app-capture vervangen.

## Screenshots maken

De browserafhankelijkheid staat vast in `package-lock.json`. Een volledige lokale vernieuwing werkt als volgt:

```text
npm ci --ignore-scripts
npx playwright install chromium
python scripts/i18n.py --write
node scripts/capture_localized_screenshots.cjs
python scripts/i18n.py --write
python scripts/localized_screenshots.py --check
```

Het capturescript start zelf twee tijdelijke webservers op localhost. Het gebruikt fictieve gegevens en een uitsluitend lokale inlogfixture. Er worden geen productiesystemen of productiecredentials benaderd. Iedere opname krijgt een geïsoleerde browsersessie, zodat handelingen in het ene scherm de volgende opname niet veranderen. Het resultaat en de hashmanifest staan in de genegeerde map `assets/img/localized/`; de tijdelijke voorbeeld-HTML wordt buiten de repository gemaakt en na afloop opgeruimd.

De i18n-build verwijst bij buitenlandse pagina’s zowel voor previews als voor het vergrootvenster naar de juiste taalbeelden. De tabletvariant blijft beschikbaar bij het draaien van de telefoon. Een gezamenlijke inhoudshash voorkomt verouderde screenshots in de browsercache. `localized_screenshots.py --check` controleert volledigheid, taal, apparaat, darkmode en bestandsinhoud.

## Build en publicatie

De bestaande GitHub Actions-workflow bouwt de taalversies na de Nederlandse inhoudscontroles en vóór de upload. De gelokaliseerde screenshots worden automatisch opgenomen en gecachet op de bronbestanden van demo, styling, vertalingen en captureplan. Daarna worden de definitieve beeldverwijzingen en sitemap gebouwd. `de/`, `en/`, `fr/`, `assets/i18n/` en `assets/img/localized/` zijn gegenereerde publicatiebestanden en worden niet gecommit. De build voegt ook de taalkeuze aan de Nederlandse HTML toe; die wijzigingen zijn lokale preview-/publicatie-output en horen niet als handmatige bronwijziging in Git.

`scripts/test_i18n_browser.cjs` controleert op localhost de menu’s, prijzen en afhankelijkheden, taalwisselen met modulekeuze, contactoverzicht, demo-inlog en zoekresultaten op telefoon, tablet en desktop. De controles versturen geen contactaanvragen en gebruiken geen betaalde AI-oproepen.

Google adviseert eigen URL’s voor taalversies en wederzijdse `hreflang`-verwijzingen: [meertalige websites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites) en [gelokaliseerde pagina’s](https://developers.google.com/search/docs/specialty/international/localized-versions).
