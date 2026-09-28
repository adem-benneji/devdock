import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "query": {
    "input": "Paste a valid JSON document and enter a JSONPath expression. For example, $.users[*].name selects each user’s name.",
    "action": "Click Load example to fill both fields, then Run tool. Use $ for the root, [0] for an index, or ..name for recursive lookup.",
    "output": "A match count and a list of paths with their values. No matches returns an empty list. Filters containing scripts are not supported.",
    "exampleInput": "{\"users\":[{\"name\":\"Ada\",\"active\":true},{\"name\":\"Lin\",\"active\":false}]}",
    "exampleOutput": "{\"count\":2,\"matches\":[{\"path\":\"$['users'][0]['name']\",\"value\":\"Ada\"},{\"path\":\"$['users'][1]['name']\",\"value\":\"Lin\"}]}"
  }
};
