import { runWorker } from './worker-client';
export async function runJsonPath(input: string, query: string, signal: AbortSignal): Promise<string> {
  if (input.length > 100_000) throw new Error('Use at most 100,000 characters at a time.');
  if (query.length > 500) throw new Error('Use a JSONPath of at most 500 characters.');
  return runWorker(() => new Worker(new URL('./jsonpath.worker', import.meta.url)), { input, query }, signal, 'Query exceeded 3 seconds. Use a smaller document or a narrower query.');
}
