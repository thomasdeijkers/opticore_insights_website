"""Contracts for complete, indexable translations and unchanged form/state values."""
from collections import Counter
from html.parser import HTMLParser
import json
import re
import shutil
import subprocess
from urllib.parse import urlsplit
from i18n import ROOT, BASE, LANGUAGES, sources, routes, language_url, catalogue


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.lang = None
        self.canonical = []
        self.alternates = {}
        self.selectors = 0
        self.in_head = False
        self.h1 = 0
        self.fields = []
        self.links = []

    def handle_starttag(self, tag, pairs):
        attrs = dict(pairs)
        if tag == 'head': self.in_head = True
        if tag == 'html': self.lang = attrs['lang']
        if tag == 'h1': self.h1 += 1
        if tag == 'details' and 'data-site-language' in attrs: self.selectors += 1
        if tag == 'link' and attrs.get('rel') == 'canonical': self.canonical.append(attrs['href'])
        if tag == 'link' and attrs.get('hreflang'):
            assert self.in_head, 'hreflang belongs in the HTML head'
            self.alternates[attrs['hreflang']] = attrs['href']
        if tag in ('input', 'select', 'textarea', 'option') and attrs.get('name') != 'language' and 'data-site-language' not in attrs:
            # Option labels translate; explicit application values do not.
            self.fields.append((tag, attrs.get('name'), attrs.get('type'), attrs.get('value')))
        if tag in ('a', 'form', 'iframe'):
            self.links.append(attrs.get('href') or attrs.get('action') or attrs.get('src', ''))

    def handle_endtag(self, tag):
        if tag == 'head': self.in_head = False


mapping = routes()
assert len(set(route for editions in mapping.values() for route in editions.values())) == len(mapping)*3
for canonical, (source_path, _) in sources().items():
    editions = {lang:canonical if lang=='nl' else mapping[canonical][lang] for lang in LANGUAGES}
    original = None
    for lang, route in editions.items():
        parser = Page()
        path = ROOT/route.lstrip('/')/'index.html'
        parser.feed(path.read_text(encoding='utf-8'))
        assert parser.lang == lang and parser.canonical == [BASE+route], (route, 'canonical/lang')
        assert parser.alternates == {**{code:BASE+target for code,target in editions.items()}, 'x-default':BASE+canonical}, route
        assert parser.selectors == 1, (route, 'language selector missing/duplicated')
        # The credits page has one main heading as well; all 84 pages have one.
        assert parser.h1 == 1, (route, 'main heading')
        fields = [field for field in parser.fields if field[0] != 'option' or field[3] not in LANGUAGES]
        explicit = [field for field in fields if field[0] != 'option' or field[3] is not None]
        if lang == 'nl': original = explicit
        else:
            for field in original:
                assert field in explicit, (route, 'form/state value changed', field)
        for target in parser.links:
            if target.startswith(('/assets/', '/api/')) or not target or target.startswith(('#','mailto:','tel:')): continue
            parsed = urlsplit(target)
            if parsed.netloc and parsed.netloc != 'opticore-insights.nl': continue
            if parsed.path.endswith('.php'): continue
            if parsed.path.startswith('/'):
                assert (ROOT/parsed.path.lstrip('/')/'index.html').is_file() or (ROOT/parsed.path.lstrip('/')).is_file(), (route, 'broken internal page link', target)
    for lang in ('de', 'en', 'fr'):
        assert language_url(canonical+'?modules=marketing#modules', lang, mapping) == mapping[canonical][lang]+'?modules=marketing#modules'

for lang in ('de','en','fr'):
    for source, value in catalogue(lang).items():
        assert isinstance(value,str) and value.strip(), (lang, 'empty translation')
        assert Counter(re.findall(r'__I18N_\d+__', source)) == Counter(re.findall(r'__I18N_\d+__', value)), (lang, 'interpolation markers changed', source)
        assert not re.search(r'ZX[QB]\d{5}ZX[QB]',value), (lang,'draft marker leaked')
assert language_url('/api/demo-access.php','en',mapping)=='/api/demo-access.php'
assert language_url('https://example.org/contact/','fr',mapping)=='https://example.org/contact/'
assert language_url('javascript:alert(1)','fr',mapping)=='javascript:alert(1)'
if shutil.which('php'):
    # Empty invalid forms stop before mail(); exercise real server-side response localisation.
    for requested in ['nl','de','en','fr','../../.env',['fr']]:
        language = requested if isinstance(requested,str) and requested in LANGUAGES else 'nl'
        response = subprocess.run(['php','-r', "$_SERVER['REQUEST_METHOD']='POST'; $_POST=json_decode($argv[1],true); include $argv[2];", json.dumps({'language':requested}), str(ROOT/'contact.php')], check=True, capture_output=True, encoding='utf-8').stdout
        assert f'<html lang="{language}">' in response
        target = '/contact/' if language=='nl' else mapping['/contact/'][language]
        assert f'href="{target}"' in response, 'Contact error returns to the same language'
        if language!='nl': assert 'Bericht niet verzonden.' not in response
print(f'I18n OK: {len(mapping)*4} pages, reciprocal alternates, one selector, existing field values, translated route targets and preserved interpolation markers.')
