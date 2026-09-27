import { isAlias, isMap, isScalar, isSeq, parseDocument, stringify, type Node } from 'yaml';
import { boundedOutput, parseJson } from './strict-json';

function toJsonValue(node: Node | null, depth = 0): unknown {
  if (!node) return null;
  if (isAlias(node)) throw new Error('YAML aliases are not supported. Expand referenced values first.');
  if (node.tag && !/^tag:yaml.org,2002:(str|int|float|bool|null|map|seq)$/.test(node.tag)) throw new Error('Only JSON-compatible YAML types are supported.');
  if (isMap(node) || isSeq(node)) {
    if (depth >= 64) throw new Error('YAML may be nested at most 64 levels deep.');
    if (isSeq(node)) return node.items.map(item => toJsonValue(item as Node | null, depth + 1));
    const entries = node.items.map(pair => {
      if (!isScalar(pair.key) || typeof pair.key.value !== 'string') throw new Error('YAML mapping keys must be strings. Quote numeric or boolean keys.');
      return [pair.key.value, toJsonValue(pair.value as Node | null, depth + 1)] as const;
    });
    if (new Set(entries.map(([key]) => key)).size !== entries.length) throw new Error('YAML mapping keys must be unique.');
    return Object.fromEntries(entries);
  }
  if (!isScalar(node)) throw new Error('Unsupported YAML value.');
  const value = typeof node.value === 'bigint' ? Number(node.value) : node.value;
  if (typeof value === 'number' && (!Number.isFinite(value) || (Number.isInteger(value) && !Number.isSafeInteger(value)))) throw new Error('YAML numbers must be finite and integers must be within the JavaScript safe range. Quote large identifiers.');
  if (value !== null && !['string', 'number', 'boolean'].includes(typeof value)) throw new Error('Only JSON-compatible YAML values are supported.');
  return value;
}
export function convertYaml(input: string, mode: string): string {
  if (input.length > 100_000) throw new Error('Use at most 100,000 characters at a time.');
  if (mode === 'to-yaml') return boundedOutput(stringify(parseJson(input), { version: '1.2', schema: 'core', lineWidth: 0 }));
  if (mode !== 'to-json') throw new Error('Choose a supported YAML conversion.');
  if (!input.trim()) throw new Error('Enter one YAML document.');
  const doc = parseDocument(input, { version: '1.2', schema: 'core', intAsBigInt: true, uniqueKeys: true, prettyErrors: false, strict: true });
  if (doc.directives.yaml.version !== '1.2') throw new Error('Use YAML 1.2; YAML 1.1 directives are not supported.');
  if (doc.errors.length || doc.warnings.length) throw new Error(`Invalid or unsupported YAML (${(doc.errors[0] ?? doc.warnings[0]).code}). Use one document with unique keys and standard types.`);
  return boundedOutput(JSON.stringify(toJsonValue(doc.contents), null, 2));
}
