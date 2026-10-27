"""Publish the attribution data for locally hosted illustrative product photos."""
import argparse
from html import escape
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def outputs():
    photos = json.loads((ROOT / 'content/demo-product-images.json').read_text(encoding='utf-8-sig'))
    assert len(photos) == 12 and len({p['sku'] for p in photos}) == 12
    for photo in photos:
        assert photo['source'].startswith('https://commons.wikimedia.org/wiki/File:')
        assert photo['license'] in ['CC0', 'Public domain', 'CC BY 4.0', 'CC BY-SA 3.0', 'CC BY-SA 4.0']
        assert photo['author'] and photo['licenseUrl'].startswith('https://creativecommons.org/')
        data = (ROOT / photo['path'].lstrip('/')).read_bytes()
        assert data.startswith(b'\xff\xd8') and len(data) > 1000
    public = {p['sku']: {k: p[k] for k in ['path', 'author', 'license', 'licenseUrl', 'source']} for p in photos}
    js = '(function(scope){const photos=' + json.dumps(public, ensure_ascii=False, separators=(',', ':')) + ';if(typeof module!=="undefined"&&module.exports)module.exports=photos;scope.DemoProductImages=photos;})(typeof window!=="undefined"?window:globalThis);\n'
    cards = []
    for photo in photos:
        e = lambda key: escape(photo[key], quote=True)
        cards.append(f'<article><img src="{e("path")}" alt="Illustratieve productfoto {e("sku")}" width="220" height="170" loading="lazy"><h2>{e("sku")}</h2><p>{e("title")}</p><p>Foto: {e("author")}</p><p><a href="{e("source")}" target="_blank" rel="noopener noreferrer">Bron op Wikimedia Commons ↗</a> · <a href="{e("licenseUrl")}" target="_blank" rel="noopener noreferrer">{e("license")} ↗</a></p><p>{e("modified")}</p></article>')
    html = '<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Beeldbronnen van de WebApp-demo | OptiCore Insights</title><meta name="robots" content="noindex,follow"><link rel="stylesheet" href="/assets/css/site.css?v=20261027-desktop-review"><link rel="stylesheet" href="/assets/css/demo-product-photos.css?v=20261027-assortment"></head><body><main class="container demo-photo-credits"><p><a href="/demo/modulaire-webapp/">Terug naar de app-demo →</a></p><h1>Productfoto’s in de demo</h1><p>De foto’s illustreren het soort artikel. Artikelnamen, merken in het voorbeeldassortiment, prijzen, voorraad en verkopen zijn fictief en horen niet bij een werkelijk aanbod van de afgebeelde fabrikant. De fotografen en fabrikanten zijn niet verbonden aan deze demo.</p><p>De bronfoto’s zijn lokaal opgeslagen. De onderstaande licenties blijven van toepassing op het fotomateriaal, ook waar het in de demo en screenshots wordt getoond. De voorbeeldcomposities voegen een achtergrond of tekst toe; de oorspronkelijke foto wordt daarin uitsluitend geschaald weergegeven.</p><div class="demo-photo-credit-grid">'+''.join(cards)+'</div></main></body></html>\n'
    title = 'Beeldbronnen van de WebApp-demo | OptiCore Insights'
    description = 'Fotografen, bronverwijzingen en licenties van de illustratieve productfoto’s in de fictieve OptiCore WebApp-demo.'
    url = 'https://opticore-insights.nl/demo/beeldbronnen/'
    metadata = f'<meta name="description" content="{description}"><link rel="canonical" href="{url}"><meta property="og:title" content="{title}"><meta property="og:description" content="{description}"><meta property="og:url" content="{url}"><meta property="og:type" content="website"><meta name="twitter:card" content="summary"><meta name="twitter:title" content="{title}"><meta name="twitter:description" content="{description}">'
    html = html.replace('</head>', metadata + '</head>')
    return {'assets/js/demo-product-images.js': js, 'demo/beeldbronnen/index.html': html}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--write', action='store_true')
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    for name, source in outputs().items():
        path = ROOT / name
        if args.write:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(source, encoding='utf-8')
        else:
            assert path.read_text(encoding='utf-8') == source, f'Stale photo attribution: {name}'
    print('Product photos OK: twelve local JPEGs, checked licenses and public attribution.')


if __name__ == '__main__':
    main()
