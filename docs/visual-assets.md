# Project brands and category icons

## Mobiele document- en inlogvoorbeelden — aanvullende ronde

Negen aanvullende PNG-browsercaptures maken de collectie volledig voor telefoonweergave: twee voor documentcontrole, twee voor weekstaten, twee voor dossierintake, twee voor inloggen/verificatie en één desktopinlogvoorbeeld. Ze zijn zonder beeldbewerking vastgelegd vanuit de code-native voorbeelden op de manifestafmetingen. De collectie telt nu 27 beelden (17 mobiel, 10 desktop). Alle nieuwe personen, dossiers, uren en bedragen zijn fictief. De neutrale verificatieafbeelding bevat geen echte codes of enrollmentgegevens.

De portfolio-kaarten, projectcases, technische uitleg en nieuwsrenderer delen dezelfde collecties via `scripts/screenshot_gallery.py`. De originele lege Olympus-inlogbeelden zijn door neutrale voorbeelden vervangen. Publieke websites, productlogo’s en de officiële bol-, Microsoft- en Google-bronbeelden behouden hun herkenbare productcontext en bronvermelding.

Original assets copied without changes from the existing project repositories:

- `hellosmart.png`: `Home_assistant/transip-migration/dist/assets/dealer-hellosmart.png`.

- `smartlife-domotica.svg`: `Home_assistant/transip-migration/dist/assets/dealer-smartlife.svg`.
- `top-groep-nederland.png`: `top_groep_nederland/apps/dashboard/static/top-groep-nederland.png`.
- `de-valk-advies.webp`: `devalkadvies/logo.webp`.
- `rust-werkt.svg`: `rustwerkt_website/rustwerkt-testsite/assets/img/rustwerkt-logo.svg`.
- `olympus-bouw.png`: `olympus_bouw/public/olympus_bouw_logo.png`.
- `home-assistant-hub.webp`: `Home_assistant/transip-migration/dist/assets/home-assistant-logo.webp`.

The Home Assistant hub project uses the same mark and project name as the
existing website header. It identifies that website project, not Home Assistant
as a commissioning organization. Rust Werkt remains labelled as a website concept.
Brand images retain their original colors and proportions, on white backgrounds.

`assets/img/rubric-icons.svg` is a local, code-drawn set of decorative line icons.
Visible category names remain the accessible labels; icons are aria-hidden.
No external font, icon CDN or runtime dependency is needed.

`project-hellosmart.jpg` is a direct browser screenshot of the public HelloSmart homepage, captured on 2026-10-20; no private store data is shown.

`home-workspace.webp` is a decorative stock workspace photograph by Carter Hightower on Unsplash:
https://unsplash.com/photos/4GD9RphwnZA (Unsplash License).
Downloaded at 1920px wide in WebP format from
https://images.unsplash.com/photo-1743796055651-41c743ff2465?auto=format&fit=crop&fm=webp&q=78&w=1920
on 2026-10-21. It illustrates working with digital tools and notes; it is not presented as an OptiCore office, employee or product screenshot. A light overlay keeps foreground text readable on mobile and desktop.

## Technology topic illustrations

Added for the Power BI, Excel, Python and PostgreSQL explanations and the related links in the dashboard, automation and knowledge overviews. Logos identify the software discussed; their original colors and proportions are preserved. Public source credit is available in the expandable ‘Beeldbronnen’ section on each affected page.

- `technology/power-bi.svg` and `technology/excel.svg`: original Microsoft assets from `https://github.com/microsoft/PowerBI-Icons/tree/main/SVG` (`Power-BI.svg`, `Excel-Workbook.svg`). Repository content is CC BY 4.0; trademark rights remain with Microsoft. See `https://github.com/microsoft/PowerBI-Icons#legal-notices`.
- `technology/python.svg`: official Python Software Foundation symbol from `https://s3.dualstack.us-east-2.amazonaws.com/pythondotorg-assets/media/files/python-logo-only.svg`, linked by `https://www.python.org/community/logos/`.
- `technology/postgresql.png`: original PostgreSQL elephant from `https://www.postgresql.org/media/img/about/press/elephant.png`, linked by `https://www.postgresql.org/about/press/presskit18/#graphics`. See the project's trademark policy at `https://www.postgresql.org/about/policies/trademarks/`.
- `power-bi-customer-report.png` (1954 × 1141) and `power-bi-customer-profitability.png` (578 × 569): unmodified `customer2.png` and `power-bi-dash.png` from `https://learn.microsoft.com/en-us/power-bi/create-reports/media/sample-customer-profitability/`. The Microsoft/obviEnce sample and its context: `https://learn.microsoft.com/en-us/power-bi/create-reports/sample-customer-profitability`. They are labelled as Microsoft sample reports, separately from OptiCore's own project screenshots.

The technology examples now use neutral illustrations for the De Valk Advies, Top Groep Nederland and Smartlife functionality, as described below. Public Power BI samples retain their original layout and attribution.

## Neutral dashboard and application examples — 22 October 2026

At the user's request, fifteen images of the actual application interfaces were replaced with a consistent neutral visual style. No client logos, OptiCore application branding, original app CSS, database, API or application code is included. Figures, names and articles are fictitious. These images illustrate functionality and must not be described as production screenshots.

- Editable source: `scripts/neutral_visuals.py` and `scripts/neutral_visuals.css`.
- Capture manifest: `scripts/neutral_visuals_manifest.json` (page, public filename, old filename, dimensions and alt text).
- Public assets: `assets/img/examples/`. Nine desktop images at 1280 × 900; nine phone images at 390 × 844, including the three listing examples added below.
- Generate static source pages with `python scripts/neutral_visuals.py <scratch-directory>` and serve that directory on loopback. Capture each manifest entry with the browser at the stated viewport size. Commit the reviewed JPEGs, not scratch HTML output.
- The same responsive HTML/CSS produces the phone and desktop layouts. Keep full viewport captures and the gallery's existing automatic device selection.
- Existing product logos and unmodified Microsoft/bol source screenshots remain separate from this neutral example collection. Public website project screenshots are also unchanged.
- The superseded application-interface assets were removed from the repository and are no longer deployed.

## Security and login examples — 22 October 2026

`assets/img/security/` contains two original empty Olympus login screenshots and four unmodified public Google Authenticator assets. These were requested specifically for the security explanation; they do not replace or expose dashboard screens. No credentials, real QR enrollment codes or recovery keys are shown. Source URLs, dimensions and usage distinctions are documented in [security-page.md](security-page.md). Product attribution is visible on `/beveiliging/`.

## Plain screenshot previews — 22 October 2026

All example galleries use the same borderless image layout. There is no inline toolbar, frame, caption panel or enlarge badge. Phone portrait selects the phone collection and shows its first two distinct screenshots side by side; desktop, tablets and phone landscape select one desktop preview. When a collection only has phone images (the official Authenticator examples), its first two phone images also appear on larger screens. A collection with only one suitable image keeps that image on its own.

Clicking either preview opens the existing image dialog at that exact image, with all distinct images for the selected device available by swipe/drag, arrows and keyboard. Closing restores focus. Static `data-screen-preview` and collection counts provide the same initial previews without JavaScript. Public project screenshots outside galleries use the same viewer; portfolio-cover links keep their route to the project story. Image sources and metadata are preserved.

## Listing examples — 22 October 2026

`listing-mobile.jpg`, `listing-editor-mobile.jpg` and `listing-desktop.jpg` are browser captures of the code-native neutral `listing` and `listing-editor` examples in `scripts/neutral_visuals.py`. They illustrate listing checks, a text optimization brief and a proposed title/description. All scores, articles and return counts are fictitious. They do not copy the private application's interface or display customer data. The listing gallery uses the same plain paired phone previews, automatic device selection and closeable swipe viewer as the existing examples.

The explanation was checked against the read-only app sources in `opticore-intern`: `marketing_agent.py` (`_listing_report`, optimization brief, score controls), `shared/product_improvements.py` (article comparison, text proposals and scope), `shared/listing_advice_decisions.py` (start, reject, defer), and the associated listing tests. ProductFlow publication follows the configured supported route; availability depends on account rights and setup. Public content guidance: https://partnerplatform.bol.com/nl/idp/productinformatie.

## Modulevoorbeelden en interactieve demo — 26 October 2026

`assets/img/module-examples/` contains 40 original browser captures of `/demo/modulaire-webapp/`: ten marketplace modules, two views (overview and work details), each at 1280×900 desktop and 390×844 phone size. These are code-native neutral examples with fictional data, captured from `assets/js/marketplace-demo-data.js`, `assets/js/module-demo.js` and `assets/css/module-demo.css`. They do not use production source, private screens, customer branding or real company data. Each module card identifies the images as fictional and uses the shared responsive gallery/viewer. See `docs/modular-webapp.md` for capture URLs and filenames.

Channel identification in these examples reuses the existing public bol, Amazon, Praxis and Brico logo assets. Logos retain their original proportions and colors and identify the demo marketplaces; they do not imply endorsement. Desktop and phone images are recaptured from the same functioning demo, including article, offer and keyword dialogs.


## News brand identification — 26 October 2026

News uses existing Shopify, Smartlife Domotica and Olympus Bouw logos without altering their proportions or colors. `assets/img/technology/openai-developers.svg` is the unmodified OpenAI Developers wordmark served at https://developers.openai.com/OpenAI_Developers.svg and observed in the official developer site's header. It identifies the OpenAI developer publication discussed in the article and links to that source. Source: https://developers.openai.com/; brand guidance: https://openai.com/brand/. Logos identify article subjects and sources, not a partnership or endorsement.


## Donkere appbeelden en prominente demo — 26 oktober 2026

De homepage en WebApp-intro tonen hetzelfde smalle dashboardvoorbeeld met een eigen verticaal scrollvlak en een knop die de volledige demo in een nieuw tabblad opent. De afbeelding zelf is ook die link. Beide pagina’s gebruiken een portretcapture van 390 CSS-pixels breed, gerenderd op driemaal de pixeldichtheid: `assets/img/demo/dashboard-channel-depth-dark-3x.png` (1170 pixels breed, driemaal de volledige dashboardhoogte, lossless PNG). Het venster is 560 pixels hoog; de kaart is maximaal 390 pixels breed, op mobiel 360 pixels. De brede, verkleinde desktopcapture en JPEG-compressie zijn daarmee uit de teaser verdwenen. Gedeelde opmaak staat in `assets/css/demo-teaser.css`. Er is geen automatische animatie. De teaser is een screenshot en verstuurt geen appacties. Het volledige model blijft bereikbaar op `/demo/modulaire-webapp/`.

Het publieke managementdashboard volgt nu de indeling van de eigen app: orders en omzet, een artikelstrook, marketing, signalen, voorraad en inkoop, kanaalomzet en vooruitkijken. De navy/paarse oppervlakken, tegels en oranje menuknop sluiten aan bij het door de gebruiker aangeleverde schermbeeld. Alleen de vorm en werkwijze zijn als referentie gebruikt. De bedragen, producten, orders en metingen worden berekend uit de bestaande fictieve seed; er zijn geen productiegegevens of klantfoto's overgenomen. Het fictieve daggemiddelde is expliciet als zodanig aangeduid. Donker is de standaard; een gebruiker kan licht kiezen en die voorkeur bewaren. De zoekknop in de app doorzoekt de modulekeuzes.

Alle 67 bestaande eigen appvoorbeelden zijn opnieuw vastgelegd in dark mode: 40 modulebeelden en 27 gedeelde galerijbeelden. Eén volledige portretcapture voor beide teasers maakt het totaal 68. De gedeelde beelden voor inloggen, documenten en weekstaten komen uit de eigen neutrale fixtures; waar mogelijk gebruiken de overige beelden de werkende publieke demo. De bestanden hebben `-dark` in de naam om verouderde browsercaches te vermijden. Authentieke screenshots van publieke klantwebsites en officiële leveranciers/appbeelden houden hun werkelijke uiterlijk.

Reproduceerbaar: genereer de fixtures buiten de repository met `python scripts/neutral_visuals.py <fixture-map>`. Serveer de website en die fixtures uitsluitend lokaal op respectievelijk 127.0.0.1:8765 en :8766. `node scripts/capture_app_screenshots.cjs` gebruikt Playwright; `PLAYWRIGHT_MODULE_PATH` en `PLAYWRIGHT_CHROMIUM_EXECUTABLE` kunnen een bestaande lokale runtime aanwijzen. Met `--teaser-only` wordt alleen de portretcapture opnieuw gemaakt. Optioneel schrijft `DEMO_CAPTURE_REPORT` een rapport buiten de repository. De renderer blokkeert alle niet-lokale netwerkverzoeken, gebruikt verse browsercontexten zonder accounts en dwingt dark mode af. Alleen de bedoelde publieke beelden worden opgeslagen onder assets/img; de fixtures en het captureverslag worden niet gepubliceerd.

Gecontroleerd in een geïsoleerde lokale Chromium-renderer op 320, 390 en 1440 pixels: geen horizontale pagina-overloop, verticale teaserscroll, openen van de hele demo, appzoekfunctie en wisselen naar licht. Alle 68 bestanden hebben de afgesproken afmetingen en een donkere achtergrond. De teasers zijn op beide pagina’s op 320, 390 en 1440 pixels gecontroleerd op scherp bronbestand, smalle/hoge vorm, scrollen en doorklikken naar dark mode. De volledige gegevens- en formuliercontroles blijven van toepassing. De screenshots zijn rechtstreeks gerenderd uit HTML/CSS/JavaScript, zonder filters of beeldbewerking.

## Kanaalverdiepingen in de demo — 26 oktober 2026

De dashboardpreview is opnieuw gerenderd na toevoeging van zeven kanalen, de uitklapbare heatmap en jaarprognoses. De kanalen blijven in de screenshot ingeklapt; de volledige demo heeft twee interactieve niveaus: kanaal → twaalf maanden → acht detailcijfers met vorig jaar. MediaMarkt NL en Kaufland DE gebruiken de bestaande publieke logo’s, met uitsluitend fictieve omzet en voorbeeldorders. Alle aantallen per maand/kanaal zijn gehele aantallen en de niveaus tellen op tot dezelfde historie. De heatmap verdeelt het fictieve maandaantal orders over weekdagen en tijdvakken; dit zijn geen echte ordertijdstippen.

De forecast voor 2026 vult januari–oktober aan met november/december op basis van de eerdere historie en YoY-groei; 2027 gebruikt een scenario van 15% groei. Advertenties en € 420 fictieve vaste maandkosten worden van het resultaat afgetrokken. De uitleg staat in een uitklapvenster in de demo. Kleur ondersteunt de bedragen en labels: groen voor groei, rood voor daling, teal voor geopende kanalen en donkerdere vlakken voor maanddetails. Ook in light mode blijven de niveaus en signalen herkenbaar. Gecontroleerd op 320, 390 en 1440 pixels met toetsenbordbediening, beide thema’s, alle kanaal- en maandregels, de heatmap en navigatie naar de artikelen.
