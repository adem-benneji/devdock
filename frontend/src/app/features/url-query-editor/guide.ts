import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "apply": {
    "input": "Enter a full HTTP/S URL. Apply mode also needs a JSON object of parameter changes; arrays create repeated parameters, null removes a parameter.",
    "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
    "output": "The resulting URL as text. Clean mode removes common tracker keys without changing unrelated query values.",
    "exampleInput": "https://example.com/search?q=old&utm_source=newsletter#results",
    "exampleOutput": "https://example.com/search?q=dev+dock&tag=api&tag=json#results",
    "exampleFields": {
      "changes": "{\"q\":\"dev dock\",\"tag\":[\"api\",\"json\"],\"utm_source\":null}"
    },
    "exampleLabel": "Example (output summary)"
  },
  "clean": {
    "input": "Enter a full HTTP/S URL. Apply mode also needs a JSON object of parameter changes; arrays create repeated parameters, null removes a parameter.",
    "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
    "output": "The resulting URL as text. Clean mode removes common tracker keys without changing unrelated query values.",
    "exampleInput": "https://example.com/search?q=old&utm_source=newsletter#results",
    "exampleOutput": "https://example.com/search?q=old#results",
    "exampleFields": {
      "changes": "{\"q\":\"dev dock\",\"tag\":[\"api\",\"json\"],\"utm_source\":null}"
    },
    "exampleLabel": "Example (output summary)"
  }
};
