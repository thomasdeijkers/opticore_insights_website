"""Keep outgoing website links in a separate tab; preserve internal navigation."""
import argparse
from html.parser import HTMLParser
from pathlib import Path
import re
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
SITE_HOSTS = {'opticore-insights.nl', 'www.opticore-insights.nl'}
ANCHOR = re.compile(r'<a\b[^>]*>', re.I)


class AnchorAttributes(HTMLParser):
    def handle_starttag(self, tag, attrs):
        self.attrs = dict(attrs)


def external_links_in_new_tabs(markup):
    def update(match):
        tag = match.group()
        parser = AnchorAttributes()
        parser.feed(tag)
        attrs = parser.attrs
        parsed = urlsplit(attrs.get('href') or '')
        if not parsed.netloc or parsed.scheme not in ('', 'http', 'https') or parsed.hostname in SITE_HOSTS:
            return tag
        if attrs.get('target') != '_blank':
            tag = re.sub(r'\s+target\s*=\s*(?:"[^"]*"|\x27[^\x27]*\x27|[^\s>]+)', '', tag, flags=re.I)
            tag = tag[:-1] + ' target="_blank">'
        tokens = (attrs.get('rel') or '').split()
        if not {'noopener', 'noreferrer'} <= set(tokens):
            tokens = list(dict.fromkeys(tokens + ['noopener', 'noreferrer']))
            tag = re.sub(r'\s+rel\s*=\s*(?:"[^"]*"|\x27[^\x27]*\x27|[^\s>]+)', '', tag, flags=re.I)
            tag = tag[:-1] + ' rel="' + ' '.join(tokens) + '">'
        return tag

    return ANCHOR.sub(update, markup)


if __name__ == '__main__':
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('--write', action='store_true')
    cli.add_argument('--check', action='store_true')
    args = cli.parse_args()
    changed = []
    files = list(ROOT.rglob('*.html'))
    for path in files:
        source = path.read_text(encoding='utf-8')
        result = external_links_in_new_tabs(source)
        if source != result:
            changed.append(path.relative_to(ROOT).as_posix())
            if args.write:
                path.write_text(result, encoding='utf-8')
    if changed and not args.write:
        raise SystemExit('Outgoing links need target/rel attributes: ' + ', '.join(changed))
    print(f'Outgoing links OK: {len(files)} HTML pages; {len(changed)} updated.' if args.write else f'Outgoing links OK: {len(files)} HTML pages.')
