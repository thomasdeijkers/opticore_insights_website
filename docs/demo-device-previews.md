# Apparaten vergelijken op desktop

De dashboardteaser op de homepage en `/modulaire-webapp/` heeft op brede schermen met een muis drie knoppen: Desktop, Tablet en Mobiel. `assets/js/demo-preview.js` kiest de bestaande gelokaliseerde screenshot via de mediaregels van het picture-element. De apparaatkaders wisselen mee: laptop 16:10, tablet 3:4 en telefoon 390:844. De afbeelding blijft scherp en verticaal scrollbaar; aanklikken opent de volledige demo zoals voorheen.

Onder de desktopgrens of bij een primair aanraakscherm verdwijnen de knoppen en gelden weer de oorspronkelijke automatische regels voor telefoon, tablet en landscape. Bij terugkeer naar desktop blijft de laatst gekozen vergelijking beschikbaar. Zonder JavaScript blijft de automatische screenshotweergave werken. De knoppen hebben een zichtbare focus en een `aria-pressed`-status. Tekst en schermafbeeldingen volgen de taal van de pagina.

`scripts/test_demo_preview_browser.cjs` controleert beide pagina’s in vier talen, echte afbeeldingkeuze, beeldverhoudingen, scrollen, toetsenbordbediening, herstel na schermwissels en de link naar de demo. `scripts/test_responsive_demo_browser.cjs` controleert de bestaande automatische apparaat- en oriëntatieregels. Beide werken uitsluitend tegen een lokale testserver, met `DEMO_CAPTURE_BASE`, `PLAYWRIGHT_MODULE_PATH` en eventueel `PLAYWRIGHT_CHROMIUM_EXECUTABLE` als configuratie.
