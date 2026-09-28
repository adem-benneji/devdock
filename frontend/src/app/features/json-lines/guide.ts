import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "to-array": {
    "input": "Paste one JSON value per line. Interior blank lines are invalid; one final newline is allowed.",
    "action": "Choose JSON Lines → array and click Run tool. Errors identify the record line.",
    "output": "A formatted JSON array containing all records in order. Strings, numbers, objects, arrays, and null are supported.",
    "exampleInput": "{\"id\":1}\n{\"id\":2}",
    "exampleOutput": "[{\"id\":1},{\"id\":2}]"
  },
  "to-lines": {
    "input": "Paste a JSON array containing the records to export.",
    "action": "Choose JSON array → lines and click Run tool.",
    "output": "One compact JSON value per item, separated by LF. Newlines within strings remain escaped. An empty array produces empty output.",
    "exampleInput": "[{\"id\":1},{\"id\":2}]",
    "exampleOutput": "{\"id\":1}\n{\"id\":2}"
  }
};
