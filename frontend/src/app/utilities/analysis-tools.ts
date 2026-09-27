import { diffLines } from 'diff';
import { boundedOutput } from './strict-json';
import { compareJson } from './structure-tools';
export function testRegex(input: string, mode: string, pattern: string, flags: string, replacement: string): string {
  if (pattern.length > 1000 || replacement.length > 2000) throw new Error('Use at most 1,000 pattern characters and 2,000 replacement characters.');
  if (!/^[gimsuy]*$/.test(flags) || new Set(flags).size !== flags.length) throw new Error('Use unique JavaScript flags from g, i, m, s, u, y.');
  let regex: RegExp;
  try { regex = new RegExp(pattern, flags); } catch { throw new Error('Invalid JavaScript regular expression. Enter the pattern without / delimiters.'); }
  const matches: object[] = [];
  let match: RegExpExecArray | null, size = 0;
  while ((match = regex.exec(input)) !== null) {
    const item = { text: match[0], index: match.index, end: match.index + match[0].length, groups: match.slice(1).map(value => value ?? null), namedGroups: match.groups ?? {} };
    size += JSON.stringify(item).length;
    if (matches.length >= 500 || size > 900_000) throw new Error('More than 500 matches or too much match output. Narrow the pattern.');
    matches.push(item);
    if (!regex.global) break;
    if (match[0] === '') regex.lastIndex += regex.unicode && (input.codePointAt(regex.lastIndex) ?? 0) > 0xffff ? 2 : 1;
  }
  if (mode === 'replace') { regex.lastIndex = 0; return boundedOutput(input.replace(regex, replacement)); }
  if (mode !== 'match') throw new Error('Choose Match or Replace.');
  return boundedOutput(JSON.stringify({ count: matches.length, matches }, null, 2));
}
export function compareText(before: string, after: string): string {
  const changes = diffLines(before, after, { timeout: 1500, maxEditLength: 2000 });
  if (!changes) throw new Error('Text comparison is too complex. Compare smaller or more similar documents.');
  return boundedOutput(JSON.stringify({ equal: before === after, chunks: changes.map(change => ({ kind: change.added ? 'added' : change.removed ? 'removed' : 'unchanged', lines: change.count, text: change.value })) }, null, 2));
}
export function analyze(id: string, input: string, mode: string, fields: Record<string, string>): string {
  if (input.length > 100_000 || Object.values(fields).some(value => value.length > 100_000)) throw new Error('Use at most 100,000 characters per editor.');
  if (id === 'regex-tester') return testRegex(input, mode, fields['pattern'] ?? '', fields['flags'] ?? '', fields['replacement'] ?? '');
  if (id === 'text-diff') return compareText(input, fields['comparison'] ?? '');
  if (id === 'json-diff') return compareJson(input, fields['comparison'] ?? '');
  throw new Error('Unknown analysis tool.');
}
