# Modulaire webapp

De informatiepagina `/modulaire-webapp/` beschrijft tien modules met door de eigenaar op 25–26 oktober 2026 goedgekeurde inrichtings- en maandprijzen. De basisomgeving (€ 1.500 inrichting, € 79/mnd) is altijd verplicht en wordt eenmaal geteld. Het blijft een aanvraagselectie, geen bestelling of moduleactivatie. Alle bedragen zijn exclusief btw; offerte en afgesproken scope blijven nodig.

## Aparte rekenpagina

De interactieve modulekeuze staat op `/webapp-samenstellen/` (ook als `.html`-alias).
De informatiepagina houdt de tien modulekaarten en hun `gegevens-*`-ankers,
met per module een link naar de rekenpagina met die keuze. Bestaande knoppen
om samen te stellen gaan rechtstreeks naar de rekenpagina. Oude WebApp-URL’s
met `?modules=...` leiden via een gevalideerde selectie door naar de calculator.

De calculator toont de netto inrichting en het maandtotaal in een sticky balk
onder de hoofdnavigatie, op desktop en mobiel. `ResizeObserver` stemt de
bovenmarge af op de werkelijke headerhoogte. De prijsopbouw, kortingen en lijst
met modules zijn bovenin via een toegankelijk `details`-paneel te openen; er
staat geen prijswidget onder de kaarten. De balk en het paneel gebruiken dezelfde
berekening. Beide aanvraagknoppen geven dezelfde selectie aan het contactformulier.
Wijzigingen blijven via de URL bewaard bij herladen. De teruglink vanuit contact
herstelt de keuze op de aparte rekenpagina.

## Prijzen en implementatievolgorde

Iedere modulekaart combineert keuze, tarieven, voorwaarden en een uitklapbare uitleg over essentiële gegevens, extra bronnen en verwerking. De tien verklaringen staan niet meer in een aparte sectie; hun bestaande `gegevens-*`-ankers blijven behouden. Het oude `gegevens-per-module`-anker verwijst naar de modulekaarten. De publieke kaarten op beide pagina’s tonen statisch de tarieven en voorwaarden, ook zonder JavaScript. `assets/js/modular-webapp.js` bevat dezelfde catalogus met bedragen en afhankelijkheden, berekent de transitieve selectie zonder dubbeltelling en sorteert voorgangers vóór uitbreidingen. `scripts/test_modular_webapp.cjs` controleert de catalogus tegen de HTML-kaarten en controleert prijzen, volgorde, gedeelde afhankelijkheden en onbekende IDs.

Iedere module vereist de basis. Aanvullende voorgangers:

- Forecasting: omzetrapportage.
- Inkoop en bestellen: omzetrapportage en voorraad. Forecasting is optioneel.
- Magazijn en logistiek: voorraad en orders en retouren.
- Marketing en ranking: omzetrapportage en productbeheer.
- Financieel overzicht: omzetrapportage.
- Signalen en controles: omzetrapportage en voorraad.
- Omzetrapportage, voorraad, productbeheer, orders en retouren kunnen direct op de basis starten.

De basis blijft € 79/mnd. De standaard maandtarieven van de losse modules blijven € 40–€ 130. Vanaf 26 oktober 2026 wordt per module € 10 korting gerekend bij standaard € 40/€ 60, € 20 bij standaard € 80/€ 100 en € 30 bij standaard € 130. De betaalde moduleprijzen zijn daarmee € 30–€ 100 per maand; de basis krijgt geen maandkorting. Daardoor eindigt ieder selectietotaal op 9. Inrichtingskosten blijven gelijk. De basis telt mee voordat een module is gekozen. Vereiste voorgangers worden automatisch aangevinkt en blijven vergrendeld zolang een gekozen uitbreiding ze nodig heeft. Verwijder eerst die uitbreiding. Handmatig gekozen voorgangers blijven behouden bij verwijderen van een uitbreiding; alleen automatisch toegevoegde voorgangers vervallen als ze niet meer nodig zijn. Reset wist alle modules en behoudt de verplichte basis.

Het contactconcept bevat alleen bekende module-ID’s, benodigde voorgangers, basis en prijsindicatie. Het webapponderwerp opent automatisch, met een bewerkbaar tekstvak bovenaan met de genummerde implementatievolgorde en bedragen. De inhoud gaat als `details[modules]` mee in het bestaande formulier; de mailbody bewaart de regelafbrekingen. Een teruglink herstelt de modulekeuze uit bekende ID’s. De klant kan de tekst bewerken; alleen de laatste contactknop verstuurt mail. Nieuwe koppelingen, aanvullend maatwerk en externe diensten vallen buiten de selectietotalen. De basis omvat alleen een al bestaande standaardkoppeling na controle van de situatie; de API-catalogus is geen lijst met gegarandeerd beschikbare connectors.

De prijzenpagina en `.html`-aliassen volgen dezelfde tarieven en verwijzen naar de modulekeuze. De galerij toont neutrale voorbeelden met fictieve gegevens.

## API-voorbeelden

De onderstaande catalogus bevat 45 voorbeelden, gegroepeerd op toepassing. Ze verwijzen naar informatie van de leverancier. Bereikbaarheid gecontroleerd op 22 oktober 2026. Het CCV Shop-developerportaal reageerde niet binnen de controletermijn; de publieke CCV Shop-site is daarom de link bij dat voorbeeld. De eBay- en Salesforce-portalen beperken geautomatiseerde HTTP-verzoeken, maar de officiële developerpagina’s zijn ook via webzoekresultaten gecontroleerd. De overige developerbronnen reageerden succesvol. API-rechten, abonnementsvoorwaarden, ondersteunde endpoints en limieten worden per klant gecontroleerd.

### Webshops

- Shopify: https://shopify.dev/docs/api/admin-graphql/latest
- WooCommerce: https://developer.woocommerce.com/docs/apis/rest-api/
- Adobe Commerce / Magento: https://developer.adobe.com/commerce/webapi/
- CCV Shop: https://www.ccvshop.nl/
- Lightspeed eCom: https://developers.lightspeedhq.com/ecom/introduction/introduction/
- Shopware: https://developer.shopware.com/docs/guides/integrations-api/

### Marketplaces

- bol: https://api.bol.com/retailer/public/Retailer-API/
- Amazon Selling Partner: https://developer-docs.amazon.com/sp-api/
- Amazon Ads: https://advertising.amazon.com/API/docs/en-us
- Mirakl: https://developer.mirakl.com/
- Kaufland: https://sellerapi.kaufland.com/
- eBay: https://developer.ebay.com/develop

### Productdata en kanalen

- ProductFlow: https://cloud.productflow.com/api
- Channable: https://docs.channable.com/
- Akeneo: https://api.akeneo.com/
- Pimcore: https://docs.pimcore.com/platform/Datahub/

### Boekhouding en ERP

- Exact Online: https://start.exactonline.nl/docs/HlpRestAPIResources.aspx
- Moneybird: https://developer.moneybird.com/
- AFAS: https://docs.afas.help/profit/nl/Api/
- Twinfield: https://developers.twinfield.com/documentation
- Microsoft Business Central: https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/api-reference/v2.0/
- Odoo: https://www.odoo.com/documentation/19.0/developer/reference/external_rpc_api.html

### Magazijn en verzending

- Picqer: https://picqer.com/en/api
- QLS: https://knowledge.qls.nl/nl/api-documentatie
- Sendcloud: https://sendcloud.dev/
- PostNL: https://developer.postnl.nl/
- DHL: https://developer.dhl.com/
- MyParcel: https://developer.myparcel.nl/
- ShipStation: https://docs.shipstation.com/

### Marketing en vindbaarheid

- Google Ads: https://developers.google.com/google-ads/api/docs/start
- Google Analytics 4: https://developers.google.com/analytics/devguides/reporting/data/v1
- Google Search Console: https://developers.google.com/webmaster-tools
- Meta Marketing: https://developers.facebook.com/docs/marketing-apis/
- Mailchimp: https://mailchimp.com/developer/marketing/
- Klaviyo: https://developers.klaviyo.com/

### CRM en samenwerken

- HubSpot: https://developers.hubspot.com/docs/api/overview
- Salesforce: https://developer.salesforce.com/docs/apis
- Pipedrive: https://developers.pipedrive.com/docs/api/v1
- Microsoft 365 / Graph: https://learn.microsoft.com/en-us/graph/overview
- Google Workspace: https://developers.google.com/workspace
- Slack: https://docs.slack.dev/apis/

### Betalingen

- Mollie: https://docs.mollie.com/
- Stripe: https://docs.stripe.com/api
- Adyen: https://docs.adyen.com/api-explorer/
- PayPal: https://developer.paypal.com/api/rest/

## Gecombineerde kaarten, screenshots en demo — 26 oktober 2026

Iedere module heeft een uitklapbare sectie `Meer info`: twee modulegerichte voorbeeldweergaven, in mobiele en desktopversie, plus de bestaande uitleg over gegevens en verwerking. De 40 JPEG-bestanden staan onder `assets/img/module-examples/` en zijn browsercaptures van de eigen openbare demo, niet van een productieapp. Ze gebruiken de bestaande screenshotgalerij met twee mobiele previews, desktopselectie en vergrootvenster. Titels en alt-teksten benoemen de fictieve gegevens.

De zelfstandige, niet-geïndexeerde `/demo/modulaire-webapp/` gebruikt `assets/js/module-demo.js` en `assets/css/module-demo.css`. Alle gegevens, orders, leveranciers, campagnes en bedragen zijn fictief en staan in `assets/js/marketplace-demo-data.js`. Er zijn geen API-koppelingen, accounts, cookies, uploads of productiegegevens. Menu, weergavekeuze, zoeken, regeldetails, voorbeeldactie en reset werken lokaal; voorbeeldacties sturen niets naar buiten. De modulepagina sluit af met deze demo in een iframe en biedt een link om hem apart te openen.

Voor nieuwe captures: serveer de website lokaal, bezoek `/demo/modulaire-webapp/?module=<bekend-module-id>&view=overzicht` of `view=details` met de browser op 1280×900 (desktop) en 390×844 (mobiel), en maak JPEG-viewportcaptures. Naam: `<module>-<overzicht|details>-<desktop|mobile>.jpg`. Bron, screenshot en kaart moeten bij dezelfde module horen. Commit alleen de bedoelde publieke assets.

## Bundelkorting

Bij een gezamenlijke eerste afname: 1 module 0%, 2–3 modules 10%, 4–5 modules 20%, 6–12 modules 30% korting op de totale eenmalige inrichting, inclusief basis. Benodigde voorgangers tellen als modules, de basis zelf niet. `resolve()` geeft het brutobedrag, percentage, kortingsbedrag, nettobedrag, standaard maandtotaal, maandkorting en maandtotaal na korting terug. De calculator en het contactconcept tonen die uitsplitsing apart. Latere uitbreidingen krijgen een offerte; de eerste-afnamekorting is niet met terugwerkende kracht van toepassing. De inrichtingskorting geldt niet voor maandtarieven of externe verbruikskosten. De afzonderlijke maandkorting wordt eenmaal per unieke gekozen of vereiste module toegepast. De kaarten, calculator en contactaanvraag tonen de standaardtarieven en maandkorting expliciet; de getoonde kortingen zijn geldig tot en met 31 december 2027. De publieke toelichting bij de prijsberekening blijft kort; uitgebreide rekenvoorwaarden worden daar niet herhaald.

Controles: Node-tests voor tarieven, alle maandtotaalcombinaties, kortingsgrenzen, afhankelijkheden, screenshots en aliassen; browsercontrole op 1440/393/320 px voor selectie, galerij, iframe, zoeken, detailactie, reset en contactoverdracht. De PHP-mailbody is lokaal gecontroleerd met de mailfunctie uitgeschakeld en vervangen door een teststub, zonder bericht te versturen.

## Marketplaceverkopers en gedeelde demogegevens

Het aanbod richt zich op marketplaceverkopers. Planning/projecten en documentverwerking zijn verwijderd uit de selectie, voorbeelden, prijzen en het demomenu. Oude onbekende module-ID�s voegen geen modules of kosten toe.

De demo gebruikt zes fictieve artikelen en vijf kanalen (bol NL, Amazon NL/DE, Praxis NL en Brico BE), inclusief kanalen zonder omzet. Artikelkaarten combineren SKU, demo-EAN, marge, voorraad, forecast, kanaalomzet, publicatiestatus en twaalfmaandentrend. Tellingen, inkoopvoorstellen, eenmalige ontvangsten, verkoopbare retouren, offerinstellingen, listingvoorstellen, campagnebudgetten en signalen werken op dezelfde tijdelijke browserstatus. Reset herstelt de seed. Filters en afrekeningen gebruiken dezelfde kanaalberekeningen. Gewogen ACoS en TACoS hebben verschillende noemers; marge, resultaat en tegoed worden apart getoond.

Functionele aansluiting is gecontroleerd tegen de interne artikelkaart in `main.py` en de documentatie `docs/purchase_orders.md`, `docs/fulfilment.md`, `docs/ads-engine.md` en `docs/bol_ranking.md` van opticore-intern. De openbare demo bevat eigen neutrale HTML/CSS/JavaScript en fictieve data; geen private UI, runtimegegevens of koppelingen. `scripts/test_marketplace_demo.cjs` controleert onder meer kanaalreconciliatie, reserveringen, voorraadvalidatie, eenmalige ontvangsten en signaalhistorie.

De bestaande openbare kanaallogo�s worden gebruikt voor herkenbaarheid, met behoud van verhouding en kleuren. De witte bol-markering staat op de blauwe merkachtergrond. De iframehoogte volgt de viewport en geopende detailvensters worden onder de vaste websitekop uitgelijnd.

## Controle aparte calculator — 26 oktober 2026

De catalogus- en afhankelijkheidscontrole blijft alle combinaties doorrekenen.
Een geïsoleerde DOM-controle op de echte HTML en JavaScript controleerde beide
prijsweergaven, benodigde modules, handmatige keuzes, reset, sluiten van het
prijspaneel, herstel via de URL en overdracht naar het contactformulier.
De controle gebruikte jsdom buiten de repository, zonder browser of netwerk.
Visuele browsercontrole was niet beschikbaar: de Windows-bediening kon de
huidige browser-URL niet betrouwbaar vaststellen en werd afgebroken.
