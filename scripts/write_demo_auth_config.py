"""Prepare private demo login configuration; never print or commit credentials."""
import json
import os
from pathlib import Path

try:
    config = json.loads(os.environ.get('OPTICORE_DEMO_AUTH_CONFIG', ''))
    assert isinstance(config['username'], str) and 1 <= len(config['username']) <= 120
    assert isinstance(config['password_hash'], str) and config['password_hash'].startswith(('$2y$', '$argon2'))
    assert isinstance(config.get('management_key'), str) and len(config['management_key']) >= 40
except (ValueError, KeyError, TypeError, AssertionError):
    raise SystemExit('Configure the OPTICORE_DEMO_AUTH_CONFIG repository secret before publishing.')
target = Path(__file__).resolve().parents[1] / '.scan-deploy/demo-auth.json'
target.parent.mkdir(exist_ok=True, mode=0o700)
target.write_text(json.dumps({key: config[key] for key in ['username', 'password_hash', 'management_key'] if key in config}), encoding='utf-8')
target.chmod(0o600)
print('Private demo login configuration prepared; no credentials printed.')
