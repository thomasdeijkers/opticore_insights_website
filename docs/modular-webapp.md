# Modulaire webapp

De pagina `/modulaire-webapp/` bevat twaalf modules met door de eigenaar op 25 oktober 2026 goedgekeurde inrichtings- en maandprijzen. De basisomgeving (€ 1.500 inrichting, € 79/mnd) is altijd verplicht en wordt eenmaal geteld. Het blijft een aanvraagselectie, geen bestelling of moduleactivatie. Alle bedragen zijn exclusief btw; offerte en afgesproken scope blijven nodig.

## Prijzen en implementatievolgorde

De publieke kaarten tonen statisch de tarieven en voorwaarden, ook zonder JavaScript. `assets/js/modular-webapp.js` bevat dezelfde catalogus met bedragen en afhankelijkheden, berekent de transitieve selectie zonder dubbeltelling en sorteert voorgangers vóór uitbreidingen. `scripts/test_modular_webapp.cjs` controleert de catalogus tegen de HTML-kaarten en controleert prijzen, volgorde, gedeelde afhankelijkheden en onbekende IDs.

Iedere module vereist de basis. Aanvullende voorgangers:

- Forecasting: omzetrapportage.
- Inkoop en bestellen: omzetrapportage en voorraad. Forecasting is optioneel.
- Magazijn en logistiek: voorraad en orders en retouren.
- Marketing en ranking: omzetrapportage en productbeheer.
- Financieel overzicht: omzetrapportage.
- Taken en controles: planning en projecten.
- Omzetrapportage, voorraad, productbeheer, orders en retouren, documentverwerking en planning kunnen direct op de basis starten.

De basis telt mee voordat een module is gekozen. Vereiste voorgangers worden automatisch aangevinkt en blijven vergrendeld zolang een gekozen uitbreiding ze nodig heeft. Verwijder eerst die uitbreiding. Handmatig gekozen voorgangers blijven behouden bij verwijderen van een uitbreiding; alleen automatisch toegevoegde voorgangers vervallen als ze niet meer nodig zijn. Reset wist alle modules en behoudt de verplichte basis.

Het contactconcept bevat alleen bekende module-ID’s, benodigde voorgangers, basis en prijsindicatie. De klant kan de tekst bewerken; alleen de laatste contactknop verstuurt mail. Documentverwerking heeft aanvullend verbruik. Nieuwe koppelingen, aanvullend maatwerk en externe diensten vallen buiten de selectietotalen. De basis omvat alleen een al bestaande standaardkoppeling na controle van de situatie; de API-catalogus is geen lijst met gegarandeerd beschikbare connectors.

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
