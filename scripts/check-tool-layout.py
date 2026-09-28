#!/usr/bin/env python3
"""Verify every tool has a module, tests, UI help and synchronized form metadata."""
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
SERVICE = ROOT / 'backend/tools-service/src'
resources = SERVICE / 'main/resources/tools'
registry = (SERVICE / 'main/java/com/devtools/tools/utilities/ToolRegistry.java').read_text()
count = 0
for folder in sorted(resources.iterdir()):
    tool = folder.name
    package = tool.replace('-', '')
    assert (SERVICE / f'main/java/com/devtools/tools/features/{package}').is_dir(), tool
    assert (SERVICE / f'test/java/com/devtools/tools/features/{package}').is_dir(), tool
    assert f'features.{package}.' in registry, tool
    frontend = ROOT / 'frontend/src/app/features' / tool
    config = json.loads(re.search(r'= (\{.*\});', (frontend / 'config.ts').read_text(), re.S).group(1))
    guides = json.loads(re.search(r'= (\{.*\});', (frontend / 'guide.ts').read_text(), re.S).group(1))
    assert config == json.loads((folder / 'definition.json').read_text()), f'{tool}: frontend/backend definitions differ'
    assert set(guides) == {mode['value'] for mode in config['modes']}, f'{tool}: missing mode guide'
    for guide in guides.values():
        assert all(key in guide for key in ['input', 'action', 'output', 'exampleInput', 'exampleOutput']), tool
    count += 1
assert count == 37, f'Expected 37 utility modules, found {count}'
for tool, package in [('json-formatter', 'jsonformatter'), ('file-converter', 'fileconverter')]:
    assert (SERVICE / f'main/java/com/devtools/tools/features/{package}').is_dir()
    assert (SERVICE / f'test/java/com/devtools/tools/features/{package}').is_dir()
    assert (ROOT / 'frontend/src/app/features' / tool).is_dir()
assert not list((ROOT / 'frontend/src/app').rglob('*.worker.ts')), 'Browser processing worker remains'
print('39 tool folders verified; 37 utility definitions and all mode guides agree with the backend.')
