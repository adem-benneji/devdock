import type { components } from '../generated/tools-api';
import { runExecution } from '../shared/execution-client';

export function runUtility(id: string, input: string, mode: string, _query: string, signal: AbortSignal, fields: Record<string, string> = {}): Promise<string> {
  return runExecution(`/api/tools/${encodeURIComponent(id)}/executions`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input, mode, fields } satisfies components['schemas']['UtilityRequest']),
  }, signal, result => {
    if (!result.utility) throw new Error('The service returned an incomplete result.');
    return result.utility.output;
  });
}
