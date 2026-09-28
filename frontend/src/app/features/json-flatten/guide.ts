import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "flatten": {
    "input": "Paste a JSON document, including any nested objects or arrays.",
    "action": "Choose Flatten to path entries and click Run tool.",
    "output": "An array of path/value entries. String segments are object keys; numeric segments are array indexes. Empty objects and arrays remain values, so Restore JSON can recover the structure.",
    "exampleInput": "{\"users\":[{\"name\":\"Ada\"}]}",
    "exampleOutput": "[{\"path\":[\"users\",0,\"name\"],\"value\":\"Ada\"}]"
  },
  "unflatten": {
    "input": "Paste path/value entries produced by this tool. Paths must be arrays of strings or numeric indexes; values must be primitive or empty containers.",
    "action": "Choose Restore JSON and click Run tool. Duplicate, conflicting, mixed, or sparse paths show an error.",
    "output": "The reconstructed JSON document. A path of [] identifies the root value. Numeric object keys must be strings, such as \"0\", rather than numeric indexes.",
    "exampleInput": "[{\"path\":[\"users\",0,\"name\"],\"value\":\"Ada\"}]",
    "exampleOutput": "{\"users\":[{\"name\":\"Ada\"}]}"
  }
};
