import type { Configuration } from '../../utilities/configuration';
export const config: Configuration = {
  "label": "YAML or JSON input",
  "note": "One YAML 1.2 document with string keys and JSON-compatible values. Aliases, custom types, nonfinite numbers, and unsupported YAML directives are rejected. Comments and formatting are not preserved. Numbers are parsed on the backend with decimal precision. Conversion runs in a worker with a 10-second limit.",
  "modes": [
    {
      "value": "to-json",
      "label": "YAML → JSON"
    },
    {
      "value": "to-yaml",
      "label": "JSON → YAML"
    }
  ]
};
