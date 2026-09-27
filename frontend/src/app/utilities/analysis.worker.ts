/// <reference lib="webworker" />
import { analyze } from './analysis-tools';
addEventListener('message', ({ data }: MessageEvent<{ id: string; input: string; mode: string; fields: Record<string, string> }>) => {
  try { postMessage({ output: analyze(data.id, data.input, data.mode, data.fields) }); }
  catch (error) { postMessage({ error: error instanceof Error ? error.message : 'Could not complete this analysis.' }); }
});
