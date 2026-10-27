# Nederlands, Duits, Engels en Frans

De bestaande Nederlandse URL’s blijven de hoofdbron. `content/i18n/routes.json` legt voor iedere pagina de Duitse, Engelse en Franse URL vast. Elke editie krijgt een eigen canonical, `lang`, sociale metadata en vijf wederzijdse taalverwijzingen (`nl`, `de`, `en`, `fr`, `x-default`). Er is geen automatische taalomleiding.

De taalkeuze staat in de header en in de demo. Bij wisselen blijven queryparameters en het fragment behouden, waaronder modules, zoekopdracht en demo-scherm. Zonder JavaScript zijn de vier talen bereikbaar via gewone links.

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

Afbeeldingen behouden hun originele pixels en bronvermelding. Externe ingesloten keuzehulpen blijven de zelfstandige toepassingen van hun eigen bron; deze build wijzigt die toepassingen niet.

## Build en publicatie

De bestaande GitHub Actions-workflow bouwt de taalversies na de Nederlandse inhoudscontroles en vóór de upload. `de/`, `en/`, `fr/` en `assets/i18n/` zijn gegenereerde publicatiebestanden en worden niet gecommit. De build voegt ook de taalkeuze aan de Nederlandse HTML toe; die wijzigingen zijn lokale preview-/publicatie-output en horen niet als handmatige bronwijziging in Git.

`scripts/test_i18n_browser.cjs` controleert op localhost de menu’s, prijzen en afhankelijkheden, taalwisselen met modulekeuze, contactoverzicht, demo-inlog en zoekresultaten op telefoon, tablet en desktop. De controles versturen geen contactaanvragen en gebruiken geen betaalde AI-oproepen.

Google adviseert eigen URL’s voor taalversies en wederzijdse `hreflang`-verwijzingen: [meertalige websites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites) en [gelokaliseerde pagina’s](https://developers.google.com/search/docs/specialty/international/localized-versions).
