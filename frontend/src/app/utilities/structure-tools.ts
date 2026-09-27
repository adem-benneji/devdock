import { boundedOutput, parseJson } from './strict-json';

export function jsonLines(input: string, mode: string): string {
  if (mode === 'to-lines') {
    const value = parseJson(input);
    if (!Array.isArray(value) || value.length > 5000) throw new Error('Enter a JSON array with at most 5,000 items.');
    return boundedOutput(value.map(item => JSON.stringify(item)).join('\n'));
  }
  if (mode !== 'to-array') throw new Error('Choose a JSON Lines operation.');
  const lines = input.split(/\r\n|\n|\r/);
  if (lines.at(-1) === '') lines.pop();
  if (!lines.length) return '[]';
  if (lines.length > 5000) throw new Error('Use at most 5,000 JSON Lines records.');
  const values = lines.map((line, i) => {
    try { return parseJson(line); }
    catch (error) { throw new Error(`Line ${i + 1}: ${error instanceof Error ? error.message : 'Invalid JSON.'}`); }
  });
  return boundedOutput(JSON.stringify(values, null, 2));
}

type Segment = string | number;
interface Entry { path: Segment[]; value: unknown; }
function isLeaf(value: unknown): boolean {
  return value === null || typeof value !== 'object' || Object.keys(value).length === 0;
}
export function flattenJson(input: string): string {
  const result: Entry[] = [];
  let size = 0;
  function walk(value: unknown, path: Segment[]) {
    if (isLeaf(value)) {
      const entry = { path, value };
      size += JSON.stringify(entry).length;
      if (result.length >= 5000 || size > 900_000) throw new Error('Flattened result is too large. Use at most 5,000 leaves and shorter paths.');
      result.push(entry);
    } else if (Array.isArray(value)) value.forEach((item, index) => walk(item, [...path, index]));
    else for (const [key, item] of Object.entries(value as object)) walk(item, [...path, key]);
  }
  walk(parseJson(input), []);
  return boundedOutput(JSON.stringify(result, null, 2));
}
interface Trie { children: Map<Segment, Trie>; assigned: boolean; value?: unknown; }
export function unflattenJson(input: string): string {
  const entries = parseJson(input);
  if (!Array.isArray(entries) || !entries.length || entries.length > 5000) throw new Error('Enter a nonempty array of up to 5,000 path/value entries.');
  const root: Trie = { children: new Map(), assigned: false };
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry) || Object.keys(entry).length !== 2 || !Object.hasOwn(entry, 'value') || !Array.isArray(entry.path) || entry.path.length > 64 || !isLeaf(entry.value)) throw new Error('Each entry needs a path array and a primitive or empty-container value. Paths may have at most 64 segments.');
    let node = root;
    for (const key of entry.path) {
      if (typeof key !== 'string' && !(Number.isInteger(key) && key >= 0 && key < 5000)) throw new Error('Path segments must be strings or array indexes from 0 to 4,999.');
      if (node.assigned) throw new Error('Paths conflict: a value cannot also contain child paths.');
      if (!node.children.has(key)) node.children.set(key, { children: new Map(), assigned: false });
      node = node.children.get(key)!;
    }
    if (node.assigned || node.children.size) throw new Error('Duplicate or conflicting paths.');
    node.assigned = true; node.value = entry.value;
  }
  function build(node: Trie): unknown {
    if (node.assigned) return node.value;
    const entries = [...node.children];
    const numeric = entries.filter(([key]) => typeof key === 'number');
    if (numeric.length) {
      if (numeric.length !== entries.length || numeric.some(([key]) => (key as number) >= entries.length)) throw new Error('Array indexes must be contiguous from zero; do not mix object keys with array indexes.');
      return Array.from({ length: entries.length }, (_, index) => build(node.children.get(index)!));
    }
    return Object.fromEntries(entries.map(([key, child]) => [key, build(child)]));
  }
  return boundedOutput(JSON.stringify(build(root), null, 2));
}

export function compareJson(before: string, after: string): string {
  const changes: object[] = [];
  let size = 0;
  function add(change: object) {
    size += JSON.stringify(change).length;
    if (changes.length >= 500 || size > 900_000) throw new Error('More than 500 changes or too much output. Compare smaller documents.');
    changes.push(change);
  }
  const childPath = (path: string, key: string) => `${path}/${key.replace(/~/g, '~0').replace(/\//g, '~1')}`;
  function visit(a: unknown, b: unknown, path: string) {
    if (a === b) return;
    if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) {
      add({ kind: 'changed', path, before: a, after: b }); return;
    }
    for (const key of Object.keys(a)) {
      if (!Object.hasOwn(b, key)) add({ kind: 'removed', path: childPath(path, key), before: (a as Record<string, unknown>)[key] });
      else visit((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key], childPath(path, key));
    }
    for (const key of Object.keys(b)) if (!Object.hasOwn(a, key)) add({ kind: 'added', path: childPath(path, key), after: (b as Record<string, unknown>)[key] });
  }
  visit(parseJson(before), parseJson(after), '');
  return boundedOutput(JSON.stringify({ equal: changes.length === 0, changes }, null, 2));
}
