# Platformen verbinden

Vier inhoudelijke dienstenpagina’s leggen koppelingen uit: `/platform-koppelingen/` (overzicht), `/marketplace-koppelingen/`, `/webshop-koppelingen/` en `/verzendsoftware-koppelingen/`. De homepage, dienstenpagina en bolpagina tonen dezelfde drie categorieën met klikbare logo’s. De modulaire webapp, procesautomatisering en REST API-uitleg verwijzen vanuit de tekst naar de verdieping. Hoofdnavigatie blijft compact.

De dienst betreft maatwerk voor beschikbare API’s. Deze pagina’s beloven geen reeds aangesloten account of identieke platformfuncties. Per account, productlijn, regio en abonnement worden endpoints, rechten, terugschrijven, frequentie en kosten geïnventariseerd. Bol-ranking en advertentiefuncties worden niet automatisch aan andere marketplaces toegeschreven. CTA’s selecteren `automation` op het bestaande contactformulier.

## Officiële inhoudelijke bronnen

Gecontroleerd op 22 oktober 2026:

- Amazon SP-API: https://developer-docs.amazon.com/sp-api/ (verwijst door naar developer-docs.amazon).
- Praxis en Brico op Mirakl: https://www.mirakl.com/news/brico-bricoplanit-and-praxis-launch-first-online-diy-marketplace-in-benelux-powered-by-mirakl/
- CCV Shop: https://www.ccv.eu/en/service-contact/developer-portal/webshop-api en https://demo.ccvshop.nl/API/Docs/
- Lightspeed eCom: https://developers.lightspeedhq.com/ecom/introduction/introduction/ (HTTP 200 gecontroleerd; specifieke productlijn vooraf inventariseren).
- Shopify: https://shopify.dev/docs/api/admin-graphql/latest
- QLS: https://knowledge.qls.nl/nl/api-documentatie (verschillende API-documentatie voor huidige fulfilmentsoftware en pakketdienst/nieuwe fulfilmentsoftware).
- Sendcloud: https://www.sendcloud.com/api/ en https://sendcloud.dev/ (huidige v3; geen nieuwe v2-inrichting adviseren).
- Overige voorbeelden: https://developer.myparcel.nl/, https://developer.postnl.nl/ en https://developer.dhl.com/.

## Logo’s

Publieke merkbeelden worden ongewijzigd lokaal getoond als identificatie van mogelijke koppelingen. Geen partnerbadges of claim van een officieel partnerschap. Beeldverhouding behouden met `object-fit:contain`; platformnamen staan ook leesbaar bij de beelden. Externe afbeeldingen worden niet tijdens bezoekerssessies opgehaald.

- Amazon: officiële navigatie op https://sell.amazon.nl/; asset https://m.media-amazon.com/images/G/01/sell/navigation/amazon-logo-squid-menu.svg
- Shopify: officiële homepage https://www.shopify.com/nl; asset https://cdn.shopify.com/shopifycloud/brochure/assets/brand-assets/shopify-logo-shopping-bag-full-color-66166b2e55d67988b56b4bd28b63c271e2b9713358cb723070a92bde17ad7d63.svg
- Lightspeed: ongewijzigde padgegevens van het inline SVG in de officiële navigatie op https://www.lightspeedhq.nl/; zelfstandig SVG met xmlns.
- CCV Shop: publiek logo bij de webshopintegraties van QLS op https://qls.nl/; https://qls.nl/wp-content/uploads/2022/06/CCV-Shop_breed-e1655201222419-300x84.png (het bestand `icon-ccv.svg` is een generiek pictogram en is daarom niet gebruikt).
- QLS: officiële header op https://knowledge.qls.nl/nl/api-documentatie; https://knowledge.qls.nl/hs-fs/hubfs/logo_QLS_PassieVoorEcommerce_RGB.png?width=100&height=56&name=logo_QLS_PassieVoorEcommerce_RGB.png
- Sendcloud: officiële homepage https://www.sendcloud.com/nl/; https://framerusercontent.com/images/42cXDspPEL7fiY0Ghw8qS8d6wAc.svg?width=108&height=108
- Praxis en Brico: bestaande publieke merkafbeeldingen uit `apps/operations_dashboard/static/assets/marketplaces/Praxis.png` en `Brico.png`, alleen deze merkbestanden overgenomen; geen applicatiegegevens of broncode gepubliceerd.
- bol: bestaand lokaal `assets/img/bol-wordmark.svg`.

## Controle

Nieuwsrendering behouden; sitemap en metadata controleren. Nieuwe pagina’s zijn gewone statische HTML met canonicals, social metadata, Service- en BreadcrumbList-gegevens en crawlbare contextlinks. Logo-links wijzen naar het concrete platformonderdeel op de bijbehorende verdiepende pagina. Onder 850px staan de drie categorieën onder elkaar; de logos blijven samen zichtbaar zonder carrousel of horizontale scroll.
