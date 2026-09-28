import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "generate": {
    "input": "Paste a representative JSON sample. Include array items to help infer their types.",
    "action": "Click Run tool, then review and adapt the schema before using it in a validator.",
    "output": "A JSON Schema draft 2020-12 document. Sample fields become required, mixed arrays use anyOf, and additional object fields are allowed.",
    "exampleInput": "{\"name\":\"Ada\"}",
    "exampleOutput": "{\"$schema\":\"https://json-schema.org/draft/2020-12/schema\",\"type\":\"object\",\"properties\":{\"name\":{\"type\":\"string\"}},\"required\":[\"name\"]}"
  }
};
