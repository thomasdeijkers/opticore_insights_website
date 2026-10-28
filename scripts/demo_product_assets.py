"""Restore reviewed studio artwork and publish accurate image provenance."""
import argparse
import hashlib
from html import escape
import io
import json
from pathlib import Path
from urllib.request import Request, urlopen
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
STUDIO = ROOT / 'content/demo-studio-products.json'


def verify_bundle(data, config):
    assert hashlib.sha256(data).hexdigest() == config['sha256'], 'Studio media bundle checksum mismatch'
    records = config['images']
    assert len(records) == 12 and {p['sku'] for p in records} == {f'DEMO-{n}' for n in range(1001, 1013)}
    expected = {}
    for photo in records:
        name = f'assets/img/demo-products/studio-v1/{photo["sku"].lower()}.jpg'
        assert photo['path'] == '/' + name, 'Unexpected studio output path'
        assert photo['width'] == photo['height'] and photo['width'] >= 1024
        expected[name] = photo
    with ZipFile(io.BytesIO(data)) as archive:
        names = archive.namelist()
        assert len(names) == len(set(names)) and set(names) == set(expected), 'Unexpected studio archive members'
        verified = {}
        for name, photo in expected.items():
            image = archive.read(name)
            assert image.startswith(b'\xff\xd8') and image.endswith(b'\xff\xd9') and len(image) > 1000, name
            assert hashlib.sha256(image).hexdigest() == photo['sha256'], name
            verified[name] = image
    return verified


def restore(bundle=None):
    config = json.loads(STUDIO.read_text(encoding='utf-8'))
    url = f'https://github.com/thomasdeijkers/opticore_insights_website/releases/download/{config["tag"]}/{config["asset"]}'
    data = bundle.read_bytes() if bundle else urlopen(Request(url, headers={'User-Agent': 'OptiCore-site-build'}), timeout=90).read()
    # All paths and checksums are validated before writing the reviewed files.
    for name, image in verify_bundle(data, config).items():
        target = ROOT / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(image)
    print('Studio media restored: twelve reviewed, checksummed product images.')


def outputs():
    photos = json.loads((ROOT / 'content/demo-product-images.json').read_text(encoding='utf-8-sig'))
    studio = json.loads(STUDIO.read_text(encoding='utf-8'))['images']
    assert len(photos) == 12 and len({p['sku'] for p in photos}) == 12
    for photo in photos:
        assert photo['source'].startswith('https://commons.wikimedia.org/wiki/File:')
        assert photo['license'] in ['CC0', 'Public domain', 'CC BY 4.0', 'CC BY-SA 3.0', 'CC BY-SA 4.0']
        assert photo['author'] and photo['licenseUrl'].startswith('https://creativecommons.org/')
        data = (ROOT / photo['path'].lstrip('/')).read_bytes()
        assert data.startswith(b'\xff\xd8') and len(data) > 1000
    assert len(studio) == 12 and {p['sku'] for p in studio} == {p['sku'] for p in photos}
    for photo in studio:
        image = (ROOT / photo['path'].lstrip('/')).read_bytes()
        assert hashlib.sha256(image).hexdigest() == photo['sha256'], photo['sku']
        assert photo['prompt'] and photo['width'] == photo['height']
    public = {p['sku']: {'path': p['path'], 'author': 'OptiCore Insights', 'kind': 'ai-generated', 'source': '/demo/beeldbronnen/'} for p in studio}
    js = '(function(scope){const photos=' + json.dumps(public, ensure_ascii=False, separators=(',', ':')) + ';if(typeof module!=="undefined"&&module.exports)module.exports=photos;scope.DemoProductImages=photos;})(typeof window!=="undefined"?window:globalThis);\n'
    cards = []
    for photo in studio:
        e = lambda key: escape(photo[key], quote=True)
        cards.append(f'<article><img src="{e("path")}" alt="Illustratieve productfoto {e("sku")}" width="220" height="220" loading="lazy"><h2>{e("title")}</h2><p>{e("sku")}</p><p>AI-gegenereerde productillustratie.</p></article>')
    legacy = ''.join(f'<li>{escape(p["sku"])} · {escape(p["title"])} · {escape(p["author"])} · <a href="{escape(p["source"], quote=True)}" target="_blank" rel="noopener noreferrer">Bron op Wikimedia Commons ↗</a> · <a href="{escape(p["licenseUrl"], quote=True)}" target="_blank" rel="noopener noreferrer">{escape(p["license"])}</a></li>' for p in photos)
    html = '<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Beeldbronnen van de WebApp-demo | OptiCore Insights</title><meta name="robots" content="noindex,follow"><link rel="stylesheet" href="/assets/css/site.css?v=20261027-desktop-review"><link rel="stylesheet" href="/assets/css/demo-product-photos.css?v=20261028-studio-products"></head><body><main class="container demo-photo-credits"><p><a href="/demo/modulaire-webapp/">Terug naar de app-demo →</a></p><h1>Productfoto’s in de demo</h1><p>De huidige productbeelden zijn met AI gemaakt voor deze fictieve demo. Ze tonen geen daadwerkelijk aangeboden merkproduct. Artikelnamen, prijzen, voorraad en verkopen zijn voorbeeldgegevens.</p><p>Alle twaalf beelden hebben een witte achtergrond, dezelfde kijkrichting en een lichte schaduw. De demo en de screenshots gebruiken dezelfde beeldset.</p><div class="demo-photo-credit-grid">'+''.join(cards)+'</div><details><summary>Bronnen van eerdere demo-afbeeldingen</summary><p>Voor eerder gebruikt fotomateriaal blijven de oorspronkelijke bronvermeldingen en licenties hieronder beschikbaar.</p><ul>'+legacy+'</ul></details></main></body></html>\n'
    title = 'Beeldbronnen van de WebApp-demo | OptiCore Insights'
    description = 'Herkomst van de AI-productbeelden en bronvermeldingen van eerder gebruikt fotomateriaal in de OptiCore WebApp-demo.'
    url = 'https://opticore-insights.nl/demo/beeldbronnen/'
    metadata = f'<meta name="description" content="{description}"><link rel="canonical" href="{url}"><meta property="og:title" content="{title}"><meta property="og:description" content="{description}"><meta property="og:url" content="{url}"><meta property="og:type" content="website"><meta name="twitter:card" content="summary"><meta name="twitter:title" content="{title}"><meta name="twitter:description" content="{description}">'
    html = html.replace('</head>', metadata + '</head>')
    return {'assets/js/demo-product-images.js': js, 'demo/beeldbronnen/index.html': html}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--write', action='store_true')
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--restore', action='store_true', help='Restore the pinned studio artwork before checking or writing source')
    parser.add_argument('--bundle', type=Path, help='Optional local copy of the same pinned release asset')
    args = parser.parse_args()
    if args.restore:
        restore(args.bundle)
    for name, source in outputs().items():
        path = ROOT / name
        if args.write:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(source, encoding='utf-8')
        else:
            assert path.read_text(encoding='utf-8') == source, f'Stale photo attribution: {name}'
    print('Product images OK: twelve reviewed studio JPEGs, AI provenance and archived photo attribution.')


if __name__ == '__main__':
    main()
