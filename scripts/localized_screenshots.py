"""Plan/check real localized app captures; generate fictional fixture HTML offline."""
import argparse
import hashlib
import json
from pathlib import Path
import re
from urllib.parse import urlsplit
from i18n import ROOT, Document, catalogue, routes, sources
from neutral_visuals import example_documents

OUTPUT = ROOT/'assets/img/localized'
LANGUAGES = ('de','en','fr')
DEVICES = {'desktop': (1280,900,2), 'tablet': (834,1112,2), 'mobile': (390,844,3)}


def plan():
    result = []
    modules = json.loads((ROOT/'content/module-screenshots.json').read_text(encoding='utf-8'))
    manifest = json.loads((ROOT/'scripts/neutral_visuals_manifest.json').read_text(encoding='utf-8'))
    referenced = set()
    for _,source in sources().values():
        referenced.update(re.findall(r'/assets/img/(?:demo|examples|module-examples)/[^\s"\x27<>?]+\.(?:jpg|png)',source))
    def add(file, page, *, tab=None, fixture=False, modal=None, focus=None, click=None, align=None, expand=None, fullPage=False, external=False):
        device = 'mobile' if '-mobile-' in file else 'tablet' if '-tablet-' in file else 'desktop'
        width,height,scale = DEVICES[device]
        if fullPage and device=='desktop': width,height = 1440,1000
        if fullPage and file=='demo/dashboard-client-tablet-dark.png': width,height = 1112,834
        result.append({'file':file,'page':page,'device':device,'width':width,'height':height,'scale':scale,
                       **{k:v for k,v in dict(tab=tab,fixture=fixture,modal=modal,focus=focus,click=click,align=align,expand=expand,fullPage=fullPage,external=external).items() if v}})
    for module,views in modules.items():
        for view in views:
            for device in DEVICES:
                add(f'module-examples/client-{module}-{view["id"]}-{device}-dark.jpg',view['page'],tab=view.get('tab'),modal=view.get('modal'),focus=view.get('focus'),click=view.get('click'),align=view.get('align'),expand=view.get('expand'))
    app_views={'management':('dashboard',None),'forecast':('forecasting','overview'),'stock':('voorraad',None),
               'ranking':('bol-ranking',None),'marketing':('marketing-agent',None),'listing':('verbeteringen',None)}
    for item in manifest:
        files = [item['file']]
        if '-desktop-' in item['file']: files.append(item['file'].replace('-desktop-','-tablet-'))
        for name in files:
            if '/assets/img/examples/'+item['file'] not in referenced: continue
            category=item['file'].removeprefix('client-').split('-')[0]
            if item.get('source') == 'olympus':
                add('examples/'+name,item['page'],external=True)
            elif category in app_views:
                page,tab=app_views[category]
                if name=='client-ranking-overview-mobile-dark.jpg': tab='movers'
                if name=='client-marketing-overview-mobile-dark.jpg': page,tab='ads-engine','campaigns'
                add('examples/'+name,page,tab=tab,
                    focus='.marketing-agent-heading' if name=='client-marketing-mobile-dark.jpg' else None, align='start' if name=='client-marketing-mobile-dark.jpg' else None,
                    modal='[data-w-host="listing"]' if name=='client-listing-editor-mobile-dark.jpg' else None,
                    expand=None)
            else:
                add('examples/'+name,item['page'],fixture=True)
    for device in DEVICES:
        add(f'demo/dashboard-client-{device}-dark.png','dashboard',fullPage=True)
    assert len({r['file'] for r in result})==len(result), 'Duplicate capture targets'
    covered={'/assets/img/'+row['file'] for row in result}
    assert referenced <= covered, f'Unmapped public app screenshots: {sorted(referenced-covered)}'
    return result


def fixtures(destination):
    mapping = routes()
    for language in LANGUAGES:
        dictionary = catalogue(language)
        for name,source in example_documents().items():
            document = Document(language,dictionary,mapping)
            document.feed(source)
            path=destination/language/(name+'.html');path.parent.mkdir(parents=True,exist_ok=True)
            path.write_text(''.join(document.parts),encoding='utf-8',newline='\n')


def check():
    manifest=json.loads((OUTPUT/'manifest.json').read_text(encoding='utf-8'))
    records=manifest['images']
    expected={f'{language}/{item["file"]}' for language in LANGUAGES for item in plan()}
    assert set(records)==expected, 'Incomplete localized screenshot manifest'
    for file,record in records.items():
        path=OUTPUT/file;data=path.read_bytes()
        assert hashlib.sha256(data).hexdigest()==record['sha256'], f'Capture changed without manifest: {file}'
        assert record['language']==file.split('/')[0] and record['theme']=='dark', file
        assert data.startswith(b'\x89PNG') if file.endswith('.png') else data.startswith(b'\xff\xd8'), file
        assert len(data)>1000, file
    for language in LANGUAGES:
        for original,(path,_) in sources().items():
            output=ROOT/routes()[original][language].lstrip('/')/'index.html'
            html=output.read_text(encoding='utf-8')
            assert not re.search(r'/assets/img/(?:demo|examples|module-examples)/',html), f'Dutch screenshot on {output}'
            for media in re.findall(r'/assets/img/localized/[^\s"<>?]+',html):
                assert media.removeprefix('/assets/img/localized/') in records, (output,media)
    print(f'Localized screenshots OK: {len(records)} real dark captures, three devices, correct language and public gallery references.')


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    modes=parser.add_mutually_exclusive_group(required=True)
    modes.add_argument('--plan',type=Path)
    modes.add_argument('--fixtures',type=Path)
    modes.add_argument('--check',action='store_true')
    args=parser.parse_args()
    if args.plan:
        args.plan.write_text(json.dumps(plan(),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    elif args.fixtures: fixtures(args.fixtures)
    else: check()


if __name__=='__main__': main()
