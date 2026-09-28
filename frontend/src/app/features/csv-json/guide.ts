import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "to-json": {
    "input": "Paste comma-separated rows with column names on the first row. Put commas or line breaks inside double-quoted cells; double any quote inside a quoted cell.",
    "action": "Choose CSV → JSON and click Run tool. Every record must have the same number of fields as the header.",
    "output": "An array of objects with string values. Leading zeros, whitespace, and large IDs stay intact. Duplicate headers or mismatched rows show an error.",
    "exampleInput": "name,id\nAda,001\nLin,002",
    "exampleOutput": "[{\"name\":\"Ada\",\"id\":\"001\"},{\"name\":\"Lin\",\"id\":\"002\"}]"
  },
  "to-csv": {
    "input": "Paste a JSON array of flat objects. Values can be strings, numbers, booleans, or null; nested objects and arrays are not supported.",
    "action": "Choose JSON → CSV and click Run tool. Columns include every key observed, in first-seen order.",
    "output": "CSV with a header and CRLF row endings. Missing values and null become empty cells. Formula-like strings gain an apostrophe for safer spreadsheet import; this changes those values.",
    "exampleInput": "[{\"name\":\"Ada\",\"id\":\"001\"},{\"name\":\"Lin\",\"id\":\"002\"}]",
    "exampleOutput": "name,id\r\nAda,001\r\nLin,002"
  }
};
