import { boundedOutput, parseJson } from './strict-json';

function typeOf(value: unknown, depth = 0): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    const types = [...new Set(value.map(item => typeOf(item, depth)))];
    return boundedOutput(`Array<${types.length ? types.join(' | ') : 'unknown'}>`);
  }
  if (typeof value === 'object') {
    const fields = Object.entries(value).map(([key, item]) => `${'  '.repeat(depth + 1)}${JSON.stringify(key)}: ${typeOf(item, depth + 1)};`);
    return boundedOutput(fields.length ? `{\n${fields.join('\n')}\n${'  '.repeat(depth)}}` : 'Record<string, unknown>');
  }
  return typeof value;
}
export function jsonToTypescript(input: string): string {
  return boundedOutput(`export type Root = ${typeOf(parseJson(input))};`);
}
function inferSchema(value: unknown): Record<string, unknown> {
  if (value === null) return { type: 'null' };
  if (Array.isArray(value)) {
    const variants = [...new Set(value.map(item => JSON.stringify(inferSchema(item))))].map(item => JSON.parse(item));
    return { type: 'array', items: variants.length > 1 ? { anyOf: variants } : variants[0] ?? {} };
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    return { type: 'object', properties: Object.fromEntries(Object.entries(value).map(([key, item]) => [key, inferSchema(item)])), ...(keys.length ? { required: keys } : {}) };
  }
  return { type: typeof value === 'number' && Number.isInteger(value) ? 'integer' : typeof value };
}
export function jsonToSchema(input: string): string {
  return boundedOutput(JSON.stringify({ $schema: 'https://json-schema.org/draft/2020-12/schema', ...inferSchema(parseJson(input)) }, null, 2));
}
