import type { Configuration } from '../../utilities/configuration';
export const config: Configuration = {
  "label": "CSV or JSON input",
  "note": "Comma-separated CSV with unique, nonblank headers; all CSV values stay strings. JSON input must be an array of flat objects. Missing/null cells become empty. Up to 100 columns and 5,000 rows. CSV export prefixes formula-like strings with an apostrophe for spreadsheet use, including headers.",
  "modes": [
    {
      "value": "to-json",
      "label": "CSV → JSON"
    },
    {
      "value": "to-csv",
      "label": "JSON → CSV"
    }
  ]
};
