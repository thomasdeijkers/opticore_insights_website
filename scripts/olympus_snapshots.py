"""Translate externally rendered, fictional Olympus snapshots for media captures."""
import argparse
import json
from pathlib import Path
from i18n import Document, catalogue, ROOT


def source_strings(source):
    result = set()
    for path in source.glob('*.html'):
        parser = Document()
        parser.feed(path.read_text(encoding='utf-8'))
        result.update(parser.strings)
    return result


def translate(source, destination):
    extra = json.loads((ROOT/'content/olympus-i18n.json').read_text(encoding='utf-8'))
    needed = source_strings(source)
    for language in ('nl', 'de', 'en', 'fr'):
        dictionary = catalogue(language) if language != 'nl' else {}
        dictionary.update({key:value[language] for key,value in extra.items() if language in value})
        if language != 'nl':
            assert not needed-set(dictionary), f'Missing Olympus {language}: {sorted(needed-set(dictionary))[:10]}'
        for path in source.glob('*.html'):
            parser = Document(language, dictionary)
            parser.feed(path.read_text(encoding='utf-8'))
            target = destination/language/path.name
            target.parent.mkdir(parents=True,exist_ok=True)
            target.write_text(''.join(parser.parts),encoding='utf-8')
    print(f'Olympus snapshots translated: {len(needed)} strings; four languages.')


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source',required=True,type=Path)
    parser.add_argument('--collect',type=Path)
    parser.add_argument('--translate',type=Path)
    args=parser.parse_args()
    assert args.source.is_dir()
    if args.collect:
        args.collect.write_text(json.dumps(sorted(source_strings(args.source)),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    if args.translate:
        translate(args.source,args.translate)
