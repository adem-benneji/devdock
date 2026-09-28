import type { Configuration } from '../../utilities/configuration';
export const config: Configuration = {
  "label": "URL component",
  "note": "Encodes one URL component, not an entire URL. A plus sign stays a plus sign when decoding.",
  "modes": [
    {
      "value": "encode",
      "label": "Encode component"
    },
    {
      "value": "decode",
      "label": "Decode component"
    }
  ]
};
