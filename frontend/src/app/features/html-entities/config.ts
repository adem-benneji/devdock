import type { Configuration } from '../../utilities/configuration';
export const config: Configuration = {
  "label": "Text or HTML entities",
  "note": "Encodes or decodes named and numeric HTML entities in text context. Strict decoding requires valid entity syntax. The result is text only; decoding is not HTML sanitization and this tool never renders the output.",
  "modes": [
    {
      "value": "encode",
      "label": "Encode HTML entities"
    },
    {
      "value": "decode",
      "label": "Decode HTML entities"
    }
  ]
};
