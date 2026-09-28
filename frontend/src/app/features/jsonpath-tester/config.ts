import type { Configuration } from '../../utilities/configuration';
export const config: Configuration = {
  "label": "JSON document",
  "fields": [
    {
      "key": "query",
      "label": "JSONPath expression",
      "initial": "$.users[*].name",
      "maxLength": 500
    }
  ],
  "note": "Up to 100,000 characters, 64 nesting levels, 500 matches, and 10 seconds per query. Properties, indexes, wildcards, slices, and recursive descent are supported. JavaScript filters and scripts are disabled.",
  "modes": [
    {
      "value": "query",
      "label": "Query JSON"
    }
  ]
};
