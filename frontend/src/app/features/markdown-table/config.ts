import type { Configuration } from '../../utilities/configuration';
export const config: Configuration = {
  "label": "CSV table",
  "note": "Uses comma-separated CSV with a header and consistent row widths. Escapes HTML, pipes, and common Markdown syntax as entities; multiline cells become <br>. Outputs source text for a Markdown renderer supporting tables. Up to 100 columns and 5,000 rows.",
  "modes": [
    {
      "value": "generate",
      "label": "Generate table"
    }
  ]
};
