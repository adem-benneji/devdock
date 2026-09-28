import type { Configuration } from '../../utilities/configuration';
export const config: Configuration = {
  "label": "Text to measure",
  "note": "Uses Unicode word and visible-character segmentation with English locale rules. Reading time assumes 200 words per minute. Line counts include trailing blank lines; empty text has zero lines.",
  "modes": [
    {
      "value": "count",
      "label": "Count text"
    }
  ]
};
