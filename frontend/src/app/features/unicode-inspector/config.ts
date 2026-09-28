import type { Configuration } from '../../utilities/configuration';
export const config: Configuration = {
  "label": "Unicode text",
  "note": "Inspect up to 1,000 code points: code-point labels, UTF-16 offsets, UTF-8 bytes, and grapheme counts. Normalization accepts the usual input limit and changes representation; NFKC/NFKD also fold compatibility forms. Character names are not included.",
  "modes": [
    {
      "value": "inspect",
      "label": "Inspect characters"
    },
    {
      "value": "NFC",
      "label": "Normalize NFC"
    },
    {
      "value": "NFD",
      "label": "Normalize NFD"
    },
    {
      "value": "NFKC",
      "label": "Normalize NFKC"
    },
    {
      "value": "NFKD",
      "label": "Normalize NFKD"
    }
  ]
};
