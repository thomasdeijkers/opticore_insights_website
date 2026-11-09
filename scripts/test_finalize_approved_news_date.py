import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('publication_date', Path(__file__).with_name('finalize_approved_news_date.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class PublicationDateTests(unittest.TestCase):
    def test_only_new_article_dates_change_and_history_is_protected(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for folder in ['content/i18n', 'docs']:
                (root/folder).mkdir(parents=True)
            articles = [{'slug':'approved-new', 'title':'Approved title', 'sections':[{'paragraphs':['Exact approved text.']}], 'published_at':'2026-11-09T03:00:00+01:00', 'modified_at':'2026-11-09T03:00:00+01:00'}, {'slug':'old', 'published_at':'2026-10-26T09:00:00+01:00'}]
            (root/'content/news.json').write_text(json.dumps({'articles':articles}),encoding='utf-8')
            (root/'docs/editorial-state.json').write_text('{"published":["old"]}',encoding='utf-8')
            (root/'content/i18n/terminology.json').write_text('{\n  "x": {}\n}',encoding='utf-8')
            previous = module.ROOT
            try:
                module.ROOT = root
                module.finalize('approved-new', '2026-11-10T02:10:00+00:00')
                changed = json.loads((root/'content/news.json').read_text(encoding='utf-8'))['articles']
                assert changed[1] == articles[1]
                for key in ['title','sections']:
                    assert changed[0][key] == articles[0][key]
                assert changed[0]['published_at'] == '2026-11-10T03:10:00+01:00'
                assert json.loads((root/'content/i18n/terminology.json').read_text(encoding='utf-8'))['10 november 2026']['de'] == '10. November 2026'
                with self.assertRaises(ValueError): module.finalize('old', '2026-11-10T03:10:00+01:00')
            finally:
                module.ROOT = previous


if __name__ == '__main__':
    unittest.main()
