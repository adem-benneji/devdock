import type { Configuration } from '../../utilities/configuration';
export const config: Configuration = {
  "label": "Absolute HTTP or HTTPS URL",
  "note": "Parses on the backend without visiting the address. Duplicate query parameters are preserved and query + signs become spaces. Credentials are flagged but omitted from the result. Path and fragment retain percent escapes.",
  "modes": [
    {
      "value": "parse",
      "label": "Parse URL"
    }
  ]
};
