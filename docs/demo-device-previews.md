# Apparaten vergelijken op desktop

De dashboardteaser op de homepage en `/modulaire-webapp/` heeft op brede schermen met een muis drie knoppen: Desktop, Tablet en Mobiel. `assets/js/demo-preview.js` kiest de gelokaliseerde screenshot via de mediaregels van het picture-element. De apparaatkaders wisselen mee: laptop 16:10, tablet altijd liggend 4:3 en telefoon 390:844. De tablet-dashboardopname wordt op 1112 × 834 gemaakt, ook wanneer een bezoeker een tablet rechtop houdt. De afbeelding blijft scherp en verticaal scrollbaar; aanklikken opent de volledige demo zoals voorheen.

Onder de desktopgrens of bij een primair aanraakscherm verdwijnen de knoppen en gelden weer de oorspronkelijke automatische regels voor telefoon, tablet en landscape. Bij terugkeer naar desktop blijft de laatst gekozen vergelijking beschikbaar. Zonder JavaScript blijft de automatische screenshotweergave werken. De knoppen hebben een zichtbare focus en een `aria-pressed`-status. Tekst en schermafbeeldingen volgen de taal van de pagina.

`scripts/test_demo_preview_browser.cjs` controleert beide pagina’s in vier talen, echte afbeeldingkeuze, beeldverhoudingen, scrollen, toetsenbordbediening, herstel na schermwissels en de link naar de demo. `scripts/test_responsive_demo_browser.cjs` controleert de bestaande automatische apparaat- en oriëntatieregels. Beide werken uitsluitend tegen een lokale testserver, met `DEMO_CAPTURE_BASE`, `PLAYWRIGHT_MODULE_PATH` en eventueel `PLAYWRIGHT_CHROMIUM_EXECUTABLE` als configuratie.

## Consistente productbeelden

De twaalf fictieve artikelen gebruiken de gereviewde studioset uit `content/demo-studio-products.json`. Daar staan de definitieve imagegen-prompts, kijkrichting, afbeeldingspaden en SHA-256-controlesommen. Alle producten staan schuin van voren met de voorkant naar rechts, op wit met een lichte schaduw. Dezelfde bestanden worden gebruikt in dashboard, productlijsten, picking en Studio-voorbeelden; de hoofdafbeelding krijgt geen extra rotatie of tweede slagschaduw.

De JPEGs in `assets/img/demo-products/studio-v1/` zijn genegeerde media-output en worden hersteld uit de vastgezette GitHub-release. `python scripts/demo_product_assets.py --restore --check` controleert eerst archiefinhoud en checksums. De bestaande deployroute doet dit vóór tests en screenshotgeneratie. Gegenereerde beelden en screenshots worden niet in Git gecommit. De beeldbronnenpagina onderscheidt de nieuwe AI-illustraties van het eerder gebruikte fotomateriaal en behoudt de oorspronkelijke licentievermeldingen van die eerdere beelden.
