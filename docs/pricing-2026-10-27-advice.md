# Huidige prijs links, adviesprijs rechts

De gebruiker vraagt de huidige prijs als uitgangspunt te nemen, ronde tientallen per uitbreiding te houden en daar circa 20% bovenop te rekenen voor de adviesprijs. Dit vervangt de eerdere berekening waarbij de huidige prijs ongeveer 20% onder de referentieprijs lag.

`assets/js/modular-webapp.js` bewaart nu expliciet `currentMonthly`. Adviesprijzen worden afgeleid als `Math.round(currentMonthly * 1.2)`; hetzelfde geldt voor de eenmalige inrichting. De bestaande afgeleide velden blijven beschikbaar voor de samensteller en gebruikscalculator. Er wordt geen historische verkoopprijs geclaimd: het zichtbare label is Advies.

| Uitbreiding | Huidig per maand | Advies per maand |
| --- | ---: | ---: |
| Forecasting | € 20 | € 24 |
| Inkoop en bestellen | € 30 | € 36 |
| Magazijn en logistiek | € 40 | € 48 |
| Productbeheer en publicaties | € 40 | € 48 |
| Marketing en ranking | € 50 | € 60 |
| Financieel overzicht | € 30 | € 36 |
| Signalen en controles | € 20 | € 24 |

De netto pakketbedragen en inrichtingskosten blijven gelijk aan de vorige prijsronde. Het startpakket blijft € 149 per maand en € 995 inrichting; de adviesbedragen zijn nu respectievelijk € 179 en € 1.194. Alle modules samen blijven € 379 per maand en € 2.995 inrichting, met adviesbedragen van € 455 en € 3.594. De netto uitbreidingen zijn ronde tientallen, zodat pakketbedragen op negen blijven eindigen. AI- en databaseverbruik, btw en de einddatum 31 december 2027 blijven afzonderlijk vermeld.

De huidige prijs staat als eerste in de DOM en links in de moduletegels, uitgeklapte toelichtingen, vaste prijsbalk en prijsopbouw. Adviesprijzen staan er rechts naast en zijn doorgestreept. De bedragen blijven dicht bij elkaar. Op de kleinste telefoons kan de eenheid onder de huidige prijs komen te staan; de adviesprijs blijft rechts van de prijs. De aanvraag gebruikt dezelfde actuele bedragen en blijft readonly.

`scripts/module_prices.py --write` genereert de prijsfragmenten op beide modulepagina’s en aliassen vanuit de catalogus. `--check` draait bij deployment. Zo worden ook de besparingsregels bijgewerkt en kunnen eerder achtergebleven kortingsbedragen niet blijven staan. De bestaande test rekent alle 1.024 selecties door en controleert de +20%-adviesformule, ronde uitbreidingstarieven, eind-negen-pakketten, labels en prijsvolgorde.

Browsercontrole op 320, 390, 844 en 1.440 pixels: beide pagina’s, horizontale prijsvolgorde en leesbaarheid, geen pagina-overloop, vaste balk en geopende prijsopbouw, exacte selectietotalen en readonly aanvraagoverdracht. De mobiele weergave is ook visueel gecontroleerd. Tijdelijke controles en screenshots staan buiten de repository in de bestaande website-checks-map.

## Contactoverzicht als tabel

Het contactformulier toont de gekozen onderdelen nu in twee tabellen: per maand en eenmalige inrichting. De kolommen zijn Module, Eindprijs, Korting en Advies. Eindprijzen per onderdeel en totaal zijn zwart en vetgedrukt; positieve kortingen zijn groen. Op mobiel staat de modulenaam over de hele rij met de drie bedragen eronder. Het startpakket benoemt de drie inbegrepen modules; benodigde uitbreidingen worden afzonderlijk getoond.

De tabellen worden met DOM-tekstnodes opgebouwd uit `quoteRows(resolve(...))`; onbekende URL-IDs worden genegeerd. Er staan geen bewerkbare velden in het prijsvoorstel. De bestaande readonly textarea blijft verborgen als tekstuele drager voor `details[modules]`, zodat de bestaande formulierverwerking dezelfde selectie en actuele prijzen ontvangt. Het tekstvoorstel bevat nu ook de eindprijzen per onderdeel en blijft met alle modules onder de bestaande limiet van 1.000 tekens. Een formulierreset herstelt de berekende selectie.

De bestaande 1.024-combinatietest controleert ook de sommen van de getoonde rijen. `scripts/test_contact_quote_browser.cjs` controleert op 320, 390, 844 en 1.440 pixels de starter, een selectie met benodigde voorgangers, alle modules en onbekende IDs: bedragen, groene korting, zwarte vetgedrukte eindprijzen, geen bewerkbare tabelvelden, geen pagina-overloop en behoud van de tekst in FormData. Er is geen contactaanvraag of mail verstuurd. Visuele controle gebruikt een tijdelijke opname buiten de repository. Cacheversie: `20261027-quote-table`.
