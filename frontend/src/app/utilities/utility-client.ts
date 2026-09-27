import { transform } from './transforms';
import { runJsonPath } from './jsonpath-client';
import { runWorker } from './worker-client';
export async function runUtility(id: string, input: string, mode: string, query: string, signal: AbortSignal, fields: Record<string, string> = {}): Promise<string> {
  if (input.length > 100_000) throw new Error('Use at most 100,000 characters at a time.');
  if (Object.values(fields).some(value => value.length > 100_000)) throw new Error('Use at most 100,000 characters per editor.');
  if (['regex-tester', 'json-diff', 'text-diff'].includes(id)) return runWorker(() => new Worker(new URL('./analysis.worker', import.meta.url)), { id, input, mode, fields }, signal, 'Analysis exceeded 3 seconds. Simplify the expression or compare smaller documents.');
  if (id === 'jsonpath-tester') return runJsonPath(input, query, signal);
  if (id === 'yaml-json') return runWorker(() => new Worker(new URL('./yaml.worker', import.meta.url)), { input, mode }, signal, 'YAML conversion exceeded 3 seconds. Use a smaller document.');
  if (id === 'json-schema-validator') return runWorker(() => new Worker(new URL('./schema.worker', import.meta.url)), { input, mode, schema: fields['schema'] ?? '' }, signal, 'Schema validation exceeded 3 seconds. Simplify the schema or use a smaller document.');
  if (id === 'sql-formatter') return runWorker(() => new Worker(new URL('./sql.worker', import.meta.url)), { input, mode }, signal, 'SQL formatting exceeded 3 seconds. Use a smaller query.');
  if (id === 'gzip-deflate') return runWorker(() => new Worker(new URL('./compression.worker', import.meta.url)), { input, mode }, signal, 'Compression exceeded 3 seconds. Use smaller content.');
  if (id === 'semver-tool') return (await import('./version-tools')).versionTool(input, mode, fields['reference'] ?? '');
  if (id === 'hmac-signer') return (await import('./protocol-tools')).hmac(input, mode, fields['secret'] ?? '', fields['signature'] ?? '');
  if (id === 'pkce-generator') return (await import('./protocol-tools')).pkce(input, mode);
  if (id === 'ipv4-cidr') return (await import('./protocol-tools')).cidr(input, fields['member'] ?? '');
  if (id === 'url-query-editor') return (await import('./protocol-tools')).editUrl(input, mode, fields['changes'] ?? '');
  return transform(id, input, mode);
}
