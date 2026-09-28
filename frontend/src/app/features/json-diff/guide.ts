import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "compare": {
    "input": "Paste the original JSON in the first editor and the updated JSON in the second. Each must be one valid JSON value.",
    "action": "Click Run tool. Object field order is ignored; arrays compare items at the same index.",
    "output": "An equal flag and a list of added, removed, or changed values with their paths. This is a comparison report, not an executable patch.",
    "exampleInput": "{\"name\":\"Ada\",\"active\":false}",
    "exampleFields": {
      "comparison": "{\"name\":\"Ada\",\"active\":true}"
    },
    "exampleOutput": "{\"equal\":false,\"changes\":[{\"kind\":\"changed\",\"path\":\"/active\",\"before\":false,\"after\":true}]}"
  }
};
