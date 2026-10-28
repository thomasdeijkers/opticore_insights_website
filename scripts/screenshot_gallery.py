"""One source of application screenshot collections for static pages and news."""
from pathlib import Path
from html import escape
import json

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = json.loads((ROOT / 'scripts/neutral_visuals_manifest.json').read_text(encoding='utf-8'))
IMAGES = {item['file']: item for item in MANIFEST}
GROUPS = {
    'olympus': ['client-olympus-dashboard-mobile-dark.jpg', 'client-olympus-planning-mobile-dark.jpg', 'client-olympus-dashboard-desktop-dark.jpg', 'client-olympus-planning-desktop-dark.jpg', 'client-olympus-opdrachten-mobile-dark.jpg', 'client-olympus-opdrachten-desktop-dark.jpg', 'client-olympus-menu-mobile-dark.jpg'],
    'management': ['client-management-mobile-dark.jpg', 'client-stock-mobile-dark.jpg', 'client-management-desktop-dark.jpg', 'client-stock-desktop-dark.jpg', 'client-forecast-mobile-dark.jpg', 'client-forecast-desktop-dark.jpg'],
    'timesheets': ['client-timesheets-mobile-dark.png', 'client-timesheets-detail-mobile-dark.png', 'client-timesheets-desktop-dark.jpg'],
    'document-review': ['client-document-review-mobile-dark.png', 'client-document-review-detail-mobile-dark.png', 'client-document-review-desktop-dark.jpg'],
    'document-intake': ['client-document-intake-mobile-dark.png', 'client-document-intake-detail-mobile-dark.png', 'client-document-intake-desktop-dark.jpg'],
    'login': ['client-login-mobile-dark.png', 'client-login-verification-mobile-dark.png', 'client-login-desktop-dark.png'],
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
    src = '/assets/img/examples/' + name + ('?v=20261028-native-app' if name.startswith(('client-management-', 'client-forecast-', 'client-stock-', 'client-ranking-', 'client-marketing-', 'client-listing-')) else '')
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
    if group and group[0] == 'olympus':
        label = 'Schermen van de Olympus WebApp met fictieve gegevens'
    return gallery_html(group[1], label) if group else None
