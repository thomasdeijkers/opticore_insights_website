"""Render the separate usage-cost page from the public indicative tariff source."""
import argparse
from html import escape
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]


def money(value):
    return 'Op maat' if value is None else '€ ' + str(value)


def render():
    config = json.loads((ROOT/'content/usage-pricing.json').read_text(encoding='utf-8'))
    package = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(require('./assets/js/modular-webapp.js').resolve([])))"], cwd=ROOT))
    initial_db, initial_text, initial_images = (config[key][0]['price'] for key in ['database', 'text', 'images'])
    initial_total = package['monthly'] + initial_db + initial_text + initial_images
    shared = (ROOT/'index.html').read_text(encoding='utf-8')
    header = shared[shared.index('<header'):shared.index('</header>')+9]
    footer = shared[shared.index('<footer'):]
    title = 'AI- en databasekosten: gebruiksstaffels | OptiCore Insights'
    description = 'Bekijk indicatieve staffels voor databasegebruik, AI-tekst en beeldopdrachten. Zie per WebApp-module wanneer verbruikskosten spelen en bereken een maandindicatie.'
    url = 'https://opticore-insights.nl/gebruikskosten/'
    meta = f'''<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" href="/favicon.ico" sizes="any"><title>{title}</title><meta name="description" content="{description}"><link rel="canonical" href="{url}"><meta name="robots" content="index,follow,max-image-preview:large"><meta property="og:title" content="{title}"><meta property="og:description" content="{description}"><meta property="og:url" content="{url}"><meta property="og:type" content="website"><meta property="og:site_name" content="OptiCore Insights"><meta property="og:locale" content="nl_NL"><meta property="og:image" content="https://opticore-insights.nl/assets/img/opticore-insights-logo.png"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{title}"><meta name="twitter:description" content="{description}"><meta name="twitter:image" content="https://opticore-insights.nl/assets/img/opticore-insights-logo.png"><link rel="stylesheet" href="/assets/css/site.css?v=20261026-search-wide"><link rel="stylesheet" href="/assets/css/usage-costs.css?v=20261027-staffels"></head><body><a class="skip-link" href="#inhoud">Direct naar inhoud</a>'''
    cards = []
    for key, label, intro in [
        ('database', 'Databasegebruik', 'Eén staffel voor de database van je hele omgeving, ongeacht het aantal modules.'),
        ('text', 'AI-tekstaanvragen', 'Bijvoorbeeld een listingvoorstel of een afgesproken AI-analyse.'),
        ('images', 'AI-beeldopdrachten', 'Bijvoorbeeld een nieuwe standaardafbeelding of een bewerking in de Product Image Studio.')
    ]:
        rows = ''.join(f'<tr><td>{escape(row["label"])}</td><td>{money(row["price"])}</td></tr>' for row in config[key])
        scope = 'id="database"' if key == 'database' else 'id="ai"' if key == 'text' else 'id="beelden"'
        details = {
            'database': '<p>De opslagstaffel volgt de hoogste gemeten omvang in de kalendermaand: gegevens en indexen van jouw eigen database. We tellen geen gegevens van andere klanten mee. Back-ups tellen niet dubbel. Losse bestanden en productafbeeldingen zijn bestandsopslag en vallen buiten deze databasestaffel.</p><p>Normale koppelingen draaien op de vooraf afgesproken frequentie. Voor uitzonderlijk zware verwerkingen, extra rekenkracht of grotere opslag maken we vooraf een aparte afspraak.</p>',
            'text': '<p>Een aanvraag is één uitgevoerde teksttaak op het vooraf afgesproken standaardmodel. Deze voorbeeldstaffels gaan uit van korte taken: tot 5.000 tekens brontekst en tot 2.000 tekens resultaat. Een nieuwe versie op jouw verzoek telt als een nieuwe aanvraag.</p><p>Lange documenten, extra zware modellen of uitgebreide analyses begroten we vooraf apart. Technische herstelpogingen tellen niet dubbel; een mislukt verzoek zonder bruikbaar resultaat tellen we niet mee in deze voorbeeldstaffel.</p>',
            'images': '<p>Een standaardopdracht levert één beeld op, of bewerkt één bestaand beeld, tot 1.024 × 1.024 pixels op de afgesproken standaardkwaliteit. Een volgende bewerking is een nieuwe opdracht. De beeldstaffel wordt apart van tekstaanvragen berekend.</p><p>Grote resoluties, meerdere invoerbeelden, zware bewerkingen en uitgebreide series begroten we vooraf apart. Een mislukt verzoek zonder bruikbaar resultaat tellen we niet mee in deze voorbeeldstaffel.</p>'
        }[key]
        cards.append(f'<article class="usage-card" {scope}><h3>{label}</h3><p>{intro}</p><table><thead><tr><th>Verbruik per maand</th><th>Per maand</th></tr></thead><tbody>{rows}</tbody></table><details class="usage-details"><summary>Wat telt mee?</summary>{details}</details></article>')
    module_rows = ''.join(f'<tr id="usage-module-{escape(row["id"])}"><td><a href="/modulaire-webapp/#module-{escape(row["id"])}-title">{escape(row["label"])}</a></td><td data-label="Database">{escape(row["database"])}</td><td data-label="AI">{escape(row["ai"])}</td></tr>' for row in config['modules'])
    body = f'''<main id="inhoud"><nav class="breadcrumbs" aria-label="Broodkruimelpad"><ol class="container"><li><a href="/">Home</a></li><li><a href="/prijzen/">Prijzen</a></li><li><span aria-current="page">AI- en databasekosten</span></li></ol></nav>
<section class="usage-intro"><div class="container"><p class="eyebrow">Aanvullend op je modulepakket</p><h1>Je vaste maandbedrag en je verbruik, duidelijk apart.</h1><p class="lead">De moduleprijzen zijn exclusief AI- en databaseverbruik. De database wordt één keer voor je hele klantomgeving berekend. AI betaal je alleen wanneer je AI-opdrachten laat uitvoeren.</p><nav class="usage-nav" aria-label="Op deze pagina"><a href="#database">Database</a><a href="#ai">AI-aanvragen</a><a href="#per-module">Per module</a><a href="#berekenen">Maandindicatie</a></nav></div></section>
<section class="section"><div class="container"><div class="section-heading"><h2>Indicatieve gebruiksstaffels</h2><p>De inrichting van de database, hosting, beveiliging, monitoring, back-ups en het afgesproken reguliere onderhoud horen bij je basisomgeving. Het hieronder beschreven verbruik komt boven op het vaste modulebedrag.</p></div><aside class="usage-proposal"><strong>Voorstelstaffels: vooraf afspreken, geen verrassingen.</strong><p>Deze staffels zijn een indicatie. De passende staffel, het standaardmodel, de gebruiksgrenzen en het maandbudget leggen we vooraf vast in je offerte. Alle bedragen zijn exclusief btw.</p></aside><div class="usage-grid">{''.join(cards)}</div><p class="usage-footnote">Per kalendermaand geldt één staffel per soort verbruik; we tellen de lagere staffels niet bij elkaar op. Tekst en beelden worden afzonderlijk berekend. Gebruiksstaffels vallen buiten de actiekorting op de modules. Zonder tekst- of beeldopdrachten betaal je geen AI-staffel.</p></div></section>
<section class="section soft" id="per-module"><div class="container"><div class="section-heading"><h2>Bij welke module spelen deze kosten?</h2><p>Alle modules gebruiken dezelfde database. Dat betekent één databasestaffel voor de hele omgeving, geen aparte databasekosten per module. Een gewone API-koppeling, rankingmeting of rekenregel is geen AI-aanvraag.</p></div><table class="usage-module-table"><thead><tr><th>Module</th><th>Databasegebruik</th><th>Wanneer AI?</th></tr></thead><tbody>{module_rows}</tbody></table><details class="usage-details"><summary>Andere AI-toepassingen, zoals documentanalyse of klantvragen</summary><p>Voor extra toepassingen spreken we eerst af welke taak wordt uitgevoerd, hoeveel bronmateriaal wordt verwerkt en welke verbruiksstaffel of welk budget past. Gewone orderverwerking, voorraadberekeningen en dashboards veroorzaken op zichzelf geen AI-aanvragen.</p></details></div></section>
<section class="section" id="berekenen"><div class="container"><div class="section-heading"><h2>Wat betekent dat voor jouw maandbedrag?</h2><p>Vul een verwacht maandverbruik in. Dit is een rekenvoorbeeld, geen meting of bestelling. Je krijgt vooraf een voorstel voor jouw situatie.</p></div><div class="usage-estimate"><form class="usage-form" data-usage-calculator><label>Databaseomvang in GB<input type="number" name="database" min="0" step="0.1" value="1" required><small>Gegevens en indexen van je eigen database.</small></label><label>AI-tekstaanvragen per maand<input type="number" name="text" min="0" step="1" value="0" required></label><label>AI-beeldopdrachten per maand<input type="number" name="images" min="0" step="1" value="0" required></label><p class="usage-error" data-usage-error role="alert"></p><button class="button" type="submit">Bereken maandindicatie</button></form><div class="usage-estimate-result" role="status" aria-live="polite"><h3 data-usage-package-name>Startpakket</h3><dl><div><dt>Vaste modules per maand</dt><dd data-usage-package>€ 149</dd></div><div><dt>Databasegebruik</dt><dd data-usage-database>€ 5</dd></div><div><dt>AI-tekstaanvragen</dt><dd data-usage-text>€ 0</dd></div><div><dt>AI-beeldopdrachten</dt><dd data-usage-images>€ 0</dd></div><div class="usage-total"><dt>Indicatie per maand</dt><dd data-usage-total>€ 154</dd></div></dl><p data-usage-quote hidden>Een deel van dit verbruik valt buiten de voorbeeldstaffels. Daarom tonen we geen onvolledig totaal; je ontvangt een voorstel op maat.</p><p>Exclusief btw en eenmalige inrichting. Vaste modulebedragen volgen de actieprijzen tot en met 31 december 2027. Verbruikskosten staan daar los van.</p><a class="text-link" href="/webapp-samenstellen/" data-usage-back>Pas je modulepakket aan →</a></div></div></div></section>
<section class="section soft"><div class="container"><div class="contact-strip"><div><h2>Welke staffel past bij jouw gebruik?</h2><p>We kijken naar je bronnen, bewaartermijn, synchronisaties en gewenste AI-toepassingen.</p></div><a class="button" href="/contact/?onderwerp=webapp">Bespreek je gebruik</a></div><p class="usage-bottom-note">Alle bedragen zijn indicatief en exclusief btw. Alleen het gebruik van jouw eigen klantomgeving telt mee; ontwikkelwerk, interne AI-tools en het beheer van andere klanten worden niet als jouw AI-verbruik gerekend.</p></div></section></main>'''
    body = body.replace('data-usage-package>€ 149', f'data-usage-package>{money(package["monthly"])}').replace('data-usage-database>€ 5', f'data-usage-database>{money(initial_db)}').replace('data-usage-text>€ 0', f'data-usage-text>{money(initial_text)}').replace('data-usage-images>€ 0', f'data-usage-images>{money(initial_images)}').replace('data-usage-total>€ 154', f'data-usage-total>{money(initial_total)}')
    data = json.dumps(config, ensure_ascii=False).replace('</', '<\\/')
    scripts = f'<script type="application/json" id="usage-pricing-data">{data}</script><script src="/assets/js/modular-webapp.js?v=20261027-advice-prices" defer></script><script src="/assets/js/usage-costs.js?v=20261027-staffels" defer></script>'
    return meta + header + body + footer.replace('</body>', scripts + '</body>')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--write', action='store_true')
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    expected = render()
    for name in ['gebruikskosten.html', 'gebruikskosten/index.html']:
        path = ROOT/name
        if args.write:
            path.parent.mkdir(exist_ok=True)
            path.write_text(expected, encoding='utf-8')
        elif not path.is_file() or path.read_text(encoding='utf-8') != expected:
            raise SystemExit('Usage-cost page out of date: run python scripts/usage_costs.py --write')
    print('Usage-cost page OK: three indicative tariff tables, all ten modules, calculator and aliases.')


if __name__ == '__main__':
    main()
