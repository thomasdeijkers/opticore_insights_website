"""Prevent regressions to desktop-only app images and obsolete screenshots."""
from html.parser import HTMLParser
from pathlib import Path
from screenshot_gallery import ROOT, IMAGES, MANIFEST


class GalleryAudit(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path = path
        self.depth = 0
        self.active = None
        self.galleries = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'div':
            self.depth += 1
            if 'data-screen-gallery' in attrs:
                assert self.active is None, f'{self.path}: nested gallery'
                self.active = {'depth': self.depth, 'items': [], 'neutral': False}
                self.galleries.append(self.active)
        if tag == 'a' and self.active is not None and 'data-screen-device' in attrs:
            self.active['items'].append(attrs)
        if tag == 'img' and attrs.get('src', '').startswith('/assets/img/examples/'):
            name = Path(attrs['src']).name
            assert name in IMAGES, f'{self.path}: unknown neutral image {name}'
            assert self.active is not None, f'{self.path}: app image outside shared gallery'
            self.active['neutral'] = True

    def handle_endtag(self, tag):
        if tag == 'div':
            if self.active and self.active['depth'] == self.depth:
                self.active = None
            self.depth -= 1


def main():
    count = 0
    for path in ROOT.rglob('*.html'):
        if any(p.startswith('.') or p in ('node_modules', 'backups') for p in path.relative_to(ROOT).parts):
            continue
        source = path.read_text(encoding='utf-8')
        audit = GalleryAudit(path.relative_to(ROOT))
        audit.feed(source)
        for old in (row['old'] for row in MANIFEST if row.get('old')):
            assert '/assets/img/' + old not in source, f'{path}: obsolete application image {old}'
        for gallery in audit.galleries:
            if not gallery['neutral']:
                continue
            mobile = [item for item in gallery['items'] if item['data-screen-device'] == 'mobile']
            desktop = [item for item in gallery['items'] if item['data-screen-device'] == 'desktop']
            previews = [item for item in mobile if item.get('data-screen-preview') == 'mobile']
            assert len({item['href'] for item in mobile}) >= 2, f'{path}: requires two distinct phone views'
            assert len(previews) == 2, f'{path}: requires exactly two static phone previews'
            assert desktop, f'{path}: desktop collection missing'
            count += 1
        if audit.galleries:
            for asset in ('screenshot-gallery.css?v=20261022h', 'screenshot-gallery.js?v=20261022h'):
                assert asset in source, f'{path}: stale/missing gallery component'
    for name in IMAGES:
        assert (ROOT/'assets/img/examples'/name).is_file(), f'Missing {name}'
    print(f'Screenshot galleries OK: {count} neutral collections; two phone previews, desktop views and shared viewer present.')


if __name__ == '__main__':
    main()
