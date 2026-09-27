/// <reference lib="webworker" />
import { convertYaml } from './yaml-tools';
addEventListener('message', ({ data }: MessageEvent<{ input: string; mode: string }>) => {
  try { postMessage({ output: convertYaml(data.input, data.mode) }); }
  catch (error) { postMessage({ error: error instanceof RangeError ? 'YAML is too deeply nested or complex. Simplify the document.' : error instanceof Error ? error.message : 'Could not convert this document.' }); }
});
