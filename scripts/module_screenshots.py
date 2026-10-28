"""Render module galleries from captured, fictional customer-demo screens."""
import argparse
from html import escape
import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
PLAN = json.loads((ROOT / 'content/module-screenshots.json').read_text(encoding='utf-8'))


def gallery(module):
    views = PLAN[module]
    items = []
    for device, width, height in [('mobile', 390, 844), ('desktop', 1280, 900)]:
        for index, view in enumerate(views):
            src = f'/assets/img/module-examples/client-{module}-{view["id"]}-{device}-dark.jpg?v=20261027-demo-scope'
            title = escape(view['title'], quote=True)
            alt = escape(f'{view["title"]} — darkmode met fictieve gegevens.', quote=True)
            preview = f' data-screen-preview="{device}"' if index < (2 if device == 'mobile' else 1) else ''
            items.append(f'<a class="screen-slide" href="{src}" data-screen-title="{title}" data-screen-device="{device}" data-screen-demo="true" aria-label="Vergroot: {title}"{preview}><img src="{src}" alt="{alt}" width="{width}" height="{height}" loading="lazy"><span class="module-screen-title">{title}</span></a>')
    return (f'<div class="screen-gallery module-screen-gallery" data-screen-gallery data-module-gallery="{module}" data-screen-previews="4" role="region" aria-labelledby="module-{module}-title" data-screen-mobile-count="{len(views)}" data-screen-desktop-count="{len(views)}">'
            '<div class="screen-gallery-stage">' + ''.join(items) + '</div>'
            f'<p class="module-screen-gallery-caption">{len(views)} schermen uit deze module · fictieve gegevens</p>'
            '<button type="button" class="module-screen-gallery-all" data-screen-open-all hidden>Bekijk alle schermen →</button></div>')


def render(source):
    def replace_card(match):
        card = match[0]
        module = re.search(r'(?:value|data-module-overview)="([a-z]+)"', card)[1]
        pattern = r'<div class="screen-gallery(?: module-screen-gallery)?"[^>]*><div class="screen-gallery-stage">[\s\S]*?</div>(?:<p class="module-screen-gallery-caption">[\s\S]*?</p><button[\s\S]*?</button>)?</div>'
        card, count = re.subn(pattern, lambda _: gallery(module), card)
        assert count == 1, f'Expected one gallery for {module}'
        return card
    return re.sub(r'<article class="webapp-module-card">[\s\S]*?</article>', replace_card, source)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--write', action='store_true')
    parser.add_argument('--check', action='store_true')
    modes = parser.add_mutually_exclusive_group()
    modes.add_argument('--source-only', action='store_true')
    modes.add_argument('--media-only', action='store_true')
    args = parser.parse_args()
    if args.check and not args.source_only:
        for module, views in PLAN.items():
            assert 4 <= len(views) <= 6, f'Expected four to six views: {module}'
            for device in ['mobile', 'tablet', 'desktop']:
                hashes = set()
                for view in views:
                    image = ROOT / f'assets/img/module-examples/client-{module}-{view["id"]}-{device}-dark.jpg'
                    data = image.read_bytes()
                    assert data.startswith(b'\xff\xd8') and len(data) > 1000, f'Missing/empty capture: {image}'
                    hashes.add(hashlib.sha256(data).hexdigest())
                assert len(hashes) == len(views), f'Duplicate scenes: {module}/{device}'
    for page in ([] if args.media_only else ['modulaire-webapp', 'webapp-samenstellen']):
        path = ROOT / f'{page}.html'
        expected = render(path.read_text(encoding='utf-8'))
        for target in [path, ROOT / page / 'index.html']:
            if args.write:
                target.write_text(expected, encoding='utf-8')
            else:
                assert target.read_text(encoding='utf-8') == expected, f'Stale module gallery: {target}'
    print(f'Module galleries OK: {sum(map(len, PLAN.values()))} scenes across {len(PLAN)} modules, with phone/tablet/desktop captures.')


if __name__ == '__main__':
    main()
