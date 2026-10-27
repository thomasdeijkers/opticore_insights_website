"""Keep public module cards and initial totals in sync with the price catalogue."""
import argparse
import json
from pathlib import Path
import re
import subprocess
from webapp_cost_content import render as render_cost_content

ROOT = Path(__file__).resolve().parents[1]


def money(value):
    return '€ ' + f'{value:,}'.replace(',', '.')


def render(source, catalogue, base, examples):
    def card(match):
        block = match[0]
        module = re.search(r'(?:value|data-module-overview)="([a-z]+)"', block)[1]
        item = catalogue[module]
        if item.get('included'):
            return block
        current, advice = money(item['currentMonthly']), money(item['monthly'])
        monthly = ('<span class="webapp-module-price webapp-module-monthly"><span class="webapp-monthly-compare">'
                   f'<span class="webapp-monthly-current"><strong>Nu {current}</strong><span class="webapp-monthly-unit">per maand</span></span>'
                   f'<span class="webapp-monthly-was">Advies <s>{advice}</s></span></span></span>')
        block, count = re.subn(r'<span class="webapp-module-price webapp-module-monthly">[\s\S]*?</span></span>(?=</span></(?:label|div)>)', lambda _: monthly, block)
        assert count == 1, f'Missing closed module price: {module}'
        details = ('<span class="webapp-module-price">'
                   f'<span class="webapp-price-comparison-row"><strong>Nu {money(item["setup"])} inrichting</strong><span class="webapp-standard-monthly">Advies <s>{money(item["standardSetup"])}</s></span></span>'
                   f'<span class="webapp-price-comparison-row"><strong class="webapp-current-monthly">Nu {current} per maand</strong><span class="webapp-standard-monthly">Advies <s>{advice}</s></span></span>'
                   f'<span class="webapp-monthly-saving">{money(item["monthlyDiscount"])} voordeel per maand</span></span>')
        block, count = re.subn(r'(<div class="webapp-module-pricing-details">)<span class="webapp-module-price">[\s\S]*?(?=<span class="webapp-module-(?:requires|included)")', lambda m: m[1] + details, block)
        assert count == 1, f'Missing expanded module price: {module}'
        return block
    source = re.sub(r'<article class="webapp-module-card">[\s\S]*?</article>', card, source)
    # Current price comes first in the DOM, including the sticky bar and its panel.
    source = re.sub(r'(<span class="webapp-pricebar-values">)(<span class="webapp-pricebar-was"[\s\S]*?</s></span>)(<span class="webapp-pricebar-now">[\s\S]*?</strong></span>)', r'\1\3\2', source)
    source = re.sub(r'(<dd class="webapp-total-prices">)(<span><span class="visually-hidden">[^<]*</span><s[^>]*>[^<]*</s></span>)(<strong>[\s\S]*?</strong>)', r'\1\3\2', source)
    source = source.replace('<span class="visually-hidden">Van </span>', '<span class="visually-hidden">Adviesprijs </span>')
    source = source.replace('Actiekorting inrichting', 'Voordeel inrichting').replace('Actiekorting per maand', 'Voordeel per maand')
    if 'data-webapp-picker' in source:
        values = {'data-module-subtotal': base['standardSetup'], 'data-module-setup': base['setup'], 'data-module-monthly-standard': base['monthly'], 'data-module-monthly': base['currentMonthly']}
        for attr, value in values.items():
            source = re.sub(r'(' + attr + r'(?:\s[^>]*)?>)[^<]*', lambda m: m[1] + money(value), source)
        for attr, value in [('data-module-discount', base['standardSetup']-base['setup']), ('data-module-monthly-discount', base['monthlyDiscount'])]:
            source = re.sub(r'(' + attr + r'>)[^<]*', lambda m: m[1] + '− ' + money(value), source)
    return render_cost_content(source, examples)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--write', action='store_true')
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    data = json.loads(subprocess.check_output(['node', '-e', "const p=require('./assets/js/modular-webapp.js');const examples=[{id:'start',name:'Startpakket',description:'Omzetrapportage, voorraad en orders/retouren.',modules:[]},{id:'inkoop',name:'Inkoop en magazijn',description:'Startpakket + Inkoop en bestellen + Magazijn en logistiek.',modules:['inkoop','logistiek']},{id:'marketing',name:'Producten en marketing',description:'Startpakket + Productbeheer en publicaties + Marketing en ranking.',modules:['marketing']},{id:'compleet',name:'Alle modules',description:'Startpakket + alle negen betaalde uitbreidingen.',modules:Object.keys(p.catalogue).filter(id=>!p.catalogue[id].included)}].map(e=>({...e,price:p.resolve(e.modules)}));process.stdout.write(JSON.stringify({catalogue:p.catalogue,base:p.base,examples}))"], cwd=ROOT))
    for page in ['modulaire-webapp', 'webapp-samenstellen']:
        path = ROOT / f'{page}.html'
        expected = render(path.read_text(encoding='utf-8'), **data)
        for target in [path, ROOT / page / 'index.html']:
            if args.write:
                target.write_text(expected, encoding='utf-8')
            else:
                assert target.read_text(encoding='utf-8') == expected, f'Stale price display: {target}'
    print('Module prices OK: current price first, advice +20%, savings and initial totals from one catalogue.')


if __name__ == '__main__':
    main()
