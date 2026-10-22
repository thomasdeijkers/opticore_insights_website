"""Build neutral, brand-free HTML examples using fictitious data only.

Run with an output directory outside the checkout, then capture the served pages
in a browser at desktop and phone viewport sizes. No app, database or API is used.
These are illustrative views of functionality, not production UI screenshots.
"""
from pathlib import Path
from html import escape
import argparse


def metrics(items):
    return '<div class="metrics">'+''.join(f'<div class="metric"><p class="metric-label">{label}</p><div class="metric-value">{value}</div><p class="metric-foot">{note}</p></div>' for label,value,note in items)+'</div>'


def panel(title,body,subtitle='',classes='',link=''):
    return f'<section class="panel {classes}"><div class="panel-heading"><div><h2>{title}</h2>'+ (f'<p>{subtitle}</p>' if subtitle else '')+'</div>'+ (f'<span class="panel-link">{link}</span>' if link else '')+'</div>'+body+'</section>'


def table(headers,rows):
    return '<table class="table"><thead><tr>'+''.join(f'<th>{h}</th>' for h in headers)+'</tr></thead><tbody>'+''.join('<tr>'+''.join(f'<td>{cell}</td>' for cell in row)+'</tr>' for row in rows)+'</tbody></table>'


def bars(values,previous,labels):
    small=max(max(values),max(previous))<=1500
    maximum=1500 if small else 4000
    levels=[(24,'1.5k'),(80,'1k'),(136,'500'),(192,'0')] if small else [(24,'4k'),(66,'3k'),(108,'2k'),(150,'1k'),(192,'0')]
    lines=''.join(f'<line x1="45" y1="{y}" x2="625" y2="{y}" stroke="#e8edea"/><text x="1" y="{y+5}" fill="#738077" font-size="13">{label}</text>' for y,label in levels)
    bars=''
    for i,(value,old,label) in enumerate(zip(values,previous,labels)):
        x=63+i*(550/len(values));height=value/maximum*168;prev=old/maximum*168
        bars+=f'<rect x="{x:.1f}" y="{192-prev:.1f}" width="22" height="{prev:.1f}" rx="3" fill="#d2dfd7"/><rect x="{x+25:.1f}" y="{192-height:.1f}" width="22" height="{height:.1f}" rx="3" fill="#649888"/><text x="{x+23:.1f}" y="220" fill="#687b70" text-anchor="middle" font-size="14">{label}</text>'
    return '<div class="chart"><svg viewBox="0 0 650 235" role="img" aria-label="Vergelijking van fictieve omzet per periode">'+lines+bars+'</svg></div><div class="legend"><span><i class="dot"></i>Deze periode</span><span><i class="dot pale"></i>Vorig jaar</span></div>'


def linechart():
    return '<div class="chart"><svg viewBox="0 0 650 235" role="img" aria-label="Fictieve omzetverwachting"><path d="M45 30H625M45 85H625M45 140H625M45 195H625" stroke="#e6ece7" fill="none"/><path d="M45 165L95 140L145 157L195 119L245 95L295 111L345 83L395 100L445 61L495 76L545 39L610 27L610 195L45 195Z" fill="#edf4ef"/><path d="M45 184L95 159L145 167L195 143L245 129L295 144L345 110L395 125L445 92L495 100L545 68L610 62" stroke="#c1cec5" stroke-width="3" fill="none"/><path d="M45 165L95 140L145 157L195 119L245 95L295 111L345 83L395 100L445 61L495 76L545 39L610 27" stroke="#548a73" stroke-width="4" fill="none"/><g fill="#6f7d73" font-size="14"><text x="40" y="225">Jan</text><text x="190" y="225">Apr</text><text x="340" y="225">Jul</text><text x="490" y="225">Okt</text><text x="590" y="225">Dec</text></g></svg></div><div class="legend"><span><i class="dot"></i>Verwachting</span><span><i class="dot pale"></i>Vorig jaar</span></div>'


def tasks(items):
    return '<div class="panel-body">'+''.join(f'<div class="task"><span class="task-icon">{symbol}</span><div><div class="task-title">{title}</div><p>{copy}</p></div><span class="arrow">›</span></div>' for symbol,title,copy in items)+'</div>'


def product_cards(stock=False):
    result=''
    for title,sku,amount,extra in [('Slimme schakelaar','ART-001','28','80'),('Wifi thermostaat','ART-002','17','40')]:
        cells=[('Beschikbaar',amount),('Besteladvies',extra),('Voorraad', 'Laag')] if stock else [('Positie','12' if sku=='ART-001' else '8'),('Zoekwoorden','6'),('Beweging','+3')]
        result+=f'<div class="product-row"><h3>{title}</h3><p class="muted small">{sku} · Voorbeeldartikel</p><div class="product-meta">'+''.join(f'<div><span>{label}</span><strong>{value}</strong></div>' for label,value in cells)+'</div><button type="button" class="action">'+('Bestelvoorstel bekijken' if stock else 'Zoekwoorden bekijken')+'</button></div>'
    return '<div class="compact-only">'+result+'</div>'


def management():
    kpis=metrics([('Omzet deze maand','€ 58.400','<strong>+13,2%</strong> t.o.v. vorig jaar'),('Brutomarge','34,0%','<strong>+2,1 punt</strong> t.o.v. vorig jaar'),('Bestellingen','842','<strong>+6,6%</strong> deze maand'),('Gemiddelde order','€ 69,36','842 bestellingen')])
    graph=panel('Omzet per dag',bars([1840,2260,2090,2680,3120,2380,1950],[1650,2010,1880,2150,2690,2230,1710],['Ma','Di','Wo','Do','Vr','Za','Zo']),'Deze week · vergeleken met vorig jaar')
    attention=panel('Dit vraagt aandacht',tasks([('↗','14 artikelen bijbestellen','Bekijk voorraad en levertijden.'),('◎','2 campagnevoorstellen','Beoordeel kosten en conversie.'),('✓','24 orders klaar voor opvolging','Open de werkvoorraad.')]),link='Alles bekijken')
    channels=panel('Verkoopkanalen',table(['Kanaal','Omzet','Marge','Ontwikkeling'],[['Webshop','€ 28.400','36,0%','<span class="positive">+14,0%</span>'],['Marketplace A','€ 18.600','32,0%','<span class="positive">+9,0%</span>'],['Marketplace B','€ 11.400','33,0%','<span class="positive">+18,0%</span>']]),classes='below desktop-only')
    return kpis+f'<div class="grid">{graph}{attention}</div>'+channels


def forecast():
    kpis=metrics([('Jaarverwachting','€ 578.000','<strong>+12,4%</strong> t.o.v. vorig jaar'),('Volgende maand','€ 59.000','Verwachte omzet'),('Inkoopbehoefte','€ 12.480','Voorstel voor 18 artikelen'),('Verwachte marge','34,0%','Op basis van voorbeeldgegevens')])
    advice=panel('Vooruitkijken en plannen',tasks([('↗','Vraag neemt toe','Verwachte groei in november.'),('▤','Inkoop voorbereiden','18 artikelen verdienen aandacht.'),('◷','Levertijden meenemen','Plan de ontvangst vóór de piek.')]))
    rows=[['Oktober','€ 51.000','€ 45.500','<span class="positive">+12,1%</span>'],['November','€ 59.000','€ 52.700','<span class="positive">+12,0%</span>'],['December','€ 63.000','€ 56.200','<span class="positive">+12,1%</span>']]
    return kpis+'<div class="grid">'+panel('Omzetverwachting',linechart(),'Voorbeeldjaar · omzet en seizoenen')+advice+'</div>'+panel('De komende maanden',table(['Maand','Verwachting','Vorig jaar','Verschil'],rows),classes='below desktop-only')


def stock():
    rows=[]
    for i,(name,qty,advice,status) in enumerate([('Slimme schakelaar',28,80,'Laag'),('Wifi thermostaat',17,40,'Laag'),('Bewegingssensor',142,0,'Voldoende'),('Dimmermodule',86,0,'Voldoende'),('Raamsensor',0,60,'Niet op voorraad'),('Slimme stekker',64,0,'Voldoende')]):
        tag='amber' if advice else ''
        rows.append([f'<strong>{name}</strong><span class="sub">ART-{i+1:03d}</span>',str(qty),str(advice),'Leverancier '+('A' if i<3 else 'B'),f'<span class="tag {tag}">{status}</span>','<button type="button" class="action">Bekijken</button>'])
    body='<div class="desktop-only">'+table(['Artikel','Voorraad','Besteladvies','Leverancier','Status',''],rows)+'</div>'+product_cards(True)
    return metrics([('Voorraadwaarde','€ 86.420','248 artikelen'),('Omloopsnelheid','4,3','Per jaar'),('Lage voorraad','14','<strong>Actie nodig</strong> bekijk het voorstel'),('Niet op voorraad','18','Controleer de inkoop')])+panel('Artikelen en besteladvies',body,'Voorbeeldartikelen · beschikbare voorraad',link='Filter artikelen')


def ranking(detail=False):
    if detail:
        rows=[['slimme schakelaar','1.240','8','<span class="positive">↑ 7</span>'],['wifi schakelaar','860','12','<span class="positive">↑ 6</span>'],['draadloze schakelaar','430','18','<span class="positive">↑ 11</span>']]
        body=table(['Zoekwoord','Volume','Positie','Verschil'],rows)
        return metrics([('Actieve zoekwoorden','6','Voor dit artikel'),('Beste positie','8','<strong>↑ 7 plaatsen</strong> deze maand'),('Zoekvolume','2.530','Voorbeeldmetingen'),('Meetperiode','30 dagen','Dagelijkse vergelijking')])+panel('Zoekwoorden voor dit artikel',body,'ART-001 · Slimme schakelaar')+panel('Volgende stap',tasks([('↗','Een relevante zoekterm groeit','Controleer titel, beschikbaarheid en campagne.'),('◎','Bekijk het listingvoorstel','Beoordeel de inhoud voor publicatie.')]),classes='below')
    rows=[[f'<strong>{n}</strong><span class="sub">ART-{i+1:03d}</span>',str(words),str(pos),'<span class="positive">↑ '+str(change)+'</span>','<button class="action" type="button">Zoekwoorden</button>'] for i,(n,words,pos,change) in enumerate([('Slimme schakelaar',6,12,3),('Wifi thermostaat',5,8,4),('Bewegingssensor',4,16,2),('Slimme stekker',7,10,5)])]
    body='<div class="desktop-only">'+table(['Artikel','Zoekwoorden','Gem. positie','Beweging',''],rows)+'</div>'+product_cards()
    return metrics([('Gevolgde artikelen','24','Voorbeeldassortiment'),('Zoekwoorden','68','Actieve meetpunten'),('Gemiddelde positie','12','<strong>↑ 3 plaatsen</strong> afgelopen maand'),('Stijgende artikelen','17','7 artikelen vragen aandacht')])+panel('Artikelen in beeld',body,'Posities, zoekvolume en ontwikkeling',link='Laatste 30 dagen')+panel('Van positie naar verbetering',tasks([('↗','Vergelijk de beweging','Bekijk de zoekwoorden achter een verandering.')]),classes='below desktop-only')


def proposals():
    result=''
    for title,tag,copy,meta in [('Zoekwoord beoordelen','Zoekwoord','Slimme schakelaar · een relevante zoekterm krijgt meer aandacht. Bekijk de meetperiode en de voorraad voordat je bijstuurt.','Zoekvolume 860 · Positie 12'),('Campagnebudget controleren','Campagne','Wifi thermostaat · klikken nemen toe. Beoordeel conversie, advertentiekosten en marge in samenhang.','Vrije voorraad 48 · Conversie 5,2%')]:
        result+=f'<article class="proposal"><div class="proposal-head"><h3 class="proposal-title">{title}</h3><span class="tag gray">{tag}</span></div><p>{copy}</p><div class="proposal-meta">{meta}</div><div class="actions"><button class="action primary" type="button">Voorstel bekijken</button><button class="action" type="button">Later beoordelen</button></div></article>'
    return result


def marketing(overview=False):
    kpis=metrics([('Advertentiekosten','€ 3.890','Laatste 30 dagen'),('Advertentieomzet','€ 23.155','Toegeschreven omzet'),('ACoS','16,8%','Kosten ten opzichte van omzet'),('Conversie','5,2%','Voorbeeldperiode')])
    if overview:
        rows=[['Ontdekking','Actief','€ 42,50'],['Hardlopers','Actief','€ 68,20'],['Seizoensartikelen','Beoordelen','€ 19,40']]
        body=panel('Campagnes',table(['Campagne','Status','Kosten'],rows))
        body+=panel('Opvolging',tasks([('◎','2 voorstellen klaar','Bekijk de onderbouwing en kies een actie.'),('✓','24 campagnes in overzicht','Vergelijk klikken, conversies en kosten.')]),classes='below')
    else:
        body=panel('Voorstellen voor beoordeling',proposals(), 'Onderbouwing vóór de volgende stap',link='2 open')
    return kpis+'<div class="tabs"><span class="'+('active' if overview else '')+'">Overzicht</span><span class="'+('' if overview else 'active')+'">Voorstellen</span><span>Campagnes</span></div>'+body


def listing(editor=False):
    if editor:
        before=panel('Huidige titel en tekst','<div class="panel-body"><h3>Schakelaar wit</h3><p>Witte draadloze schakelaar voor bediening.</p><p class="muted small">Toepassing en montage zijn nog niet duidelijk uitgelegd.</p></div>','Voorbeeldartikel ART-001')
        after=panel('Tekstvoorstel ter controle','<div class="panel-body"><span class="tag">Concept</span><h3 style="margin-top:12px">Voorbeeldmerk draadloze schakelaar — wit, wandmontage</h3><p><strong>Bediening op een vaste plek</strong><br>Een witte draadloze schakelaar voor wandmontage. Controleer bij dit voorbeeld welke ontvanger en voeding nodig zijn.</p><p><strong>Controleer vóór publicatie</strong><br>Productfeiten, montage, verpakkingsinhoud en de gekozen zoekterm.</p><div class="actions"><button class="action primary" type="button">Tekst beoordelen</button><button class="action" type="button">Aanpassen</button></div></div>','Jouw beoordeling bepaalt de vervolgstap')
        return '<div class="notice"><span>Fictief tekstvoorstel · nog niet gepubliceerd</span></div><div class="grid">'+before+after+'</div>'
    kpis=metrics([('Listing-score','58 / 100','Eigen controle · geen bol-score'),('Tekstacties','3','Ter beoordeling'),('Retoursignalen','2','Fictieve meldingen'),('Controle','Open','Controleer de brongegevens')])
    checks=panel('Dit vraagt aandacht',tasks([('↗','Relevante zoekterm ontbreekt','Beoordeel “draadloze schakelaar” voor de titel.'),('▤','Toepassing verduidelijken','Leg montage en benodigde onderdelen uit.'),('✓','Productgegevens controleren','Bevestig de verpakkingsinhoud vanuit de bron.')]),'ART-001 · Voorbeeldartikel')
    brief=panel('Opdracht voor tekstoptimalisatie','<div class="panel-body"><p>Werk de drie tekstpunten uit met bevestigde productinformatie.</p><p class="muted small">Retoursignalen geven aanleiding tot controle. Ze bewijzen geen producteigenschap.</p><div class="actions"><button class="action primary" type="button">Maak een tekstvoorstel</button><button class="action" type="button">Later beoordelen</button></div></div>','Eerst beoordelen, dan verder')
    return kpis+'<div class="grid">'+checks+brief+'</div>'


def timesheets():
    return metrics([('Ontvangen','18','Weekstaten in deze periode'),('Gecontroleerd','16','Relatie en project herkend'),('Wacht op akkoord','12','Volgende beoordelingsstap'),('Uren deze week','1.360','<strong>+6,3%</strong> t.o.v. vorig jaar')])+'<div class="grid">'+panel('Uren per week',bars([980,1120,1040,1280,1200,1360],[900,1040,960,1200,1120,1280],['38','39','40','41','42','43']),'Fictieve periode · dit jaar en vorig jaar')+panel('Werkvoorraad',tasks([('▤','4 weekstaten controleren','Afwijkende uren of ontbrekende gegevens.'),('✓','12 klaar voor akkoord','Beoordeel de periode en voorbereiding.'),('↗','8 loonberekeningen voorbereiden','Controleer de afgesproken gegevens.')]))+'</div>'+panel('Laatste weekstaten',table(['Medewerker','Project','Uren','Status'],[['Medewerker A','Project Noord','40','<span class="tag">Gecontroleerd</span>'],['Medewerker B','Project West','36','<span class="tag amber">Controleren</span>'],['Medewerker C','Project Zuid','32','<span class="tag">Klaar voor akkoord</span>']]),classes='below desktop-only')


def documents():
    rows=[['Binnenwanden plaatsen','120 m²','€ 62,00','€ 7.440,00','<span class="tag">96%</span>'],['Wandafwerking','120 m²','€ 24,00','€ 2.880,00','<span class="tag">92%</span>'],['Plafondafwerking','80 m²','€ 48,00','€ 3.840,00','<span class="tag">87%</span>'],['Schilderwerk','200 m²','€ 18,00','€ 3.600,00','<span class="tag amber">78%</span>'],['Binnendeuren','8 st','€ 285,00','€ 2.280,00','<span class="tag amber">64%</span>']]
    return metrics([('Brontotaal','€ 20.280','Bedrag uit het document'),('Regeltotaal','€ 20.040','Som van herkende regels'),('Verschil','€ 240','Te controleren'),('Herkende regels','5','2 regels verdienen aandacht')])+'<div class="notice"><span>Controleer het verschil van € 240 vóór je de gegevens exporteert.</span><button class="action" type="button">Bron bekijken</button></div>'+panel('Begrotingsregels',table(['Werkzaamheden','Hoeveelheid','Eenheidsprijs','Totaal','Herkenning'],rows)+'<div class="panel-note">Begroting 014.pdf · Voorbeeldproject · Uitsluitend fictieve gegevens</div>','Document 014 · gegevens controleren',link='Export naar Excel')+panel('Vervolg',tasks([('✓','Controleer en pas de regels aan','Beoordeel hoeveelheden, bedragen en herkenning.')]),classes='below')


def intake():
    return metrics([('Te controleren','4','Documenten met een aandachtspunt'),('Planning aanvullen','2','Opdrachtgegevens ontbreken'),('Klaar voor akkoord','3','Controleer de dossiers'),('Gereed voor factuur','6','Voorbereiding afgerond')])+panel('Taken en dossiers',table(['Document of opdracht','Dossier','Aandachtspunt','Vervolg'],[['<strong>Weekstaat 043.pdf</strong><span class="sub">Medewerker A</span>','Project Noord','Uren nalopen','<button class="action" type="button">Controleren</button>'],['<strong>Opdracht 012</strong><span class="sub">Medewerker B</span>','Project West','Tarief bevestigen','<button class="action" type="button">Dossier openen</button>'],['<strong>Factuurvoorbereiding</strong><span class="sub">Medewerker C</span>','Project Zuid','Klaar voor akkoord','<button class="action" type="button">Beoordelen</button>']]),'Van document naar een herkenbare vervolgstap',link='Alle taken')+'<div class="grid equal below">'+panel('Verwerking volgen',tasks([('✓','Documenten ontvangen','18 bestanden in de voorbeeldperiode.'),('↗','Uitzonderingen opvolgen','4 documenten hebben een controle nodig.')]))+panel('Voortgang', '<div class="panel-body"><div class="summary-row"><span>Gegevens herkend</span><strong>16 van 18</strong></div><div class="progress"><i style="width:89%"></i></div><div class="summary-row"><span>Wacht op beoordeling</span><strong>4 dossiers</strong></div></div>')+'</div>'


def mobile_work(kind, detail=False):
    """Readable phone-first records, rather than a shrunken desktop table."""
    if kind == 'timesheets':
        if detail:
            return panel('Weekstaat controleren','<div class="panel-body"><span class="tag amber">Wacht op beoordeling</span><h3 class="record-title">Medewerker A · Project Noord</h3><p class="muted small">Week 43 · Uitsluitend fictieve gegevens</p>'+''.join(f'<div class="summary-row"><span>{day}</span><strong>{hours} uur</strong></div>' for day,hours in [('Maandag','8'),('Dinsdag','8'),('Woensdag','8'),('Donderdag','8'),('Vrijdag','6')])+'<div class="summary-row"><span>Totaal</span><strong>38 uur</strong></div></div>')+panel('Controle en vervolg',tasks([('✓','Project en periode herkend','Controleer de bron en gemaakte afspraken.'),('↗','Twee uur verschil','Vergelijk met de geplande 40 uur.')])+'<div class="panel-body"><button class="action primary">Ter beoordeling klaarzetten</button></div>',classes='below')
        return metrics([('Weekstaten','18','Deze periode'),('Te controleren','4','Actie nodig'),('Klaar voor akkoord','12','Volgende stap'),('Uren deze week','1.360','Fictief totaal')])+panel('Weekstaten en acties',tasks([('▤','Medewerker A · Project Noord','38 uur · verschil met planning controleren.'),('✓','Medewerker B · Project West','36 uur · klaar voor beoordeling.'),('▤','Medewerker C · Project Zuid','32 uur · bronbestand bekijken.')]))+panel('Deze periode',tasks([('↗','Factuurvoorbereiding','Verzamel de gecontroleerde weekstaten.')]),classes='below')
    if kind == 'documents':
        if detail:
            return panel('Begrotingsregel beoordelen','<div class="panel-body"><span class="tag amber">Controle nodig</span><h3 class="record-title">Schilderwerk</h3><p class="muted small">Begroting 014.pdf · regel 4 · fictief voorbeeld</p>'+''.join(f'<div class="summary-row"><span>{k}</span><strong>{v}</strong></div>' for k,v in [('Hoeveelheid','200 m²'),('Prijs per eenheid','€ 18,00'),('Regeltotaal','€ 3.600,00'),('Herkenning','78%')])+'</div>')+panel('Vergelijk met de bron','<div class="panel-body"><p>Controleer de hoeveelheid en eenheidsprijs voordat je de regel overneemt.</p><div class="source-example">Schilderwerk<br>200 m² × € 18,00 = € 3.600,00</div><div class="actions"><button class="action primary">Regel bevestigen</button><button class="action">Aanpassen</button></div></div>','Fictief bronfragment',classes='below')
        return metrics([('Brontotaal','€ 20.280','Uit het document'),('Regeltotaal','€ 20.040','Herkende regels'),('Verschil','€ 240','Te controleren'),('Regels','5','2 aandachtspunten')])+panel('Documentcontrole',tasks([('▤','Begroting 014.pdf','Voorbeeldproject · 5 herkende regels.'),('↗','Controleverschil van € 240','Vergelijk regels en bronbedrag.'),('✓','Twee regels nalopen','Schilderwerk en binnendeuren.')]))+panel('Volgende stap','<div class="panel-body"><p class="muted small">Bevestig de gecontroleerde regels en bereid de export voor.</p><button class="action primary">Regels controleren</button></div>',classes='below')
    if detail:
        return panel('Document beoordelen','<div class="panel-body"><span class="tag amber">Uren nalopen</span><h3 class="record-title">Weekstaat 043.pdf</h3><p class="muted small">Medewerker A · Project Noord · fictief dossier</p>'+''.join(f'<div class="summary-row"><span>{k}</span><strong>{v}</strong></div>' for k,v in [('Document ontvangen','Ja'),('Project herkend','Project Noord'),('Gevonden uren','38'),('Geplande uren','40')])+'</div>')+panel('Van controle naar actie',tasks([('✓','Vergelijk met de bron','Open het document en controleer de uren.'),('↗','Zet klaar voor beoordeling','De verantwoordelijke controleert het dossier.')])+'<div class="panel-body"><button class="action primary">Naar beoordelingslijst</button></div>',classes='below')
    return metrics([('Te controleren','4','Documenten'),('Planning aanvullen','2','Opdrachten'),('Klaar voor akkoord','3','Dossiers'),('Factuurvoorbereiding','6','Vervolg mogelijk')])+panel('Taken en dossiers',tasks([('▤','Weekstaat 043.pdf','Medewerker A · uren nalopen.'),('↗','Opdracht 012','Project West · tarief bevestigen.'),('✓','Factuurvoorbereiding','Project Zuid · klaar voor akkoord.')]))+panel('Verwerking volgen','<div class="panel-body"><div class="summary-row"><span>Gegevens herkend</span><strong>16 van 18</strong></div><div class="progress"><i style="width:89%"></i></div><p class="muted small">Elk document blijft gekoppeld aan zijn dossier.</p></div>',classes='below')


def login(verify=False):
    fields = '<label>Gebruikersnaam<input type="text" placeholder="Gebruikersnaam" autocomplete="off"></label><label>Wachtwoord<input type="password" placeholder="Wachtwoord" autocomplete="off"></label>'
    if verify:
        fields = '<p>Open je authenticator-app en vul de tijdelijke code in.</p><label>Verificatiecode<input type="text" inputmode="numeric" placeholder="6 cijfers" autocomplete="off"></label>'
    title = 'Extra controle' if verify else 'Veilig inloggen'
    return '<div class="login-example"><span class="login-symbol" aria-hidden="true">✓</span><h2>'+title+'</h2><p class="muted small">Neutrale voorbeeldomgeving</p>'+fields+'<button class="action primary">'+('Code controleren' if verify else 'Inloggen')+'</button><p class="login-note">Voorbeeldscherm · vul hier geen echte gegevens in.</p></div>'


def document(title,section,body):
    nav=''.join('<div class="nav-item'+(' active' if section==label else '')+f'"><b>{symbol}</b>{label}</div>' for symbol,label in [('◫','Overzicht'),('▤','Verkoop'),('↗','Vooruitkijken'),('▦','Voorraad'),('□','Inkoop'),('◎','Marketing'),('✓','Werkvoorraad')])
    style=Path(__file__).with_suffix('.css').read_text(encoding='utf-8')
    return f'''<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{escape(title)} · Neutraal voorbeeld</title><style>{style}</style></head><body><header class="topbar"><div class="brand"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>Werkruimte</div><div class="top-right"><span class="badge">Fictieve gegevens</span><span class="avatar">D</span></div></header><div class="layout"><aside class="sidebar"><p>JE OMGEVING</p>{nav}<div class="sidebar-note">Neutrale voorbeeldweergave<br>Geen bedrijfsgegevens</div></aside><main><div class="breadcrumb">Werkruimte / {section}</div><div class="page-head"><div><h1>{title}</h1><p>Overzicht, context en een concrete volgende stap.</p></div><span class="period desktop-only">Oktober 2026 ▾</span></div>{body}<p class="footer">Voorbeeldweergave · Alle namen, artikelen en cijfers zijn fictief</p></main></div><div class="mobile-bottom"><b>Overzicht</b><span>Cijfers</span><span>Acties</span><span>Meer</span></div></body></html>'''


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('output',type=Path)
    args=parser.parse_args();args.output.mkdir(parents=True,exist_ok=True)
    pages={
        'management':('Bedrijfsoverzicht','Overzicht',management()),
        'forecast':('Forecasting','Vooruitkijken',forecast()),
        'stock':('Voorraad en inkoop','Voorraad',stock()),
        'ranking':('Zoekwoordposities','Marketing',ranking()),
        'ranking-detail':('Slimme schakelaar','Marketing',ranking(True)),
        'marketing':('Marketingvoorstellen','Marketing',marketing()),
        'marketing-overview':('Campagneoverzicht','Marketing',marketing(True)),
        'listing':('Listing beoordelen','Marketing',listing()),
        'listing-editor':('Listing verbeteren','Marketing',listing(True)),
        'timesheets':('Uren en periodecontrole','Werkvoorraad',timesheets()),
        'documents':('Documentcontrole','Werkvoorraad',documents()),
        'intake':('Taken en dossiers','Werkvoorraad',intake())
    }
    for kind,title in [('timesheets','Weekstaten'),('documents','Documentcontrole'),('intake','Taken en dossiers')]:
        pages[kind+'-phone']=(title,'Werkvoorraad',mobile_work(kind))
        pages[kind+'-detail']=(title+' controleren','Werkvoorraad',mobile_work(kind,True))
    pages['login']=('Toegang tot je omgeving','Beveiliging',login())
    pages['login-verify']=('Tweestapsverificatie','Beveiliging',login(True))
    for name,(title,section,body) in pages.items():
        html=document(title,section,body)
        if name.startswith('login'):
            html=html.replace('<div class="layout">','<div class="layout auth-layout">')
            html=html.replace('<aside class="sidebar">','<aside class="sidebar" hidden>')
            html=html.replace('<div class="mobile-bottom">','<div class="mobile-bottom" hidden>')
        (args.output/(name+'.html')).write_text(html,encoding='utf-8')
    print(f'{len(pages)} static, neutral examples written to {args.output}')


if __name__=='__main__':main()
