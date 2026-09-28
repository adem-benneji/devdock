// All processing happens in Spring Boot. The browser manages input and job lifecycle.
import type { components } from '../generated/tools-api';
export type ExecutionTicket = components['schemas']['ExecutionTicket'];
export type ExecutionResult = components['schemas']['ExecutionResult'];
type ExecutionView = components['schemas']['ExecutionView'];

async function checked(response: Response): Promise<Response> {
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? `The service returned HTTP ${response.status}. Try again.`);
  }
  return response;
}

/** Deletion cancels queued/running work and removes retained results. */
export async function runExecution<T>(url: string, init: RequestInit, signal: AbortSignal,
  consume: (result: ExecutionResult, download: () => Promise<Blob>) => T | Promise<T>): Promise<T> {
  signal.throwIfAborted();
  let ticket: ExecutionTicket | undefined;
  const headers = () => ({ 'X-Execution-Token': ticket!.token });
  const path = () => `/api/tools/executions/${ticket!.id}`;
  const remove = async () => {
    if (ticket) await fetch(path(), { method: 'DELETE', headers: headers(), keepalive: true, signal: AbortSignal.timeout(5000) }).catch(() => undefined);
  };
  const cancel = () => { void remove(); };
  signal.addEventListener('abort', cancel, { once: true });
  try {
    // Finish creation so cancellation during upload can delete an accepted job.
    ticket = await (await checked(await fetch(url, { ...init, signal: AbortSignal.timeout(15000) }))).json();
    signal.throwIfAborted();
    const deadline = Date.now() + 180_000;
    while (Date.now() < deadline) {
      const response: ExecutionView = await (await checked(await fetch(path(), { headers: headers(), signal }))).json();
      if (response.state === 'SUCCEEDED' && response.result) {
        return await consume(response.result, async () => (await checked(await fetch(`${path()}/download`, { headers: headers(), signal }))).blob());
      }
      if (!['QUEUED', 'RUNNING'].includes(response.state)) throw new Error(response.result?.error?.message ?? 'Execution was cancelled or expired.');
      await new Promise<void>((resolve, reject) => {
        const abort = () => { clearTimeout(timer); reject(new DOMException('Cancelled', 'AbortError')); };
        const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve(); }, 250);
        signal.addEventListener('abort', abort, { once: true });
        if (signal.aborted) { signal.removeEventListener('abort', abort); abort(); }
      });
    }
    throw new Error('Execution took too long. Please retry.');
  } catch (error) {
    if (signal.aborted) throw new Error('Execution cancelled.');
    if (error instanceof TypeError) throw new Error('Could not reach DevDock. Check the local services and retry.');
    throw error;
  } finally {
    signal.removeEventListener('abort', cancel);
    await remove();
  }
}
