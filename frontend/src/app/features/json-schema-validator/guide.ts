import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "2020": {
    "input": "Enter the JSON document and its schema in the second editor. Choose the matching schema dialect.",
    "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
    "output": "A valid flag and errors with JSON Pointer paths, failed keywords, and details. Schema errors appear separately.",
    "exampleInput": "{\"name\":\"Ada\",\"age\":37}",
    "exampleOutput": "valid: true; errors: []",
    "exampleFields": {
      "schema": "{\n  \"type\": \"object\",\n  \"properties\": {\n    \"name\": {\n      \"type\": \"string\"\n    },\n    \"age\": {\n      \"type\": \"integer\",\n      \"minimum\": 0\n    }\n  },\n  \"required\": [\n    \"name\",\n    \"age\"\n  ],\n  \"additionalProperties\": false\n}"
    },
    "exampleLabel": "Example (output summary)"
  },
  "draft7": {
    "input": "Enter the JSON document and its schema in the second editor. Choose the matching schema dialect.",
    "action": "Choose the operation, then click Run tool. Load example fills all required fields.",
    "output": "A valid flag and errors with JSON Pointer paths, failed keywords, and details. Schema errors appear separately.",
    "exampleInput": "{\"name\":\"Ada\",\"age\":37}",
    "exampleOutput": "valid: true; errors: []",
    "exampleFields": {
      "schema": "{\n  \"type\": \"object\",\n  \"properties\": {\n    \"name\": {\n      \"type\": \"string\"\n    },\n    \"age\": {\n      \"type\": \"integer\",\n      \"minimum\": 0\n    }\n  },\n  \"required\": [\n    \"name\",\n    \"age\"\n  ],\n  \"additionalProperties\": false\n}"
    },
    "exampleLabel": "Example (output summary)"
  }
};
