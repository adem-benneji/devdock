#!/usr/bin/env python3
"""Run real gateway/service/SQL/browser integration in a disposable DB schema.
Requires built jars, installed frontend dependencies/Chromium, and PostgreSQL.
Never uses the application's public schema or deletes user snippets.
"""
import argparse
import json
import os
from pathlib import Path
import shutil
import signal
import socket
import subprocess
import tempfile
import time
import urllib.error
import urllib.request
import urllib.parse
import uuid

ROOT = Path(__file__).resolve().parents[1]
SCHEMA = 'integration_' + uuid.uuid4().hex
DB_URL = os.environ.get('TEST_DB_URL', 'jdbc:postgresql://127.0.0.1:55432/devdock_snippets')
DB_USER = os.environ.get('TEST_DB_USER', 'devdock')
DB_PASSWORD = os.environ.get('TEST_DB_PASSWORD', '')
PROCESSES = []
LOGS = Path(tempfile.mkdtemp(prefix='devdock-integration-'))


def port():
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        return sock.getsockname()[1]


def start(name, command, extra=None, cwd=ROOT):
    logfile = open(LOGS / (name + '.log'), 'a')
    process = subprocess.Popen(command, cwd=cwd, env={**os.environ, **(extra or {})},
                               stdout=logfile, stderr=subprocess.STDOUT, start_new_session=True)
    logfile.close()
    PROCESSES.append(process)
    return process


def stop(process):
    if process.poll() is None:
        os.killpg(process.pid, signal.SIGTERM)
        try:
            process.wait(timeout=15)
        except subprocess.TimeoutExpired:
            os.killpg(process.pid, signal.SIGKILL)
            process.wait(timeout=5)


def request(base, method, path, data=None, expected=200, headers=None):
    body = None if data is None else json.dumps(data).encode()
    req = urllib.request.Request(base + path, data=body, method=method,
                                 headers={'Content-Type': 'application/json', **(headers or {})})
    try:
        response = urllib.request.urlopen(req, timeout=15)
    except urllib.error.HTTPError as error:
        response = error
    with response:
        payload = response.read()
        assert response.status == expected, (method, path, response.status, payload[:500])
        return (json.loads(payload) if payload else None), response.headers


def ready(base, process, path='/actuator/health'):
    deadline = time.monotonic() + 60
    while time.monotonic() < deadline:
        if process.poll() is not None:
            raise RuntimeError(f'Process exited; inspect {LOGS}')
        try:
            urllib.request.urlopen(base + path, timeout=2).close()
            return
        except (OSError, urllib.error.HTTPError):
            time.sleep(.2)
    raise RuntimeError(f'Timed out waiting for {base}; inspect {LOGS}')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--no-browser', action='store_true')
    parser.add_argument('--postgres-data', help='Opt in to stopping/restarting this isolated local PostgreSQL cluster to verify database outage recovery.')
    args = parser.parse_args()
    tools_port, snippets_port, gateway_port, frontend_port = port(), port(), port(), port()
    base = f'http://127.0.0.1:{gateway_port}'
    def java(service, service_port, extra=None):
        return start(service, ['java', '-jar', str(ROOT / 'backend' / service / 'target' / (service + '-0.0.1-SNAPSHOT.jar'))],
                     {'SERVER_PORT': str(service_port), 'SERVER_ADDRESS': '127.0.0.1', **(extra or {})})
    snippets_env = {'SNIPPETS_DB_URL': DB_URL, 'SNIPPETS_DB_USER': DB_USER, 'SNIPPETS_DB_PASSWORD': DB_PASSWORD,
                    'SPRING_FLYWAY_SCHEMAS': SCHEMA, 'SPRING_DATASOURCE_HIKARI_SCHEMA': SCHEMA}
    try:
        tools = java('tools-service', tools_port)
        snippets = java('snippets-service', snippets_port, snippets_env)
        gateway = java('gateway-service', gateway_port, {
            'TOOLS_SERVICE_URL': f'http://127.0.0.1:{tools_port}',
            'SNIPPETS_SERVICE_URL': f'http://127.0.0.1:{snippets_port}',
            'FRONTEND_ORIGIN': f'http://127.0.0.1:{frontend_port}'})
        for service_port, process in [(tools_port, tools), (snippets_port, snippets), (gateway_port, gateway)]:
            ready(f'http://127.0.0.1:{service_port}', process)
        catalog, _ = request(base, 'GET', '/api/tools')
        assert catalog[0]['id'] == 'json-formatter'
        output, headers = request(base, 'POST', '/api/tools/json-formatter', {'input': '{"id":12345678901234567890}', 'mode': 'FORMAT'})
        assert '12345678901234567890' in output['output']
        assert headers['Cache-Control'] == 'no-store'
        snippet, headers = request(base, 'POST', '/api/snippets', {'title': 'Integration', 'content': output['output'], 'language': 'JSON'}, 201)
        path = headers['Location']
        assert request(base, 'GET', path)[0] == snippet
        # Real process restart reuses the same database schema and Flyway migration.
        stop(snippets)
        failure, _ = request(base, 'GET', path, expected=503)
        assert failure['code'] == 'SERVICE_UNAVAILABLE'
        snippets = java('snippets-service', snippets_port, snippets_env)
        ready(f'http://127.0.0.1:{snippets_port}', snippets)
        assert request(base, 'GET', path)[0] == snippet
        updated, _ = request(base, 'PUT', path, {'title': 'Integration updated', 'content': '[1,2]', 'language': 'JSON', 'version': 0})
        assert updated['version'] == 1
        conflict, _ = request(base, 'PUT', path, {'title': 'Stale', 'content': '[]', 'language': 'JSON', 'version': 0}, 409)
        assert conflict['code'] == 'VERSION_CONFLICT'
        request(base, 'DELETE', path + '?version=0', expected=409)
        request(base, 'DELETE', path + '?version=1', expected=204)
        request(base, 'GET', path, expected=404)
        invalid, _ = request(base, 'POST', '/api/tools/json-formatter', {'input': '{"x":1,"x":2}', 'mode': 'MINIFY'}, 400)
        assert invalid['code'] == 'INVALID_JSON'
        request(base, 'GET', '/api/snippets?limit=0', expected=400)
        request(base, 'GET', '/api/tools/missing', expected=404)
        # Both fixed-length and chunked oversized bodies must be rejected by the gateway.
        request(base, 'POST', '/api/tools/json-formatter', {'input': 'x' * 8_000_001, 'mode': 'FORMAT'}, 413)
        import http.client
        connection = http.client.HTTPConnection('127.0.0.1', gateway_port, timeout=15)
        connection.request('POST', '/api/tools/json-formatter', body=iter([b'x' * 1_000_000] * 9),
                           headers={'Content-Type': 'application/json'}, encode_chunked=True)
        response = connection.getresponse()
        assert response.status == 413, (response.status, response.read())
        response.read(); connection.close()
        _, headers = request(base, 'OPTIONS', '/api/snippets', expected=200, headers={
            'Origin': f'http://127.0.0.1:{frontend_port}', 'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'content-type'})
        assert headers['Access-Control-Allow-Origin'] == f'http://127.0.0.1:{frontend_port}'
        # Suspend the real tools process to exercise the gateway's response timeout.
        os.kill(tools.pid, signal.SIGSTOP)
        try:
            timeout, _ = request(base, 'POST', '/api/tools/json-formatter', {'input': '{}', 'mode': 'FORMAT'}, 504)
            assert timeout['code'] == 'GATEWAY_TIMEOUT'
        finally:
            os.kill(tools.pid, signal.SIGCONT)
        stop(tools)
        failure, headers = request(base, 'POST', '/api/tools/json-formatter', {'input': '{}', 'mode': 'FORMAT'}, 503,
                                   headers={'Origin': f'http://127.0.0.1:{frontend_port}'})
        assert failure['code'] == 'SERVICE_UNAVAILABLE'
        assert headers['Access-Control-Allow-Origin'] == f'http://127.0.0.1:{frontend_port}'
        tools = java('tools-service', tools_port)
        ready(f'http://127.0.0.1:{tools_port}', tools)
        # Exercise the asynchronous contract through the real gateway.
        ticket, _ = request(base, 'POST', '/api/tools/base64/executions', {'input': 'exact', 'mode': 'encode', 'fields': {}}, 202)
        job = '/api/tools/executions/' + ticket['id']
        token = {'X-Execution-Token': ticket['token']}
        request(base, 'GET', job, expected=404, headers={'X-Execution-Token': 'wrong'})
        request(base, 'GET', job, expected=400)
        deadline = time.monotonic() + 15
        while True:
            execution, _ = request(base, 'GET', job, headers=token)
            if execution['state'] not in ('QUEUED', 'RUNNING'):
                break
            assert time.monotonic() < deadline, 'Execution did not finish'
            time.sleep(.1)
        assert execution['state'] == 'SUCCEEDED', execution
        assert execution['result']['utility']['output'] == 'ZXhhY3Q='
        request(base, 'GET', job + '/download', expected=409, headers=token)
        request(base, 'DELETE', job, expected=204, headers=token)
        request(base, 'GET', job, expected=404, headers=token)
        request(base, 'POST', '/api/tools/base64/executions', {'input': 'x', 'mode': 'invalid'}, 400)
        request(base, 'GET', '/api/contracts/tools')
        request(base, 'GET', '/api/contracts/snippets')
        subprocess.run(['python3', str(ROOT / 'scripts/api-contracts.py'), '--check',
                        '--tools-url', f'http://127.0.0.1:{tools_port}/v3/api-docs',
                        '--snippets-url', f'http://127.0.0.1:{snippets_port}/v3/api-docs'], check=True)
        print('PASS: asynchronous jobs, private result tokens, deletion and live OpenAPI contract checks.', flush=True)
        if args.postgres_data:
            pg_ctl = shutil.which('pg_ctl')
            assert pg_ctl, 'pg_ctl must be on PATH for database outage testing'
            database_address = urllib.parse.urlsplit(DB_URL.removeprefix('jdbc:'))
            assert database_address.hostname in ('127.0.0.1', 'localhost'), 'Outage test requires a loopback database'
            database_port = database_address.port or 5432
            actual_port = int((Path(args.postgres_data) / 'postmaster.pid').read_text().splitlines()[3])
            assert database_port == actual_port, 'Cluster port must match TEST_DB_URL'
            subprocess.run([pg_ctl, '-D', args.postgres_data, 'stop', '-m', 'fast'], check=True, stdout=subprocess.DEVNULL)
            try:
                failure, _ = request(base, 'GET', '/api/snippets', expected=503)
                assert failure['code'] == 'DATABASE_UNAVAILABLE'
            finally:
                subprocess.run([pg_ctl, '-D', args.postgres_data, '-l', str(LOGS / 'postgres-restart.log'), '-o', f'-h 127.0.0.1 -p {database_port} -k /tmp', 'start'], check=True, stdout=subprocess.DEVNULL)
            assert request(base, 'GET', '/api/snippets')[0]['items'] == []
            print('PASS: real PostgreSQL outage returns 503 and recovers after database restart.', flush=True)
        print('PASS: real gateway, CRUD, PostgreSQL restart persistence, conflicts, validation, request limits, CORS, downstream failure and recovery.', flush=True)
        if not args.no_browser:
            proxy = LOGS / 'proxy.json'
            proxy.write_text(json.dumps({'/api/**': {'target': base, 'changeOrigin': True}}))
            frontend = start('frontend', ['npm', 'start', '--', '--host', '127.0.0.1', '--port', str(frontend_port), '--proxy-config', str(proxy)], cwd=ROOT / 'frontend')
            frontend_url = f'http://127.0.0.1:{frontend_port}'
            ready(frontend_url, frontend, '/')
            subprocess.run(['npm', 'run', 'test:e2e'], cwd=ROOT / 'frontend', env={**os.environ, 'DEVDOCK_BASE_URL': frontend_url}, check=True)
            stop(tools)
            stop(snippets)
            subprocess.run(['npm', 'run', 'test:e2e'], cwd=ROOT / 'frontend',
                           env={**os.environ, 'DEVDOCK_BASE_URL': frontend_url, 'DEVDOCK_TEST_OUTAGE': '1'}, check=True)
    finally:
        for process in reversed(PROCESSES):
            stop(process)
        # SCHEMA is generated here, never supplied by a user or read from application data.
        subprocess.run(['psql', DB_URL.removeprefix('jdbc:'), '-U', DB_USER, '-v', 'ON_ERROR_STOP=1', '-c', f'DROP SCHEMA IF EXISTS {SCHEMA} CASCADE'],
                       env={**os.environ, 'PGPASSWORD': DB_PASSWORD}, check=True, stdout=subprocess.DEVNULL)
        print(f'Integration logs: {LOGS}', flush=True)

if __name__ == '__main__':
    main()
