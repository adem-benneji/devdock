/// <reference lib="webworker" />
import { compressText } from './compression-tools';
addEventListener('message', async ({ data }: MessageEvent<{ input: string; mode: string }>) => {
  try { postMessage({ output: await compressText(data.input, data.mode) }); }
  catch (error) { postMessage({ error: error instanceof Error ? error.message : 'Could not process this content.' }); }
});
