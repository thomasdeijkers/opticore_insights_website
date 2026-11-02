"""Deterministic checks for maintenance activation, rollback and PHP responses."""
from contextlib import contextmanager
from io import BytesIO
import json
from pathlib import Path
import subprocess
import unittest
from unittest.mock import patch

import site_maintenance as maintenance


class MemorySFTP:
    def __init__(self):
        self.files = {'/www/index.html': (maintenance.ROOT / 'index.html').read_bytes()}
        self.directories = {'/www'}

    @contextmanager
    def open(self, path, mode):
        if mode == 'rb' and path not in self.files:
            raise FileNotFoundError(path)
        stream = BytesIO(self.files.get(path, b'') if mode == 'rb' else b'')
        yield stream
        if mode == 'wb':
            self.files[path] = stream.getvalue()
        stream.close()

    def mkdir(self, path):
        if path in self.directories:
            raise FileExistsError(path)
        self.directories.add(path)

    def stat(self, path):
        if path not in self.directories:
            raise FileNotFoundError(path)

    def chmod(self, path, mode):
        pass

    def posix_rename(self, old, new):
        self.files[new] = self.files.pop(old)

    def remove(self, path):
        if path not in self.files:
            raise FileNotFoundError(path)
        del self.files[path]


class SiteMaintenanceTests(unittest.TestCase):
    def test_rules_preserve_existing_config_and_are_idempotent(self):
        original = 'Options -Indexes\n# Existing website configuration\n'
        result = maintenance.merge_rules(original)
        self.assertTrue(result.endswith(original))
        self.assertEqual(maintenance.merge_rules(result), result)
        self.assertIn('ErrorDocument 503 /onderhoud.php', result)
        with self.assertRaises(ValueError):
            maintenance.merge_rules(maintenance.START)

    def test_target_must_be_an_explicit_absolute_directory(self):
        for value in ('', '/', '/www/../', 'www'):
            with self.assertRaises(ValueError):
                maintenance.remote_root(value)
        self.assertEqual(maintenance.remote_root('/www/'), '/www')

    def test_begin_stages_assets_before_enabling_and_finish_checks_upload(self):
        sftp = MemorySFTP()
        sftp.files['/www/.htaccess'] = b'Options -Indexes\n'
        with patch.object(maintenance, 'probe') as probe:
            maintenance.begin(sftp, '/www')
            self.assertIn('/www/' + maintenance.MARKER, sftp.files)
            self.assertIn('/www/maintenance/logo.png', sftp.files)
            self.assertTrue(sftp.files['/www/.htaccess'].endswith(b'Options -Indexes\n'))
            self.assertEqual(probe.call_count, 2)
            maintenance.finish(sftp, '/www')
        self.assertNotIn('/www/' + maintenance.MARKER, sftp.files)
        self.assertIn('/www/.htaccess', sftp.files)
        self.assertEqual(sftp.files['/www/.htaccess'], b'Options -Indexes\n')

    def test_failed_activation_restores_previous_rules(self):
        sftp = MemorySFTP()
        sftp.files['/www/.htaccess'] = b'Original rules'
        with patch.object(maintenance, 'probe', side_effect=RuntimeError('Not confirmed')):
            with self.assertRaises(RuntimeError):
                maintenance.begin(sftp, '/www')
        self.assertEqual(sftp.files['/www/.htaccess'], b'Original rules')
        self.assertNotIn('/www/' + maintenance.MARKER, sftp.files)

    def test_partial_upload_keeps_maintenance_enabled(self):
        sftp = MemorySFTP()
        sftp.files['/www/' + maintenance.MARKER] = b'on'
        sftp.files['/www/index.html'] = b'Partial upload'
        with self.assertRaises(RuntimeError):
            maintenance.finish(sftp, '/www')
        self.assertIn('/www/' + maintenance.MARKER, sftp.files)

    def test_failed_public_verification_restores_maintenance_marker(self):
        sftp = MemorySFTP()
        sftp.files['/www/' + maintenance.MARKER] = b'on'
        active_rules = maintenance.merge_rules('Options -Indexes\n').encode()
        sftp.files['/www/.htaccess'] = active_rules
        with patch.object(maintenance, 'probe', side_effect=RuntimeError('Not confirmed')):
            with self.assertRaises(RuntimeError):
                maintenance.finish(sftp, '/www')
        self.assertIn('/www/' + maintenance.MARKER, sftp.files)
        self.assertEqual(sftp.files['/www/.htaccess'], active_rules)

    def php(self, values):
        code = "$_SERVER=json_decode($argv[1],true); register_shutdown_function(function(){fwrite(STDERR,(string)http_response_code());}); include $argv[2];"
        result = subprocess.run(['php', '-r', code, json.dumps(values), str(maintenance.ROOT / 'onderhoud.php')],
                                check=True, capture_output=True, encoding='utf-8')
        return int(result.stderr), result.stdout

    def test_browser_maintenance_and_preview(self):
        status, body = self.php({'REQUEST_METHOD': 'GET', 'REDIRECT_STATUS': '503', 'HTTP_ACCEPT': 'text/html'})
        self.assertEqual(status, 503)
        self.assertIn('De website wordt verbeterd', body)
        self.assertIn('Kom zo bij ons terug voor meer informatie.', body)
        self.assertIn('data:image/png;base64,', body)
        self.assertIn('id="dinoGame"', body)
        self.assertIn('support@opticore-insights.nl', body)
        self.assertNotIn('{{', body)
        self.assertEqual(self.php({'REQUEST_METHOD': 'GET'})[0], 200)

    def test_api_and_post_failures_never_receive_a_reloading_form(self):
        for values in ({'REQUEST_METHOD': 'POST', 'HTTP_ACCEPT': 'text/html'},
                       {'REQUEST_METHOD': 'GET', 'HTTP_ACCEPT': 'application/json'},
                       {'REQUEST_METHOD': 'GET', 'REDIRECT_OPTICORE_MAINTENANCE_NONGET': '1'}):
            status, body = self.php(values)
            self.assertEqual(status, 503)
            self.assertFalse(json.loads(body)['ok'])
            self.assertNotIn('<script', body)

    def test_workflow_keeps_maintenance_assets_available_through_the_upload(self):
        workflow = (maintenance.ROOT / '.github/workflows/deploy.yml').read_text()
        self.assertNotIn('delete_remote_files: true', workflow)
        self.assertIn('--exclude=maintenance', workflow)
        self.assertLess(workflow.index('site_maintenance.py begin'), workflow.index('- name: Deploy website files'))
        self.assertGreater(workflow.index('site_maintenance.py finish'), workflow.index('- name: Deploy website files'))


if __name__ == '__main__':
    unittest.main()
