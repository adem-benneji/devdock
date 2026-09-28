import type { UsageGuide } from '../../shared/tool-guide';
export const guides: Record<string, UsageGuide> = {
  "compare": {
    "input": "Paste the original and updated text in their respective editors. Empty text is allowed.",
    "action": "Click Run tool to compare exact lines, including whitespace and line endings.",
    "output": "Ordered chunks labeled unchanged, removed, or added, with text and line counts. Equal text reports equal: true.",
    "exampleInput": "hello\nold\n",
    "exampleFields": {
      "comparison": "hello\nnew\n"
    },
    "exampleOutput": "unchanged: \"hello\\n\"\nremoved: \"old\\n\"\nadded: \"new\\n\"",
    "exampleLabel": "Example (output summary)"
  }
};
