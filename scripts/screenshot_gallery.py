"""One source of neutral screenshot collections for static pages and news."""
from pathlib import Path
from html import escape
import json

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = json.loads((ROOT / 'scripts/neutral_visuals_manifest.json').read_text(encoding='utf-8'))
IMAGES = {item['file']: item for item in MANIFEST}
GROUPS = {
    'management': ['management-mobile.jpg', 'stock-mobile.jpg', 'management-desktop.jpg', 'stock-desktop.jpg', 'forecast-mobile.jpg', 'forecast-desktop.jpg'],
    'timesheets': ['timesheets-mobile.png', 'timesheets-detail-mobile.png', 'timesheets-desktop.jpg'],
    'document-review': ['document-review-mobile.png', 'document-review-detail-mobile.png', 'document-review-desktop.jpg'],
    'document-intake': ['document-intake-mobile.png', 'document-intake-detail-mobile.png', 'document-intake-desktop.jpg'],
    'login': ['login-mobile.png', 'login-verification-mobile.png', 'login-desktop.png'],
}


def collection(src):
    name = Path(src).name
    for key, names in GROUPS.items():
        if name in names:
            return key, names
    return None


def item_html(name, preview=False):
    item = IMAGES[name]
    device = 'mobile' if item['width'] < item['height'] else 'desktop'
    src = '/assets/img/examples/' + name
    alt = escape(item['alt'], quote=True)
    attrs = f' data-screen-preview="{device}"' if preview else ''
    return (f'<a class="screen-slide" href="{src}" data-screen-device="{device}" '
            f'data-screen-title="{alt}" data-screen-demo="true" aria-label="Vergroot: {alt}"{attrs}>'
            f'<img src="{src}" alt="{alt}" width="{item["width"]}" height="{item["height"]}" loading="lazy"></a>')


def gallery_html(names, label):
    names = list(dict.fromkeys(names))
    mobile = [name for name in names if IMAGES[name]['width'] < IMAGES[name]['height']]
    desktop = [name for name in names if name not in mobile]
    preview = set(mobile[:2] + desktop[:1])
    return (f'<div class="screen-gallery" data-screen-gallery role="region" aria-label="{escape(label,quote=True)}" '
            f'data-screen-mobile-count="{len(mobile)}" data-screen-desktop-count="{len(desktop)}">'
            '<div class="screen-gallery-stage">' + ''.join(item_html(name, name in preview) for name in names) + '</div></div>')


def gallery_for_image(src, label='Voorbeeldschermen met fictieve gegevens'):
    group = collection(src)
    return gallery_html(group[1], label) if group else None
