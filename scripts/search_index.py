"""Build the public site's local search index from canonical, indexable HTML.

The JSON is generated locally and during deployment; it is not a source file.
Forms, navigation, screenshot controls and unindexed example pages are excluded.
"""
import argparse
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://opticore-insights.nl'
OUTPUT = ROOT / 'assets/search-index.json'
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
SERVICES = {'diensten','dashboard-ontwikkeling','procesautomatisering','modulaire-webapp','webapp-samenstellen',
            'website-ontwikkeling','keuzehulpen','bol-ondernemers','platform-koppelingen',
            'marketplace-koppelingen','webshop-koppelingen','verzendsoftware-koppelingen',
            'prijzen','gebruikskosten','bedrijfsscan','beveiliging'}


def clean(value):
    return re.sub(r'\s+', ' ', value).strip()


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.canonical = None
        self.indexable = True
        self.description = ''
        self.title = ''
        self.seo_title = ''
        self.in_title = False
        self.language = 'nl'
        self.sections = []
        self.current = {'heading':'', 'anchor':'', 'parts':[]}
        self.heading = None

    def handle_starttag(self, tag, pairs):
        attrs = dict(pairs)
        if tag == 'html':
            self.language = attrs.get('lang', 'nl')
        if tag == 'title':
            self.in_title = True
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical = attrs.get('href')
        if tag == 'meta':
            if attrs.get('name') == 'description':
                self.description = attrs.get('content', '')
            if attrs.get('name', '').lower() in ('robots','googlebot'):
                self.indexable &= 'noindex' not in attrs.get('content', '').lower()
        parent_main = any(item['tag'] == 'main' for item in self.stack)
        skip = (any(item['skip'] for item in self.stack) or tag in ('script','style','nav','form','dialog')
                or 'data-screen-gallery' in attrs or 'data-expectations' in attrs)
        if parent_main and not skip and tag in ('h1','h2','h3'):
            self.finish_section()
            anchor = attrs.get('id') or next((item['id'] for item in reversed(self.stack)
                                             if item['id'] and item['tag'] != 'main'), '')
            self.current = {'heading':'', 'anchor':anchor, 'parts':[]}
            self.heading = {'tag':tag, 'parts':[]}
        if tag not in VOID:
            self.stack.append({'tag':tag, 'skip':skip, 'id':attrs.get('id', '')})
        elif parent_main and not skip:
            self.current['parts'].append(' ')

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False
        if self.heading and tag == self.heading['tag']:
            text = clean(' '.join(self.heading['parts']))
            self.current['heading'] = text
            if tag == 'h1':
                self.title = text
            self.heading = None
        for pos in range(len(self.stack)-1, -1, -1):
            if self.stack[pos]['tag'] == tag:
                self.stack = self.stack[:pos]
                break
        self.current['parts'].append(' ')

    def handle_data(self, value):
        if self.in_title:
            self.seo_title += value
            return
        if not any(item['tag'] == 'main' for item in self.stack) or any(item['skip'] for item in self.stack):
            return
        if self.heading:
            self.heading['parts'].append(value)
        else:
            self.current['parts'].append(value)

    def finish_section(self):
        text = clean(' '.join(self.current['parts']))
        if text or self.current['heading']:
            self.sections.append({'heading':self.current['heading'], 'anchor':self.current['anchor'], 'text':text})


def category(path):
    # Foreign route names are resolved to their original editorial category.
    if path.startswith(('/de/', '/en/', '/fr/')):
        from i18n import routes
        path = next((original for original, editions in routes().items() if path in editions.values()), path)
    first = path.strip('/').split('/')[0]
    if first == 'projecten': return 'Projecten'
    if first == 'nieuws': return 'Nieuws'
    if first in SERVICES: return 'Diensten'
    if first in ('','over','contact'): return 'OptiCore'
    return 'Kennis'


def build():
    records = []
    for path in sorted(ROOT.rglob('index.html')):
        if any(part.startswith('.') or part in ('node_modules','backups') for part in path.relative_to(ROOT).parts):
            continue
        page = Page()
        page.feed(path.read_text(encoding='utf-8'))
        page.finish_section()
        if not page.indexable:
            continue
        assert page.canonical and page.canonical.startswith(BASE+'/'), f'{path}: invalid canonical'
        url = urlsplit(page.canonical).path
        assert path == ROOT/url.lstrip('/')/'index.html', f'{path}: canonical source mismatch'
        assert page.title and page.sections, f'{path}: empty searchable page'
        title = clean(page.seo_title).removesuffix(' | OptiCore Insights') or page.title
        records.append({'url':url, 'title':title, 'description':page.description, 'language':page.language,
                        'category':category(url), 'sections':page.sections})
    assert len({r['url'] for r in records}) == len(records), 'Duplicate search URLs'
    assert not any(r['url'].startswith('/zoeken/') for r in records), 'Search results must be unindexed'
    return json.dumps({'version':1, 'pages':records}, ensure_ascii=False, separators=(',',':'))+'\n', len(records)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--write', action='store_true')
    mode.add_argument('--check', action='store_true')
    args = parser.parse_args()
    content, count = build()
    if args.write:
        OUTPUT.write_text(content, encoding='utf-8')
    elif not OUTPUT.exists() or OUTPUT.read_text(encoding='utf-8') != content:
        raise SystemExit('Search index is stale. Run python scripts/search_index.py --write')
    print(f'Search index OK: {count} canonical public pages; no forms, aliases or unindexed examples.')


if __name__ == '__main__':
    main()
