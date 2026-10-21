# Screenshotgalerij

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
