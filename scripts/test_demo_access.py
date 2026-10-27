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

ROOT = Path(__file__).resolve().parents[1]
php = shutil.which('php')
assert php, 'PHP is required for the session integration checks'
with tempfile.TemporaryDirectory(prefix='opticore-demo-access-') as folder:
    password = secrets.token_urlsafe(24)
    password_hash = subprocess.check_output([php, '-r', 'echo password_hash(stream_get_contents(STDIN), PASSWORD_DEFAULT);'], input=password.encode()).decode()
    config = Path(folder) / 'auth.json'
    config.write_text(json.dumps({'username': 'Test user', 'password_hash': password_hash}), encoding='utf-8')
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
        token = request()[1]['csrf']
        bad = {'username': 'Test user', 'password': 'incorrect test input', 'csrf': token}
        assert request({**bad, 'password': 'x' * 5000})[0] == 400
        for attempt in range(10):
            assert request(bad)[0] == 401
        status, _, headers = request({**bad, 'password': password})
        assert status == 429 and headers['Retry-After'] == '900'
        config.unlink()
        assert request()[0] == 503, 'Missing private configuration must fail closed'
        print('Demo access OK: private config, wrong credentials, CSRF/origin checks, cookie flags, session persistence/regeneration, input limits and login throttling.')
    finally:
        server.terminate()
        server.wait(timeout=5)
