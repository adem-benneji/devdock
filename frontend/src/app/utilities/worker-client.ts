// Share lifecycle handling without putting parser-specific logic into the UI.
export function runWorker(create: () => Worker, payload: unknown, signal: AbortSignal, timeoutMessage: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new Error('Operation cancelled.')); return; }
    if (typeof Worker === 'undefined') { reject(new Error('This tool requires a browser with Web Worker support.')); return; }
    const worker = create();
    const finish = (output?: string, error?: string) => {
      clearTimeout(timer); worker.terminate(); signal.removeEventListener('abort', abort);
      if (error) reject(new Error(error)); else if (typeof output === 'string') resolve(output); else reject(new Error('The worker returned an invalid result.'));
    };
    const abort = () => finish(undefined, 'Operation cancelled.');
    const timer = setTimeout(() => finish(undefined, timeoutMessage), 3000);
    signal.addEventListener('abort', abort, { once: true });
    worker.onmessage = ({ data }: MessageEvent<{ output?: string; error?: string }>) => finish(data.output, data.error);
    worker.onerror = () => finish(undefined, 'Could not run this tool. Reload and try again.');
    worker.onmessageerror = () => finish(undefined, 'Could not read the tool result.');
    try { worker.postMessage(payload); } catch { finish(undefined, 'Could not start this operation.'); }
  });
}
