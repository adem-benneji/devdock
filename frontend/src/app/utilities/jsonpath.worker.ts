/// <reference lib="webworker" />
import { queryJson } from './jsonpath-engine';
addEventListener('message', ({ data }: MessageEvent<{ input: string; query: string }>) => {
  try { postMessage({ output: queryJson(data.input, data.query) }); }
  catch (error) { postMessage({ error: error instanceof Error ? error.message : 'Could not evaluate this query.' }); }
});
