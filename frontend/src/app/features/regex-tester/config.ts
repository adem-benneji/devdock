import type { Configuration } from '../../utilities/configuration';
export const config: Configuration = {
  "label": "Text to search",
  "note": "Java regular expressions, with UTF-16 offsets. Enter a pattern without / delimiters and optional gimsuy flags. At most 500 matches; 10-second backend execution limit. Replacement uses JavaScript $&, $1, and named-group syntax. Text and captured groups are displayed as data.",
  "modes": [
    {
      "value": "match",
      "label": "Find matches"
    },
    {
      "value": "replace",
      "label": "Replace matches"
    }
  ],
  "fields": [
    {
      "key": "pattern",
      "label": "Regular expression",
      "initial": "\\b\\w+\\b",
      "maxLength": 1000
    },
    {
      "key": "flags",
      "label": "Regex flags",
      "initial": "g",
      "maxLength": 6
    },
    {
      "key": "replacement",
      "label": "Replacement (replace mode)",
      "initial": "",
      "maxLength": 2000
    }
  ]
};
