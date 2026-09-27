import Papa from 'papaparse';
import { boundedOutput, parseJson } from './strict-json';

export function readCsv(input: string): string[][] {
  if (input.length > 100_000) throw new Error('Use at most 100,000 characters at a time.');
  if (!input.trim()) throw new Error('Enter comma-separated CSV with a header row.');
  const parsed = Papa.parse<string[]>(input.replace(/^\uFEFF/, ''), { delimiter: ',', header: false, dynamicTyping: false, skipEmptyLines: false });
  if (parsed.errors.length) throw new Error(`Invalid CSV near record ${(parsed.errors[0].row ?? 0) + 1}. Check quotes and delimiters.`);
  const rows = parsed.data;
  // One final newline terminates the last record; other blank rows remain data.
  if (/(?:\r\n|\r|\n)$/.test(input) && rows.at(-1)?.length === 1 && rows.at(-1)![0] === '') rows.pop();
  const header = rows[0];
  if (!header?.length || header.some(value => !value.trim())) throw new Error('Every CSV column needs a nonblank header.');
  if (new Set(header).size !== header.length) throw new Error('CSV headers must be unique.');
  if (header.length > 100 || rows.length > 5001) throw new Error('Use at most 100 columns and 5,000 data rows.');
  rows.forEach((row, index) => {
    if (row.length !== header.length) throw new Error(`Record ${index + 1} has ${row.length} fields; expected ${header.length}.`);
  });
  return rows;
}
export function csvToJson(input: string): string {
  const [header, ...rows] = readCsv(input);
  const records: string[] = [];
  let length = 2;
  for (const row of rows) {
    const record = JSON.stringify(Object.fromEntries(header.map((key, i) => [key, row[i]])), null, 2)
      .split('\n').map(line => `  ${line}`).join('\n');
    length += record.length + 2;
    if (length > 1_000_000) throw new Error('Result exceeds 1,000,000 characters. Use fewer rows or shorter headers.');
    records.push(record);
  }
  return boundedOutput(records.length ? `[\n${records.join(',\n')}\n]` : '[]');
}
export function jsonToCsv(input: string): string {
  const rows = parseJson(input);
  if (!Array.isArray(rows) || !rows.length || rows.length > 5000 || rows.some(row => row === null || typeof row !== 'object' || Array.isArray(row))) {
    throw new Error('Enter a nonempty JSON array of up to 5,000 flat objects.');
  }
  const headers = [...new Set(rows.flatMap(row => Object.keys(row)))];
  if (!headers.length || headers.length > 100 || headers.some(key => !key.trim())) throw new Error('Use 1–100 nonblank column names.');
  const data = rows.map(row => headers.map(key => {
    const value = Object.hasOwn(row, key) ? row[key] : null;
    if (value !== null && typeof value === 'object') throw new Error('CSV cells must be strings, numbers, booleans, or null. Flatten nested data first.');
    return value ?? '';
  }));
  // Escape headers as well as cells. This intentionally changes formula-like strings.
  return boundedOutput(Papa.unparse([headers, ...data], { newline: '\r\n', escapeFormulae: true }));
}
function markdownCell(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\\/g, '&#92;').replace(/\|/g, '&#124;').replace(/`/g, '&#96;')
    .replace(/\*/g, '&#42;').replace(/_/g, '&#95;').replace(/\[/g, '&#91;').replace(/\]/g, '&#93;')
    .replace(/\r\n|\r|\n/g, '<br>');
}
export function csvToMarkdown(input: string): string {
  const [header, ...rows] = readCsv(input);
  const line = (row: string[]) => `| ${row.map(markdownCell).join(' | ')} |`;
  return boundedOutput([line(header), line(header.map(() => '---')), ...rows.map(line)].join('\n'));
}
