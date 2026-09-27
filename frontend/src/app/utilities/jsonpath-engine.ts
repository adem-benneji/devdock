import { JSONPath } from 'jsonpath-plus';
import { boundedOutput, parseJson } from './strict-json';

export function queryJson(input: string, query: string): string {
  const json = parseJson(input);
  query = query.trim();
  if (!query.startsWith('$') || query.length > 500) throw new Error('Enter a JSONPath starting with $, up to 500 characters.');
  // Accept an explicit, non-evaluating subset. The library otherwise tolerates
  // incomplete paths and only rejects scripts when a matching node is visited.
  const segment = /(?:\.\.?[\p{L}\p{N}_$*-]+|(?:\.\.)?\[(?:\*|-?\d+|-?\d*:-?\d*(?::[1-9]\d*)?|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")\])/uy;
  let offset = 1;
  while (offset < query.length) {
    segment.lastIndex = offset;
    if (!segment.exec(query)) throw new Error('Invalid or unsupported JSONPath. Use properties, indexes, wildcards, slices, or recursive descent. Filters and scripts are disabled.');
    offset = segment.lastIndex;
  }
  // JSONPath Plus treats falsy roots as missing; JSON itself permits them.
  if (query === '$') return boundedOutput(JSON.stringify({ count: 1, matches: [{ path: '$', value: json }] }, null, 2));
  const matches: { path: string; value: unknown }[] = [];
  let size = 0;
  try {
    JSONPath({ path: query.trim(), json: json as object, eval: false, resultType: 'all', wrap: true, callback: (match: { path: string; value: unknown }) => {
      if (matches.length >= 500) throw new Error('More than 500 matches. Use a narrower query.');
      size += JSON.stringify(match.value).length + match.path.length;
      if (size > 1_000_000) throw new Error('Result exceeds 1,000,000 characters. Use a narrower query.');
      matches.push({ path: match.path, value: match.value });
    } });
  } catch (error) {
    if (error instanceof Error && /^(More than 500|Result exceeds)/.test(error.message)) throw error;
    throw new Error('Invalid or unsupported JSONPath. Use properties, indexes, wildcards, slices, or recursive descent. Filters and scripts are disabled.');
  }
  return boundedOutput(JSON.stringify({ count: matches.length, matches }, null, 2));
}
