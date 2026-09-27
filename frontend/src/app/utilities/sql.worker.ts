/// <reference lib="webworker" />
import { formatSql } from './sql-tools';
addEventListener('message', ({ data }: MessageEvent<{ input: string; mode: string }>) => {
  try { postMessage({ output: formatSql(data.input, data.mode) }); }
  catch (error) { postMessage({ error: error instanceof Error ? error.message : 'Could not format this query.' }); }
});
