"""Restore pinned, reviewed Olympus captures without publishing private app code."""
import argparse
import hashlib
import io
import json
from pathlib import Path
from urllib.request import Request, urlopen
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT/'content/olympus-captures.json'


def targets():
    result = {}
    for language in ('nl', 'de', 'en', 'fr'):
        for scene in ('dashboard', 'planning', 'opdrachten', 'menu'):
            for device in ('desktop', 'tablet', 'mobile') if scene != 'menu' else ('mobile',):
                prefix = 'assets/img/examples/' if language == 'nl' else f'assets/img/localized/{language}/examples/'
                result[prefix+f'client-olympus-{scene}-{device}-dark.jpg'] = (language, device)
    return result


def restore(bundle=None):
    config = json.loads(CONFIG.read_text(encoding='utf-8'))
    url = f'https://github.com/thomasdeijkers/opticore_insights_website/releases/download/{config["tag"]}/{config["asset"]}'
    data = bundle.read_bytes() if bundle else urlopen(Request(url, headers={'User-Agent':'OptiCore-site-build'}), timeout=90).read()
    assert hashlib.sha256(data).hexdigest() == config['sha256'], 'Olympus media bundle checksum mismatch'
    expected = targets()
    with ZipFile(io.BytesIO(data)) as archive:
        names = archive.namelist()
        assert len(names) == len(set(names)) and set(names) == set(expected)|{'manifest.json'}, 'Unexpected media bundle files'
        manifest = json.loads(archive.read('manifest.json'))
        assert manifest['sourceCommit'] == config['sourceCommit']
        assert set(manifest['images']) == set(expected) and len(expected) == config['images'] == 40
        # Validate the whole archive before writing anything. No paths from it are trusted.
        for file, (language, device) in expected.items():
            image = archive.read(file)
            record = manifest['images'][file]
            dimensions = {'desktop':(1280,900,2),'tablet':(834,1112,2),'mobile':(390,844,3)}[device]
            assert image.startswith(b'\xff\xd8') and len(image) > 1000, file
            assert hashlib.sha256(image).hexdigest() == record['sha256'], file
            assert (record['language'], record['device'], record['theme']) == (language, device, 'dark'), file
            assert (record['width'],record['height'],record['scale']) == dimensions, file
        for file in expected:
            path = ROOT/file
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(archive.read(file))
    target = ROOT/'assets/img/localized/manifest.json'
    previous = json.loads(target.read_text(encoding='utf-8')) if target.exists() else {'images':{}}
    for file, record in manifest['images'].items():
        if record['language'] != 'nl':
            previous['images'][file.removeprefix('assets/img/localized/')] = record
    previous['revision'] = hashlib.sha256(json.dumps(sorted(previous['images'].items()), ensure_ascii=False, separators=(',',':')).encode()).hexdigest()[:16]
    target.write_text(json.dumps(previous, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print('Olympus media verified: 40 actual frontend captures, four languages, matching phone/tablet/desktop views.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--bundle', type=Path, help='Optional local copy of the same pinned release asset')
    restore(parser.parse_args().bundle)
