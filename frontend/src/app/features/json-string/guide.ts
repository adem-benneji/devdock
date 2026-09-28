import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "escape": {
    "input": "Paste ordinary text, including quotes, tabs, or line breaks.",
    "action": "Choose Escape as JSON string and click Run tool.",
    "output": "A complete quoted JSON string with special characters escaped, ready to use as a JSON value.",
    "exampleInput": "Hello \"Ada\"\nWelcome",
    "exampleOutput": "\"Hello \\\"Ada\\\"\\nWelcome\""
  },
  "unescape": {
    "input": "Paste one JSON string with its surrounding double quotes and valid escapes.",
    "action": "Choose Unescape JSON string and click Run tool.",
    "output": "The original text with escaped quotes and line breaks restored. Objects, numbers, and malformed strings are rejected.",
    "exampleInput": "\"Hello \\\"Ada\\\"\\nWelcome\"",
    "exampleOutput": "Hello \"Ada\"\nWelcome"
  }
};
