#!/usr/bin/env python3
"""Start/stop an isolated loopback-only development PostgreSQL cluster."""
import argparse
import os
from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('action', choices=['start', 'stop', 'status'])
parser.add_argument('--data-dir', type=Path, default=ROOT / '.local' / 'postgres')
parser.add_argument('--port', type=int, default=55432)
args = parser.parse_args()

def binary(name):
    found = shutil.which(name)
    if found:
        return found
    for folder in ['/opt/homebrew/opt/postgresql@16/bin', '/usr/local/opt/postgresql@16/bin']:
        candidate = Path(folder) / name
        if candidate.exists():
            return str(candidate)
    raise SystemExit(f'{name} is required. Install PostgreSQL 16+ or add its bin directory to PATH.')

def run(name, *options, **kwargs):
    return subprocess.run([binary(name), *map(str, options)], **kwargs)

data = args.data_dir.resolve()
if args.action == 'start':
    if not (data / 'PG_VERSION').exists():
        data.parent.mkdir(parents=True, exist_ok=True)
        run('initdb', '-D', data, '-U', 'devdock', '--auth-local=trust', '--auth-host=trust', check=True)
    running = run('pg_ctl', '-D', data, 'status', stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0
    if not running:
        run('pg_ctl', '-D', data, '-l', data.parent / 'postgres.log', '-o', f'-h 127.0.0.1 -p {args.port} -k /tmp', 'start', check=True)
    # Use the known development role, never the current user's default database.
    options = ['-h', '127.0.0.1', '-p', str(args.port), '-U', 'devdock']
    exists = run('psql', *options, '-d', 'postgres', '-Atc', "SELECT 1 FROM pg_database WHERE datname = 'devdock_snippets'", check=True, capture_output=True, text=True)
    if exists.stdout.strip() != '1':
        run('createdb', *options, 'devdock_snippets', check=True)
    print(f'DevDock PostgreSQL ready: 127.0.0.1:{args.port}/devdock_snippets (role devdock). Data: {data}')
elif args.action == 'stop':
    run('pg_ctl', '-D', data, 'stop', '-m', 'fast', check=True)
else:
    raise SystemExit(run('pg_ctl', '-D', data, 'status').returncode)
