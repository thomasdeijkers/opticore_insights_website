# Screenshotgalerij

## Aansluiten op de eigen WebApp — 28 oktober 2026

De gedeelde demo gebruikt nu de kleuren, typografie, werkbalk, panelen, tabbladen en KPI-opmaak uit `opticore-intern@f4ab0d72`, `apps/operations_dashboard/static/style.css`. Alle 49 klantgerichte pagina’s behouden hun eigen fictieve gegevens en lokale interacties. Beheergegevens van andere klanten worden niet overgenomen.

Marketing Agent en Advertentie Campagnes gebruiken de native componentklassen en CSS uit `marketing_agent.py` / `marketing_agent.css` en `ads_engine.py` / `ads_engine.css`. De twee referentiestijlen bewaren een SHA256 van de bron; alleen hun twee icoon-URL’s zijn ingebed, zodat de demo geen productieserver nodig heeft. `demo-marketing-reference.js` past deze componenten aan op de bestaande fictieve datalaag. Adviezen zijn te filteren en te beoordelen; campagne- en kanaaldetails, voorbeeldperioden, pauzeren en zoekwoorden werken lokaal. De screenshots zijn browsercaptures van dezelfde demo, zonder verbinding met productiegegevens of advertentie-API’s.

Alle Nederlandse modulebeelden en gedeelde management-, voorraad-, forecast-, ranking-, marketing- en listingbeelden worden nu samen met Duits, Engels en Frans tijdens deployment vastgelegd. Ook de dashboardteaser wordt uit deze interface gegenereerd. De picklijst is daarnaast overgenomen uit de definitief gepubliceerde versie `opticore-intern@253e6357` (Deploy VPS-run 40664602476, geslaagd; laatste controle na de definitieve bevestiging). De native DOM-opbouw, bevestigingsdialoog en CSS blijven behouden. Een lokale adapter vervangt het transport naar de API: open orderregels worden per artikel opgeteld, twee fictieve thuiswerksets worden naar muis/toetsenbord uitgesplitst, deelpicks gaan naar Niet gepickt en terugzetten herstelt de werkvoorraad. Er worden geen orders verzonden of voorraadmutaties naar productie gestuurd. De mobiele rij toont de actie links, foto en SKU in het midden en de grotere locatie rechts en de omschrijving eronder, zoals in de definitieve versie. Klikken of Enter op een rij klapt de omschrijving open; ook vanuit Niet gepickt kan een pick worden teruggezet. Dashboardtegels en drie picklijstcaptures gebruiken hetzelfde model. Afdrukken gebruikt de browser, inclusief opslaan als PDF.

De cache bewaart alle gegenereerde Nederlandse beelden; die worden niet als nieuwe binaire output gecommit. Versie `20261028-native-app` vernieuwt de bestaande afbeeldings- en appverwijzingen. `test_native_app_browser.cjs` controleert de marketinginteracties in vier talen en drie breedtes en de gedeelde weergave van alle 49 klantpagina’s op mobiel en desktop.

## Volledige toepassing — aanvullende ronde 22 oktober 2026

Alle neutrale applicatiebeelden, inclusief portfolioafbeeldingen, projectcases en het Olympus-nieuwsbericht, staan nu in de gedeelde galerij. Afbeeldingen in portfolio-kaarten openen de beelden; de aparte tekstlink blijft naar het projectverhaal gaan. Documentcontrole, documentintake en weekstaten hebben elk twee afzonderlijk ontworpen mobiele weergaven. De beveiligingspagina gebruikt twee neutrale inlogvoorbeelden (inloggen en extra verificatie) en één desktopvoorbeeld. De originele Olympus-inlogafbeeldingen zijn verwijderd; de officiële Google-appbeelden blijven als toegeschreven productuitleg staan.

`scripts/screenshot_gallery.py` definieert de aanvullende collecties en wordt ook door de nieuwsrenderer gebruikt. `scripts/check_screenshot_galleries.py` controleert tijdens deployment dat ieder neutraal applicatiebeeld in een galerij staat, dat twee verschillende mobiele previews aanwezig zijn en dat desktopbeelden en de actuele gedeelde viewer geladen worden. Dit voorkomt dat toekomstige project- of nieuwsupdates weer losse desktopbeelden terugzetten.

De componentversie is `20261022h`; de vernieuwde URL's verversen de CSS/JS-component. De live host gaf geen Cache-Control-header terug na een proef met `.htaccess`. Die niet-werkende configuratie is verwijderd; er is geen wijziging aan de servercache bevestigd. Beide domeinvarianten en de HTML-alias van de bolpagina toonden vóór deze ronde al de neutrale rankingbeelden. De oude afbeelding uit de aangeleverde screenshot kon niet op de huidige server worden gereproduceerd. Na publicatie zijn de actuele galerijversie en beelden op beide domeinen gecontroleerd.

De homepage, dienstenpagina, dashboardpagina, bol-pagina en Smartlife-case gebruiken dezelfde galerij. De bestaande verklarende onderschriften onder foto's zijn verwijderd. De bronverwijzingen naar bol blijven bij de inhoudelijke uitleg staan. Nieuws krijgt dezelfde viewer via de nieuwsrenderer.

## Beelden

De dashboard- en applicatiebeelden gebruiken vanaf 22 oktober 2026 een neutrale huisstijl. Ze illustreren de functionaliteit met fictieve gegevens; het zijn geen kopieën van de productie-interface. De zeven mobiele JPEG's zijn rechtstreeks uit de responsive voorbeeldpagina's vastgelegd op 390 × 844 pixels. Het gaat om management, voorraad, forecasting, rankingoverzicht en -details, marketingoverzicht en -voorstellen. Er zijn geen desktopbeelden tot een telefoonbeeld vervormd.

De bron staat in `scripts/neutral_visuals.py` en `scripts/neutral_visuals.css`; de beeldnamen, afmetingen en omschrijvingen staan in `scripts/neutral_visuals_manifest.json`. De generator schrijft statische HTML buiten de checkout, met uitsluitend fictieve artikelen, bedragen en metingen. Een lokale statische server en browser leggen de beelden vast. Er wordt geen applicatieomgeving, database of API geladen en de appcheckout is niet gewijzigd. Alleen de bedoelde publieke JPEG's onder `assets/img/examples/` worden gepubliceerd. De oude afbeeldingen van de productie-interface zijn verwijderd.

## Gedrag

- Alleen een telefoonformaat rechtop (maximaal 599 px breed en portrait) toont de mobiele collectie. Tablet, desktop en landscape tonen uitsluitend desktopbeelden. Dit gebruikt schermbreedte en oriëntatie, zonder cookies of apparaatregistratie.
- Er zijn geen Mobiel/Desktop-keuzeknoppen. De slider en pop-up bladeren uitsluitend door de passende collectie. Als het apparaat draait, wordt de collectie direct aangepast, ook in een open pop-up; waar mogelijk blijft hetzelfde onderwerp geselecteerd.
- Geen automatisch afspelen. Bladeren werkt met knoppen, pijltjestoetsen en horizontaal vegen. Verticaal scrollen en pinch-zoom blijven beschikbaar.
- Een native `dialog` toont de afbeelding met een vaste Sluiten-knop, vorige/volgende, teller en vergroten/passend maken. Escape sluit ook. Focus en paginascroll worden hersteld.
- Andere directe foto- en screenshotlinks gebruiken dezelfde viewer. Zonder JavaScript blijven gewone afbeeldingslinks en een passende eerste afbeelding beschikbaar.
- Afbeeldingen hebben alternatieve tekst. Fictieve gegevens staan in de beelden en compact in de viewer aangegeven.

## Controle

JavaScript-syntax, HTML/SEO, gelijke URL-aliases, nieuwsrenderer en sitemap. Browsercontrole op 320/390 portrait, telefoonlandscape, tablet en desktop, passende collectie, meerdere afbeeldingen, draaien met open pop-up, vergroting, sluiten, Escape, pijltjestoetsen, focusherstel en scrollherstel. Geen echte campagneactie of contactaanvraag uitgevoerd.

## Voorbeelden bij dienstenteksten

Negen pagina's tonen een concreet praktijkvoorbeeld met korte toelichting, dezelfde galerij en een projectlink: procesautomatisering, forecasting, voorraadanalyses, KPI-dashboard, data-analyse, e-commerceautomatisering, API-integraties, marketplace-synchronisatie en productdata. De teksten beschrijven de functionaliteit en welke vervolgstap die ondersteunt. Achterliggende koppelingen worden niet als zichtbare schermen voorgesteld; het productdata-voorbeeld benoemt expliciet de analysekant van productbeheer. Ook deze voorbeelden gebruiken de gedeelde neutrale beeldcollectie met fictieve gegevens.

## Dark mode als standaard — 26 oktober 2026

De 27 gedeelde appvoorbeelden en 40 modulebeelden zijn opnieuw gerenderd in dark mode, met nieuwe `-dark`-bestandsnamen. Manifest, galerijcollecties, nieuws en alle paginaverwijzingen gebruiken de nieuwe beelden. De galerijcontrole bewaakt de donkere standaard in het manifest. De nieuwe dashboardteaser is een afzonderlijke scrollbare link naar de volledige demo; de bestaande galerijen behouden hun twee telefoonpreviews en vergrootvenster. Zie [visual-assets.md](visual-assets.md) voor het captureproces en validatie.


## Meer schermen per module — 27 oktober 2026

Beide WebApp-modulepagina’s tonen nu vier tot zes verschillende schermen per module, vastgelegd uit de publieke klantdemo in darkmode met uitsluitend fictieve gegevens. `content/module-screenshots.json` legt de 46 scènes en hun routes, tabs en eventuele interacties vast. Productbeheer, Marketing en Logistiek hebben zes scènes; de andere zeven modules vier. Elke scène heeft een afzonderlijke desktop-, tablet- en mobiele browsercapture: 138 beelden in totaal. De bestaande 60 modulebeelden worden vernieuwd; 78 aanvullende opnamen worden toegevoegd.

Achter Meer info staan vier previews in een raster, met korte schermtitels en een knop om alle vier of zes beelden te openen. De bestaande viewer ondersteunt vergroten, terug/vooruit, Escape en focusherstel. Alleen modulegalerijen krijgen dit uitgebreidere raster; andere galerijen behouden hun bestaande gedrag. Het passende apparaat wordt gekozen op dezelfde breedtegrenzen als de demo (760 en 1100 pixels). De componentversie op deze twee pagina’s is `20261027-module-screens`.

Reproduceren: serveer de website lokaal op 127.0.0.1:8765 en voer `node scripts/capture_module_screenshots.cjs` uit met de bestaande Playwright-runtime (`PLAYWRIGHT_MODULE_PATH` en zo nodig `PLAYWRIGHT_CHROMIUM_EXECUTABLE`). Dit script staat alleen lokaal verkeer toe en laadt geen productieapp, database of API. Daarna `python scripts/module_screenshots.py --write` om de twee pagina’s en aliassen bij te werken. De generatorcontrole bewaakt minimaal vier verschillende captures per apparaat en module, JPEG-bestanden en gelijke pagina-aliassen. De workflow controleert de bron en afbeeldingen vóór deployment.

`node scripts/test_module_galleries_browser.cjs` controleert op de lokale server alle schermen op beide pagina’s, op mobiel, tablet en desktop: vier previews, juiste beelden per apparaat, afbeeldingsdecodering, alle viewerpagina’s, sluiten/focusherstel en horizontale overloop. De bestaande moduleprijstest blijft de tarieven en alle 1.024 modulecombinaties bewaken.


## Draaien naar landscape — 27 oktober 2026

Deze regels vervangen de eerdere selectie uitsluitend op schermbreedte. Een telefoon tot 760 pixels breed gebruikt in portrait de mobiele screenshots. In landscape gebruikt ook een kleinere telefoon de tabletbeelden. Een apparaat met een grove primaire aanwijzer (touch) gebruikt in landscape de tabletweergave, ook als de breedte boven 1100 pixels komt. Gewone vensters van 761–1100 pixels blijven de tabletweergave gebruiken; bredere desktopvensters met een muis blijven desktop, ook als het venster kort is. De selectie gebruikt mediaqueries, zonder apparaatherkenning via user-agent of opslag.

De picture-bronnen op de homepage en modulepagina schakelen met de oriëntatie mee. De teaser wordt in landscape maximaal 834 pixels breed en gebruikt de beschikbare kolom; bij een korte viewport is het verticale scrollvenster compacter. In de app blijven tabletpanelen en een inklapbaar menu beschikbaar, met een compacte werkbalk voor telefoon-landscape. Terugdraaien herstelt de portraitopmaak. Bestaande screenshots hoeven niet opnieuw vastgelegd te worden: de portrait-, tablet-portrait- en desktopformaten van de captures veranderen niet.

Een open galerij houdt tijdens draaien hetzelfde onderwerp geselecteerd en wisselt het bijbehorende mobiele/tabletbeeld. `scripts/test_responsive_demo_browser.cjs` test beide teasers op 390×844, 844×390, 667×375, 568×320 en 1194×430 met touch. De test controleert daarnaast draaien met geopende viewer, herstel van de pagina-scroll, de app met geopende kanaaldetails, themabehoud, menu/inert-gedrag, geen horizontale overloop en desktopbehoud op 1280×500. Opname voor visuele controle wordt alleen buiten de repository bewaard via `DEMO_ROTATION_REPORT_DIR`. De componentversie is `20261027-landscape`.
