import type { Configuration } from '../../utilities/configuration';
export const config: Configuration = {
  "label": "JSON Lines or JSON array",
  "note": "One complete JSON value per line, up to 5,000 records. Blank interior lines are invalid; one final newline is allowed. Array export writes compact JSON per item. Duplicate keys are rejected; numeric values are parsed with backend decimal precision.",
  "modes": [
    {
      "value": "to-array",
      "label": "JSON Lines → array"
    },
    {
      "value": "to-lines",
      "label": "JSON array → lines"
    }
  ]
};
