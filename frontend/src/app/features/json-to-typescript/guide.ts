import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "generate": {
    "input": "Paste sample JSON with the fields and values your application receives. Quote large numeric IDs as strings.",
    "action": "Click Run tool, then copy the generated type into your TypeScript project and refine it for your full data model.",
    "output": "An exported Root type with nested properties and array item types. One sample cannot determine every optional field or possible value.",
    "exampleInput": "{\"name\":\"Ada\",\"active\":true}",
    "exampleOutput": "export type Root = {\n  \"name\": string;\n  \"active\": boolean;\n};"
  }
};
