import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "seconds": {
    "input": "Enter seconds since 1 January 1970. Up to three decimal places are supported.",
    "action": "Choose Unix seconds → UTC, then click Run tool.",
    "output": "A UTC date and time in ISO format. The ending Z means UTC, not your local timezone.",
    "exampleInput": "1704067200",
    "exampleOutput": "2024-01-01T00:00:00.000Z"
  },
  "milliseconds": {
    "input": "Enter a whole number of milliseconds since 1 January 1970.",
    "action": "Choose Unix milliseconds → UTC, then click Run tool.",
    "output": "A UTC date and time in ISO format, including milliseconds.",
    "exampleInput": "1704067200123",
    "exampleOutput": "2024-01-01T00:00:00.123Z"
  },
  "iso": {
    "input": "Enter a UTC date as YYYY-MM-DDTHH:mm:ssZ. You can include up to three fractional-second digits.",
    "action": "Choose UTC date → Unix seconds, then click Run tool.",
    "output": "Seconds since 1 January 1970, with a decimal fraction if the input includes milliseconds.",
    "exampleInput": "2024-01-01T00:00:00Z",
    "exampleOutput": "1704067200"
  }
};
