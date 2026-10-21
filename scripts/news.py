"""Render news pages, RSS and the compact homepage list from content/news.json.

Edit the content, then run --write; --check verifies that every output is current.
Publication dates are editorial input and are never refreshed by a build.
"""
import argparse
from copy import deepcopy
from datetime import datetime, timezone
from email.utils import format_datetime
from html import escape
import json
from pathlib import Path
import re
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://opticore-insights.nl'
KINDS = {'nieuws': 'Nieuws & duiding', 'project': 'Projectupdate', 'inzicht': 'Praktisch inzicht'}
MONTHS = ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december']
START = '<!-- NEWS-LATEST:START -->'
END = '<!-- NEWS-LATEST:END -->'


def date_label(value):
    dt = datetime.fromisoformat(value)
    return f'{dt.day} {MONTHS[dt.month-1]} {dt.year}'


def safe_link(url):
    parsed = urlsplit(url)
    if not (parsed.scheme == 'https' and parsed.netloc) and not (url.startswith('/') and not url.startswith('//')):
        raise ValueError(f'Invalid public link: {url}')
    return escape(url, quote=True)


def route(article):
    return '/nieuws/' + article['slug'] + '/'


def byline(article):
    text = f'<span>{escape(KINDS[article["kind"]])}</span><time datetime="{article["published_at"]}">{date_label(article["published_at"])}</time>'
    return f'<p class="news-byline">{text}</p>'


def render():
    home = (ROOT / 'index.html').read_text(encoding='utf-8')
    header = re.search(r'<header class="site-header">.*?</header>', home, re.S).group()
    header = header.replace(' aria-current="page"', '')
    footer = re.search(r'<footer class="site-footer">.*?</footer>', home, re.S).group()
    if 'href="/nieuws/"' not in footer:
        raise ValueError('Keep the news overview reachable from the footer')
    graph = json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', home, re.S).group(1))['@graph']
    identity = [item for item in graph if item['@type'] in ['Organization','WebSite']]
    articles = json.loads((ROOT / 'content/news.json').read_text(encoding='utf-8'))['articles']
    seen = set()
    for article in articles:
        slug = article['slug']
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', slug) or slug in seen:
            raise ValueError(f'Invalid or duplicate article slug: {slug}')
        seen.add(slug)
        if article['kind'] not in KINDS:
            raise ValueError(f'Unknown article kind: {slug}')
        published = datetime.fromisoformat(article['published_at'])
        modified = datetime.fromisoformat(article['modified_at'])
        if published.tzinfo is None or modified.tzinfo is None or published > modified or modified > datetime.now(timezone.utc):
            raise ValueError(f'Article needs truthful, nonfuture dates with timezone: {slug}')
        if not article['sections'] or not article['sources'] or not article['description']:
            raise ValueError(f'Article needs substantive content and sources: {slug}')
        for link in article['sources'] + article['related']:
            safe_link(link['url'])
        if image := article.get('image'):
            if not image['src'].startswith('/assets/img/') or not (ROOT / image['src'].lstrip('/')).is_file():
                raise ValueError(f'Missing article image: {slug}')
            if image['width'] <= 0 or image['height'] <= 0:
                raise ValueError(f'Image dimensions missing: {slug}')
    articles.sort(key=lambda a: datetime.fromisoformat(a['published_at']), reverse=True)

    def document(path, title, description, main, article=None):
        url = BASE + path
        full_title = title + ' | OptiCore Insights'
        schema = deepcopy(identity)
        crumbs = [('Home',BASE+'/'),('Nieuws en praktijk',BASE+'/nieuws/')]
        if article:
            crumbs.append((title,url))
        schema.append({'@type':'BreadcrumbList','@id':url+'#broodkruimels','itemListElement':[
            {'@type':'ListItem','position':i+1,'name':name,'item':href} for i,(name,href) in enumerate(crumbs)]})
        schema.append({'@type':'WebPage' if article else 'CollectionPage','@id':url+'#pagina','url':url,'name':full_title,
                       'description':description,'inLanguage':'nl-NL','isPartOf':{'@id':BASE+'/#website'},'breadcrumb':{'@id':url+'#broodkruimels'}})
        if article:
            post = {'@type':'BlogPosting','@id':url+'#artikel','headline':title,'description':description,'inLanguage':'nl-NL',
                    'datePublished':article['published_at'],'dateModified':article['modified_at'],'mainEntityOfPage':{'@id':url+'#pagina'},
                    'author':{'@type':'Person','name':'Thomas Deijkers','url':BASE+'/over/'},'publisher':{'@id':BASE+'/#organisatie'},
                    'articleSection':KINDS[article['kind']]}
            if article.get('image'):
                post['image'] = BASE + article['image']['src']
            schema.append(post)
        else:
            schema.append({'@type':'ItemList','itemListElement':[{'@type':'ListItem','position':i+1,'name':a['title'],'url':BASE+route(a)} for i,a in enumerate(articles)]})
        image = BASE + (article.get('image',{}).get('src','/assets/img/opticore-insights-logo.png') if article else '/assets/img/opticore-insights-logo.png')
        return f'''<!doctype html>
<html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="/favicon.ico" sizes="any"><link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<title>{escape(full_title)}</title><meta name="description" content="{escape(description,quote=True)}"><link rel="canonical" href="{url}"><meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:title" content="{escape(full_title,quote=True)}"><meta property="og:description" content="{escape(description,quote=True)}"><meta property="og:url" content="{url}"><meta property="og:type" content="{'article' if article else 'website'}"><meta property="og:site_name" content="OptiCore Insights"><meta property="og:locale" content="nl_NL"><meta property="og:image" content="{image}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{escape(full_title,quote=True)}"><meta name="twitter:description" content="{escape(description,quote=True)}"><meta name="twitter:image" content="{image}">
<script type="application/ld+json">{json.dumps({'@context':'https://schema.org','@graph':schema},ensure_ascii=False,separators=(',',':'))}</script>
<link rel="stylesheet" href="/assets/css/site.css?v=20261022c"><link rel="stylesheet" href="/assets/css/news.css?v=20261020a"><link rel="alternate" type="application/rss+xml" title="OptiCore Insights — Nieuws en praktijk" href="{BASE}/nieuws/feed.xml">
<link rel="stylesheet" href="/assets/css/screenshot-gallery.css?v=20261021c"></head><body><a class="skip-link" href="#inhoud">Direct naar inhoud</a>{header}
<main id="inhoud">{main}</main>{footer}<script src="/assets/js/main.js?v=20261021a" defer></script><script src="/assets/js/screenshot-gallery.js?v=20261021c" defer></script></body></html>
'''

    outputs = {}
    cards = []
    for article in articles:
        url = route(article)
        cards.append(f'<article class="card news-card">{byline(article)}<h2><a href="{url}">{escape(article["title"])}</a></h2><p>{escape(article["summary"])}</p><a class="text-link" href="{url}">Lees het bericht →</a></article>')
        body = []
        if image := article.get('image'):
            body.append(f'<figure class="news-image"><a href="{image["src"]}" target="_blank" rel="noopener" aria-label="Vergroot de applicatiescreenshot"><img src="{image["src"]}" width="{image["width"]}" height="{image["height"]}" alt="{escape(image["alt"],quote=True)}"></a></figure>')
        for section in article['sections']:
            text = ''.join('<p>'+escape(p)+'</p>\n' for p in section.get('paragraphs',[]))
            if section.get('bullets'):
                text += '<ul>'+''.join('<li>'+escape(item)+'</li>' for item in section['bullets'])+'</ul>'
            body.append('<section><h2>'+escape(section['heading'])+'</h2>'+text+'</section>')
        sources = []
        for source in article['sources']:
            dates = []
            if source.get('published'): dates.append('Gepubliceerd '+date_label(source['published']))
            if source.get('checked'): dates.append('Geraadpleegd '+date_label(source['checked']))
            sources.append(f'<li><a href="{safe_link(source["url"])}">{escape(source["title"])}</a><small>{" · ".join(dates)}</small></li>')
        body.append('<section class="news-sources"><h2>'+('Bron en duiding' if article['kind']=='nieuws' else 'Bij dit project')+'</h2>'+('<p>De externe ontwikkeling komt uit onderstaande publicatie. De vertaling naar bedrijfsprocessen en het mkb is onze eigen analyse.</p>' if article['kind']=='nieuws' else '')+'<ul>'+''.join(sources)+'</ul></section>')
        related = ''.join(f'<li><a href="{safe_link(link["url"])}">{escape(link["title"])} →</a></li>' for link in article['related'])
        body.append('<section class="news-related"><h2>Verder lezen</h2><ul>'+related+'<li><a href="/nieuws/">Alle nieuws- en praktijkberichten →</a></li></ul></section>')
        modified = '' if article['modified_at']==article['published_at'] else f'<p class="news-byline">Bijgewerkt <time datetime="{article["modified_at"]}">{date_label(article["modified_at"])}</time></p>'
        main = f'''<nav class="breadcrumbs" aria-label="Broodkruimelpad"><ol class="container"><li><a href="/">Home</a></li><li><a href="/nieuws/">Nieuws en praktijk</a></li><li><span aria-current="page">{escape(article['title'])}</span></li></ol></nav>
<section class="page-intro"><div class="container">{byline(article)}<h1>{escape(article['title'])}</h1><p class="lead">{escape(article['summary'])}</p><p class="news-byline">Door <a href="/over/">Thomas Deijkers</a></p>{modified}</div></section>
<div class="container section"><article class="news-article" aria-label="{escape(article['title'],quote=True)}">{''.join(body)}</article></div>
<section class="section soft"><div class="container"><div class="section-heading"><h2>Wat zou in jouw bedrijf beter kunnen?</h2></div><div class="contact-strip"><p>Vertel welk werk tijd kost of welk inzicht je mist. Dan bespreken we een concrete eerste stap.</p><a class="button" href="/contact/">Bespreek je vraag</a></div></div></section>'''
        outputs[ROOT/url.lstrip('/')/'index.html'] = document(url,article['title'],article['description'],main,article)

    overview = '''<nav class="breadcrumbs" aria-label="Broodkruimelpad"><ol class="container"><li><a href="/">Home</a></li><li><span aria-current="page">Nieuws en praktijk</span></li></ol></nav>
<section class="page-intro"><div class="container"><h1>Nieuws en praktijk.</h1><p class="lead">Wat ontwikkelingen in dashboards, automatisering en websites voor je bedrijf kunnen betekenen. En hoe we die inzichten toepassen in onze opdrachten.</p></div></section>
<section class="section"><div class="container"><div class="cards">'''+''.join(cards)+'''</div><p class="news-overview-note">Nieuwsberichten bevatten bronverwijzingen en onze duiding. Projectupdates gaan over aantoonbare werkzaamheden. <a href="/projecten/">Bekijk ook de volledige projectverhalen →</a></p><p class="section-more"><a href="/nieuws/feed.xml">Volg de berichten via RSS →</a></p></div></section>'''
    outputs[ROOT/'nieuws/index.html'] = document('/nieuws/','Nieuws en praktijk: data, processen & automatisering','Ontwikkelingen in dashboards, automatisering en websites. ✓ Duiding voor ondernemers ✓ Updates uit echte projecten ✓ Praktische verbeteringen voor je bedrijf.',overview)

    items = ''.join(f'<li>{byline(a)}<a href="{route(a)}">{escape(a["title"])} →</a><p>{escape(a["summary"])}</p></li>' for a in articles[:2])
    latest = f'{START}\n<section class="section home-updates"><div class="container"><div class="section-heading"><h2>Nieuws en praktijk</h2><p>Ontwikkelingen in ons vakgebied en verbeteringen uit onze projecten.</p></div><ul class="resource-list">{items}</ul><p class="section-more"><a href="/nieuws/">Alle berichten →</a></p></div></section>\n{END}'
    if home.count(START)!=1 or home.count(END)!=1:
        raise ValueError('Homepage needs one NEWS-LATEST marker pair')
    home = re.sub(re.escape(START)+r'.*?'+re.escape(END),lambda _:latest,home,flags=re.S)
    outputs[ROOT/'index.html'] = home

    atom='http://www.w3.org/2005/Atom'; ET.register_namespace('atom',atom)
    rss=ET.Element('rss',version='2.0'); channel=ET.SubElement(rss,'channel')
    for tag,text in [('title','OptiCore Insights — Nieuws en praktijk'),('link',BASE+'/nieuws/'),('description','Nieuws, duiding en updates over dashboards, automatisering, websites en projecten.'),('language','nl-NL'),('lastBuildDate',format_datetime(max(datetime.fromisoformat(a['modified_at']) for a in articles).astimezone(timezone.utc),usegmt=True))]:
        ET.SubElement(channel,tag).text=text
    ET.SubElement(channel,f'{{{atom}}}link',href=BASE+'/nieuws/feed.xml',rel='self',type='application/rss+xml')
    for article in articles:
        item=ET.SubElement(channel,'item')
        for tag,text in [('title',article['title']),('link',BASE+route(article)),('description',article['summary']),('category',KINDS[article['kind']]),('pubDate',format_datetime(datetime.fromisoformat(article['published_at']).astimezone(timezone.utc),usegmt=True))]:
            ET.SubElement(item,tag).text=text
        ET.SubElement(item,'guid',isPermaLink='true').text=BASE+route(article)
    ET.indent(rss,space='  ')
    outputs[ROOT/'nieuws/feed.xml'] = ET.tostring(rss,encoding='utf-8',xml_declaration=True).decode()+'\n'
    return outputs, len(articles)


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    mode=parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--write',action='store_true');mode.add_argument('--check',action='store_true')
    args=parser.parse_args();outputs,count=render()
    for path,content in outputs.items():
        if args.write:
            path.parent.mkdir(parents=True,exist_ok=True);path.write_text(content,encoding='utf-8')
        elif not path.is_file() or path.read_text(encoding='utf-8')!=content:
            raise SystemExit(f'News output is stale: {path.relative_to(ROOT)}. Run python scripts/news.py --write')
    print(f'News OK: {count} articles, overview, RSS and homepage links; publication dates preserved.')


if __name__=='__main__':
    main()
