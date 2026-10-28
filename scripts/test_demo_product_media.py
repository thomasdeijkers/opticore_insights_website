"""Reject incomplete, altered or path-injected product media bundles."""
import hashlib
import io
from pathlib import Path
from zipfile import ZipFile
from demo_product_assets import verify_bundle

ROOT = Path(__file__).resolve().parents[1]
files = {}
records = []
for number in range(1001, 1013):
    sku = f'DEMO-{number}'
    name = f'assets/img/demo-products/studio-v1/{sku.lower()}.jpg'
    data = (ROOT / f'assets/img/demo-products/{sku.lower()}.jpg').read_bytes()
    files[name] = data
    records.append({'sku': sku, 'path': '/' + name, 'width': 1254, 'height': 1254, 'sha256': hashlib.sha256(data).hexdigest()})


def bundle(entries):
    output = io.BytesIO()
    with ZipFile(output, 'w') as archive:
        for name, data in entries.items():
            archive.writestr(name, data)
    return output.getvalue()


def config(data):
    return {'sha256': hashlib.sha256(data).hexdigest(), 'images': records}


def rejected(data, settings):
    try:
        verify_bundle(data, settings)
    except AssertionError:
        return
    raise AssertionError('Invalid media was accepted')


valid = bundle(files)
assert verify_bundle(valid, config(valid)) == files
rejected(valid + b'changed', config(valid))
missing = bundle(dict(list(files.items())[:-1]))
rejected(missing, config(missing))
injected = bundle({**files, '../outside.jpg': next(iter(files.values()))})
rejected(injected, config(injected))
changed = dict(files)
changed[next(iter(files))] += b'changed'
tampered = bundle(changed)
rejected(tampered, config(tampered))
print('Studio media validation OK: complete bundle; altered checksum/image, missing file and path injection rejected.')
