"""Create a temporary credential file for deployment outside the public webroot."""
import json
import os
from pathlib import Path

key = os.environ.get('OPTICORE_SCAN_API_KEY', '').strip()
if not key or any(char in key for char in '\r\n'):
    raise SystemExit('Configure the OPTICORE_SCAN_OPENAI_API_KEY repository secret before publishing.')
target = Path(__file__).resolve().parents[1] / '.scan-deploy/config.json'
target.parent.mkdir(exist_ok=True, mode=0o700)
target.write_text(json.dumps({'api_key': key, 'model': 'gpt-4o-mini', 'daily_limit': 100}), encoding='utf-8')
target.chmod(0o600)
print('Private scan configuration prepared; no credentials printed.')
