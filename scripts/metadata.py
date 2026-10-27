"""Audit current page metadata and export a readable, canonical URL inventory.

Generated reports belong outside the published source tree. The HTML files remain
our source of truth; HTML aliases are checked, but listed only once per canonical.
"""
import argparse
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from html import escape
from html.parser import HTMLParser
import json
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://opticore-insights.nl'


class Metadata(HTMLParser):
    def __init__(self):
        super().__init__()
        self.titles = []
        self.title_parts = []
        self.in_title = False
        self.language = 'nl'
        self.meta = {}
        self.canonical = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'html':
            self.language = attrs.get('lang', 'nl')
        if tag == 'title':
            self.in_title = True
            self.title_parts = []
        if tag == 'meta':
            name = attrs.get('name') or attrs.get('property')
            if name:
                self.meta.setdefault(name, []).append(attrs.get('content', ''))
        if tag == 'link' and 'canonical' in attrs.get('rel', '').split():
            self.canonical.append(attrs.get('href', ''))

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False
            self.titles.append(''.join(self.title_parts).strip())

    def handle_data(self, value):
        if self.in_title:
            self.title_parts.append(value)

    def record(self, source):
        if len(self.titles) != 1 or not self.titles[0]:
            raise ValueError(f'{source}: needs one nonempty title')
        if len(self.meta.get('description', [])) != 1 or not self.meta['description'][0]:
            raise ValueError(f'{source}: needs one nonempty meta description')
        if len(self.canonical) != 1 or not self.canonical[0].startswith(BASE + '/'):
            raise ValueError(f'{source}: needs one site canonical')
        title, description = self.titles[0], self.meta['description'][0]
        for name, expected in [('og:title', title), ('twitter:title', title),
                               ('og:description', description), ('twitter:description', description),
                               ('og:url', self.canonical[0])]:
            if self.meta.get(name) != [expected]:
                raise ValueError(f'{source}: {name} does not match page metadata')
        robots = self.meta.get('robots', [''])[0]
        return {'url': self.canonical[0], 'title': title, 'description': description, 'language': self.language,
                'robots': robots, 'indexable': 'noindex' not in robots.lower(),
                'title_length': len(title), 'description_length': len(description)}


def parse(text, source):
    parser = Metadata()
    parser.feed(text)
    return parser.record(source)


def inventory():
    records = {}
    for path in sorted(ROOT.rglob('*.html')):
        if any(part.startswith('.') or part in ('node_modules', 'backups')
               for part in path.relative_to(ROOT).parts):
            continue
        record = parse(path.read_text(encoding='utf-8'), path.relative_to(ROOT))
        if record['url'] in records and records[record['url']] != record:
            raise ValueError(f'{path}: alias metadata differs')
        records[record['url']] = record
    result = sorted(records.values(), key=lambda item: (not item['indexable'], item['url']))
    for field in ('title', 'description'):
        duplicates = [text for text, count in Counter((item['language'], item[field]) for item in result if item['indexable']).items() if count > 1]
        if duplicates:
            raise ValueError(f'Duplicate indexable {field}: {duplicates}')
    return result


def verify_live(records):
    def verify(expected):
        request = Request(expected['url'], headers={'User-Agent': 'OptiCore-Metadata-Check/1.0'})
        with urlopen(request, timeout=30) as response:
            actual = parse(response.read().decode('utf-8'), expected['url'])
        if actual != expected:
            raise ValueError(f'Live metadata differs: {expected["url"]}')
        return expected['url']
    with ThreadPoolExecutor(max_workers=6) as pool:
        return list(pool.map(verify, records))


def export(records, destination):
    if destination.resolve() == ROOT or ROOT in destination.resolve().parents:
        raise ValueError('Export reports outside the published source tree')
    destination.mkdir(parents=True, exist_ok=True)
    indexed = sum(item['indexable'] for item in records)
    stamp = datetime.now().astimezone().strftime('%d-%m-%Y %H:%M %Z')
    intro = f'OptiCore Insights — metadataoverzicht\nStand: {stamp}\n{len(records)} canonieke pagina’s: {indexed} indexeerbaar, {len(records)-indexed} bewust noindex.\nHTML-aliassen staan niet dubbel in deze lijst. Open Graph en Twitter gebruiken dezelfde titel en omschrijving.\n'
    lines = [intro]
    for group in (True, False):
        lines.append('\n' + ('INDEXEERBARE PAGINA’S' if group else 'PAGINA’S MET NOINDEX') + '\n')
        for number, item in enumerate((item for item in records if item['indexable'] == group), 1):
            lines.append(f'{number}. {item["url"]}\nTitel ({item["title_length"]} tekens): {item["title"]}\nMetaomschrijving ({item["description_length"]} tekens): {item["description"]}\nRobots: {item["robots"]}\n')
    lines.append('Google bepaalt de uiteindelijke weergave van titels en snippets. Deze lijst bevat de metadata die op de website is ingesteld.\n')
    text = '\n'.join(lines)
    (destination / 'opticore-metadataoverzicht.txt').write_text(text, encoding='utf-8', newline='\n')
    tables = []
    for group in (True, False):
        rows = []
        for item in records:
            if item['indexable'] != group:
                continue
            rows.append('<tr><td><a href="'+escape(item['url'], quote=True)+'">'+escape(item['url'].removeprefix(BASE))+'</a></td><td>'+escape(item['title'])+f'<small>{item["title_length"]} tekens</small></td><td>'+escape(item['description'])+f'<small>{item["description_length"]} tekens</small></td><td><code>'+escape(item['robots'])+'</code></td></tr>')
        heading = 'Indexeerbare pagina’s' if group else 'Pagina’s met noindex'
        tables.append('<section><h2>'+heading+'</h2><div class="table-wrap"><table><thead><tr><th scope="col">Pagina-URL</th><th scope="col">Titel</th><th scope="col">Metaomschrijving</th><th scope="col">Robots</th></tr></thead><tbody>'+''.join(rows)+'</tbody></table></div></section>')
    html = '''<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Metadataoverzicht — OptiCore Insights</title><style>
*{box-sizing:border-box}body{margin:0;color:#223448;background:#f3f6f9;font:15px/1.6 system-ui,sans-serif}main{max-width:1500px;margin:auto;padding:36px 30px}h1,h2{color:#152c42;line-height:1.2}h1{font-size:32px}h2{font-size:23px;margin-top:38px}.intro{max-width:920px}.facts{display:flex;gap:15px;flex-wrap:wrap;margin:24px 0}.facts span{padding:9px 14px;background:#fff;border:1px solid #cbd6df;border-radius:5px}table{border-collapse:collapse;width:100%;background:#fff}th,td{text-align:left;vertical-align:top;padding:15px;border:1px solid #d2dce5}th{background:#152c42;color:white}td:first-child{width:20%;overflow-wrap:anywhere}td:nth-child(2){width:27%}td:nth-child(3){width:40%}td:last-child{width:13%}small{display:block;color:#52667b;margin-top:10px}a{color:#175a96}code{font-size:12px;overflow-wrap:anywhere}.table-wrap{overflow:auto}footer{font-size:14px;color:#52667b;margin:25px 0}@media(max-width:700px){main{padding:24px 18px}table{min-width:1000px}}
</style></head><body><main><h1>Metadataoverzicht OptiCore Insights</h1><p class="intro">De ingestelde paginatitels en metaomschrijvingen, per canonieke URL. HTML-aliassen zijn samengevoegd. Open Graph en Twitter gebruiken dezelfde titel en omschrijving.</p>'''
    html += f'<p>Stand: {escape(stamp)}</p><div class="facts"><span>{len(records)} canonieke pagina’s</span><span>{indexed} indexeerbaar</span><span>{len(records)-indexed} met noindex</span></div>'
    html += ''.join(tables) + '<footer>Google bepaalt de uiteindelijke weergave van titels en snippets. Dit overzicht bevat de metadata die op de website is ingesteld.</footer></main></body></html>\n'
    (destination / 'opticore-metadataoverzicht.html').write_text(html, encoding='utf-8', newline='\n')
    return text


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--verify-live', action='store_true')
    parser.add_argument('--export', type=Path)
    parser.add_argument('--json', action='store_true')
    args = parser.parse_args()
    records = inventory()
    if args.verify_live:
        verify_live(records)
    if args.export:
        export(records, args.export)
    if args.json:
        print(json.dumps(records, ensure_ascii=False))
    else:
        print(f'Metadata OK: {len(records)} canonical pages, {sum(item["indexable"] for item in records)} indexable; unique titles and descriptions; aliases and social metadata agree.' + (' All live pages match.' if args.verify_live else ''))


if __name__ == '__main__':
    main()
