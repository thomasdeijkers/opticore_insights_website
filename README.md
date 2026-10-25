# OptiCore Insights website

Statische HTML/CSS/JS website voor OptiCore Insights. De site is bedoeld als snelle, onderhoudbare vervanging van de huidige WordPress-site op opticore-insights.nl.

## Structuur

- `index.html` - Home
- `diensten.html` - Diensten
- `modulaire-webapp.html` / `modulaire-webapp/index.html` - Marketplace-modules, prijzen, voorwaarden, bundelkorting, screenshots en contactselectie; zie `docs/modular-webapp.md`
- `demo/modulaire-webapp/index.html` - Zelfstandige interactieve marketplace-demo met gedeelde fictieve artikelgegevens, ook ingesloten onderaan de modulepagina
- `projecten.html` / `projecten/index.html` - Portfolio-overzicht
- `projecten/dashboards`, `projecten/documentverwerking`, `projecten/websites` - Categorieën met echte cases
- `projecten/tijdlijn` - Chronologische weergave met filters
- `website-ontwikkeling.html` - Websiteontwikkeling
- `beveiliging.html` / `beveiliging/index.html` - Beveiliging, wachtwoordhashing, Google Authenticator en toegangsbeheer; zie `docs/security-page.md`
- `kennisbank.html` - Onderwerpen gegroepeerd per toepassing
- `over.html` - Over Thomas Deijkers / OptiCore Insights
- `contact.html` - Contactformulier
- `privacy.html` - Privacyverklaring
- `contact.php` - Simpele PHP mail fallback
- `assets/css/style.css` - Styling
- `assets/js/main.js` - Mobiel menu en lokale mail fallback
- `assets/css/structure.css` - Gedeelde navigatie, broodkruimels en overzichtspagina’s
- `sitemap.xml` - Canonieke, indexeerbare pagina’s
- `.github/workflows/deploy.yml` - Deploy via SFTP naar TransIP

## Lokaal testen

Open `index.html` direct in je browser. Omdat de site statisch is, is er geen buildstap nodig.

Let op: als je het contactformulier lokaal opent via `file://`, gebruikt JavaScript automatisch een mailto-fallback. Op de server probeert het formulier `contact.php` te gebruiken.

## Benodigde GitHub Secrets

Maak in GitHub onder `Settings > Secrets and variables > Actions` deze secrets aan:

- `TRANSIP_SFTP_HOST`
- `TRANSIP_SFTP_USERNAME`
- `TRANSIP_SFTP_PASSWORD`
- `TRANSIP_SFTP_PORT`
- `TRANSIP_SFTP_TARGET`

Voorbeeldwaarden:

- Host: je SFTP hostnaam van TransIP
- Username: je SFTP/hosting gebruikersnaam
- Password: je SFTP wachtwoord
- Port: meestal `22`, tenzij TransIP iets anders aangeeft
- Target: de map waarin je websitebestanden moeten komen, bijvoorbeeld `/www/` of `/public_html/` afhankelijk van je hostingpakket

## Deploy

De workflow draait automatisch bij een push naar `main`.

De workflow uploadt de statische site via SFTP/SSH en maakt de doelmap eerst leeg, omdat `delete_remote_files` op `true` staat. Bestanden zoals `.git`, `.github`, `README.md`, backups en zipbestanden worden uitgesloten.

## Belangrijk voor livegang

Maak eerst een volledige backup van de bestaande WordPress-bestanden en database voordat je deze statische site live zet. Controleer daarna welke map TransIP als webroot gebruikt en upload daar pas de statische bestanden naartoe.

## Paginastructuur en SEO

### Schrijfstijl

Schrijf namens OptiCore Insights, in de wij-vorm of met de bedrijfsnaam. Gebruik bijvoorbeeld ‘onze marketingagent’, ‘we ontwikkelen’ en ‘onze aanpak’; gebruik geen ‘mijn’, ‘ik’ of ‘mij’ voor de onderneming of haar diensten. Pas dit ook toe in projectverhalen, nieuws, metadata en tekstsjablonen voor nieuwe pagina’s.

Beschrijf de persoonlijke loopbaan van Thomas in de derde persoon en houd eerdere functies bij andere werkgevers aan hem gekoppeld. Antwoorden, toestemmingen en berichtconcepten die de bezoeker zelf invult of verstuurt, mogen vanuit die bezoeker in de ik-vorm blijven staan.

Houd het hoofdmenu beperkt tot Diensten, Bol ondernemers, Portfolio, Over OptiCore en Contact. Home blijft bereikbaar via het logo. Gebruik geen streepjes in menuteksten of onderstrepingen bij menu-items, ook niet voor de actieve pagina. Verdiepende routes blijven bereikbaar via de inhoud en voettekst.

Gebruik bij uitleg over software herkenbare originele productlogo’s en relevant beeldmateriaal. Vermeld de bron van openbare voorbeelden en houd die herkenbaar gescheiden van onze eigen opdrachten. Dashboards en applicatiefuncties tonen we in een neutrale huisstijl met fictieve gegevens, zonder de productie-interface of klantbranding te kopiëren. Benoem ze als voorbeeldweergaven en gebruik de gedeelde galerij met vergrootvenster. Zie `docs/visual-assets.md` voor herkomst en gebruik.

De hoofdroute is Home → Diensten / Portfolio → onderwerp of case → Contact. De kennisbank is bereikbaar via de voettekst en gerelateerde onderwerpen.

Elke pagina bevat een unieke titel en metaomschrijving, één H1, een canonieke URL met afsluitende slash en gestructureerde gegevens voor de pagina en broodkruimels. Werk bij wijzigingen ook de bijbehorende `.html`-alias bij; de mapversie `index.html` is de voorkeursroute. De sitemap bevat alleen de canonieke, indexeerbare routes. Oude generieke projectopzetten blijven bereikbaar met `noindex,follow`; de zes uitgewerkte klantcases zijn wel indexeerbaar.

Google kan titels en snippets zelf samenstellen. Vinkjes in metaomschrijvingen zijn tekst en geven geen garantie op een specifieke weergave of positie.

## Bedrijfsscan

De route `/bedrijfsscan/` bevat een vragenlijst, een echte AI-samenvatting en een vooraf ingevuld contactconcept. Alleen de laatste verzendstap verstuurt mail. Zie [configuratie, privacy en controles](docs/business-scan.md). De bestaande deployroute publiceert ook de AI-configuratie **buiten de webroot**, vanuit een GitHub Actions-secret; de sleutel hoort nooit in deze repository.

## Keuzehulpdemo

`/keuzehulpen/` legt de werkwijze, toepassingen en aanpak uit. `/demo/keuzehulp/` sluit de drie originele openbare HTML-toepassingen in vanaf `https://vps.smartlife-domotica.nl/`: `keuzehulp-draadloze-schakelaars.html`, `keuzehulp_thermostaten.html` en `ketelhulp.html`. Er worden geen HTML- of feedkopieën uit de app gepubliceerd. De oude fictieve demo is vervangen.

`assets/js/choice-guide.js` verzorgt toegankelijke tabs en de bekende `voorbeeld`-parameters `schakelaars`, `thermostaten` en `ketelhulp`. De iframes blijven bestaan bij tabwissels, zodat keuzes behouden blijven. Zonder JavaScript staan alle drie de ingesloten voorbeelden onder elkaar. De externe toepassingen houden hun eigen gegevens, huisstijl en scrollgedrag; ‘Open apart’ opent dezelfde hulp in een nieuw tabblad. Controleer bij wijzigingen zowel de buitenpagina als de daadwerkelijke selectie en uitkomst binnen ieder iframe, op telefoon en desktop.

## Metadata controleren en exporteren

`python scripts/metadata.py --check` controleert canonieke titels, omschrijvingen, HTML-aliassen en overeenkomst met Open Graph en Twitter. `--verify-live` vergelijkt alle canonieke pagina’s met de gepubliceerde website. Met `--export <absolute map buiten deze repository>` maak je een HTML-tabel en een tekstlijst met alle URL’s, titels, omschrijvingen, lengtes en robots-instellingen. Bewaar gegenereerde rapporten buiten de gepubliceerde broncode.

Nieuwstitels voor SEO kunnen via `seo_title` in `content/news.json` worden verkort zonder de zichtbare artikelkop of publicatiedatum te veranderen. De renderer houdt paginatitels, sociale metadata en gestructureerde paginagegevens gelijk. Zie [de SEO-afspraken](docs/seo-metadata.md).
