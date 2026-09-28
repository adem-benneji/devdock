import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "to-json": {
    "input": "Paste one YAML 1.2 document. Use string mapping keys and quote large IDs or values requiring exact decimal precision.",
    "action": "Choose YAML → JSON and click Run tool. Remove aliases and custom types before converting.",
    "output": "Formatted JSON with the same supported values. YAML comments and formatting are discarded. Unsupported values and duplicate keys produce errors.",
    "exampleInput": "name: Ada\nactive: true\nroles:\n  - developer",
    "exampleOutput": "{\"name\":\"Ada\",\"active\":true,\"roles\":[\"developer\"]}"
  },
  "to-yaml": {
    "input": "Paste valid JSON with unique keys and no comments or trailing commas.",
    "action": "Choose JSON → YAML and click Run tool.",
    "output": "YAML 1.2 text with quoted strings where needed to preserve their types. Large integers must be quoted as strings.",
    "exampleInput": "{\"name\":\"Ada\",\"active\":true,\"roles\":[\"developer\"]}",
    "exampleOutput": "name: Ada\nactive: true\nroles:\n  - developer\n"
  }
};
