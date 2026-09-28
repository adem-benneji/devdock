#!/usr/bin/env python3
"""Snapshot live Spring Boot contracts and generate/check frontend types."""
import argparse
import json
import subprocess
import tempfile
from pathlib import Path
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--tools-url', default='http://127.0.0.1:8082/v3/api-docs')
parser.add_argument('--snippets-url', default='http://127.0.0.1:8083/v3/api-docs')
parser.add_argument('--check', action='store_true')
parser.add_argument('--offline', action='store_true', help='Check generated types against committed snapshots without live services')
args = parser.parse_args()
for name, url in [('tools', args.tools_url), ('snippets', args.snippets_url)]:
    snapshot = ROOT / 'contracts' / f'{name}.openapi.json'
    destination = ROOT / 'frontend/src/app/generated' / f'{name}-api.ts'
    if args.offline:
        spec = json.loads(snapshot.read_text())
    else:
        with urllib.request.urlopen(url, timeout=15) as response:
            spec = json.load(response)
    for path, item in spec['paths'].items():
        for method, operation in item.items():
            if method in {'get', 'post', 'put', 'delete', 'patch'}:
                assert any(code.startswith('2') for code in operation['responses']), f'{method} {path}: missing success response'
    spec.pop('servers', None)  # Local test ports do not change the API contract.
    canonical = json.dumps(spec, ensure_ascii=False, indent=2, sort_keys=True) + '\n'
    if args.check:
        assert snapshot.read_text() == canonical, f'{name}: live API contract changed; regenerate and review it'
    else:
        snapshot.parent.mkdir(parents=True, exist_ok=True)
        snapshot.write_text(canonical)
    with tempfile.TemporaryDirectory(prefix='devdock-contract-') as temp:
        source, output = Path(temp) / 'schema.json', Path(temp) / 'types.ts'
        source.write_text(canonical)
        subprocess.run([str(ROOT / 'tooling/contracts/node_modules/.bin/openapi-typescript'), str(source), '-o', str(output)], check=True)
        if args.check:
            assert destination.read_text() == output.read_text(), f'{name}: generated frontend types are stale'
        else:
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_text(output.read_text())
    print(f'{name}: API snapshot and generated types {"verified" if args.check else "updated"}')
