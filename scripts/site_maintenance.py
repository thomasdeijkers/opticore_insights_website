"""Enable the public site's maintenance gate around the existing SFTP upload."""
from __future__ import annotations

import argparse
import hashlib
import os
from pathlib import Path, PurePosixPath
import time
from urllib.error import HTTPError
from urllib.request import Request, urlopen
from uuid import uuid4

ROOT = Path(__file__).resolve().parents[1]
SITE = 'https://opticore-insights.nl'
MARKER = '.opticore-maintenance'
START = '# BEGIN OptiCore maintenance'
END = '# END OptiCore maintenance'
RULES = f'''{START}
ErrorDocument 503 /onderhoud.php
RewriteEngine On
RewriteRule ^\\.opticore-maintenance$ - [R=404,L]
RewriteCond %{{DOCUMENT_ROOT}}/{MARKER} -f
RewriteCond %{{REQUEST_METHOD}} !^(GET|HEAD)$
RewriteRule ^ - [E=OPTICORE_MAINTENANCE_NONGET:1]
RewriteCond %{{DOCUMENT_ROOT}}/{MARKER} -f
RewriteCond %{{REQUEST_URI}} !^/onderhoud\\.php$
RewriteCond %{{REQUEST_URI}} !^/maintenance/
RewriteRule ^ - [R=503,L]
{END}
'''
BOOTSTRAP = ('onderhoud.php', 'maintenance/page.tpl', 'maintenance/game.js', 'maintenance/logo.png', 'maintenance/support.php')


def without_rules(existing: str) -> str:
    if START in existing or END in existing:
        if existing.count(START) != 1 or existing.count(END) != 1 or existing.index(END) < existing.index(START):
            raise ValueError('Onverwachte onderhoudsconfiguratie; niets overschreven.')
        before, rest = existing.split(START, 1)
        _, after = rest.split(END, 1)
        existing = before + after.lstrip('\n')
    return existing


def merge_rules(existing: str) -> str:
    return RULES + without_rules(existing)


def remote_root(value: str) -> str:
    root = PurePosixPath(value)
    if not value or not root.is_absolute() or '..' in root.parts or str(root) == '/':
        raise ValueError('Een expliciete SFTP-webroot is vereist.')
    return str(root)


def read(sftp, path: str) -> bytes | None:
    try:
        with sftp.open(path, 'rb') as stream:
            return stream.read()
    except FileNotFoundError:
        return None


def write(sftp, path: str, data: bytes) -> None:
    temporary = path + '.upload-' + uuid4().hex
    try:
        with sftp.open(temporary, 'wb') as stream:
            stream.write(data)
        sftp.chmod(temporary, 0o644)
        sftp.posix_rename(temporary, path)
    finally:
        try:
            sftp.remove(temporary)
        except FileNotFoundError:
            pass


def probe(path: str, status: int, text: str, *, absent: bool = False) -> None:
    actual = 'geen HTTP-antwoord'
    for attempt in range(12):
        try:
            request = Request(SITE + path, headers={'Accept': 'text/html', 'User-Agent': 'OptiCore release check'})
            try:
                response = urlopen(request, timeout=20)
            except HTTPError as error:
                response = error
            with response:
                body = response.read().decode('utf-8')
                actual = f'HTTP {response.status}'
                if response.status == status and ((text not in body) if absent else (text in body)):
                    return
        except OSError:
            pass
        if attempt < 11:
            time.sleep(3)
    raise RuntimeError(f'Websitecontrole niet bevestigd: {path}, verwacht HTTP {status}, ontvangen {actual}.')


def begin(sftp, target: str) -> None:
    refresh(sftp, target)
    path = target + '/.htaccess'
    previous = read(sftp, path)
    write(sftp, path, merge_rules((previous or b'').decode('utf-8')).encode('utf-8'))
    write(sftp, target + '/' + MARKER, os.getenv('GITHUB_SHA', 'deployment').encode('utf-8'))
    try:
        probe('/?maintenance-check=begin', 503, 'De website wordt verbeterd')
        probe('/contact/index.html?maintenance-check=begin', 503, 'Kom zo bij ons terug voor meer informatie.')
    except Exception:
        if previous is None:
            sftp.remove(path)
        else:
            write(sftp, path, previous)
        sftp.remove(target + '/' + MARKER)
        raise
    print('Website maintenance enabled; visitors receive the update page with HTTP 503.')


def refresh(sftp, target: str) -> None:
    try:
        sftp.mkdir(target + '/maintenance')
    except OSError:
        sftp.stat(target + '/maintenance')
    for relative in BOOTSTRAP:
        write(sftp, target + '/' + relative, (ROOT / relative).read_bytes())


def finish(sftp, target: str) -> None:
    remote_index = read(sftp, target + '/index.html')
    if remote_index is None or hashlib.sha256(remote_index).digest() != hashlib.sha256((ROOT / 'index.html').read_bytes()).digest():
        raise RuntimeError('Homepage-upload niet bevestigd; onderhoud blijft actief.')
    config_path = target + '/.htaccess'
    active_rules = read(sftp, config_path)
    # Remove the gate itself as well: shared hosting can retain file-existence
    # results briefly after the marker is removed.
    if active_rules is not None:
        write(sftp, config_path, without_rules(active_rules.decode('utf-8')).encode('utf-8'))
    try:
        sftp.remove(target + '/' + MARKER)
    except FileNotFoundError:
        pass
    try:
        probe('/?maintenance-check=' + uuid4().hex, 200, '<title>De website wordt verbeterd', absent=True)
    except Exception:
        write(sftp, target + '/' + MARKER, b'verification-pending')
        if active_rules is not None:
            write(sftp, config_path, active_rules)
        raise
    print('Website maintenance disabled; the published homepage is available with HTTP 200.')


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=('begin', 'finish', 'refresh'))
    args = parser.parse_args()
    import paramiko
    requested_target = os.environ['TRANSIP_SFTP_TARGET'].strip()
    if not requested_target:
        raise ValueError('De SFTP-webroot ontbreekt.')
    with paramiko.SSHClient() as client:
        client.load_system_host_keys()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(os.environ['TRANSIP_SFTP_HOST'], port=int(os.getenv('TRANSIP_SFTP_PORT') or '22'),
                       username=os.environ['TRANSIP_SFTP_USERNAME'], password=os.environ['TRANSIP_SFTP_PASSWORD'],
                       look_for_keys=False, allow_agent=False, timeout=20)
        with client.open_sftp() as sftp:
            target = remote_root(sftp.normalize(requested_target))
            {'begin': begin, 'finish': finish, 'refresh': refresh}[args.action](sftp, target)
            if args.action == 'refresh':
                status = 503 if read(sftp, target + '/' + MARKER) is not None else 200
                probe('/onderhoud.php?release=' + uuid4().hex, status, 'Vraag versturen')
                probe('/maintenance/support.php', 200, '"csrf"')
                print('Maintenance screen and direct support endpoint published and verified.')


if __name__ == '__main__':
    main()
