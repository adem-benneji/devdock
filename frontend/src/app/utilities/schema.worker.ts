/// <reference lib="webworker" />
import { validateSchema } from './schema-tools';
addEventListener('message', ({ data }: MessageEvent<{ input: string; schema: string; mode: string }>) => {
  try { postMessage({ output: validateSchema(data.input, data.schema, data.mode) }); }
  catch (error) { postMessage({ error: error instanceof Error ? error.message : 'Could not validate this document.' }); }
});
