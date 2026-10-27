"""Build the public sitemap from canonical, indexable HTML pages.

Run --write before publication, or --check to verify the tracked sitemap.
Uses only the standard library; no network or application data is accessed.
"""
import argparse
from collections import deque
from datetime import date
from html.parser import HTMLParser
from pathlib import Path
import subprocess
from urllib.parse import urljoin, urlsplit, urlunsplit
from urllib.robotparser import RobotFileParser
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://opticore-insights.nl'
SM = 'http://www.sitemaps.org/schemas/sitemap/0.9'
IMG = 'http://www.google.com/schemas/sitemap-image/1.1'
ET.register_namespace('', SM)
ET.register_namespace('image', IMG)


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.canonical = []
        self.indexable = True
        self.links = set()
        self.images = set()
        self.in_main = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'main':
            self.in_main = True
        if tag == 'link' and 'canonical' in attrs.get('rel', '').split():
            self.canonical.append(attrs.get('href', ''))
        if tag == 'meta' and attrs.get('name', '').lower() in ('robots', 'googlebot'):
            directives = attrs.get('content', '').lower().replace(',', ' ').split()
            self.indexable &= not ({'noindex', 'none'} & set(directives))
        if tag == 'a' and attrs.get('href') and 'nofollow' not in attrs.get('rel', '').split():
            self.links.add(attrs['href'])
        if self.in_main and tag == 'img' and attrs.get('alt', '').strip() and attrs.get('src'):
            self.images.add(attrs['src'])

    def handle_endtag(self, tag):
        if tag == 'main':
            self.in_main = False


def public_url(value, relative_to=BASE + '/', *, allow_query=False):
    parsed = urlsplit(urljoin(relative_to, value))
    if parsed.scheme != 'https' or parsed.netloc != urlsplit(BASE).netloc or (parsed.query and not allow_query):
        return None
    return urlunsplit((parsed.scheme, parsed.netloc, parsed.path or '/', '', ''))


def git(*args):
    return subprocess.run(['git', *args], cwd=ROOT, check=True, capture_output=True).stdout.decode('utf-8').strip()


def build():
    pages = {}
    for path in sorted(ROOT.rglob('*.html')):
        if any(part.startswith('.') or part in ('node_modules', 'backups') for part in path.relative_to(ROOT).parts):
            continue
        page = Page()
        page.feed(path.read_text(encoding='utf-8'))
        if len(page.canonical) != 1:
            raise ValueError(f'{path.relative_to(ROOT)} needs exactly one canonical URL')
        url = public_url(page.canonical[0])
        if not url or url != page.canonical[0] or not url.endswith('/'):
            raise ValueError(f'Invalid canonical URL: {page.canonical[0]}')
        expected_file = ROOT / urlsplit(url).path.lstrip('/') / 'index.html'
        if not expected_file.is_file():
            raise ValueError(f'Canonical route has no index.html: {url}')
        if url in pages:
            previous_path, previous = pages[url]
            if path.read_bytes() != previous_path.read_bytes():
                raise ValueError(f'Conflicting HTML aliases for {url}')
            if path != expected_file:
                continue
        pages[url] = (path, page)

    robots_text = (ROOT / 'robots.txt').read_text(encoding='utf-8')
    robots = RobotFileParser()
    robots.parse(robots_text.splitlines())
    if BASE + '/sitemap.xml' not in (robots.site_maps() or []):
        raise ValueError('robots.txt must advertise the public sitemap')

    reachable = {BASE + '/'}
    queue = deque(reachable)
    while queue:
        current = queue.popleft()
        for href in pages[current][1].links:
            target = public_url(href, current)
            if target in pages and target not in reachable:
                reachable.add(target)
                queue.append(target)
    indexed = {url for url, (_, page) in pages.items() if page.indexable}
    if missing := indexed - reachable:
        raise ValueError(f'Indexable pages unreachable through links: {sorted(missing)}')

    urlset = ET.Element(f'{{{SM}}}urlset')
    image_count = 0
    for url in sorted(indexed):
        path, page = pages[url]
        if not robots.can_fetch('Googlebot', url):
            raise ValueError(f'robots.txt blocks an indexable page: {url}')
        images = []
        for source in sorted(page.images):
            image_url = public_url(source, url, allow_query=True)
            if not image_url:
                continue
            image_path = ROOT / urlsplit(image_url).path.lstrip('/')
            if not image_path.is_file():
                raise ValueError(f'Missing image on {url}: {source}')
            if not robots.can_fetch('Googlebot-Image', image_url):
                raise ValueError(f'robots.txt blocks image: {image_url}')
            images.append((image_url, image_path))

        node = ET.SubElement(urlset, f'{{{SM}}}url')
        ET.SubElement(node, f'{{{SM}}}loc').text = url
        # Page and screenshot changes count; a fresh deploy by itself does not.
        sources = [path, *(image_path for _, image_path in images)]
        tracked_paths = [p.relative_to(ROOT).as_posix() for p in sources]
        changed = git('status', '--porcelain', '--', *tracked_paths)
        modified = date.today().isoformat() if changed else git('log', '-1', '--format=%cs', '--', *tracked_paths)
        if modified:
            date.fromisoformat(modified)
            ET.SubElement(node, f'{{{SM}}}lastmod').text = modified
        for image_url, _ in images:
            image = ET.SubElement(node, f'{{{IMG}}}image')
            ET.SubElement(image, f'{{{IMG}}}loc').text = image_url
            image_count += 1

    ET.indent(urlset, space='  ')
    content = ET.tostring(urlset, encoding='utf-8', xml_declaration=True) + b'\n'
    if len(content) > 50 * 1024 * 1024 or len(indexed) > 50000:
        raise ValueError('Sitemap exceeds the single-file sitemap limits')
    return content, len(indexed), image_count


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--write', action='store_true')
    mode.add_argument('--check', action='store_true')
    args = parser.parse_args()
    content, count, images = build()
    path = ROOT / 'sitemap.xml'
    if args.write:
        path.write_bytes(content)
    elif path.read_text(encoding='utf-8') != content.decode('utf-8'):
        raise SystemExit('Sitemap is out of date. Run: python scripts/sitemap.py --write')
    print(f'Sitemap OK: {count} canonical indexable URLs, {images} image references; all pages reachable and allowed by robots.txt.')


if __name__ == '__main__':
    main()
