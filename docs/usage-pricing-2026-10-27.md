# Aparte AI- en databasekosten

De vaste WebApp-moduleprijzen zijn exclusief AI- en databaseverbruik. Database-inrichting blijft onderdeel van de basisomgeving. De gebruikskosten staan op `/gebruikskosten/`, met verwijzingen onderaan de prijzenpagina, modulepagina en samensteller en in de moduletoelichtingen.

## Status van de tarieven

De gebruiker vroeg om aparte gebruiksstaffels, maar leverde geen bedragen of grenzen aan. De bedragen zijn daarom expliciet gepubliceerde **indicatieve voorstelstaffels**; geen bevestigde bestaande contracttarieven of claims over leverancierstarieven. De offerte legt de definitieve staffel, het standaardmodel, grenzen en maandbudget vast. De tarieven staan centraal in `content/usage-pricing.json`.

| Verbruik per kalendermaand | Indicatief, exclusief btw |
| --- | --- |
| Database tot en met 2 GB | € 5 |
| Database boven 2 tot en met 10 GB | € 15 |
| Database boven 10 tot en met 50 GB | € 35 |
| AI-tekst: 0 aanvragen | € 0 |
| AI-tekst: 1–100 aanvragen | € 5 |
| AI-tekst: 101–500 aanvragen | € 15 |
| AI-tekst: 501–2.000 aanvragen | € 40 |
| AI-beeld: 0 opdrachten | € 0 |
| AI-beeld: 1–10 opdrachten | € 5 |
| AI-beeld: 11–50 opdrachten | € 20 |
| AI-beeld: 51–200 opdrachten | € 65 |

Boven de grenzen, bij zware opdrachten of bijzondere databasebelasting: voorstel op maat, zonder onvolledig rekenresultaat. Per soort verbruik geldt één staffel; lagere staffels worden niet opgeteld. De bestaande modulekortingen en einddatum veranderen niet.

## Afbakening

- Eén databasebedrag voor de gehele eigen klantomgeving, ongeacht het aantal modules. Eigen gegevens en indexen tellen mee; back-ups niet dubbel. Bestandsopslag is apart van databaseomvang.
- AI-tekst: afgesproken standaardmodel, maximaal 5.000 tekens bron en 2.000 tekens resultaat per standaardtaak. Een nieuwe gewenste versie is een nieuwe aanvraag; technische herstelpogingen tellen niet dubbel.
- AI-beeld: één standaardbeeld of één bewerking, maximaal 1.024 × 1.024 pixels op afgesproken standaardkwaliteit. Zwaarder beeldwerk wordt apart begroot.
- Alle tien modules tonen hun databasegebruik. Productbeheer koppelt tekst aan listingoptimalisatie en beeld aan Product Image Studio. Marketing kan AI-analyse gebruiken. Eventuele AI-klantantwoordconcepten of aanvullende AI-duiding vereisen een afspraak.
- Gewone API-synchronisaties, rankingmetingen, forecasts en rekenregels zijn geen AI-aanvragen. Interne ontwikkeltools, Codex en andere klantomgevingen tellen niet mee als AI-verbruik van deze klant.

Dit is uitsluitend een publieke prijsindicatie met een calculator. Er is geen productieregistratie, facturatie of meting toegevoegd. De calculator neemt de gekozen modules mee uit de samensteller en toont vaste modulekosten en aanvullend gebruik afzonderlijk. Het bestaande contactoverzicht noemt de uitsluiting.

## Controle

`scripts/usage_costs.py` genereert en controleert beide HTML-aliassen. `scripts/test_usage_costs.cjs` controleert staffelgrenzen, nul AI, ongeldige invoer, offertegevallen, één gedeelde database, moduleverwijzingen en uitsluitingen. De bestaande moduleprijstest controleert alle selecties. Browsercontrole op 320, 390, 834 en 1.440 pixels controleert bedragen, pakketoverdracht, foutmeldingen en horizontale overloop. De mobiele staffeltabel is ook visueel gecontroleerd.
