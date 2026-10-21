# Wekelijkse website-update

Dit is de werkwijze voor de door de gebruiker geautoriseerde wekelijkse updates
van opticore-insights.nl. De website mag standaard live worden bijgewerkt.
Werk uitsluitend in `C:/Users/thoma/OneDrive/projects_github/opticore-insights_website`.
De werkmap van de chat kan bij een ander project horen.

## Doel en doelgroep

Schrijf voor ondernemers met €250.000 tot €25 miljoen jaaromzet. Thomas Deijkers
doorziet processen snel, adviseert over verbeteringen en voert die ook uit met
dashboards, automatisering, koppelingen, documentverwerking, websites en keuzehulpen.
Leg uit wat een ontwikkeling voor het dagelijkse werk, grip en inzicht betekent.

Streef per week naar één goed onderbouwd nieuws- of duidingsartikel en één
projectupdate als er aantoonbaar relevant werk is gedaan. Publiceer minder als
er geen betekenisvolle ontwikkeling is. Vul een week niet met herhalingen, losse
zoekwoorden, kunstmatige wijzigingen of gewijzigde publicatiedatums.
Een projectupdate kan meerdere projecten bundelen. Neem alle relevante, nieuwe
projectontwikkelingen van de week mee; maak losse berichten als dat duidelijker is.

## Nieuws en bronnen

- Onderzoek actuele ontwikkelingen, gewoonlijk van de laatste 7–14 dagen, in
  procesverbetering, dashboards, data, API-koppelingen, automatisering, document-AI,
  webontwikkeling en e-commerceprocessen. Niet ieder onderwerp hoeft elke week.
- Open de primaire bron: officiële release notes, documentatie, een leveranciersblog
  of een oorspronkelijke publicatie. Controleer gebeurtenis- en publicatiedatum.
- Scheid bronfeiten van Thomas' eigen duiding en concrete vertaalslag naar het mkb.
  Neem bronlink, oorspronkelijke publicatiedatum en raadpleegdatum op.
- Schrijf oorspronkelijk Nederlands; geen gekopieerde artikelen of verzonnen
  ervaring. Respecteer bron- en citaatlimieten. Geen rangschikkingsgaranties.

## Projectupdates

- Lees `docs/editorial-state.json` en vergelijk de opgegeven repositories alleen
  read-only met hun bewaarde commit. Bekijk relevante broncode, changelogs en
  voltooide taakuitkomsten. Een gebruikersvraag of plan is geen opgeleverde functie.
- Werk kan vanuit andere worktrees zijn gepusht. Haal voor de broncontrole zo nodig
  alleen remote Git-metadata op met `git fetch origin` en bekijk `origin/main`
  via `git log`, `git show` en relevante Actions-uitkomsten. Merge of wijzig de
  bronrepositories niet. Een lokale checkout kan achterlopen; onbevestigd lokaal
  werk mag niet als live functionaliteit worden beschreven.
- Bestaande publieke cases: Smartlife Domotica, Olympus Bouw, Top Groep Nederland,
  De Valk Advies, Rust Werkt, Home Assistant hub en HelloSmart.nl. Rust Werkt is een concept.
  HelloSmart: zie `docs/hellosmart-case-evidence.md` voor bevestigde projectfeiten.
- Beschrijf probleem, gemaakte verbetering, praktische vervolghandeling en hoe de
  werking is gecontroleerd. Noem livegang alleen na bevestigde deployment.
- Publiceer alleen verifieerbare, voor publicatie geschikte functionaliteit. Geen
  nieuwe klantnamen zonder bestaande publicatie of uitdrukkelijke toestemming.
  Geen persoonsgegevens, echte omzetcijfers, tarieven, documenten, credentials,
  interne adressen of vertrouwelijke roadmap. Gebruik geen runtimegegevens.
- Gebruik voor dashboards en applicaties neutrale voorbeeldweergaven met fictieve gegevens. Presenteer die niet als productieschermen. Originele openbare website- en leveranciersbeelden blijven herkenbaar als bronbeelden, met bronverwijzing.
  Gebruik bestaande veilige beelden, of maak een lokale geïsoleerde fixture.
  Verzin geen schermen, testimonials, resultaten, urenbesparing of percentages.
- Wijzig de bronprojecten niet. Verstuur geen berichten naar andere taken of mensen.
  Bij een ontbrekende repository kan nieuws wel door; verzin geen projectvoortgang.

## Schrijven en publiceren

1. Lees de actuele website, recente berichten en Git-status. Synchroniseer veilig
   met `origin/main`; overschrijf geen gebruikerswerk. Vermijd dubbele artikelen.
2. Bewerk `content/news.json`. Gebruik een unieke, stabiele slug en de soort
   `nieuws`, `project` of `inzicht`. Geef elk bericht een concrete eigen invalshoek,
   duidelijke titel, metaomschrijving, korte samenvatting, bruikbare koppen,
   bronverwijzingen en relevante interne links naar diensten en projectverhalen.
3. Gebruik de echte publicatietijd met tijdzone voor `published_at` en aanvankelijk
   dezelfde `modified_at`. Pas `modified_at` alleen bij wezenlijke inhoudelijke
   wijziging aan. Laat bestaande datums en slugs intact.
4. Genereer met `python scripts/news.py --write`, gevolgd door
   `python scripts/sitemap.py --write`. Controleer beide met `--check` en voer
   `git diff --check` uit. De homepage, rubriek en RSS volgen uit dezelfde bron.
   Controleer nieuwe links, metadata, de relevante feitelijke claims en mobiel
   wanneer de vormgeving verandert. Voeg geen willekeurige tests of afhankelijkheden toe.
5. Werk de inhoud van een projectcase alleen bij als er een werkelijk nieuwe
   ontwikkeling is. Vul `docs/editorial-state.json` aan met beoordeelde commits,
   gebruikte bronnen en gepubliceerde slugs. Bewaar ook bewust niet gepubliceerde
   bevindingen kort, zodat ze niet steeds opnieuw worden onderzocht.
6. Commit uitsluitend taakgerelateerde bronbestanden, synchroniseer zo nodig met
   `origin/main` en push naar `main` zonder force-push. Gebruik de bestaande
   GitHub Actions-workflow **Deploy static site to TransIP**. Controleer de afloop,
   lees bij fouten de logs en herstel alleen taakgerelateerde oorzaken.
7. Verifieer de nieuwe live URL's en de bijgewerkte RSS/sitemap. Meld kort wat is
   gepubliceerd, met links, bronvermelding en de deploymentuitkomst. Meld een
   blokkade eerlijk. Als er niets inhoudelijk te publiceren is, meld dat kort.

Interne redactiegegevens en scripts zijn uitgesloten van de webpublicatie.
Wijzig geen andere automations, schema's, budgetten of toegangsrechten.
