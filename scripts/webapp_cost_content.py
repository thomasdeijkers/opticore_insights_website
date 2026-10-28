"""Static cost answers use the exact same resolved packages as the calculator.

Called by module_prices.py; all answers remain readable without JavaScript.
"""
import json
import re
from html import escape

URL = 'https://opticore-insights.nl/webapp-samenstellen/'
TITLE = 'Wat kost een webapp? Bereken je prijs | OptiCore Insights'


def money(value):
    return '€ ' + f'{value:,}'.replace(',', '.')


def render(source, examples):
    if '<!-- webapp-cost-intro:start -->' not in source:
        return source
    basic = examples[0]['price']
    setup, monthly = money(basic['setup']), money(basic['monthly'])
    description = f'Wat kost een webapp? Bij OptiCore vanaf {setup} inrichting en {monthly} per maand, excl. btw en verbruik. Bereken je modules en bekijk prijsvoorbeelden.'
    intro = f'''<section class="section webapp-calculator-intro" id="webapp-kosten"><div class="container">
<p class="eyebrow">Webapp laten maken · kosten en prijsberekening</p>
<h1>Wat kost een webapp voor jouw bedrijf?</h1>
<p class="webapp-cost-answer">Een modulaire webapp van OptiCore Insights begint bij <strong><span class="webapp-cost-money">{setup}</span> eenmalige inrichting en <span class="webapp-cost-money">{monthly}</span> per maand</strong>. Daarmee werk je met omzetrapportage, voorraad en orders in één omgeving. Retourverwerking is maatwerk en valt buiten het startpakket. Extra modules kies je zelf; de prijsbalk bovenaan rekent direct mee.</p>
<p class="webapp-cost-small">Dit zijn onze tarieven voor een bestaande modulaire bedrijfsapp, geen richtprijzen voor iedere maatwerkapp. Exclusief btw, AI- en databaseverbruik. <a href="/gebruikskosten/">Bekijk de aparte gebruikskosten</a>. Nieuwe koppelingen en aanvullend maatwerk worden apart afgestemd.</p>
<nav class="webapp-cost-nav" aria-label="Kosten en prijsberekening"><a class="button" href="#modules">Bereken je webapp prijs</a><a href="#prijsvoorbeelden">Bekijk prijsvoorbeelden →</a><a href="#veelgestelde-vragen">Veelgestelde vragen →</a></nav>
<div class="actions"><a href="/modulaire-webapp/#webapp-keuze">Kies tussen je huidige software, modules en aanvullend maatwerk →</a><a href="/demo/modulaire-webapp/" target="_blank" rel="noopener noreferrer">Bekijk de app-demo →</a></div>
</div></section>'''
    rows = []
    for item in examples:
        price = item['price']
        href = '/webapp-samenstellen/' + ('?modules=' + ','.join(item['modules']) if item['modules'] else '') + '#modules'
        rows.append(f'''<tr data-cost-example="{escape(item['id'])}"><th scope="row">{escape(item['name'])}<span>{escape(item['description'])}</span></th><td data-label="Inrichting">{money(price['setup'])}</td><td data-label="Per maand">{money(price['monthly'])}</td><td data-label="Eerste 12 maanden">{money(price['setup'] + 12 * price['monthly'])}</td><td><a href="{href}">Bereken dit pakket →</a></td></tr>''')
    faqs = [
        ('Wat kost een webapp laten maken?', f'Bij OptiCore Insights begint een modulaire webapp bij {setup} eenmalig en {monthly} per maand. Het startpakket bevat omzetrapportage, voorraad en orders. Extra modules komen daarbij. Retourverwerking en retourkoppelingen zijn maatwerk en vallen buiten deze pakketprijzen. Alle bedragen zijn exclusief btw en AI- en databaseverbruik. Voor een volledig nieuwe applicatie op maat maken we een afzonderlijke offerte; de moduleprijzen zijn daarvoor geen vaste bouwprijs.'),
        ('Wat zijn de maandelijkse kosten van een webapp?', f'Het startpakket kost vast {monthly} per maand. Daarin zitten het gebruik van de drie basismodules, hosting, back-ups, monitoring en regulier platformonderhoud. Betaalde uitbreidingen verhogen het maandbedrag. Databaseverbruik, optionele AI-aanvragen en kosten van externe leveranciers staan daar los van. <a href="/gebruikskosten/">Bekijk de staffels en de kosten per module</a>.'),
        ('Hoe bereken ik de prijs van mijn webapp?', 'Vink de uitbreidingen aan die je nodig hebt. De vaste prijsbalk toont direct de eenmalige inrichting en het maandbedrag. Benodigde voorgangers tellen automatisch mee, ieder onderdeel maar één keer. Klik op de prijsbalk voor de volledige prijsopbouw. Je selectie gaat mee naar het contactformulier; pas na afstemming ontvang je een offerte.'),
        ('Waarom is een modulaire webapp goedkoper te starten dan volledig maatwerk?', 'We beginnen met bestaande modules en richten die in voor je processen en systemen. Daardoor hoeft niet ieder scherm opnieuw ontwikkeld te worden. Dat past bij bedrijven die hun omzet, artikelen, orders en voorraad willen verbinden. Vraagt jouw proces om nieuwe functies, een bijzondere werkwijze of een nieuwe integratie? Dan bespreken we het aanvullende maatwerk apart. Een modulaire oplossing en een volledig nieuw softwareproduct hebben een andere omvang.'),
        ('Wat kost een API-koppeling met mijn webshop of marketplace?', 'De inrichting van één al bestaande standaardkoppeling is inbegrepen, na controle van je systemen en toegang. De voorbeelden van bol, Amazon, webshops en andere platforms zijn geen garantie dat iedere koppeling direct beschikbaar is. Nieuwe API-koppelingen, datamigratie en extra inrichting krijgen een aparte begroting. Ook kan de leverancier kosten of API-limieten hanteren. <a href="/api-integraties/">Lees hoe we systemen koppelen</a>.'),
        ('Wat kosten voorraadbeheer, productbeheer en marketingmodules?', 'Omzetrapportage, voorraad en orders zitten al in het startpakket. Uitbreidingen hebben elk een eigen maandbedrag en eenmalige inrichting, zichtbaar bij ‘Meer info’. Bij Marketing en ranking en Listingoptimalisatie is Productbeheer nodig. Picklijsten en verzending bouwt op Magazijn en logistiek. De calculator neemt benodigde voorgangers automatisch mee. Product Image Studio kies je als aparte module voor je productbeelden. Eventueel AI-verbruik komt apart boven op de vaste moduleprijs.'),
        ('Zijn hosting, onderhoud, AI en databasegebruik inbegrepen?', 'Hosting, database-inrichting, back-ups, monitoring en regulier platformonderhoud zijn inbegrepen in het startpakket. Databasegebruik is een aparte verbruikspost. AI betaal je alleen bij gebruik van AI-functies; een gewone forecast of regelcontrole is geen AI-aanvraag. Nieuw ontwikkelwerk en abonnementen bij andere leveranciers zijn evenmin automatisch inbegrepen. <a href="/gebruikskosten/">Bekijk wat er per module speelt</a>.'),
        ('Kan ik klein beginnen en later modules toevoegen?', 'Ja. Begin met de drie inbegrepen basismodules en kies daarna gericht uitbreidingen voor bijvoorbeeld inkoop, magazijn, productbeheer of marketing. Bepaal vooraf welke gegevens beschikbaar zijn en welke koppelingen nodig zijn. In de calculator zie je wat je gekozen pakket kost; in de <a href="/demo/modulaire-webapp/">demo</a> kun je de schermen bekijken. Voor doorklikken in de demo kun je gratis inloggegevens aanvragen.'),
    ]
    faq_html = ''.join(f'<details><summary>{escape(question)}</summary><div><p>{answer}</p></div></details>' for question, answer in faqs)
    content = f'''<section class="section webapp-cost-guide" id="prijsvoorbeelden"><div class="container">
<p class="eyebrow">Eenmalig én per maand inzichtelijk</p><h2>Webapp kosten: vier concrete prijsvoorbeelden</h2>
<p>Wat je betaalt hangt af van je modules en de benodigde koppelingen. Dit zijn vier samenstellingen uit onze eigen calculator. Het bedrag voor de eerste 12 maanden is de inrichting plus twaalf maandbedragen, <strong>exclusief btw, AI- en databaseverbruik, externe abonnementen en aanvullend maatwerk</strong>.</p>
<div class="webapp-cost-table-wrap"><table class="webapp-cost-table"><caption>Vaste kosten van een modulaire webapp bij OptiCore Insights</caption><thead><tr><th scope="col">Samenstelling</th><th scope="col">Eenmalige inrichting</th><th scope="col">Vast per maand</th><th scope="col">Eerste 12 maanden</th><th scope="col">Jouw prijs</th></tr></thead><tbody>{''.join(rows)}</tbody></table></div>
<p class="webapp-cost-small">Voorbeeldbedragen bij twaalf maanden gebruik met deze vaste tarieven; dit is geen uitspraak over een minimale contractduur. De getoonde pakketvoordelen gelden tot en met 31 december 2027. Bekijk de <a href="/prijzen/">prijzen en andere diensten</a> of <a href="#modules">bereken je eigen combinatie</a>.</p>
</div></section>
<section class="section soft webapp-cost-guide" id="prijs-bepalen"><div class="container"><h2>Wat bepaalt de kosten van een webapplicatie?</h2><div class="webapp-cost-factors">
<article><h3>Functies en modules</h3><p>Een overzicht van omzet en orders heeft een andere omvang dan een werkplek met inkoopadvies, magazijnlocaties en publicaties. Kies wat dagelijks werk bespaart. <a href="/modulaire-webapp/">Bekijk wat de modules doen</a>.</p></article>
<article><h3>Koppelingen en gegevens</h3><p>Beschikbare API’s, artikelgegevens en de kwaliteit van je bestaande data bepalen hoeveel inrichting nodig is. Een nieuwe koppeling of het opschonen van oude gegevens kan extra werk betekenen. <a href="/api-integraties/">Zo koppelen we systemen</a>.</p></article>
<article><h3>Gebruik en beheer</h3><p>De vaste maandprijs en het verbruik zijn twee aparte onderdelen. Hoeveel gegevens je verwerkt en welke AI-functies je gebruikt bepalen de aanvullende kosten. <a href="/gebruikskosten/">Bereken database- en AI-gebruik</a>.</p></article>
<article><h3>Modulair of maatwerk</h3><p>Past een bestaande module bij je proces? Dan kunnen we daarop voortbouwen. Voor een nieuwe bedrijfsapplicatie met eigen functies bepalen we eerst de scope en geven we een aparte prijsindicatie. <a href="/contact/?onderwerp=webapp">Bespreek je toepassing</a>.</p></article>
</div><div class="webapp-cost-proof"><h3>Bekijk de toepassing achter de prijs</h3><p>Onze modules komen voort uit de dagelijkse praktijk van onze marketplace-business. Bekijk de <a href="/projecten/smartlife-domotica/">praktijkcase van Smartlife Domotica</a> en de <a href="/demo/modulaire-webapp/">demo met fictieve gegevens</a>. OptiCore Insights richt de werkplek vervolgens in op jouw kanalen en werkwijze. <a href="/over/">Maak kennis met OptiCore Insights</a>.</p></div></div></section>
<section class="section webapp-cost-guide" id="veelgestelde-vragen"><div class="container"><h2>Veelgestelde vragen over een webapp laten maken</h2><div class="webapp-cost-faq">{faq_html}</div><div class="actions"><a class="button" href="#modules">Bereken de kosten van jouw WebApp</a><a href="/contact/?onderwerp=webapp">Bespreek jouw wensen →</a></div></div></section>'''
    for marker, value in [('intro', intro), ('guide', content)]:
        source, count = re.subn(r'<!-- webapp-cost-' + marker + r':start -->[\s\S]*?<!-- webapp-cost-' + marker + r':end -->', lambda _: f'<!-- webapp-cost-{marker}:start -->{value}<!-- webapp-cost-{marker}:end -->', source)
        assert count == 1, f'Missing cost content: {marker}'
    source = re.sub(r'<title>.*?</title>', '<title>' + escape(TITLE) + '</title>', source, count=1)
    for name, value in [('description', description), ('og:title', TITLE), ('twitter:title', TITLE), ('og:description', description), ('twitter:description', description)]:
        source = re.sub(r'(<meta (?:name|property)="' + re.escape(name) + r'" content=")[^"]*', lambda m: m[1] + escape(value, quote=True), source, count=1)
    def schema(match):
        data = json.loads(match[1])
        graph = data['@graph']
        page = next(item for item in graph if item.get('@id') == URL + '#pagina')
        page.update(name=TITLE, description=description, mainEntity={'@id':URL + '#dienst'})
        graph[:] = [item for item in graph if item.get('@id') != URL + '#dienst']
        graph.append({'@type':'Service', '@id':URL + '#dienst', 'name':'Modulaire WebApp voor bedrijven', 'serviceType':'Inrichting en gebruik van een modulaire bedrijfsapplicatie', 'provider':{'@id':'https://opticore-insights.nl/#organisatie'}, 'url':URL, 'description':f'Startpakket met omzetrapportage, voorraad en orders. {setup} eenmalige inrichting én {monthly} per maand. Exclusief btw, AI- en databaseverbruik. Nieuwe koppelingen en maatwerk worden apart afgestemd.'})
        return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False, separators=(',',':')) + '</script>'
    return re.sub(r'<script type="application/ld\+json">([\s\S]*?)</script>', schema, source, count=1)
