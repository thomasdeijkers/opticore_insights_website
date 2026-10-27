# Vindbaarheid van webappkosten

De centrale prijsberekening blijft `/webapp-samenstellen/`. De pagina geeft een direct antwoord, eigen prijsvoorbeelden, de eerste twaalf maanden aan vaste kosten, kostendrijvers en zichtbare uitklapbare antwoorden. De modulekeuze blijft het belangrijkste gereedschap. Geen verzonnen marktgemiddelden, keurmerken, reviews, zoekvolumes of positiegaranties.

## Onderwerpen en bestemming

| Zoekintentie / voorbeelden | Primaire pagina |
| --- | --- |
| wat kost een webapp, webapp kosten, webapplicatie kosten, kosten webapp laten maken | `/webapp-samenstellen/` |
| webapp prijs berekenen, webapp calculator, webapp samenstellen, prijs bedrijfsapp | `/webapp-samenstellen/` |
| maandelijkse kosten webapp, webapp hosting en onderhoud kosten | `/webapp-samenstellen/#veelgestelde-vragen` |
| modulaire webapp laten maken, bedrijfsapplicatie, marketplace werkplek | `/modulaire-webapp/` |
| voorraad, inkoop, orders, productbeheer, listingoptimalisatie, Product Image Studio, marketing en forecasting modules | Uitleg en demo via `/modulaire-webapp/`, kosten via de calculator |
| webapp prijzen en pakketten, diensten vergelijken | `/prijzen/` |
| API koppeling webapp, webshop of marketplace koppelen | `/api-integraties/`, `/marketplace-koppelingen/`, `/webshop-koppelingen/` |
| database verbruik kosten, AI aanvragen kosten | `/gebruikskosten/` |
| volledig maatwerk webapp, software op maat kosten | Calculator legt de scopegrens uit; aanvullende functies vereisen een afzonderlijke offerte |

Dit is een inhoudelijke indeling, geen lijst met gemeten zoekvolumes. Synoniemen worden natuurlijk gebruikt waar het antwoord staat. Geen aparte, vrijwel identieke landingspagina per zoekterm.

## Onderhoud en controles

`scripts/module_prices.py --write` rendert ook de gemarkeerde kostenfragmenten uit `scripts/webapp_cost_content.py`. Alle voorbeelden worden doorgerekend met **dezelfde JavaScript-resolver als de calculator**, inclusief vereiste modules. Daardoor blijven startbedragen, marketingafhankelijkheden en jaarbedragen gelijk aan de daadwerkelijke selectie. De statische HTML werkt ook zonder JavaScript. Dit bestaande script wordt bij elke deployment met `--check` gecontroleerd. Pas de voorbeeldprijzen nooit los in HTML aan.

De pagina en HTML-alias zijn identiek. Queryvarianten met `modules` houden de vaste canonical. De titel en hoofdtekst richten zich op kosten; de andere landingspagina’s houden hun eigen functie. Schema bevat de bestaande organisatie, website, pagina en broodkruimels, plus een Service die overeenkomt met het zichtbare aanbod. Geen fictieve beoordelingen of beloften over rich results. FAQ-antwoorden zijn zichtbare inhoud, geen belofte op een FAQ-resultaat.

De homepage, modulepagina en prijzenpagina linken met beschrijvende tekst naar de calculator. Sitemap en lokale zoekindex worden bijgewerkt bij publicatie.

## Meten na publicatie

Gebruik Google Search Console voor de canonical URL: controleer indexering en door Google gekozen canonical, vraag na een inhoudelijke wijziging herindexering aan en vergelijk vertoningen, klikken, CTR en gemiddelde positie per relevante zoekopdracht. Splits mobiel en desktop. Gebruik een periode van 28 dagen met vergelijking met de vorige periode; een nieuwe pagina heeft eerst tijd nodig om gegevens op te bouwen. Bewaar echte uitkomsten en pas inhoud aan op vragen die bezoekers daadwerkelijk stellen. Zonder toegang zijn indexeringsstatus, posities en zoekvolumes niet vastgesteld.

Bronnen, geraadpleegd 27 oktober 2026:

- https://developers.google.com/search/docs/appearance/title-link
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- https://developers.google.com/search/help/crawling-index-faq

## Uitbreiding aanbod op 27 oktober 2026

Twaalf modules: de drie inbegrepen modules plus negen uitbreidingen. Klantenservice en tickets en Facturen en offertes kosten ieder € 200 inrichting en € 20 per maand, met adviesprijzen 20% hoger. Beide vereisen Orders en retouren uit het startpakket. Het zijn functies voor de eigen onderneming; geen dienstfacturen of beheer van andere klanten. Beide hebben vier echte demoschermen met fictieve data, voor mobiel, tablet en desktop. De modulelinks openen respectievelijk Mailtickets en Orderfacturen in de demo. Alle modules samen: € 3.395 inrichting en € 419 per maand, exclusief btw en verbruik.

De rustige demo op de calculator is standaard dichtgeklapt en laadt het darkmode-dashboard in een lazy iframe bij openen. De moduletegels gebruiken rekbare tekstkolommen zodat de maandprijzen op dezelfde hoogte staan; er wordt geen beschrijving afgekapt.
