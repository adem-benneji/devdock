import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "match": {
    "input": "Paste text, enter a Java regex without surrounding / characters, and choose flags such as g for all matches or i to ignore case.",
    "action": "Click Run tool. Load example fills text, pattern, and flags together.",
    "output": "Match count, matched text, UTF-16 start/end offsets, numbered captures, and named captures. No matches returns an empty list.",
    "exampleInput": "Ada 42, Lin 7",
    "exampleFields": {
      "pattern": "\\d+",
      "flags": "g",
      "replacement": "#"
    },
    "exampleOutput": "2 matches: \"42\" at index 4, \"7\" at index 12",
    "exampleLabel": "Example with pattern \\d+ and flag g (output summary)"
  },
  "replace": {
    "input": "Enter the original text, pattern, flags, and replacement. Use g to replace all matches; $1 inserts the first captured group.",
    "action": "Choose Replace matches, then Run tool. An empty replacement removes matches.",
    "output": "The text after Java regex replacement. The source editor is preserved. Expensive patterns stop after ten seconds.",
    "exampleInput": "Ada 42, Lin 7",
    "exampleFields": {
      "pattern": "\\d+",
      "flags": "g",
      "replacement": "#"
    },
    "exampleOutput": "Ada #, Lin #",
    "exampleLabel": "Example with pattern \\d+, flag g, replacement #"
  }
};
