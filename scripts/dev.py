#!/usr/bin/env python3
"""Local development only: consistent Java, builds, health checks and owned processes."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import signal
import socket
import subprocess
import sys
import time
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
STATE = ROOT / '.local' / 'dev'
ENV = dict(os.environ)
if (ROOT / '.env').exists():
    for line in (ROOT / '.env').read_text().splitlines():
        if line.strip() and not line.lstrip().startswith('#'):
            key, sep, value = line.partition('=')
            if not sep or not key.strip().replace('_', '').isalnum():
                raise SystemExit('Use KEY=value assignments in .env; shell expressions are not evaluated.')
            ENV.setdefault(key.strip(), value.strip().strip('\"\''))
if not ENV.get('JAVA_HOME'):
    for candidate in ['/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home', '/usr/local/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home']:
        if Path(candidate).is_dir():
            ENV['JAVA_HOME'] = candidate
            break
if ENV.get('JAVA_HOME'):
    ENV['PATH'] = str(Path(ENV['JAVA_HOME']) / 'bin') + os.pathsep + ENV['PATH']
if not shutil.which('psql', path=ENV['PATH']):
    for candidate in ['/opt/homebrew/opt/postgresql@16/bin', '/usr/local/opt/postgresql@16/bin']:
        if (Path(candidate) / 'psql').exists():
            ENV['PATH'] = candidate + os.pathsep + ENV['PATH']
            break
ENV.setdefault('NG_BUILD_MAX_WORKERS', '2')
SERVICES = [('tools-service', 8082), ('snippets-service', 8083), ('gateway-service', 8080)]

def run(command, cwd=ROOT, **kwargs):
    return subprocess.run(list(map(str, command)), cwd=cwd, env=ENV, check=True, **kwargs)

def occupied(port):
    with socket.socket() as connection:
        connection.settimeout(.3)
        return connection.connect_ex(('127.0.0.1', port)) == 0

def stamp(pid):
    return subprocess.run(['ps', '-p', str(pid), '-o', 'lstart='], capture_output=True, text=True).stdout.strip()

def records():
    path = STATE / 'processes.json'
    return json.loads(path.read_text()) if path.exists() else {}

def alive(record):
    return bool(record.get('started')) and stamp(record['pid']) == record['started']

def save(data):
    STATE.mkdir(parents=True, exist_ok=True)
    path = STATE / 'processes.json'
    temp = path.with_suffix('.tmp')
    temp.write_text(json.dumps(data, indent=2) + '\n')
    temp.replace(path)

def ready(port, process, path='/actuator/health'):
    deadline = time.monotonic() + 60
    while time.monotonic() < deadline:
        if process.poll() is not None:
            raise RuntimeError(f'Process exited; inspect logs in {STATE}')
        try:
            with urllib.request.urlopen(f'http://127.0.0.1:{port}{path}', timeout=2) as response:
                if response.status == 200:
                    return
        except OSError:
            time.sleep(.2)
    raise RuntimeError(f'Health check timed out on {port}; inspect {STATE}')

def start(name, command, port, extra=None):
    data = records()
    if name in data and alive(data[name]):
        print(f'{name}: already running on {data[name]["port"]}')
        return
    if occupied(port):
        raise RuntimeError(f'Port {port} is already in use. Stop that process or configure another port; it will not be killed automatically.')
    STATE.mkdir(parents=True, exist_ok=True)
    with open(STATE / f'{name}.log', 'a') as log:
        process = subprocess.Popen(list(map(str, command)), cwd=ROOT / 'frontend' if name == 'frontend' else ROOT, env={**ENV, **(extra or {})}, stdout=log, stderr=subprocess.STDOUT, start_new_session=True)
    data[name] = {'pid': process.pid, 'started': stamp(process.pid), 'port': port}
    save(data)
    ready(port, process, '/' if name == 'frontend' else '/actuator/health')
    print(f'{name}: http://127.0.0.1:{port}')

def database():
    if not ENV.get('SNIPPETS_DB_URL'):
        port = int(ENV.get('DB_PORT', '55432'))
        if not occupied(port):
            command = [sys.executable, ROOT / 'scripts/local-db.py', 'start', '--port', port]
            if ENV.get('DB_DATA_DIR'):
                command += ['--data-dir', ENV['DB_DATA_DIR']]
            run(command)
        ENV['SNIPPETS_DB_URL'] = f'jdbc:postgresql://127.0.0.1:{port}/devdock_snippets'
    # Explicit test settings win; otherwise test the configured database in disposable schemas.
    ENV.setdefault('TEST_DB_URL', ENV['SNIPPETS_DB_URL'])
    ENV.setdefault('TEST_DB_USER', ENV.get('SNIPPETS_DB_USER', 'devdock'))
    ENV.setdefault('TEST_DB_PASSWORD', ENV.get('SNIPPETS_DB_PASSWORD', ''))

def dependencies(folder, name):
    lock = hashlib.sha256((folder / 'package-lock.json').read_bytes()).hexdigest()
    stamp_file = STATE / (name + '-dependencies.sha256')
    if not (folder / 'node_modules').exists() or not stamp_file.exists() or stamp_file.read_text() != lock:
        run(['npm', 'ci'], cwd=folder)
        STATE.mkdir(parents=True, exist_ok=True)
        stamp_file.write_text(lock)

def build():
    database()
    run([ROOT / 'backend/mvnw', '-B', '-ntp', '-f', ROOT / 'backend/pom.xml', 'package'])
    dependencies(ROOT / 'frontend', 'frontend')
    run(['npm', 'run', 'build'], cwd=ROOT / 'frontend')
    dependencies(ROOT / 'tooling/contracts', 'contracts')

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('action', choices=['doctor', 'build', 'up', 'down', 'status', 'logs', 'check', 'format'])
parser.add_argument('--build', action='store_true', help='Build/test before starting services')
parser.add_argument('--backend-only', action='store_true', help='Start only backend services, for API and contract development')
parser.add_argument('--service', choices=[s[0] for s in SERVICES] + ['frontend'])
args = parser.parse_args()
try:
    if args.action == 'doctor':
        for binary, version in [('java', '-version'), ('node', '--version'), ('npm', '--version'), ('python3', '--version'), ('psql', '--version')]:
            print(f'\n{binary}: {shutil.which(binary, path=ENV["PATH"]) or "MISSING"}', flush=True)
            if shutil.which(binary, path=ENV['PATH']):
                run([binary, version])
        print('\nRequires Java 21 LTS, Node compatible with frontend/package.json, Python 3, PostgreSQL 16+. Maven is supplied by backend/mvnw.')
    elif args.action == 'build':
        build()
    elif args.action == 'up':
        if args.build:
            build()
        database()
        ports = {name: int(ENV.get(name.upper().replace('-', '_') + '_PORT', default)) for name, default in SERVICES}
        front_port = int(ENV.get('FRONTEND_PORT', '4200'))
        for name, default in SERVICES:
            jar = ROOT / 'backend' / name / 'target' / f'{name}-0.0.1-SNAPSHOT.jar'
            if not jar.exists():
                raise RuntimeError('Build first: python3 scripts/dev.py up --build')
            start(name, ['java', '-jar', jar], ports[name], {'SERVER_PORT': str(ports[name]), 'SERVER_ADDRESS': '127.0.0.1',
                'TOOLS_SERVICE_URL': f'http://127.0.0.1:{ports["tools-service"]}', 'SNIPPETS_SERVICE_URL': f'http://127.0.0.1:{ports["snippets-service"]}', 'FRONTEND_ORIGIN': f'http://127.0.0.1:{front_port}'})
        if not args.backend_only:
            proxy = STATE / 'proxy.json'
            proxy.write_text(json.dumps({'/api/**': {'target': f'http://127.0.0.1:{ports["gateway-service"]}', 'secure': False}}))
            start('frontend', ['node', ROOT / 'frontend/node_modules/@angular/cli/bin/ng.js', 'serve', '--host', '127.0.0.1', '--port', front_port, '--proxy-config', proxy], front_port, {'NG_CLI_ANALYTICS': 'false'})
    elif args.action == 'down':
        data = records()
        for name, record in reversed(list(data.items())):
            if alive(record):
                os.killpg(record['pid'], signal.SIGTERM)
                deadline = time.monotonic() + 15
                while alive(record) and time.monotonic() < deadline:
                    time.sleep(.1)
                if alive(record):
                    os.killpg(record['pid'], signal.SIGKILL)
                print(f'{name}: stopped')
            data.pop(name)
        save(data)
        print('PostgreSQL and its data remain available.')
    elif args.action == 'status':
        for name, record in records().items():
            print(f'{name}: {"running" if alive(record) else "stopped"} (port {record["port"]})')
    elif args.action == 'logs':
        names = [args.service] if args.service else [*dict(SERVICES), 'frontend']
        for name in names:
            path = STATE / f'{name}.log'
            if path.exists():
                print(f'\n{name}\n' + '\n'.join(path.read_text(errors='replace').splitlines()[-50:]))
    elif args.action == 'check':
        build()
        run([sys.executable, ROOT / 'scripts/check-tool-layout.py'])
        run([sys.executable, ROOT / 'scripts/api-contracts.py', '--offline', '--check'])
        run(['npm', 'test', '--', '--watch=false'], cwd=ROOT / 'frontend')
        run([sys.executable, ROOT / 'scripts/verify-integration.py'])
    elif args.action == 'format':
        run([ROOT / 'backend/mvnw', '-B', '-ntp', '-f', ROOT / 'backend/pom.xml', 'spotless:apply'])
except (subprocess.CalledProcessError, RuntimeError, OSError) as error:
    raise SystemExit(str(error))
