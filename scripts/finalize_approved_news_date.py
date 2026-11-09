"""Set only the actual release date of a dashboard-approved new article.

Run after claiming its approval, immediately before the production commit.
The approved proposal must explicitly include this metadata-only operation.
Never run for an existing published article or change its original date.
"""
import argparse
from datetime import datetime
import json
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
MONTHS = {
    'nl': 'januari februari maart april mei juni juli augustus september oktober november december'.split(),
    'en': 'January February March April May June July August September October November December'.split(),
    'de': 'Januar Februar März April Mai Juni Juli August September Oktober November Dezember'.split(),
    'fr': 'janvier février mars avril mai juin juillet août septembre octobre novembre décembre'.split(),
}


def finalize(slug, at):
    timestamp = datetime.fromisoformat(at)
    if timestamp.tzinfo is None:
        raise ValueError('A timezone-aware publication time is required.')
    timestamp = timestamp.astimezone(ZoneInfo('Europe/Amsterdam'))
    state = json.loads((ROOT / 'docs/editorial-state.json').read_text(encoding='utf-8'))
    if slug in json.dumps(state):
        raise ValueError('This article is already recorded in publication history; preserve its original date.')
    path = ROOT / 'content/news.json'
    data = json.loads(path.read_text(encoding='utf-8'))
    matches = [article for article in data['articles'] if article['slug'] == slug]
    if len(matches) != 1:
        raise ValueError('Expected exactly one new approved article.')
    article = matches[0]
    article['published_at'] = timestamp.isoformat(timespec='seconds')
    article['modified_at'] = article['published_at']
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n', encoding='utf-8', newline='\n')
    # Source publication dates remain unchanged. Only add the release date label.
    source = f'{timestamp.day} {MONTHS["nl"][timestamp.month-1]} {timestamp.year}'
    catalog = ROOT / 'content/i18n/terminology.json'
    dictionary = json.loads(catalog.read_text(encoding='utf-8'))
    translated = {lang: f'{timestamp.day}{"." if lang == "de" else ""} {MONTHS[lang][timestamp.month-1]} {timestamp.year}' for lang in ('en', 'de', 'fr')}
    if source not in dictionary:
        value = json.dumps(source, ensure_ascii=False)+': '+json.dumps(translated, ensure_ascii=False)
        text = catalog.read_text(encoding='utf-8').replace('{\n', '{\n  '+value+',\n', 1)
        catalog.write_text(text, encoding='utf-8', newline='\n')
    return article['published_at']


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--slug', required=True)
    parser.add_argument('--at', required=True)
    args = parser.parse_args()
    print('Approved article publication date:', finalize(args.slug, args.at))
