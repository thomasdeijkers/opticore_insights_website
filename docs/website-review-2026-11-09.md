# Concept: omzet per bezorgland — 9 november 2026

Status: **concept ter goedkeuring; niet gepubliceerd**. Websitebasis:
`1dc2185a22620dfbfe21c371c62effed229cf757` (de volledige basiscommit staat in de dashboardproposal). Er is geen
websitepush naar main en geen websiteproductiedeployment uitgevoerd.

## Wat dit voorstel bevat

- Eén zelfstandig praktijkartikel over een bestaande functie: omzet naar bezorgland
  en de verkoopkanalen binnen ieder land. Geen nieuwe apprelease of besparing geclaimd.
- De bestaande OptiCore-identiteit en nieuwsopmaak, met vier gerichte screenshots
  in twee gedeelde galerijen. De beelden worden werkelijk uit de demo gerenderd
  op telefoon, tablet en desktop, in Nederlands, Engels, Duits en Frans.
- Een gerichte correctie van de publieke demo: kanaalregels binnen een land tonen,
  net als de bronapp, hun aandeel in dat land en staan op aflopende omzet. De
  bronapp toont hele euro's; de demo behoudt dat. Het artikel legt uit dat daardoor
  kleine zichtbare afrondingsverschillen kunnen ontstaan. De onderliggende
  fictieve centbedragen blijven exact met elkaar aansluiten.
- Een capture-offset voorkomt dat de vaste appwerkbalk de schermafbeeldingstitel
  bedekt. Er wordt geen klantinformatie, secret of productieactie gebruikt.

## Broncontrole

De landenfunctie is al opgeleverd in `opticore-intern@377e1af6ef24b9030df75205896a946ca76aef9d`.
De twee relevante bronfuncties zijn opnieuw vergeleken met de opgeleverde versie
`d9f6a1f1db50388f84264ede6b3becc23f316f90` (Deploy VPS-run `42539820900`, geslaagd).
`_render_dashboard_country_marketplace_breakdown` en
`_render_revenue_article_country_list` zijn inhoudelijk ongewijzigd. De eerste
bronfunctie toont expliciet de kanaalpercentages en sorteert op omzet; juist die
twee zichtbare details ontbraken nog in de demo. De fictieve datalaag en externe
API-isolatie blijven behouden.

Deze kandidaat actualiseert uitsluitend de landenfunctie en het bijbehorende
artikel/captureplan. Dit is geen claim dat alle andere appontwikkelingen sinds
2 november al naar de demo zijn overgezet. De brede rendercontrole van de
bestaande klantdemo toetst schermen/tabs en responsive werking, en bewijst op
zichzelf geen gelijkheid met alle nieuwste appfuncties.

## Beoordeling en uitvoering

De reviewbeelden staan uitsluitend achter de dashboardlogin; de nieuwe captures
en taalpagina's zijn gegenereerde output en worden niet in Git gecommit.
De dashboardproposal bevat de volledige leesbare teksten in vier talen, de
concrete broncommit, inhoudshash en de private beeldverwijzingen.

Zonder dashboardgoedkeuring blijft alles op de conceptbranch. Na goedkeuring
mag de nachtworker uitsluitend deze kandidaat overnemen. **Alleen voor dit
nieuwe artikel** mag het meegeleverde script de feitelijke publicatiedatum en
bijbehorende vertaalde datumregel invullen:

```
python scripts/finalize_approved_news_date.py --slug webapp-omzet-per-bezorgland --at <werkelijke-tijd-met-tijdzone>
```

Dit is een expliciet onderdeel van het goed te keuren voorstel: de datum in de
kandidaat is een conceptdatum en wordt nooit gebruikt om activiteit terug te
dateren. Het script wijzigt geen titel, alinea, beeld, bron of bestaand artikel.
Bronnen behouden hun echte raadpleegdatum van 9 november. De contracttest toetst
deze beperking en blokkeert het veranderen van een eerder gepubliceerd bericht.
Iedere andere inhoudswijziging of inhoudelijk mergeconflict vereist nieuwe
dashboardgoedkeuring. De werkelijke publicatie, workflow-uitkomst en live-URL's
worden pas na verificatie in de redactiehistorie en dashboardstatus opgeslagen.

De gewone taal-/capturebuild, nieuwsrenderer, zoekindex en sitemap publiceren de
goedgekeurde bron via **Deploy static site to TransIP**. Er wordt maximaal één
WebApp-bericht per kalenderweek gepubliceerd. Het onderwerp jaarverwachtingen
blijft een apart, nog niet vrijgegeven concept voor een volgende week.

## Uitgevoerde controles

- Volledige lokale captureroute: 936 opnamen, met 744 gecontroleerde buitenlandse
  opnamen in het hashmanifest. De 48 nieuwe landenopnamen omvatten vier scènes,
  vier talen en drie apparaten. De gerichte heropname controleerde ook de
  werkbalk-offset en actuele kanaalaandelen; geen Nederlandse restteksten in de
  buitenlandse beelden van dit onderwerp.
- Alle 50 huidige klantdemopagina's en 107 pagina-/tabweergaven zijn in vier talen
  op 390, 834 en 1440 pixels gerenderd: 1284 controles zonder JavaScriptfouten of
  horizontale overloop. De oude inventaristelling van 99 weergaven is gecorrigeerd.
- Twaalf afzonderlijke browsercombinaties controleren de landenregels met het
  toetsenbord, onderliggende centbedragen, zichtbare afrondingsmarges, afbeeldingen
  per taal/apparaat en de gedeelde vergrootviewer.
- De volledige dashboardreviewtekst komt per taal overeen met de gerenderde
  artikeltekst. De demoversie is verhoogd om oude scripts en vertaalcatalogi uit
  de browsercache te halen.
- Bron-, model-, i18n-, galerij-, zoekindex-, metadata- en sitemapcontroles geslaagd;
  356 taalpagina's en 292 indexeerbare URL's. De datumcontracttest beschermt
  bestaande artikelen en alle goedgekeurde inhoud tegen onbedoelde wijzigingen.

Deze controles zijn tegen localhost uitgevoerd. Ze hebben geen echte order,
betaling, e-mail, advertentie, dashboardgoedkeuring of websitepublicatie aangemaakt.
