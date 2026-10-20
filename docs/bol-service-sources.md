# App voor bol-ondernemers: bronnen en afbakening

De dienstenpagina `/bol-ondernemers/` beschrijft de bestaande app vanuit het dagelijkse werk van een bol-ondernemer. De homepage en dienstenpagina geven een directe ingang. E-commerce, forecasting en de Smartlife-case verwijzen naar de verdieping. CTA's gebruiken het specifieke contactonderwerp `bol-tools`.

## Onderbouwing

De volgende bronbestanden zijn uitsluitend gelezen in `C:/Users/thoma/.codex/worktrees/f440/opticore-intern`; de applicatie en de andere checkout met werk in uitvoering zijn niet gewijzigd.

- `docs/bol_ranking.md`, `docs/bol-ranking-keyword-onboarding.md`, `docs/bol-ranking-monthly-keywords.md` en `static/bol_ranking.js`: productselectie, zoekwoorden, posities, historie, zoekvolume en landencontext. Geen exacte meetfrequentie of garantie op een positie op de publieke pagina gezet.
- `apps/operations_dashboard/marketing_agent.py`, `shared/marketing_agent_recommendations.py`, `docs/bol-phase-strategy.md`, `docs/ads-diagnosis.md`: onderbouwde voorstellen, ondersteunde campagneacties na bevestiging, controle op actuele context, uitstellen/afwijzen en koopblokbeoordeling via `NOT_BEST_OFFER`-signalen. Geen onbeperkte autonome uitvoering of volledig historische koopblokmeting geclaimd.
- `apps/operations_dashboard/webshop_ai.py`, `docs/product_improvements.md`, `docs/gs1_publications.md`: nieuwe productconcepten, gecontroleerde brongegevens, EAN/GS1, publiceren naar ProductFlow en geselecteerde verbeteringen aan bestaande artikelen. De verdere publicatieroute naar bol wordt per inrichting afgestemd.
- Bestaande forecast-, voorraad- en omzetonderdelen, `docs/daily-article-trends.md`, `docs/weekly-signals.md`, de bestaande forecasting-/voorraadpagina's en de expliciete gebruikersinformatie: omzetforecast, YoY, trends, voorraad en bestelsuggesties. Een forecast blijft herkenbaar als verwachting; geen gegarandeerde aantallen of besparingen.

Officiële bol-bronnen gecontroleerd voor de uitleg van ACoS, TACoS en conversies:
- https://partnerplatform.bol.com/nl/idp/metrics-sp
- https://partnerplatform.bol.com/nl/idp/analyseer-resultaten-sp

## Schermbeelden

`bol-ranking-demo.png` en `bol-marketing-agent-demo.png` tonen de bestaande HTML/CSS/JS en geselecteerde pure renderfuncties uit de app, lokaal gerenderd met uitsluitend fictieve `DEMO-*` artikelen, zoekwoorden en cijfers. Geen database, bedrijfsgegevens, credentials of live API-koppeling geladen. De ranking-JS leest alleen een lokale synthetische JSON-route; POST is geblokkeerd. De marketingpagina voert geen app-JavaScript of acties uit. De website benoemt de fictieve gegevens bij ieder schermbeeld. Er is geen AI-afbeelding als echte app voorgesteld.

Het bestaande `dashboard-forecast-demo.jpg` is eveneens de echte forecastinterface met fictieve gegevens. De bron- en screenshotfixtures staan buiten Git onder `.codex/website-checks`; alleen de bedoelde publieke afbeeldingen worden gepubliceerd.

## Controle

HTML/SEO, identieke aliases, sitemapbereikbaarheid, nieuwsrenderer, PHP-syntax, responsive weergave, ankers, afbeeldingslinks en het vooraf geselecteerde contactonderwerp. Geen echte contactaanvraag of advertentiewijziging tijdens controle uitvoeren.
