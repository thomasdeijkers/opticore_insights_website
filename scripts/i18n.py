"""Build four local language editions from Dutch sources and reviewed catalogues.

No translation API is called by this build or by the published website.
Dutch URLs stay unchanged. Generated language folders/assets are deployment output.
"""
import argparse
from public_components import public_components
from html import escape, unescape
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import xml.etree.ElementTree as ET
from urllib.parse import urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / 'content/i18n'
BASE = 'https://opticore-insights.nl'
LANGUAGES = {'nl': 'Nederlands', 'de': 'Deutsch', 'en': 'English', 'fr': 'Français'}
LOCALES = {'nl': 'nl_NL', 'de': 'de_DE', 'en': 'en_GB', 'fr': 'fr_FR'}
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}
DISPLAY_ATTRS = {'alt', 'title', 'placeholder', 'aria-label', 'aria-description', 'data-mail-label', 'data-screen-title', 'data-label'}
META_TEXT = {'description', 'og:title', 'og:description', 'twitter:title', 'twitter:description'}
SCHEMA_TEXT = {'name', 'description', 'headline', 'text', 'caption', 'articleSection', 'keywords'}
VERSION = '20261029-team-footer'


def clean(value):
    return re.sub(r'\s+', ' ', unescape(value)).strip()


def meaningful(value):
    return bool(re.search(r'[A-Za-zÀ-ÿ]{2}', re.sub(r'__I18N_\d+__', '', value)))


def strip_integration(source):
    return re.sub(r'<!-- i18n:(?:head|selector|form) -->.*?<!-- /i18n -->', '', source, flags=re.S)


def public_navigation(source, canonical):
    """Keep supporting public pages discoverable without editing every template."""
    entries = [('/prijzen/', '/implementatie/', 'Implementatie'),
               ('/over/', '/team/', 'Team'),
               ('/team/', '/werken-bij/', 'Samenwerken')]
    def menu(match):
        block = match[0]
        for after, path, label in entries:
            if f'href="{path}"' not in block:
                current = ' aria-current="page"' if canonical == path else ''
                block = re.sub(r'(<a\b[^>]*href="' + re.escape(after) + r'"[^>]*>.*?</a>)',
                               lambda m: m[1] + f'<a href="{path}"{current}>{label}</a>', block, count=1, flags=re.S)
        return block
    def footer(match):
        block = match[0]
        for after, path, label in entries:
            if f'href="{path}"' not in block:
                block = re.sub(r'(<li><a\b[^>]*href="' + re.escape(after) + r'"[^>]*>.*?</a></li>)',
                               lambda m: m[1] + f'<li><a href="{path}">{label}</a></li>', block, count=1, flags=re.S)
        return block
    source = re.sub(r'<nav\b(?=[^>]*\bdata-menu(?:[ >]))[^>]*>.*?</nav>', menu, source, flags=re.S)
    return re.sub(r'<nav\b(?=[^>]*aria-label="Verder kijken in de footer")[^>]*>.*?</nav>', footer, source, flags=re.S)


def sources():
    result = {}
    for path in ROOT.rglob('index.html'):
        parts = path.relative_to(ROOT).parts
        if any(p.startswith('.') or p in ('node_modules', 'backups') for p in parts) or parts[0] in ('de', 'en', 'fr'):
            continue
        source = strip_integration(path.read_text(encoding='utf-8'))
        match = re.search(r'rel="canonical" href="' + re.escape(BASE) + r'([^"]+)"', source)
        if match:
            result[match[1]] = (path, public_components(public_navigation(source, match[1])))
    return dict(sorted(result.items()))


def routes():
    return json.loads((CONTENT / 'routes.json').read_text(encoding='utf-8'))


def catalogue(language):
    dictionary = json.loads((CONTENT/f'{language}.json').read_text(encoding='utf-8'))
    terminology = json.loads((CONTENT/'terminology.json').read_text(encoding='utf-8'))
    dictionary.update({source: values[language] for source, values in terminology.items()})
    # The brand promise is always English, including on translated editions.
    dictionary.update({line: line for line in ('Insight at the core of', 'every smart decision.')})
    return dictionary


def language_url(value, language, mapping):
    parsed = urlsplit(value)
    if parsed.netloc and parsed.netloc != 'opticore-insights.nl':
        return value
    if parsed.scheme and parsed.scheme not in ('https', 'http'):
        return value
    path = parsed.path
    if not path.startswith('/'):
        return value
    if path == '/nieuws/feed.xml':
        path = path if language == 'nl' else mapping['/nieuws/'][language]+'feed.xml'
        return urlunsplit((parsed.scheme, parsed.netloc, path, parsed.query, parsed.fragment))
    canonical = path
    if path.endswith('.html'):
        canonical = path[:-5].rstrip('/') + '/'
    if path == '/index.html':
        canonical = '/'
    # Keep assets, API routes and downloads at the shared root.
    if canonical not in mapping:
        return value
    path = canonical if language == 'nl' else mapping[canonical][language]
    return urlunsplit((parsed.scheme, parsed.netloc, path, parsed.query, parsed.fragment))


class Document(HTMLParser):
    def __init__(self, language='nl', dictionary=None, mapping=None):
        super().__init__(convert_charrefs=True)
        self.language = language
        self.dictionary = dictionary
        self.mapping = mapping or {}
        self.parts = []
        self.strings = set()
        self.stack = []
        self.script = None
        self.script_parts = []
        self.option_values = []

    def text(self, value):
        normalized = clean(value)
        if meaningful(normalized):
            self.strings.add(normalized)
            if self.dictionary is not None and self.language != 'nl':
                if normalized not in self.dictionary:
                    raise ValueError(f'Missing {self.language} translation: {normalized[:180]}')
                translated = self.dictionary[normalized]
                return re.match(r'^\s*', value)[0] + translated + re.search(r'\s*$', value)[0]
        return unescape(value)

    def schema(self, value, key=''):
        if isinstance(value, dict):
            result = {k: self.schema(v, k) for k, v in value.items()}
            if 'inLanguage' in result or result.get('@type') in ('WebPage', 'CollectionPage', 'Article', 'NewsArticle', 'FAQPage'):
                result['inLanguage'] = self.language
            return result
        if isinstance(value, list):
            return [self.schema(v, key) for v in value]
        if isinstance(value, str):
            if value.startswith(BASE) and not value.endswith(('#organization', '#website')):
                return language_url(value, self.language, self.mapping)
            if key in SCHEMA_TEXT:
                return self.text(value)
        return value

    def handle_starttag(self, tag, pairs):
        attrs = dict(pairs)
        updates = {}
        if tag == 'html':
            updates['lang'] = self.language
        if tag == 'script':
            self.script = attrs.get('type', 'javascript')
            self.script_parts = []
        for key, value in pairs:
            if value is None:
                continue
            if key in DISPLAY_ATTRS:
                updates[key] = self.text(value)
            if key in ('href', 'action', 'src', 'data-src'):
                updates[key] = language_url(value, self.language, self.mapping)
        if tag == 'meta':
            name = attrs.get('name') or attrs.get('property')
            if name in META_TEXT:
                updates['content'] = self.text(attrs.get('content', ''))
            elif name == 'og:locale':
                updates['content'] = LOCALES[self.language]
            elif name == 'og:url':
                updates['content'] = language_url(attrs.get('content', ''), self.language, self.mapping)
        if tag == 'option':
            self.option_values.append((len(self.parts), 'value' in attrs, []))
        raw = self.get_starttag_text()
        for key, value in updates.items():
            pattern = r'(?<![\w-])' + re.escape(key) + r'\s*=\s*(?:"[^"]*"|\x27[^\x27]*\x27|[^\s>]+)'
            replacement = key + '="' + escape(value, quote=True) + '"'
            if re.search(pattern, raw, re.I):
                raw = re.sub(pattern, lambda _: replacement, raw, flags=re.I)
            else:
                raw = raw[:-1] + ' ' + replacement + '>'
        self.parts.append(raw)
        if tag not in VOID:
            self.stack.append(tag)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID and self.stack and self.stack[-1] == tag:
            self.stack.pop()

    def handle_endtag(self, tag):
        if tag == 'script':
            value = ''.join(self.script_parts)
            if self.script == 'application/ld+json':
                value = json.dumps(self.schema(json.loads(value)), ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
            self.parts.append(value)
            self.script = None
        if tag == 'option' and self.option_values:
            position, explicit, values = self.option_values.pop()
            if not explicit:
                self.parts[position] = self.parts[position][:-1] + ' value="' + escape(unescape(''.join(values)), quote=True) + '">'
        self.parts.append('</' + tag + '>')
        if tag in self.stack:
            self.stack = self.stack[:len(self.stack)-1-self.stack[::-1].index(tag)]

    def handle_data(self, value):
        if self.script is not None:
            self.script_parts.append(value)
        elif 'style' in self.stack:
            self.parts.append(value)
        else:
            if self.option_values:
                self.option_values[-1][2].append(value)
            translated = self.text(value)
            self.parts.append(escape(translated, quote=False))

    def handle_entityref(self, name):
        self.handle_data(unescape('&' + name + ';'))

    def handle_charref(self, name):
        self.handle_data(unescape('&#' + name + ';'))

    def handle_comment(self, data):
        self.parts.append('<!--' + data + '-->')

    def handle_decl(self, decl):
        self.parts.append('<!' + decl + '>')


def decode_js(value):
    escapes = {'n': '\n', 'r': '\r', 't': '\t', 'b': '\b', 'f': '\f', 'v': '\v'}
    return re.sub(r'\\(?:u[\da-fA-F]{4}|x[\da-fA-F]{2}|[\s\S])', lambda m: chr(int(m[0][2:], 16)) if m[0][1] in ('u', 'x') else escapes.get(m[0][1], m[0][1]), value)


def js_strings(source):
    """Collect literals and template output; never rewrite executable source/state IDs."""
    result = []
    def scan(i, expression=False):
        depth = 0
        previous = '='
        while i < len(source):
            char = source[i]
            if source.startswith('//', i):
                i = source.find('\n', i) if '\n' in source[i:] else len(source)
            elif source.startswith('/*', i):
                end = source.find('*/', i+2)
                i = end+2 if end >= 0 else len(source)
            elif char in ('"', "'", '`'):
                quote = char; i += 1; raw = []; token = 0
                while i < len(source) and source[i] != quote:
                    if source[i] == '\\' and i+1 < len(source):
                        raw.append(source[i:i+2]); i += 2
                    elif quote == '`' and source.startswith('${', i):
                        raw.append(f'__I18N_{token}__'); token += 1
                        i = scan(i+2, True)
                    else:
                        raw.append(source[i]); i += 1
                i += 1
                value = decode_js(''.join(raw))
                if len(value) <= 5000: result.append(value)
                previous = 'x'
            elif char == '/' and previous in '=([{,:;!&|?':
                i += 1; in_class = False
                while i < len(source):
                    if source[i] == '\\': i += 2; continue
                    if source[i] == '[': in_class = True
                    if source[i] == ']': in_class = False
                    if source[i] == '/' and not in_class: i += 1; break
                    if source[i] == '\n': break
                    i += 1
                previous = 'x'
            elif char == '{':
                depth += 1; previous = char; i += 1
            elif char == '}':
                if expression and depth == 0: return i+1
                depth -= 1; previous = char; i += 1
            else:
                if not char.isspace(): previous = char
                i += 1
        return i
    scan(0)
    return result


def collect():
    strings = set()
    for _, source in sources().values():
        doc = Document()
        doc.feed(source)
        strings.update(doc.strings)
    from neutral_visuals import example_documents
    for source in example_documents().values():
        doc = Document()
        doc.feed(source)
        strings.update(doc.strings)
    for path in [*(ROOT/'assets/js').glob('*.js'), ROOT/'contact.php', ROOT/'api/demo-access.php', ROOT/'api/bedrijfsscan.php', ROOT/'api/scan-lib.php']:
        if path.name == 'i18n.js':
            continue
        for value in js_strings(path.read_text(encoding='utf-8')):
            # PHP session/storage keys are identifiers, never displayed copy.
            if path.suffix == '.php' and re.fullmatch(r'[a-z]+(?:_[a-z]+)+', value):
                continue
            if '<' in value and '>' in value:
                doc = Document()
                try:
                    doc.feed(value)
                    strings.update(doc.strings)
                except (ValueError, json.JSONDecodeError):
                    pass
            else:
                value = clean(value)
                if meaningful(value) and not re.search(r'[{}<>]|=>|(?:^[/#.\[\]]|https?://|^\w+(?:-\w+){2,}$)', value) and len(value) < 1500:
                    strings.add(value)
    def json_text(value):
        if isinstance(value, dict):
            for item in value.values(): json_text(item)
        elif isinstance(value, list):
            for item in value: json_text(item)
        elif isinstance(value, str) and meaningful(value):
            strings.add(clean(value))
    json_text(json.loads((ROOT/'assets/data/bedrijfsscan.json').read_text(encoding='utf-8')))
    for node in ET.parse(ROOT/'nieuws/feed.xml').iter():
        if node.tag in ('title', 'description', 'category') and node.text:
            strings.add(clean(node.text))
    strings.update(['Taal kiezen', 'Huidige taal', 'Terug naar contact', 'Naar home', 'Verstuurde taal', 'Bedankt voor je bericht.', 'Bericht niet verzonden.'])
    return sorted(strings)


def integration(source, canonical, language, mapping):
    source = re.sub(r'(/assets/js/(?:site-search|bedrijfsscan|modular-webapp|module-demo|usage-costs|implementation-roadmap|demo-picklist|demo-marketing-reference|demo-full-workspace|demo-page-catalogue|demo-access|screenshot-gallery|marketplace-demo-data)\.js)(?:\?v=[^"\s]*)?', lambda m: m[1] + '?v=' + VERSION, source)
    source = re.sub(r'(/assets/css/demo-full-workspace\.css)(?:\?v=[^"\s]*)?', lambda m: m[1] + '?v=' + VERSION, source)
    if language == 'nl':
        source = re.sub(r'(/assets/img/(?:examples/client-(?:management|stock|forecast|ranking|marketing|listing)-[\w.-]+\.jpg|module-examples/client-[\w.-]+\.jpg|demo/dashboard-client-[\w.-]+\.png))(?:\?[^\s"<>]*)?', lambda m: m[1] + '?v=' + VERSION, source)
    if language != 'nl':
        manifest = ROOT/'assets/img/localized/manifest.json'
        revision = json.loads(manifest.read_text(encoding='utf-8'))['revision'] if manifest.is_file() else VERSION
        source = re.sub(r'/assets/img/(demo|examples|module-examples)/([\w.-]+\.(?:jpg|png))(?:\?[^\s"<>]*)?', lambda m:f'/assets/img/localized/{language}/{m[1]}/{m[2]}?v={revision}', source)
    alternatives = ''.join(f'<link rel="alternate" hreflang="{lang}" href="{BASE}{canonical if lang == "nl" else mapping[canonical][lang]}">' for lang in LANGUAGES)
    alternatives += f'<link rel="alternate" hreflang="x-default" href="{BASE}{canonical}">'
    # Marketing styles must never change native app navigation or captures.
    actions_css = '' if 'class="demo-shell"' in source else '<link rel="stylesheet" href="/assets/css/link-buttons.css?v=20261029-footer-links">'
    head = f'<!-- i18n:head -->{alternatives}<link rel="stylesheet" href="/assets/css/i18n.css?v={VERSION}">{actions_css}<script src="/assets/i18n/{language}.js?v={VERSION}" defer></script><script src="/assets/js/i18n.js?v={VERSION}" defer></script><!-- /i18n -->'
    # These deferred scripts must precede existing deferred application scripts.
    position = re.search(r'<script\b[^>]*\bsrc=', source)
    if position and position.start() < source.index('</head>'):
        source = source[:position.start()] + head + source[position.start():]
    else:
        source = source.replace('</head>', head + '</head>', 1)
    labels = {'nl':'Taal kiezen', 'de':'Sprache wählen', 'en':'Choose language', 'fr':'Choisir la langue'}
    flag = lambda lang: f'<img src="/assets/img/flags/{lang}.svg" alt="" width="27" height="18">'
    selector = f'<!-- i18n:selector --><details class="language-picker" data-site-language="{language}"><summary aria-label="{labels[language]}: {LANGUAGES[language]}" title="{labels[language]}">{flag(language)}<span class="language-sr">{LANGUAGES[language]}</span><span class="language-chevron" aria-hidden="true"></span></summary><nav aria-label="{labels[language]}">' + ''.join(f'<a href="{canonical if lang == "nl" else mapping[canonical][lang]}" data-language="{lang}" lang="{lang}" hreflang="{lang}"' + (' aria-current="page"' if lang == language else '') + f'>{flag(lang)}<span>{label}</span></a>' for lang, label in LANGUAGES.items()) + '</nav></details><!-- /i18n -->'
    if 'class="nav-wrap' in source or 'class="container nav-wrap' in source:
        source = re.sub(r'(<nav\b(?=[^>]*\bdata-menu(?:[\s=>]))[^>]*>)', lambda m: m[1] + selector, source, count=1)
    elif 'class="demo-topbar-actions"' in source:
        source = source.replace('<div class="demo-topbar-actions">', '<div class="demo-topbar-actions">' + selector, 1)
    else:
        wrapped = selector.replace('<!-- i18n:selector -->', '<!-- i18n:selector --><div class="standalone-language">', 1).replace('<!-- /i18n -->', '</div><!-- /i18n -->')
        source = re.sub(r'(<body\b[^>]*>)', lambda m: m[1] + wrapped, source, count=1)
    source = re.sub(r'(<form\b[^>]*(?:data-contact-form|id="scan-contact-form")[^>]*>)', lambda m: m[1] + f'<!-- i18n:form --><input type="hidden" name="language" value="{language}"><!-- /i18n -->', source)
    # Scripts initialise after the language catalogue/observer, before interaction.
    return source


def build(check=False):
    mapping = routes()
    originals = sources()
    assert set(mapping) == set(originals), 'Route manifest must cover every Dutch canonical page'
    strings = collect()
    dictionaries = {'nl': {}}
    for language in ('de', 'en', 'fr'):
        dictionaries[language] = catalogue(language)
        missing = set(strings) - set(dictionaries[language])
        if missing:
            raise ValueError(f'{language}: {len(missing)} missing translations: {sorted(missing)[:8]}')
    output = {}
    for canonical, (path, source) in originals.items():
        output[path] = integration(source, canonical, 'nl', mapping)
        alias = ROOT/(canonical.strip('/') + '.html')
        if canonical != '/' and alias.is_file():
            output[alias] = output[path]
        for language in ('de', 'en', 'fr'):
            doc = Document(language, dictionaries[language], mapping)
            doc.feed(source)
            output[ROOT/mapping[canonical][language].lstrip('/')/'index.html'] = integration(''.join(doc.parts), canonical, language, mapping)
    for language in LANGUAGES:
        payload = {'language': language, 'routes': mapping, 'strings': dictionaries[language]}
        output[ROOT/f'assets/i18n/{language}.js'] = 'window.OptiCoreLocale=' + json.dumps(payload, ensure_ascii=False, separators=(',', ':')).replace('</','<\\/') + ';\n'
        output[ROOT/f'assets/i18n/{language}.json'] = json.dumps(dictionaries[language], ensure_ascii=False, separators=(',', ':')) + '\n'
    output[ROOT/'assets/i18n/routes.json'] = json.dumps(mapping, ensure_ascii=False, separators=(',', ':')) + '\n'
    ET.register_namespace('atom', 'http://www.w3.org/2005/Atom')
    for language in ('de','en','fr'):
        feed = ET.parse(ROOT/'nieuws/feed.xml')
        for node in feed.iter():
            if node.tag in ('title','description','category') and node.text:
                node.text = dictionaries[language][clean(node.text)]
            elif node.tag in ('link','guid') and node.text:
                node.text = language_url(node.text, language, mapping)
            elif node.tag == 'language':
                node.text = LOCALES[language].replace('_','-')
            if node.get('href'):
                node.set('href',language_url(node.get('href'),language,mapping))
        output[ROOT/mapping['/nieuws/'][language].lstrip('/')/'feed.xml'] = ET.tostring(feed.getroot(), encoding='unicode', xml_declaration=True)+'\n'
    for path, source in output.items():
        if check:
            assert path.is_file() and path.read_text(encoding='utf-8') == source, f'Stale multilingual output: {path.relative_to(ROOT)}'
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(source, encoding='utf-8', newline='\n')
    print(f'Languages OK: {len(originals)} pages × 4 languages, reciprocal alternates, localized metadata and offline catalogues.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    modes = parser.add_mutually_exclusive_group(required=True)
    modes.add_argument('--extract', action='store_true')
    modes.add_argument('--write', action='store_true')
    modes.add_argument('--check', action='store_true')
    args = parser.parse_args()
    if args.extract:
        values = collect()
        CONTENT.mkdir(parents=True, exist_ok=True)
        (CONTENT/'source.json').write_text(json.dumps(values, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
        print(f'Extracted {len(values)} unique public text fragments, {sum(map(len, values))} characters.')
    else:
        build(args.check)


if __name__ == '__main__':
    main()
