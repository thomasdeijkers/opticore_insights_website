"""Restore reviewed website atmosphere images; no generated binaries in Git."""
import argparse
import hashlib
import io
import json
from pathlib import Path
from urllib.request import Request, urlopen
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / 'content/collaboration-media.json'


def verified(data, config):
    assert hashlib.sha256(data).hexdigest() == config['sha256'], 'Media bundle checksum mismatch'
    expected = {item['path'].lstrip('/'): item for item in config['images']}
    assert len(expected) == 4 and all(name.startswith('assets/img/collaboration-v1/') and name.endswith('.webp') and '..' not in name for name in expected)
    with ZipFile(io.BytesIO(data)) as archive:
        assert len(archive.namelist()) == len(expected) and set(archive.namelist()) == set(expected), 'Unexpected media paths'
        result = {}
        for name, item in expected.items():
            image = archive.read(name)
            assert image.startswith(b'RIFF') and image[8:12] == b'WEBP', name
            assert hashlib.sha256(image).hexdigest() == item['sha256'], name
            result[name] = image
        return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--restore', action='store_true')
    parser.add_argument('--bundle', type=Path)
    args = parser.parse_args()
    config = json.loads(MANIFEST.read_text(encoding='utf-8'))
    if args.restore:
        url = f'https://github.com/thomasdeijkers/opticore_insights_website/releases/download/{config["tag"]}/{config["asset"]}'
        data = args.bundle.read_bytes() if args.bundle else urlopen(Request(url, headers={'User-Agent': 'OptiCore-site-build'}), timeout=90).read()
        for name, image in verified(data, config).items():
            target = ROOT / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(image)
    assert config['kind'] == 'ai-generated-illustrations' and config['tool'] == 'built-in image_gen'
    for item in config['images']:
        assert item['prompt'] and item['width'] >= 1024 and item['height'] >= 768
        assert hashlib.sha256((ROOT / item['path'].lstrip('/')).read_bytes()).hexdigest() == item['sha256']
    print('Website atmosphere images OK: four reviewed AI illustrations, full prompts and verified assets.')


if __name__ == '__main__':
    main()
