import type { Configuration } from '../../utilities/configuration';
export const config: Configuration = {
  "label": "Text to convert",
  "note": "Word-based cases split punctuation and existing camelCase. Uppercase and lowercase preserve punctuation.",
  "modes": [
    {
      "value": "camel",
      "label": "camelCase"
    },
    {
      "value": "snake",
      "label": "snake_case"
    },
    {
      "value": "kebab",
      "label": "kebab-case"
    },
    {
      "value": "upper",
      "label": "UPPERCASE"
    },
    {
      "value": "lower",
      "label": "lowercase"
    }
  ]
};
