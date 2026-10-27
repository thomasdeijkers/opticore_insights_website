"""Reject unsafe/incomplete capture bundles before any public asset is written."""
import hashlib
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from zipfile import ZipFile
import olympus_media as media


class MediaSafety(unittest.TestCase):
    def fixture(self, change=None, wrong_checksum=False):
        files = {}
        images = {}
        for file, (language, device) in media.targets().items():
            data = b'\xff\xd8'+file.encode()*30
            files[file] = data
            width,height,scale = {'desktop':(1280,900,2),'tablet':(834,1112,2),'mobile':(390,844,3)}[device]
            images[file] = dict(language=language,device=device,theme='dark',width=width,height=height,scale=scale,sha256=hashlib.sha256(data).hexdigest())
        manifest = dict(sourceCommit='a'*40,images=images)
        if change:
            change(files, manifest)
        files['manifest.json'] = json.dumps(manifest).encode()
        output = io.BytesIO()
        with ZipFile(output,'w') as archive:
            for name,data in files.items():
                archive.writestr(name,data)
        data = output.getvalue()
        config = dict(tag='reviewed-v1',asset='images.zip',sha256='0'*64 if wrong_checksum else hashlib.sha256(data).hexdigest(),sourceCommit='a'*40,images=40)
        return data,config

    def run_restore(self, change=None, wrong_checksum=False, reject=True):
        data,config = self.fixture(change,wrong_checksum)
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            bundle = root/'media.zip'; bundle.write_bytes(data)
            source = root/'config.json'; source.write_text(json.dumps(config))
            with patch.object(media,'ROOT',root),patch.object(media,'CONFIG',source):
                if reject:
                    with self.assertRaises(AssertionError):
                        media.restore(bundle)
                    self.assertFalse((root/'assets').exists(), 'A rejected archive must not write assets')
                else:
                    target = root/'assets/img/localized/manifest.json';target.parent.mkdir(parents=True)
                    target.write_text(json.dumps({'images':{'de/existing.jpg':{'sha256':'existing'}}}))
                    media.restore(bundle)
                    records = json.loads(target.read_text())['images']
                    self.assertEqual(len(records),31)
                    self.assertIn('de/existing.jpg',records)
                    self.assertEqual(len(list((root/'assets/img/examples').glob('*.jpg'))),10)

    def test_valid_bundle_merges_other_demo_captures(self):
        self.run_restore(reject=False)

    def test_checksum_mismatch(self):
        self.run_restore(wrong_checksum=True)

    def test_path_traversal(self):
        self.run_restore(lambda files,_: files.update({'../../outside.jpg':b'bad'}))

    def test_missing_capture(self):
        self.run_restore(lambda files,_: files.pop(next(iter(files))))

    def test_tampered_capture(self):
        self.run_restore(lambda files,_: files.update({next(iter(files)):b'\xff\xd8'+b'bad'*800}))

    def test_wrong_source_revision(self):
        self.run_restore(lambda _,manifest: manifest.update(sourceCommit='b'*40))


if __name__ == '__main__':
    unittest.main()
