import type { Configuration } from '../../utilities/configuration';
export const config: Configuration = {
  "label": "Original JSON",
  "note": "Compares parsed values; object key order is ignored, arrays compare by index. Results describe added, removed, or changed values using escaped pointer paths; an empty path means the root. Up to 500 changes. No merging or patch application.",
  "modes": [
    {
      "value": "compare",
      "label": "Compare JSON"
    }
  ],
  "fields": [
    {
      "key": "comparison",
      "label": "Updated JSON",
      "initial": "",
      "multiline": true,
      "maxLength": 100000
    }
  ]
};
