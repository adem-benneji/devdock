import type { Configuration } from '../../utilities/configuration';
export const config: Configuration = {
  "label": "Integer to convert",
  "note": "Choose the input base. Enter up to 4,096 digits with an optional + or − (ASCII minus), without 0x/0b/0o prefixes, separators, or fractions. Results are exact signed integers, not fixed-width two’s complement. Output numbers are strings to preserve precision.",
  "modes": [
    {
      "value": "decimal",
      "label": "Input: decimal (10)"
    },
    {
      "value": "hex",
      "label": "Input: hexadecimal (16)"
    },
    {
      "value": "binary",
      "label": "Input: binary (2)"
    },
    {
      "value": "octal",
      "label": "Input: octal (8)"
    }
  ]
};
