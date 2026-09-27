import { UsageGuide } from '../shared/tool-guide';
export const CONVERSION_GUIDES: Record<string, Record<string, UsageGuide>> = {
  'csv-json': {
    'to-json': {
      input: 'Paste comma-separated rows with column names on the first row. Put commas or line breaks inside double-quoted cells; double any quote inside a quoted cell.',
      action: 'Choose CSV → JSON and click Run tool. Every record must have the same number of fields as the header.',
      output: 'An array of objects with string values. Leading zeros, whitespace, and large IDs stay intact. Duplicate headers or mismatched rows show an error.',
      exampleInput: 'name,id\nAda,001\nLin,002', exampleOutput: '[{"name":"Ada","id":"001"},{"name":"Lin","id":"002"}]',
    },
    'to-csv': {
      input: 'Paste a JSON array of flat objects. Values can be strings, numbers, booleans, or null; nested objects and arrays are not supported.',
      action: 'Choose JSON → CSV and click Run tool. Columns include every key observed, in first-seen order.',
      output: 'CSV with a header and CRLF row endings. Missing values and null become empty cells. Formula-like strings gain an apostrophe for safer spreadsheet import; this changes those values.',
      exampleInput: '[{"name":"Ada","id":"001"},{"name":"Lin","id":"002"}]', exampleOutput: 'name,id\r\nAda,001\r\nLin,002',
    },
  },
  'yaml-json': {
    'to-json': {
      input: 'Paste one YAML 1.2 document. Use string mapping keys and quote large IDs or values requiring exact decimal precision.',
      action: 'Choose YAML → JSON and click Run tool. Remove aliases and custom types before converting.',
      output: 'Formatted JSON with the same supported values. YAML comments and formatting are discarded. Unsupported values and duplicate keys produce errors.',
      exampleInput: 'name: Ada\nactive: true\nroles:\n  - developer', exampleOutput: '{"name":"Ada","active":true,"roles":["developer"]}',
    },
    'to-yaml': {
      input: 'Paste valid JSON with unique keys and no comments or trailing commas.',
      action: 'Choose JSON → YAML and click Run tool.',
      output: 'YAML 1.2 text with quoted strings where needed to preserve their types. Large integers must be quoted as strings.',
      exampleInput: '{"name":"Ada","active":true,"roles":["developer"]}', exampleOutput: 'name: Ada\nactive: true\nroles:\n  - developer\n',
    },
  },
  'markdown-table': { generate: {
    input: 'Paste CSV with unique column headers and an equal number of cells in each row.',
    action: 'Click Run tool, then copy the result into a README or Markdown document that supports tables.',
    output: 'Markdown source with a header separator and table rows. Special characters are escaped and multiline cells use <br>. The app displays source, not rendered HTML.',
    exampleInput: 'name,role\nAda,Developer', exampleOutput: '| name | role |\n| --- | --- |\n| Ada | Developer |',
  } },
  'line-toolkit': Object.fromEntries([
    ['unique', 'Remove duplicate lines', 'Keep the first copy of each exact line, preserving order.', 'apple\nbanana\napple', 'apple\nbanana'],
    ['sort', 'Sort lines A → Z', 'Lines sorted by UTF-16 character order, with case and whitespace significant.', 'pear\napple\nbanana', 'apple\nbanana\npear'],
    ['reverse', 'Reverse line order', 'The same lines in the opposite order; characters inside each line stay unchanged.', 'first\nsecond\nthird', 'third\nsecond\nfirst'],
    ['trim', 'Trim each line', 'Leading and trailing whitespace removed from each line. Blank lines remain.', '  apple  \n banana ', 'apple\nbanana'],
    ['nonblank', 'Remove blank lines', 'Empty and whitespace-only lines removed, preserving the other lines exactly.', 'apple\n   \nbanana', 'apple\nbanana'],
  ].map(([mode, label, output, exampleInput, exampleOutput]) => [mode, {
    input: 'Paste one item per line. LF, CRLF, and CR line endings are accepted.', action: `Choose ${label}, then click Run tool.`, output, exampleInput, exampleOutput,
  }])),
  'number-base-converter': Object.fromEntries([
    ['decimal', 'decimal (10)', '255'], ['hex', 'hexadecimal (16)', 'FF'], ['binary', 'binary (2)', '11111111'], ['octal', 'octal (8)', '377'],
  ].map(([mode, name, exampleInput]) => [mode, {
    input: `Enter an integer in ${name}, without a base prefix, spaces, or fractions. A leading + or ASCII - is allowed.`,
    action: `Choose Input: ${name}, then click Run tool. Uppercase and lowercase hexadecimal digits both work.`,
    output: 'Exact decimal, hexadecimal, binary, and octal representations. Results are strings so large integers never lose precision.',
    exampleInput, exampleOutput: '{"decimal":"255","hexadecimal":"FF","binary":"11111111","octal":"377"}',
  }])),
};
