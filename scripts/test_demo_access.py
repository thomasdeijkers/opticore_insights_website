"""Exercise real PHP sessions locally with temporary, random test credentials."""
import http.cookiejar
import json
import os
from pathlib import Path
import secrets
import shutil
import socket
import subprocess
import tempfile
import time
import urllib.error
import urllib.request
from uuid import uuid4

ROOT = Path(__file__).resolve().parents[1]
php = shutil.which('php')
assert php, 'PHP is required for the session integration checks'
with tempfile.TemporaryDirectory(prefix='opticore-demo-access-') as folder:
    password = secrets.token_urlsafe(24)
    password_hash = subprocess.check_output([php, '-r', 'echo password_hash(stream_get_contents(STDIN), PASSWORD_DEFAULT);'], input=password.encode()).decode()
    config = Path(folder) / 'auth.json'
    management_key = secrets.token_urlsafe(48)
    config.write_text(json.dumps({'username': 'Test user', 'password_hash': password_hash, 'management_key': management_key}), encoding='utf-8')
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        port = sock.getsockname()[1]
    origin = f'http://127.0.0.1:{port}'
    environment = dict(os.environ, OPTICORE_DEMO_CONFIG_PATH=str(config))
    server = subprocess.Popen([php, '-S', f'127.0.0.1:{port}', '-t', str(ROOT)], env=environment, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    jar = http.cookiejar.CookieJar()
    client = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
    def request(body=None, method=None, headers=None):
        req = urllib.request.Request(origin + '/api/demo-access.php', data=json.dumps(body).encode() if body is not None else None, method=method, headers={'Content-Type': 'application/json', **(headers or {})})
        try:
            response = client.open(req, timeout=5)
        except urllib.error.HTTPError as error:
            response = error
        with response:
            return response.status, json.loads(response.read()), response.headers
    try:
        for attempt in range(40):
            try:
                status, data, headers = request()
                break
            except urllib.error.URLError:
                time.sleep(.1)
        else:
            raise AssertionError('Local PHP server did not start')
        assert status == 200 and not data['authenticated'] and data['expiresAt'] == 0
        assert 'no-store' in headers['Cache-Control']
        assert set(data) == {'authenticated', 'expiresAt', 'csrf'}
        original_cookie = next(c.value for c in jar if c.name == 'opticore_demo_access')
        login = {'username': 'Test user', 'password': password, 'csrf': data['csrf']}
        assert request({'username': 'Test user', 'password': password})[0] == 403
        assert request(login, headers={'Origin': 'https://unrelated.example'})[0] == 403
        assert request({**login, 'username': 'Unknown user'})[0] == 401
        status, data, headers = request(login, headers={'Origin': origin})
        assert status == 200 and data['authenticated'] and data['expiresAt'] > time.time() * 1000
        assert next(c.value for c in jar if c.name == 'opticore_demo_access') != original_cookie
        assert 'HttpOnly' in headers['Set-Cookie'] and 'SameSite=Lax' in headers['Set-Cookie']
        assert request()[1]['authenticated']
        assert request(login)[0] == 403, 'The old CSRF token must be invalid after login'
        assert request(method='PUT')[0] == 405
        def manage(payload, key=management_key):
            req = urllib.request.Request(origin + '/api/demo-management.php', data=json.dumps(payload).encode(), headers={'Content-Type': 'application/json', 'X-OptiCore-Demo-Key': key})
            try: response = client.open(req, timeout=5)
            except urllib.error.HTTPError as error: response = error
            with response: return response.status, json.loads(response.read())
        assert manage({'action': 'status'}, 'incorrect')[0] == 403
        assert manage({'action': 'status'})[1]['version'] == 'initial-v1'
        # Personal accounts have independent credentials and a fixed 30-day lifetime.
        from datetime import datetime, timezone, timedelta
        created = datetime.now(timezone.utc).replace(microsecond=0)
        personal = {"action": "account", "id": str(uuid4()), "username": "Chosen-user", "password": secrets.token_urlsafe(16), "created_at": created.isoformat(), "expires_at": (created + timedelta(days=30)).isoformat()}
        assert manage(personal)[0] == 200
        assert manage(personal)[0] == 200, "Retry preserves account and expiry"
        assert manage({**personal, "id": str(uuid4())})[0] == 409, "No duplicate usernames"
        assert manage({**personal, "expires_at": (created + timedelta(days=31)).isoformat()})[0] == 400
        token = request()[1]["csrf"]
        status, personal_session, _ = request({"username": personal["username"], "password": personal["password"], "csrf": token})
        assert status == 200 and personal_session["authenticated"]
        assert personal_session["expiresAt"] <= (created + timedelta(days=30)).timestamp() * 1000
        assert request()[1]["authenticated"]
        extension = {"action": "account_extend", "id": personal["id"], "expected_expires_at": personal["expires_at"], "expires_at": (created + timedelta(days=60)).isoformat()}
        assert manage(extension)[0] == 200
        assert manage(extension)[0] == 200, "Extension retry never doubles the extension"
        assert request()[1]["authenticated"], "Extending does not revoke a valid session"
        accounts_path = Path(folder) / "demo-accounts.json"
        stored = json.loads(accounts_path.read_text())
        assert personal["password"] not in accounts_path.read_text(), "Website stores only password hashes"
        stored[personal["id"]]["expires_at"] = (created - timedelta(seconds=1)).isoformat()
        accounts_path.write_text(json.dumps(stored))
        assert not request()[1]["authenticated"], "Existing sessions stop at account expiry"
        assert request({"username": personal["username"], "password": personal["password"], "csrf": request()[1]["csrf"]})[0] == 401, "Expired accounts cannot log in again"
        assert manage({"action": "account_delete", "id": personal["id"]})[0] == 200
        assert manage({"action": "account_delete", "id": personal["id"]})[0] == 200
        assert personal["id"] not in json.loads(accounts_path.read_text())
        other = {**personal, "id": str(uuid4()), "username": "Other-user"}
        assert manage(other)[0] == 200
        assert request({"username": other["username"], "password": other["password"], "csrf": request()[1]["csrf"]})[1]["authenticated"]
        assert manage({"action": "account_delete", "id": other["id"]})[0] == 200
        assert not request()[1]["authenticated"], "Deleting an active user invalidates their session"
        assert request({"username": other["username"], "password": other["password"], "csrf": request()[1]["csrf"]})[0] == 401
        token = request()[1]["csrf"]
        assert request({"username": "Test user", "password": password, "csrf": token})[0] == 200, "Personal expiry leaves other accounts working"
        new_password = secrets.token_urlsafe(24)
        update = {'action': 'update', 'username': 'Updated-user', 'password': new_password, 'version': str(uuid4()), 'expected_version': 'initial-v1'}
        status, result = manage(update)
        assert status == 200 and result['version'] == update['version']
        assert set(result) == {'ok', 'username', 'version', 'updated_at'}
        assert manage(update)[0] == 200, 'A retry must be idempotent'
        assert manage({**update, 'version': str(uuid4())})[0] == 409
        assert not request()[1]['authenticated'], 'Changing credentials invalidates existing sessions'
        assert request({**login, 'csrf': request()[1]['csrf']})[0] == 401
        # A subsequent seed upload must not overwrite the mutable settings.
        config.write_text(json.dumps({'username': 'Test user', 'password_hash': password_hash, 'management_key': management_key}), encoding='utf-8')
        assert manage({'action': 'status'})[1]['version'] == update['version']
        status, data, _ = request({'username': 'Updated-user', 'password': new_password, 'csrf': request()[1]['csrf']})
        assert status == 200 and data['authenticated']
        token = request()[1]['csrf']
        bad = {'username': 'Updated-user', 'password': 'incorrect test input', 'csrf': token}
        assert request({**bad, 'password': 'x' * 5000})[0] == 400
        for attempt in range(10):
            assert request(bad)[0] == 401
        status, _, headers = request({**bad, 'password': new_password})
        assert status == 429 and headers['Retry-After'] == '900'
        config.unlink()
        assert request()[0] == 503, 'Missing private configuration must fail closed'
        print('Demo access OK: private config, wrong credentials, CSRF/origin checks, cookie flags, session persistence/regeneration, input limits and login throttling.')
    finally:
        server.terminate()
        server.wait(timeout=5)
