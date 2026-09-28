import type { Configuration } from '../../utilities/configuration';
export const config: Configuration = {
  "label": "Lines of text",
  "note": "Operations are case-sensitive. Sorting uses deterministic UTF-16 order, not natural numeric order. Deduplication keeps the first occurrence. Output uses LF line endings and preserves a final newline if present. Blank lines stay unless Remove blank lines is selected.",
  "modes": [
    {
      "value": "unique",
      "label": "Remove duplicate lines"
    },
    {
      "value": "sort",
      "label": "Sort lines A → Z"
    },
    {
      "value": "reverse",
      "label": "Reverse line order"
    },
    {
      "value": "trim",
      "label": "Trim each line"
    },
    {
      "value": "nonblank",
      "label": "Remove blank lines"
    }
  ]
};
