import type { Configuration } from '../../utilities/configuration';
export const config: Configuration = {
  "label": "Text with line endings",
  "note": "Inspect or normalize CRLF, LF, and CR, or remove one leading Unicode BOM. Conversion preserves whether a final line break exists. Textareas may normalize pasted line endings; Load example and Copy result preserve the underlying generated value.",
  "modes": [
    {
      "value": "inspect",
      "label": "Inspect line endings"
    },
    {
      "value": "lf",
      "label": "Convert to LF"
    },
    {
      "value": "crlf",
      "label": "Convert to CRLF"
    },
    {
      "value": "cr",
      "label": "Convert to CR"
    },
    {
      "value": "strip-bom",
      "label": "Remove leading BOM"
    }
  ]
};
